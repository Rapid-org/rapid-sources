package io.mohamed.rapid.buildserver

import com.google.auth.oauth2.GoogleCredentials
import com.google.common.io.Files
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.gson.Gson
import io.github.classgraph.ClassGraph
import io.github.classgraph.ClassInfo
import io.github.classgraph.ClassInfoList
import io.github.classgraph.ScanResult
import net.lingala.zip4j.model.ZipParameters
import org.apache.commons.io.FileUtils
import org.apache.commons.io.IOUtils
import org.apache.maven.repository.internal.MavenRepositorySystemUtils
import org.eclipse.aether.DefaultRepositorySystemSession
import org.eclipse.aether.RepositorySystem
import org.eclipse.aether.RepositorySystemSession
import org.eclipse.aether.artifact.Artifact
import org.eclipse.aether.artifact.DefaultArtifact
import org.eclipse.aether.collection.CollectRequest
import org.eclipse.aether.connector.basic.BasicRepositoryConnectorFactory
import org.eclipse.aether.graph.Dependency
import org.eclipse.aether.graph.DependencyFilter
import org.eclipse.aether.impl.DefaultServiceLocator
import org.eclipse.aether.repository.LocalRepository
import org.eclipse.aether.repository.RemoteRepository
import org.eclipse.aether.resolution.ArtifactResult
import org.eclipse.aether.resolution.DependencyRequest
import org.eclipse.aether.resolution.DependencyResult
import org.eclipse.aether.spi.connector.RepositoryConnectorFactory
import org.eclipse.aether.spi.connector.transport.TransporterFactory
import org.eclipse.aether.transport.file.FileTransporterFactory
import org.eclipse.aether.transport.http.HttpTransporterFactory
import org.eclipse.aether.util.artifact.JavaScopes
import org.eclipse.aether.util.filter.DependencyFilterUtils
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.core.io.InputStreamResource
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.io.*
import java.util.*
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit
import java.util.stream.Collectors
import java.util.zip.ZipEntry
import java.util.zip.ZipFile


@RestController
@CrossOrigin(origins = ["*"])
class BuildServerController {
	var gson: Gson = Gson()
	private lateinit var scanResult: ScanResult

	@RequestMapping(value = ["/build/{type}"], method = [RequestMethod.POST])
    fun build(@RequestParam("input") inputFile: MultipartFile, @PathVariable type: String): ResponseEntity<String> {
		val isRelease = type == "release"
		val builder = ExtensionBuilder()
        val errors = ArrayList<ErrorGeneration.Error>()
        val messages = ByteArrayOutputStream()
        val messagesWriter = PrintWriter(messages, true)
        builder.build(inputFile, messagesWriter, messages, errors, isRelease)
		val uuid = UUID.randomUUID().toString()
		val extensionFile = ExtensionFile(null, uuid, builder)
		buildCacheNames[uuid] = extensionFile
		val resultObj = LinkedHashMap<String, String?>()
		resultObj["id"] = extensionFile.id
		return ResponseEntity.ok(gson.toJson(resultObj))
    }

	@RequestMapping(value = ["/build/status/{buildId}"], method = [RequestMethod.GET])
	fun buildStatus(@PathVariable buildId: String): ResponseEntity<String> {
		val extFile = buildCacheNames[buildId]
		if (extFile != null) {
			val outputObject = LinkedHashMap<String, Any?>()
			outputObject["id"] = extFile.id
			val result = extFile.builder?.result
			if (result != null) {
				outputObject["success"] = result.isSuccessful
			}
			if (result != null) {
				extFile.file = result.outputExtension
				extFile.fileName = result.fileName
			}
			outputObject["messages"] = extFile.builder?.messages?.toString("utf-8")
			outputObject["status"] = extFile.builder?.result?.status ?: ""
			outputObject["done"] = extFile.builder?.done
			outputObject["errors"] = ErrorGeneration.parseErrors(extFile.builder?.userErrors)
			if (result?.isSuccessful!!) {
				val downloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
					.path("/ext/")
					.path(extFile.id!!)
					.toUriString()
				val executorService = Executors.newSingleThreadScheduledExecutor()
				val task = executorService.schedule(
					Callable {
						extFile.file?.delete() // delete the generated extension.
						cacheNames.remove(extFile)
						extFile
					}, 10, TimeUnit.MINUTES
				)
				cacheNames[extFile] = task
				outputObject["downloadUrl"] = downloadUri
			} else {
				outputObject["downloadUrl"] = ""
			}
			ResponseEntity.ok(outputObject.toString())
			return ResponseEntity.ok(gson.toJson(outputObject))
		} else {
			return ResponseEntity.status(404).body("{error: \"Failed to find status ID\"}")
		}
	}

