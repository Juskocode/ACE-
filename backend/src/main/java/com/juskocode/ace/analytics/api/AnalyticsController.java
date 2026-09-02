package com.juskocode.ace.analytics.api;

import com.juskocode.ace.analytics.application.ReadinessService;
import com.juskocode.ace.analytics.domain.ReadinessPoint;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {
    private final ReadinessService service;

    public AnalyticsController(ReadinessService service) {
        this.service = service;
    }

    @GetMapping("/readiness")
    public List<ReadinessPoint> readiness() {
        return service.timeline();
    }
}
