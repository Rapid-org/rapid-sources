package io.mohamed.rapid.buildserver

import com.android.tools.r8.*
import com.android.tools.r8.origin.Origin
import com.google.appinventor.components.scripts.*
import com.google.gson.Gson
import com.google.gson.internal.LinkedTreeMap
import net.lingala.zip4j.ZipFile
import org.apache.commons.io.FileUtils
import org.apache.commons.io.IOUtils
import org.w3c.dom.Element
import org.w3c.dom.Node
import org.xml.sax.InputSource
import org.xml.sax.SAXException
import java.io.*
import java.net.URI
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.util.*
import java.util.jar.Attributes
import java.util.jar.JarOutputStream
import java.util.jar.Manifest
import java.util.zip.ZipEntry
import java.util.zip.ZipException
import javax.tools.*
import javax.tools.Diagnostic
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.parsers.ParserConfigurationException
import kotlin.collections.ArrayList
import kotlin.collections.HashMap
import kotlin.collections.LinkedHashMap
import kotlin.math.roundToInt

class Compiler(
	private val propertiesObj: HashMap<String, Any>,
	private val code: String,
	private val userErrors: ArrayList<ErrorGeneration.Error>,
	private val androidManifestXml: String,
	private val userMessages: PrintWriter,
	private val extensionDirectory: File,
	private val release: Boolean,
	private val callback: CompilerCallback
) {
	private val generatedClasses = ArrayList<String>()
	private val packageName: String = propertiesObj["packageName"] as String
	private var projectName: String? = null
	private var proguard = false
	private var gson = Gson()
	private fun compileSourceFiles(classesDir: File): Boolean {
		return try {
			val compiler = ToolProvider.getSystemJavaCompiler()
			val diagnostics = DiagnosticCollector<JavaFileObject>()
			val file: JavaFileObject = JavaSource(projectName, code)
			val compilationUnits: Iterable<JavaFileObject> = listOf(file)
			var libsClassPath = (File("$extensionDirectory/deps").listFiles()
				?.joinToString(System.getProperty("path.separator")) ?: "")
			if (libsClassPath.isNotEmpty()) {
				libsClassPath = System.getProperty("path.separator") + libsClassPath.replace("\n", "")
			}
			println(libsClassPath)
			println("android.jar" + System.getProperty("path.separator") + System.getProperty("java.class.path") + libsClassPath)
			val options: ArrayList<String> = ArrayList(
				listOf(
					"-classpath",
					"android.jar" + System.getProperty("path.separator") + System.getProperty("java.class.path") + libsClassPath,
					"-target",
					"1.7",
					"-source",
					"1.7",
					"-d",
					classesDir.absolutePath
				)
			)
			val task = compiler.getTask(null, null, diagnostics, options, null, compilationUnits)
			task.setProcessors(
				listOf(
					ComponentDescriptorGenerator(),
					ComponentListGenerator(),
					ComponentTranslationGenerator(),
					MarkdownDocumentationGenerator()
				)
			)
			val success = task.call()
			for (diagnostic in diagnostics.diagnostics) {
				// TODO: Simplify the errors for a non java user.
				if (diagnostic.kind == Diagnostic.Kind.ERROR) { // ignore java warnings,
					// they are not useful when dealing with blockly
					userErrors.add(ErrorGeneration.Error(diagnostic.getMessage(null), ErrorGeneration.ErrorType.COMPILE)) // an error occurred while compiling source files.
				}
			}
			success
		} catch (e: Exception) {
			e.printStackTrace()
			false
		}
	}

	private fun proguardSourceFiles(externalComponents: File): Boolean {
		return try {
			val outJar = File(externalComponents, "AndroidRuntime_p.jar")
			val inJar = File(File(File(externalComponents, packageName), "files"), "AndroidRuntime.jar")
			val configuration = """-verbose
-dontwarn
-dontnote **
-allowaccessmodification
-dontskipnonpubliclibraryclasses
-mergeinterfacesaggressively
-overloadaggressively
-repackageclasses ''

-keep public class * {
    public protected *;
}"""
			val configurationLines: Array<String> =
				configuration.split("\n".toRegex()).toTypedArray()
			val proguardFile = File.createTempFile("proguard",".cfg")
			Files.write(proguardFile.toPath(), listOf(*configurationLines))
			R8.run(
				R8Command.parse(
					arrayOf(
						"--release",
						"--classfile",
						"--output",
						outJar.absolutePath,
						"--pg-conf",
						proguardFile.absolutePath,
						inJar.absolutePath
					),
					Origin.root()
				)
					.build()
			)
			inJar.delete()
			outJar.renameTo(inJar)
			true
		} catch (e: Exception) {
			val sw = StringWriter()
			val pw = PrintWriter(sw)
			e.printStackTrace(pw)
			userErrors.add(ErrorGeneration.Error(sw.toString(), ErrorGeneration.ErrorType.PROGUARD))
			false
		}
	}

	@Throws(ParserConfigurationException::class, IOException::class, SAXException::class)
	private fun parseAndroidManifest(classesDir: File): Boolean {
		return try {
			val factory = DocumentBuilderFactory.newInstance()
			factory.isValidating = false
			val builder = factory.newDocumentBuilder()
			val `is` = InputSource(StringReader(androidManifestXml))
			println(androidManifestXml)
			val document = builder.parse(`is`)
			val rootElement = document.documentElement
			val activitiesArray = getActivities(rootElement)
			val receiversArray = getReceivers(rootElement)
			val providersArray = getProviders(rootElement)
			val servicesArray = getServices(rootElement)
			val permissionsArray = getPermissions(rootElement)
			println(permissionsArray)
			val simpleComponentsBuildInfoFile =
				File(classesDir.absolutePath, "simple_components_build_info.json")
			val buildInfoJsonString = IOUtils
				.toString(FileInputStream(simpleComponentsBuildInfoFile), StandardCharsets.UTF_8)
			println(buildInfoJsonString)
			val buildInfoJsonArray = gson.fromJson(buildInfoJsonString,
				ArrayList<LinkedTreeMap<String, Any>>().javaClass)
			val buildInfoJsonObject = buildInfoJsonArray[0]
			buildInfoJsonObject["activities"] = activitiesArray
			buildInfoJsonObject["contentProviders"] = providersArray
			buildInfoJsonObject["broadcastReceivers"] = receiversArray
			buildInfoJsonObject["services"] = servicesArray
			buildInfoJsonObject["permissions"] = permissionsArray
			buildInfoJsonArray.add(buildInfoJsonObject)
			val writer = FileWriter(simpleComponentsBuildInfoFile)
			writer.write(gson.toJson(buildInfoJsonArray))
			writer.close()
			true
		} catch (e: Exception) {
			userErrors.add(ErrorGeneration.Error(e.toString(), ErrorGeneration.ErrorType.ANDORID_MANIFEST))
			false
		}
	}

	private fun getActivities(rootElement: Element): ArrayList<String> {
		val array = ArrayList<String>()
		val activitiesNodes = rootElement.getElementsByTagName("activity")
		var buffer: StringBuffer
		for (i in 0 until activitiesNodes.length) {
			val permissionNode = activitiesNodes.item(i)
			buffer = StringBuffer()
			getXMLString(permissionNode, true, buffer, true)
			array.add(buffer.toString())
		}
		return array
	}

	private fun getReceivers(rootElement: Element): ArrayList<String> {
		val array = ArrayList<String>()
		val nodes = rootElement.getElementsByTagName("receiver")
		var buffer: StringBuffer
		for (i in 0 until nodes.length) {
			val permissionNode = nodes.item(i)
			buffer = StringBuffer()
			getXMLString(permissionNode, true, buffer, true)
			array.add(buffer.toString())
		}
		return array
	}

	private fun getProviders(rootElement: Element): ArrayList<String> {
		val array = ArrayList<String>()
		val providerNodes = rootElement.getElementsByTagName("provider")
		var buffer: StringBuffer
		for (i in 0 until providerNodes.length) {
			val permissionNode = providerNodes.item(i)
			buffer = StringBuffer()
			getXMLString(permissionNode, true, buffer, true)
			array.add(buffer.toString())
		}
		return array
	}

	private fun getServices(rootElement: Element): ArrayList<String> {
		val array = ArrayList<String>()
		val serviceNodes = rootElement.getElementsByTagName("service")
		var buffer: StringBuffer
		for (i in 0 until serviceNodes.length) {
			val permissionNode = serviceNodes.item(i)
			buffer = StringBuffer()
			getXMLString(permissionNode, true, buffer, true)
			array.add(buffer.toString())
		}
		return array
	}

	private fun getPermissions(rootElement: Element): ArrayList<String> {
		val array = ArrayList<String>()
		val permissionNodes = rootElement.getElementsByTagName("uses-permission")
		for (i in 0 until permissionNodes.length) {
			val permissionNode = permissionNodes.item(i)
			array.add(
				permissionNode.attributes.getNamedItem("android:name")
					.nodeValue
			)
		}
		return array
	}

	private fun packExtension(
		outputDirectory: File,
		externalComponents: File,
	): Boolean {
		return try {
			val zipFile = ZipFile(File(outputDirectory, "$packageName.aix"))
			zipFile.addFolder(File(externalComponents, packageName))
			zipFile.close()
			true
		} catch (e: IOException) {
			e.printStackTrace()
			false
		}
	}

	private fun runD8(externalComponents:File, filesDir: File): Boolean {
		return try {
			D8.run(
				D8Command.parse(
					File(filesDir, packageName).listFiles { pathname -> pathname.isFile }?.let {
						arrayOf(
							"--output",
							File(File(externalComponents, packageName), "classes.jar").absolutePath,
							File(File(filesDir, packageName), "$packageName.jar").absolutePath
						)
					},
					Origin.root()
				)
					.build()
			)
			true
		} catch (e: CompilationFailedException) {
			e.printStackTrace()
			false
		} catch (e: IOException) {
			e.printStackTrace()
			false
		}
	}

	private fun generateExtensions(
		filesDirectory: File,
		externalComponentDirectory: File,
		depsDirectory: File,
		classesDirectory: File
	): Boolean {
		return try {
			val simpleComponentsFile = File(classesDirectory.absolutePath, "simple_components.json")
			val simpleComponentsBuildInfoFile =
				File(classesDirectory.absolutePath, "simple_components_build_info.json")
			ExternalComponentGenerator.main(
				arrayOf(
					simpleComponentsFile.absolutePath,
					simpleComponentsBuildInfoFile.absolutePath,
					externalComponentDirectory.absolutePath,
					classesDirectory.absolutePath,
					depsDirectory.absolutePath,
					filesDirectory.absolutePath,
					"false"
				)
			)
			true
		} catch (e: Exception) {
			e.printStackTrace()
			userErrors.add(ErrorGeneration.Error(e.toString(), ErrorGeneration.ErrorType.GENERATE_EXTENSIONS));
			false
		}
	}

	private fun unJarExtensionLibraries(filesDirectory: File): Boolean {
		return try {
			for (jarFile: File in File(
				filesDirectory,
				packageName
			).listFiles { file -> file.extension == "jar" }!!) {
				val zipFile = ZipFile(jarFile)
				zipFile.extractAll(File(filesDirectory, packageName).absolutePath)
			}
			true
		} catch (e: ZipException) {
			false
		}
	}

	private fun jarExtension(filesDirectory: File, externalComponents: File): Boolean {
		val fileOutputStream: FileOutputStream
		return try {
			fileOutputStream = FileOutputStream(File(File(filesDirectory, packageName), packageName.plus(".jar")))
			val manifest = Manifest()
			manifest.mainAttributes[Attributes.Name.MANIFEST_VERSION] = "1.0"
			val jarOut = JarOutputStream(fileOutputStream, manifest)
			for (file in generatedClasses) {
				val relativePath = File(filesDirectory, packageName).toURI().relativize(File(file).toURI()).path
				jarOut.putNextEntry(ZipEntry(relativePath))
				jarOut.write(
					IOUtils.toByteArray(FileInputStream(File(File(filesDirectory, packageName), relativePath)))
				)
			}
			jarOut.closeEntry()
			jarOut.close()
			fileOutputStream.close()
			FileUtils.copyFile(File(File(filesDirectory, packageName), packageName.plus(".jar")), File(File(File(externalComponents, packageName), "files"), "AndroidRuntime.jar"));
			true
		} catch (e: IOException) {
			e.printStackTrace()
			false
		}
	}

	private fun findGeneratedClasses(rootDirectory: File) {
		if (rootDirectory.listFiles() != null) {
			for (file in Objects.requireNonNull(rootDirectory.listFiles())) {
				if (file.isDirectory) {
					findGeneratedClasses(file)
				} else if (file.name
						.endsWith(".class")
				) { // collect class files only to dex afterwards
					generatedClasses.add(file.absolutePath)
				}
			}
		}
	}

	@Throws(ParserConfigurationException::class, IOException::class, SAXException::class)
	fun compile() {
		Thread {
			projectName = propertiesObj["name"] as String?
			proguard = if (propertiesObj.containsKey("proguard")) {
				propertiesObj["proguard"] as Boolean && release
			} else {
				false
			}
			if (projectName == null) {
				userErrors.add(
					ErrorGeneration.Error(
						"Invalid extension properties file.",
						ErrorGeneration.ErrorType.UNKNOWN
					)
				)
				println("[ERROR] Invalid extension properties file.")
				callback.onDone(false)
				return@Thread
			}
			val start = System.currentTimeMillis()
			println("[INFO] Building $projectName")
			userMessages.println("Building $projectName")
			println("[INFO] Compiling Source Files..")
			userMessages.println("_______Compiling Project Source Files..")
			callback.onStatusChange("Compiling Project Source Files (10%)")
			val classesDir = File(extensionDirectory, "classes")
			if (!classesDir.mkdir()) {
				println("[ERROR] Failed to create classes directory")
				callback.onDone(false)
				return@Thread
			}
			if (!compileSourceFiles(classesDir)) {
				println("[ERROR] Compile source files failed.")
				callback.onDone(false)
				return@Thread
			}
			userMessages.println("Parsing Android Manifest")
			callback.onStatusChange("Parsing Android Manifest (20%)")
			if (!parseAndroidManifest(classesDir)) {
				println("[ERROR] Parsing Android Manifest Failed.")
				callback.onDone(false)
				return@Thread
			}
			println("[INFO] Generating Extensions")
			userMessages.println("_______Generating Extensions")
			callback.onStatusChange("Generating Extensions (30%)")
			val externalComponents = File(extensionDirectory, "externalComponents")
			if (!externalComponents.mkdir()) {
				println("[ERROR] Failed to create external components directory")
				callback.onDone(false)
				return@Thread
			}
			// copy icons so they can be picked by the ExternalComponentsGenerator
			if (propertiesObj.containsKey("icon")) {
				val iconName =
					File("$extensionDirectory/aiwebres", propertiesObj["icon"].toString());
				FileUtils.copyFile(
					iconName, File(
						File(
							externalComponents,
							packageName
						).toString() + File.separator + "aiwebres"
							+ File.separator + iconName.name
					)
				)
			}
			val filesDir = File(extensionDirectory, "files")
			if (!filesDir.mkdir()) {
				println("[ERROR] Failed to create files directory")
				callback.onDone(false)
				return@Thread
			}
			val depsDirectory = File(extensionDirectory, "deps")
			depsDirectory.mkdir()
			if (!generateExtensions(
					filesDir,
					externalComponents,
					depsDirectory,
					classesDir
				)
			) {
				callback.onDone(false)
				return@Thread
			}
			println("[INFO] UnJARing extension library files")
			userMessages.println("_______UnJARing extension library files")
			callback.onStatusChange("Unjaring extension library files (40%)")
			if (!unJarExtensionLibraries(filesDir)) {
				userErrors.add(ErrorGeneration.Error("Failed to unjar libraries", ErrorGeneration.ErrorType.UNJAR));
			}
			println("[INFO] Creating JAR file for Extension")
			userMessages.println("_______Creating JAR file for Project")
			callback.onStatusChange("Creating JAR file for Project (50%)")
			findGeneratedClasses(filesDir)
			if (!jarExtension(filesDir, externalComponents)) {
				userErrors.add(
					ErrorGeneration.Error(
						"Failed to jar extensions.",
						ErrorGeneration.ErrorType.JAR
					)
				)
				callback.onDone(false)
				return@Thread
			}
			if (proguard) {
				println("[INFO] Invoking R8..")
				userMessages.println("_______Proguarding Source Files..")
				callback.onStatusChange("Proguarding Source Files (60%)")
				if (!proguardSourceFiles(filesDir)) {
					userErrors.add(
						ErrorGeneration.Error(
							"Failed to proguard extensions.",
							ErrorGeneration.ErrorType.PROGUARD
						)
					)
					callback.onDone(false)
					return@Thread
				}
			}
			println("[INFO] Invoking D8")
			userMessages.println("_______Invoking D8")
			callback.onStatusChange("Invoking D8 (75%)")
			if (!runD8(externalComponents, filesDir)) {
				userErrors.add(
					ErrorGeneration.Error(
						"Failed to invoke D8 Dexer.",
						ErrorGeneration.ErrorType.D8
					)
				)
				callback.onDone(false)
				return@Thread
			}
			println("[INFO] Packing Extension Files")
			userMessages.println("_______Packing Extension Files")
			callback.onStatusChange("Packing Extension Files (90%)")
			val outputDirectory = File(extensionDirectory, "out")
			if (!outputDirectory.mkdir()) {
				println("[ERROR] Failed to create output directory")
				callback.onDone(false)
				return@Thread
			}
			if (!packExtension(
					outputDirectory, externalComponents
				)
			) {
				userErrors.add(
					ErrorGeneration.Error(
						"Failed to pack extension.",
						ErrorGeneration.ErrorType.PACK_EXTENSIONS
					)
				)
				callback.onDone(false)
				return@Thread
			}
			val time = ((System.currentTimeMillis() - start) / 1000.0).roundToInt()
			println("[INFO] Finished Compilation in $time sec")
			userMessages.println("Compilation Succeeded")
			callback.onDone(true)
		}.start()
	}

	private fun getXMLString(
		node: Node, withoutNamespaces: Boolean, buff: StringBuffer,
		_endTag: Boolean
	) {
		var endTag = _endTag
		buff.append("<")
			.append(namespace(node.nodeName, withoutNamespaces))
		if (node.hasAttributes()) {
			buff.append(" ")
			val attr = node.attributes
			val attrLenth = attr.length
			for (i in 0 until attrLenth) {
				val attrItem = attr.item(i)
				val name = namespace(attrItem.nodeName, withoutNamespaces)
				val value = attrItem.nodeValue
				buff.append(name)
					.append("=")
					.append("\"")
					.append(value)
					.append("\"")
				if (i < attrLenth - 1) {
					buff.append(" ")
				}
			}
		}
		if (node.hasChildNodes()) {
			buff.append(">")
			val children = node.childNodes
			val childrenCount = children.length
			if (childrenCount == 1) {
				val item = children.item(0)
				val itemType = item.nodeType.toInt()
				if (itemType == Node.TEXT_NODE.toInt()) {
					if (item.nodeValue == null) {
						buff.append("/>")
					} else {
						buff.append(item.nodeValue)
						buff.append("</")
							.append(namespace(node.nodeName, withoutNamespaces))
							.append(">")
					}
					endTag = false
				}
			}
			for (i in 0 until childrenCount) {
				val item = children.item(i)
				val itemType = item.nodeType.toInt()
				if (itemType == Node.DOCUMENT_NODE.toInt() || itemType == Node.ELEMENT_NODE.toInt()) {
					getXMLString(item, withoutNamespaces, buff, endTag)
				}
			}
		} else {
			if (node.nodeValue == null) {
				buff.append("/>")
			} else {
				buff.append(node.nodeValue)
				buff.append("</")
					.append(namespace(node.nodeName, withoutNamespaces))
					.append(">")
			}
			endTag = false
		}
		if (endTag) {
			buff.append("</")
				.append(namespace(node.nodeName, withoutNamespaces))
				.append(">")
		}
	}

	private fun namespace(str: String, withoutNamespace: Boolean): String {
		return if (withoutNamespace && str.contains(":")) {
			str.substring(str.indexOf(":") + 1)
		} else str
	}
}

internal class JavaSource(name: String?, private val code: String) : SimpleJavaFileObject(
	URI.create(
		"string:///" + (name?.replace(
			'.',
			'/'
		)) + JavaFileObject.Kind.SOURCE.extension
	), JavaFileObject.Kind.SOURCE
) {
	override fun getCharContent(ignoreEncodingErrors: Boolean): CharSequence {
		return code
	}
}

interface CompilerCallback {
	fun onStatusChange(status: String)

	fun onDone(result: Boolean)
}
