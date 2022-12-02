package io.mohamed.rapid.buildserver;

import java.util.zip.ZipEntry
import java.util.zip.ZipFile

public class Util {

	companion object {
		fun getEntryByPath(path: String, zipFile: ZipFile): ZipEntry? {
			val entries = zipFile.entries()
			while (entries.hasMoreElements()) {
				val entry = entries.nextElement()
				if (entry.name == path) {
					return entry
				}
			}
			return null
		}

		fun getLibrariesEntries(zipFile: ZipFile): ArrayList<ZipEntry>? {
			val entries = zipFile.entries()
			val libEntries = ArrayList<ZipEntry>()
			while (entries.hasMoreElements()) {
				val entry = entries.nextElement()
				if (entry.name.startsWith("libraries/") && !entry.isDirectory) {
					libEntries.add(entry)
				}
			}
			return libEntries
		}
	}

}
