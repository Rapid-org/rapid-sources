package io.mohamed.rapid.buildserver

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter
import java.util.*


@SpringBootApplication
open class BuildServer {

    companion object {
        @JvmStatic fun main(args: Array<String>) {
            runApplication<BuildServer>(*args)
        }
    }

	@Bean
	open fun corsFilter(): CorsFilter? {
		val source = UrlBasedCorsConfigurationSource()
		val config = CorsConfiguration()
		config.allowCredentials = true
		config.addAllowedOriginPattern("*") // this allows all origin
		config.addAllowedHeader("*") // this allows all headers
		config.addAllowedMethod("OPTIONS")
		config.addAllowedMethod("HEAD")
		config.addAllowedMethod("GET")
		config.addAllowedMethod("PUT")
		config.addAllowedMethod("POST")
		config.addAllowedMethod("DELETE")
		config.addAllowedMethod("PATCH")
		source.registerCorsConfiguration("/**", config)
		return CorsFilter(source)
	}
}
