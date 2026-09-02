package com.juskocode.ace.ingestion.api;

import com.juskocode.ace.ingestion.application.FeedIngestionService;
import com.juskocode.ace.ingestion.application.SourceCatalogService;
import com.juskocode.ace.ingestion.domain.IngestionResult;
import com.juskocode.ace.ingestion.domain.SourceFeed;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/sources")
public class SourceController {
    private final SourceCatalogService service;
    private final FeedIngestionService ingestion;
    private final byte[] ingestionKey;

    public SourceController(
            SourceCatalogService service,
            FeedIngestionService ingestion,
            @Value("${ace.ingestion.api-key:}") String ingestionKey) {
        this.service = service;
        this.ingestion = ingestion;
        this.ingestionKey = ingestionKey.getBytes(StandardCharsets.UTF_8);
    }

    @GetMapping
    public List<SourceFeed> list() {
        return service.list();
    }

    @PostMapping("/{sourceId}/sync")
    public ResponseEntity<IngestionResult> sync(
            @PathVariable String sourceId,
            @RequestHeader(value = "X-ACE-Ingestion-Key", required = false) String providedKey) {
        authorize(providedKey);
        var result = ingestion.sync(sourceId);
        var status = result.status().equals("SUCCESS") ? HttpStatus.OK : HttpStatus.BAD_GATEWAY;
        return ResponseEntity.status(status).body(result);
    }

    private void authorize(String providedKey) {
        if (ingestionKey.length == 0) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "A sincronização manual não está configurada.");
        }
        var provided = providedKey == null ? new byte[0] : providedKey.getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(ingestionKey, provided)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credencial de ingestão inválida.");
        }
    }
}
