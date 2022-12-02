package io.mohamed.rapid.buildserver

import java.io.File

class Result {
    val isSuccessful: Boolean
    var outputExtension: File? = null
        private set
	val status: String
	var fileName = "extension.aix"

    constructor(successful: Boolean, outputExtension: File?) {
        isSuccessful = successful
        this.outputExtension = outputExtension
		this.status = ""
    }

    constructor(successful: Boolean) {
        isSuccessful = successful
		this.status = ""
    }

	constructor(successful: Boolean, status:String) {
		isSuccessful = successful
		this.status = status
	}

	public fun setExtensionFileName(fileName:String) {
		this.fileName = fileName
	}
}
