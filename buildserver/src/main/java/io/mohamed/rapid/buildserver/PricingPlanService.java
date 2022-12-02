package io.mohamed.rapid.buildserver;

import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
class PricingPlanService {

	private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

	public Bucket resolveBucket(String apiKey) {
		return cache.computeIfAbsent(apiKey, this::newBucket);
	}

	private Bucket newBucket(String apiKey) {
			return Bucket.builder()
				.addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofHours(1))))
				.build();
	}
}
