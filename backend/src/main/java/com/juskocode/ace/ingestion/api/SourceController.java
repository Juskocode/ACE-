package com.juskocode.ace.ingestion.api;

import com.juskocode.ace.ingestion.application.SourceCatalogService;
import com.juskocode.ace.ingestion.domain.SourceFeed;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sources")
public class SourceController {
    private final SourceCatalogService service;

    public SourceController(SourceCatalogService service) {
        this.service = service;
    }

    @GetMapping
    public List<SourceFeed> list() {
        return service.list();
    }
}
