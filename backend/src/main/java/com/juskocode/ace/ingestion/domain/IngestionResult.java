package com.juskocode.ace.ingestion.domain;

import java.time.Instant;

public record IngestionResult(
        String runId,
        String sourceId,
        String sourceName,
        String status,
        int discovered,
        int imported,
        Instant completedAt,
        String message) {
}
