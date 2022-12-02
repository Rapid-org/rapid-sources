package io.mohamed.rapid.buildserver

import com.google.gson.Gson
import io.mohamed.rapid.buildserver.ErrorGeneration.ErrorType
import org.apache.commons.io.FileUtils
import org.apache.commons.io.IOUtils
import org.springframework.core.io.ClassPathResource
import org.springframework.web.multipart.MultipartFile
import java.io.*
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.util.zip.ZipEntry
import java.util.zip.ZipFile

class ExtensionBuilder {
	lateinit var result: Result
	lateinit var userErrors: ArrayList<ErrorGeneration.Error>
	private lateinit var userMessages: PrintWriter
	lateinit var messages: ByteArrayOutputStream
	var gson: Gson = Gson()
	var done = false;
	fun build(
		inputFile: MultipartFile,
		userMessages: PrintWriter,
		messages: ByteArrayOutputStream,
		errors: ArrayList<ErrorGeneration.Error>,
		isRelease: Boolean
	) {
		this.messages = messages
		this.result = Result(false)
		this.userErrors = errors
		this.userMessages = userMessages
		val input = File(inputFile.name)
		FileUtils.writeByteArrayToFile(input, inputFile.bytes)
		Thread {
			try {
				val file = ZipFile(input)
				val extensionProperties = Util.getEntryByPath("extension.json", file)
				if (extensionProperties == null) {
					println("[ERROR] No extension properties file found in the given project file.")
					userErrors.add(
						ErrorGeneration.Error(
							"Invalid extension project file! No extension properties file found.",
							ErrorType.UNKNOWN
						)
					)
					result = Result(false)
				}
				val inputStream = extensionProperties?.let { file.getInputStream(it) }
				// read extension.json file
				val extensionPropertiesObject = gson.fromJson(
					String(
						IOUtils.toByteArray(inputStream)
					), java.util.HashMap<String, Any>().javaClass
				)
				val projectName = extensionPropertiesObject["name"] as String
				if (projectName.isEmpty()) {
					println("[ERROR] Failed to resolve name for project file.")
					userErrors.add(
						ErrorGeneration.Error(
							"Invalid extension properties file! No project name specified.",
							ErrorType.UNKNOWN
						)
					);
					result = Result(false)
				}
				val packageName = extensionPropertiesObject["packageName"] as String
				if (packageName.isEmpty()) {
					println("[ERROR] Failed to resolve packageName for project file.")
					userErrors.add(
						ErrorGeneration.Error(
							"Invalid extension properties file! No package name specified.",
							ErrorType.UNKNOWN
						)

					)
					result = Result(false)
				}
				var iconName = ""
				if (extensionPropertiesObject.contains("icon")) {
					iconName = extensionPropertiesObject["icon"] as String
				}
				val sourceFile = Util.getEntryByPath(
					"src/main/java/" + packageName
						.replace("\\.".toRegex(), "/") + "/" + projectName + ".java", file
				)
				if (sourceFile == null) {
					println("[ERROR] No source files found in the given project file.")
					userErrors.add(
						ErrorGeneration.Error(
							"Invalid Project file. No Source Files found.",
							ErrorType.UNKNOWN
						)
					)
					result = Result(false)
				}
				val androidManifestXmlFile = Util.getEntryByPath("AndroidManifest.xml", file)
				if (androidManifestXmlFile == null) {
					println("[ERROR] No AndroidManifest file found in the given project file.")
					userErrors.add(
						ErrorGeneration.Error(
							"Invalid Project file. No android manifest Files found.",
							ErrorType.UNKNOWN
						)
					)
					result = Result(false)
				}
				val code =
					IOUtils.toString(
						sourceFile?.let { file.getInputStream(it) },
						StandardCharsets.UTF_8
					)
				val androidManifestXml = IOUtils
					.toString(
						androidManifestXmlFile?.let { file.getInputStream(it) },
						StandardCharsets.UTF_8
					)
				val extensionDir = Files.createTempDirectory(projectName as String?).toFile()
				var `is`: InputStream? = null
				if (iconName.isNotEmpty()) {
					println(iconName)
					val entry = Util.getEntryByPath("aiwebres/$iconName", file)
					if (entry != null) {
						`is` = entry.let { file.getInputStream(it) }
					} else {
						val resource = ClassPathResource("logo.png")
						`is` = resource.inputStream
					}
				}
				if (`is` != null) {
					println("is not null")
					val iconFile = File("$extensionDir/aiwebres/$iconName")
					iconFile.parentFile.mkdirs()
					FileOutputStream(iconFile).use { fos ->
						IOUtils.copy(`is`, fos)
					}
				} else {
					println("is null")
				}
				val libraries = Util.getLibrariesEntries(file)
				if (libraries != null) {
					for (lib: ZipEntry in libraries) {
						val libFile = File("$extensionDir/deps/${lib.name.split("/")[1]}")
						libFile.parentFile.mkdirs()
						FileOutputStream(libFile).use { fos ->
							IOUtils.copy(file.getInputStream(lib), fos)
						}
					}
				}
				val compiler = Compiler(
					extensionPropertiesObject,
					code,
					userErrors,
					androidManifestXml,
					userMessages,
					extensionDir,
					isRelease,
					object : CompilerCallback {
						override fun onStatusChange(status: String) {
							print("Status " + status)
							result = Result(false, status)
						}

						override fun onDone(result: Boolean) {
							val outputExtension =
								File(File(extensionDir, "out"), "$packageName.aix")
							if (result && !outputExtension.exists()) { // unexpected to happen
								println("[ERROR] Failed to find generated extension.")
								userErrors.add(
									ErrorGeneration.Error(
										"Generated extension doesn't exist.",
										ErrorType.UNKNOWN
									)
								)
								this@ExtensionBuilder.result = Result(false)
							}
							val extension: File = File.createTempFile(packageName, ".aix")
							if (outputExtension.exists()) {
								FileUtils.copyFile(outputExtension, extension)
								extension.deleteOnExit()
							}
							FileUtils.deleteQuietly(extensionDir) // cleanup
							val result1 = Result(result, extension)
							result1.setExtensionFileName("$packageName.aix")
							this@ExtensionBuilder.result = result1
							this@ExtensionBuilder.done = true
						}
					})
				compiler.compile()
			} catch (e: Exception) {
				e.printStackTrace()
				result = Result(false)
			}
		}.start();
	}
}
