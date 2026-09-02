package com.juskocode.ace.dashboard.api;

import com.juskocode.ace.dashboard.application.DashboardService;
import com.juskocode.ace.dashboard.application.DashboardService.DashboardData;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping
    public DashboardData dashboard() {
        return service.dashboard();
    }
}
