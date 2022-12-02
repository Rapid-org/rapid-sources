import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.5.31")
    }
}
plugins {
    id("org.springframework.boot") version "2.5.2"
    id("io.spring.dependency-management") version "1.0.11.RELEASE"
    java
    application
    kotlin("jvm") version "1.6.0-RC"
}
apply(plugin = "application")
apply(plugin = "kotlin")
apply(plugin = "maven-publish")
group = "io.mohamed"
version = "0.0.1"

application {
    mainClass.set("io.mohamed.rapid.buildserver.BuildServer")
}

repositories {
    mavenCentral()
    google()
    flatDir {
        dirs("lib")
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.zeroturnaround:zt-zip:1.14")
    implementation("commons-io:commons-io:2.11.0")
    implementation("com.android.tools:r8:2.2.64")
	implementation(":AnnotationProcessors")
    implementation(":kawa")
    implementation(":proguard")
	implementation(":AndroidRuntime")
	//implementation(":android")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.5.31")
    implementation("io.github.classgraph:classgraph:4.8.128")
	implementation("com.google.firebase:firebase-admin:9.0.0")
	implementation("com.thoughtworks.paranamer:paranamer:2.8")
    implementation("org.jsoup:jsoup:1.14.3")
	implementation("org.xeustechnologies:jcl-core:2.8")
	implementation("com.google.code.gson:gson:2.9.1")
	implementation("net.lingala.zip4j:zip4j:2.11.2")
	implementation(fileTree(mapOf("dir" to "lib", "include" to listOf("*.jar"))))
	implementation("org.springframework.boot:spring-boot-starter:2.7.3")
	implementation("com.github.vladimir-bukhtoyarov:bucket4j-core:7.6.0")
	implementation("com.jcabi:jcabi-aether:0.10.1")
	implementation("org.eclipse.aether:aether-impl:1.1.0" )
		implementation( "org.eclipse.aether:aether-connector-basic:1.1.0")
	implementation( "org.eclipse.aether:aether-transport-file:1.1.0")
		implementation( "org.eclipse.aether:aether-transport-http:1.1.0")
		implementation( "org.apache.maven:maven-aether-provider:3.3.9")
}

val compileKotlin: KotlinCompile by tasks
val compileTestKotlin: KotlinCompile by tasks

compileKotlin.kotlinOptions {
    jvmTarget = "1.8"
}
compileTestKotlin.kotlinOptions {
    jvmTarget = "1.8"
}


tasks.jar {
	println("Creating JAR")
	manifest.attributes["Main-Class"] = "io.mohamed.rapid.buildserver.BuildServer"
	val dependencies = configurations
		.runtimeClasspath
		.get()
		.map(::zipTree) // OR .map { zipTree(it) }
	from(dependencies)
	duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}