    @RequestMapping(value = ["/ext/{fileId}"], method = [RequestMethod.GET])
    fun downloadExtension(@PathVariable fileId: String): ResponseEntity<*> {
        println("Received request $fileId")
		println(cacheNames.entries)
        for (entry in cacheNames.entries) {
            val key = entry.key
			println(key.id)
            if (key.id == fileId) {
                if (key.file != null) {
                    try {
                        val resource: InputStreamResource? = key.file?.let {
							FileInputStream(
								it
							)
						}?.let {
							InputStreamResource(
								it
							)
						}
                        println(key.file!!.name)
                        return ResponseEntity.ok()
                            .contentLength(key.file!!.length())
                            .contentType(MediaType.parseMediaType("application/java-archive"))
                            .header(
                                "Content-Disposition",
                                "attachment; filename=\"" + key.fileName + "\""
                            )
                            .body(resource)
                    } catch (e: IOException) {
                        e.printStackTrace()
                    }
                } else {
                    System.err.println("File null in key.")
                }
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\": \"Not Found\"}")
    }

    @EventListener
    fun applicationStartup(event: ApplicationReadyEvent) {
        println("The Rapid Buildserver is running..")
        println("Caching classes..")
        fetchClasses(true)
		val options = FirebaseOptions.builder()
			.setCredentials(GoogleCredentials.fromStream(FileInputStream("rapid-b9abe-firebase-adminsdk-m3hpy-ddf1a44208.json")))
			.build()
		FirebaseApp.initializeApp(options)
	}

    @RequestMapping(value = ["/classes/{className}"], method = [RequestMethod.POST])
    fun resolveClasses(@RequestParam("input") inputFile: MultipartFile, @PathVariable className : String): ResponseEntity<String> {
		val classes: ArrayList<LinkedHashMap<String, Any>> = loadClasses(className)
		val classes1: ArrayList<LinkedHashMap<String, Any>> = loadClassesFromLib(inputFile, className)
		classes.addAll(classes1)
		return ResponseEntity.status(HttpStatus.OK).body(gson.toJson(classes.take(50)))
    }

	@RequestMapping(value = ["/library/resolve"], method = [RequestMethod.POST])
	fun resolveLibrary(@RequestParam("dependency") dependency: String,@RequestParam("input") inputFile: MultipartFile): ResponseEntity<*> {
		try {
			val input = File.createTempFile("input", ".rbx")
			FileUtils.writeByteArrayToFile(input, inputFile.bytes)
			val locator: DefaultServiceLocator? = MavenRepositorySystemUtils.newServiceLocator()
			val system: RepositorySystem? = locator?.let { newRepositorySystem(it) }
			val session: RepositorySystemSession? = system?.let { newSession(it) }

			val central: RemoteRepository = RemoteRepository.Builder("central", "default", "https://repo.maven.apache.org/maven2").build()
			val google: RemoteRepository = RemoteRepository.Builder("google", "default", "https://dl.google.com/android/maven2").build()

			val artifact: Artifact = DefaultArtifact(dependency)

			val collectRequest = CollectRequest(Dependency(artifact, JavaScopes.COMPILE), listOf(google, central))
			val filter: DependencyFilter = DependencyFilterUtils.classpathFilter(JavaScopes.COMPILE)
			val request = DependencyRequest(collectRequest, filter)
			val result: DependencyResult? = system?.resolveDependencies(session, request)

			if (result != null) {
				val zipFile: net.lingala.zip4j.ZipFile = net.lingala.zip4j.ZipFile(input)
				val libraryNames:ArrayList<String> = ArrayList()
				for (artifactResult: ArtifactResult in result.artifactResults) {
					println(artifactResult.artifact.file)

					if (artifactResult.artifact.file.extension == "aar") {
						val zipParameters = ZipParameters()
						val zipFile1 = net.lingala.zip4j.ZipFile(artifactResult.artifact.file)
						val classesJarFile = File(artifactResult.artifact.file.parent, "classes.jar").absolutePath
						zipFile1.extractFile("classes.jar", artifactResult.artifact.file.parent)
						zipParameters.fileNameInZip = "libraries/" + artifactResult.artifact.file.name.replace(".aar", ".jar")
						libraryNames.add(artifactResult.artifact.file.name.replace(".aar", ".jar"))
						zipFile.addFile(classesJarFile, zipParameters)
					} else {
						val zipParameters = ZipParameters()
						zipParameters.fileNameInZip = "libraries/" + artifactResult.artifact.file.name
						libraryNames.add(artifactResult.artifact.file.name)
						zipFile.addFile(artifactResult.artifact.file, zipParameters)
					}

				}
				val extensionJson: String =  zipFile.getInputStream(zipFile.getFileHeader("extension.json")).bufferedReader().use { it.readLine() }
				val extensionObj: HashMap<String, Any> = gson.fromJson(extensionJson, HashMap<String, Any>().javaClass)
				val extensionLibraries:ArrayList<String> = extensionObj["libraries"] as ArrayList<String>
				extensionLibraries.addAll(libraryNames)
				val zipParameters = ZipParameters()
				zipParameters.fileNameInZip = "extension.json"
				val extensionObjFile = File.createTempFile("extension", ".json")
				val writer = FileWriter(extensionObjFile)
				val bw = BufferedWriter(writer)
				bw.write(gson.toJson(extensionObj))
				bw.close()
				extensionObjFile.deleteOnExit()
				zipFile.addFile(extensionObjFile, zipParameters)
				FileUtils.deleteDirectory(File("target/local-repo"))
			}
			input.deleteOnExit()
			val resource: InputStreamResource = FileInputStream(
				input
			).let {
				InputStreamResource(
					it
				)
			}
			return ResponseEntity.ok()
				.contentLength(input.length())
				.contentType(MediaType.parseMediaType("application/java-archive"))
				.header(
					"Content-Disposition",
					"attachment; filename=\"" + input.name + "\""
				)
				.body(resource)
		} catch (e: Exception) {
			e.printStackTrace()
			return ResponseEntity.status(400).body("Failed to resolve library.")
		}
	}

	private fun newRepositorySystem(locator: DefaultServiceLocator):RepositorySystem {
		locator.addService(RepositoryConnectorFactory::class.java, BasicRepositoryConnectorFactory::class.java);
		locator.addService(TransporterFactory::class.java, FileTransporterFactory::class.java);
		locator.addService(TransporterFactory::class.java, HttpTransporterFactory::class.java);
		return locator.getService(RepositorySystem::class.java);
	}

	private fun newSession(system:RepositorySystem):RepositorySystemSession {
		var session:DefaultRepositorySystemSession = MavenRepositorySystemUtils.newSession();
		var localRepo = LocalRepository("target/local-repo");
		session.localRepositoryManager = system.newLocalRepositoryManager(session, localRepo);
		return session;
	}

	fun loadClassesFromLib(inputFile: MultipartFile, filter: String): ArrayList<LinkedHashMap<String, Any>> {
		val classes: ArrayList<LinkedHashMap<String, Any>> = ArrayList()
		val input: File = File.createTempFile(inputFile.name, ".rbx")
		inputFile.transferTo(input)
		val zipFile = ZipFile(input)
		val libraries = Util.getLibrariesEntries(zipFile)
		val parentDir: File?
		val classPath: java.util.ArrayList<String> = ArrayList<String>()
		if (libraries != null) {
			parentDir = Files.createTempDir()
			for (lib: ZipEntry in libraries) {
				val libFile = File("${parentDir}/${lib.name}")
				libFile.parentFile.mkdirs()
				FileOutputStream(libFile).use { fos ->
					IOUtils.copy(zipFile.getInputStream(lib), fos)
				}
				classPath.add(libFile.absolutePath)
				/*val zip =  ZipFile(libFile)
				for (entry : ZipEntry in zip.entries()) {
					if (!entry.isDirectory && entry.name.endsWith(".class")) {
						// This ZipEntry represents a class. Now, what class does it represent?
						val className:String = entry.name.replace('/', '.').replace(".class", ""); // including ".class"
						println(className)
						if (className.contains(filter)) {
							val classObject = LinkedHashMap<String, Any>()
							classObject["type"] = "class"
							var newClassName = className
							if (newClassName.contains("$")) {
								println("isNUmber " + newClassName.substring(newClassName.indexOf("$") +1))
								if (isNumber(newClassName.substring(newClassName.lastIndexOf("$")+1))) {
									continue
								} else {
									newClassName = newClassName.replace("$", ".")
								}
							}
							classObject["name"] = newClassName
							classObject["package"] =
								className.substring(0, className.lastIndexOf('.'))
							var newDisplayName = className.substring(className.lastIndexOf('.') + 1)
							if (newDisplayName.contains("$")) {
								if (isNumber(newDisplayName.substring(newDisplayName.lastIndexOf("$")+1))) {
									continue
								} else {
									newDisplayName = newDisplayName.replace("$", ".")
								}
							}
							classObject["simpleName"] = newDisplayName
							println(classObject)
							classes.add(classObject)
						}
					}
				}
			}*/
			}
			if (classPath.isNotEmpty()) {
				val result: ScanResult = ClassGraph()
					.enableClassInfo()
					.enableMethodInfo()
					.overrideClasspath(classPath)
					.scan()
				println(result.allClasses)
				for (classz in result.allClasses) {
					if (classz.name.contains(filter)) {
						val classObject = LinkedHashMap<String, Any>()
						classObject["type"] =
							if (classz.isEnum) "enum" else if (classz.isInterface) "interface" else "class"
						classObject["name"] = classz.name
						classObject["package"] = classz.packageName
						classObject["simpleName"] = classz.simpleName
						classes.add(classObject)
					}
				}
			}
		}
		return classes
	}

	fun loadClassFromLib(inputFile: MultipartFile, filter: String): ClassInfo {
		val input:File = File.createTempFile(inputFile.name, ".rbx")
		inputFile.transferTo(input)
		val zipFile = ZipFile(input)
		val libraries = Util.getLibrariesEntries(zipFile)
		var parentDir: File? = null

		if (libraries != null) {
			parentDir = File(Files.createTempDir(), inputFile.name.plus("-libs"))
			for (lib: ZipEntry in libraries) {
				val libFile = File("${parentDir}/${lib.name}")
				libFile.parentFile.mkdirs()
				FileOutputStream(libFile).use { fos ->
					IOUtils.copy(zipFile.getInputStream(lib), fos)
				}
			}
		}
		val classPath: ArrayList<String> = ArrayList()
		for (file: File in File(parentDir, "libraries").listFiles()!!) {
			classPath.add(file.absolutePath)
		}
		println(classPath)
		val result: ScanResult = ClassGraph()
			.enableAllInfo()
			.overrideClasspath(classPath)
			.acceptClasses(filter)
			.scan()
			return result.getClassInfo(filter)
	}

    @RequestMapping(value = ["/class/{className}"], method = [RequestMethod.POST])
    fun loadClassInfo(@RequestParam("input") inputFile: MultipartFile, @PathVariable className : String): ResponseEntity<String> {
		val classz:ClassInfo?
		val classPath:ArrayList<String> = ArrayList<String>()
		classPath.add("android.jar")
		classPath.addAll(System.getProperty("java.class.path").split(File.pathSeparatorChar))
			val result = ClassGraph()
				.enableClassInfo()
				.enableMethodInfo()
				.acceptClasses()
				.overrideClasspath(classPath)
				.scan()
			val classInfo = result.getClassInfo(className)
			if (classInfo != null) {
				classz = classInfo
				println("Found class in android.jar or classpath!")
			} else {
				classz = loadClassFromLib(inputFile, className)
			}

		var classObject: String = gson.toJson(DocumentationGenerator.generateDocs(classz))
        return ResponseEntity.ok(classObject)
    }

    fun loadClasses(filter: Any?): ArrayList<LinkedHashMap<String, Any>> {
        val classes = ArrayList<LinkedHashMap<String, Any>>()
        val localCachedClasses: ClassInfoList? = if (filter != null) {
            cachedClasses?.filter { e -> e != null && e.name.toString()
				.lowercase(Locale.getDefault())
				.contains((filter as String).toString().lowercase(Locale.getDefault())) }!!
        } else {
            cachedClasses
        }
        val limitedScanResult =
            localCachedClasses?.stream()
                ?.filter { e -> !e.isAnnotation && !e.isRecord }
                ?.collect(Collectors.toList())
        if (limitedScanResult != null) {
            for (routeClassInfo in limitedScanResult) {
                val classObject = LinkedHashMap<String, Any>()
				classObject["type"] = if (routeClassInfo.isEnum) "enum" else if (routeClassInfo.isInterface) "interface" else "class"
				classObject["name"] = routeClassInfo.name
				classObject["package"] = routeClassInfo.packageName
				classObject["simpleName"] = routeClassInfo.simpleName
				classes.add(classObject)
            }
        }
        return classes
    }

    private fun fetchClasses(async: Boolean, callback: FetchClassesCallback? = null) {
        if (!async) {
            ClassGraph()
                .enableClassInfo()
				.overrideClasspath("android.jar" + File.pathSeparatorChar + System.getProperty("java.class.path"))
                .scan().use { scanResult ->                // Start the scan
                    println("Finished Synchronous fetching..")
                    println(scanResult.allClasses.size)
					BuildServerController@this.scanResult = scanResult
                    cachedClasses = scanResult.allClasses
                    callback?.onFetch()
                }
        } else {
            Thread { fetchClasses(false) }.start()
        }
    }

    companion object {
        private val cacheNames: MutableMap<ExtensionFile, ScheduledFuture<ExtensionFile>> =
            LinkedHashMap()
		private val buildCacheNames: MutableMap<String, ExtensionFile> =
			LinkedHashMap()
        var cachedClasses: ClassInfoList? = null
    }

    interface FetchClassesCallback {
        fun onFetch()
    }
}
