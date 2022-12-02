package io.mohamed.rapid.buildserver;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Refill;

import java.time.Duration;

enum PricingPlan {
	FREE {
		@Override
		public Bandwidth getLimit() {
			return Bandwidth.classic(10, Refill.intervally(10, Duration.ofHours(1)));
		}
	},
	BASIC {
		@Override
		public Bandwidth getLimit() {
			return Bandwidth.classic(15, Refill.intervally(15, Duration.ofHours(1)));
		}
	},
	PROFESSIONAL {
		@Override
		public Bandwidth getLimit() {

			return Bandwidth.classic(20, Refill.intervally(50, Duration.ofHours(1)));
		}
	},

	PREMIUM {
		@Override
		public Bandwidth getLimit() {
			return Bandwidth.classic(30, Refill.intervally(30, Duration.ofHours(1)));
		}
	},
	ENTERPRISE {
		@Override
		public Bandwidth getLimit() {
			return Bandwidth.classic(1000, Refill.intervally(1000, Duration.ofHours(1)));
		}
	};

	public Bandwidth getLimit() {
		return null;
	}
	static PricingPlan resolvePlanFromApiKey(String apiKey) {
		System.out.println(apiKey);
		try {
			FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(apiKey);
		System.out.println("plan: "+ decoded.getClaims());
		if (apiKey == null || apiKey.isEmpty()) {
			return FREE;
		} else if (decoded.getClaims().get("plan").equals("basic")) {
			return BASIC;
		} else if (decoded.getClaims().get("plan").equals("professional")) {
			return PROFESSIONAL;
		} else if (decoded.getClaims().get("plan").equals("premium")) {
			return PREMIUM;
		} else if (decoded.getClaims().get("plan").equals("enterprise")) {
			return ENTERPRISE;
		}
		} catch (FirebaseAuthException e) {
			e.printStackTrace();
		}
		return FREE;
	}
}
