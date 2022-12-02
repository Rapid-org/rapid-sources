package io.mohamed.rapid.buildserver;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static io.mohamed.rapid.buildserver.PricingPlan.resolvePlanFromApiKey;

@Component
@CrossOrigin(origins = "*")
public class RateLimitInterceptor implements HandlerInterceptor {

	@Autowired
	private PricingPlanService pricingPlanService;

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
		throws Exception {
		String apiKey = request.getHeader("X-api-key");
		if (apiKey == null || apiKey.isEmpty()) {
			response.sendError(HttpStatus.BAD_REQUEST.value(), "Missing Header: X-api-key");
			return false;
		}
		Bucket tokenBucket = pricingPlanService.resolveBucket(apiKey);
		ConsumptionProbe probe = tokenBucket.tryConsumeAndReturnRemaining(1);
		if (probe.isConsumed()) {
			System.out.println(request.getRequestURI());
			PricingPlan plan = resolvePlanFromApiKey(apiKey);
			response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
			response.setHeader("Access-Control-Expose-Headers", "X-Rate-Limit-Remaining");
			return true;
		} else {
			long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
			response.setHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill));
			response.setHeader("Access-Control-Expose-Headers", "X-Rate-Limit-Retry-After-Seconds");
			response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(),
				"You have exhausted your API Request Quota");
			return false;
		}

	}
}
