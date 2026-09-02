package com.juskocode.ace.ingestion.domain;

public record SourceFeed(
        String id,
        String name,
        String authority,
        String type,
        String status,
        String lastSync,
        int itemsImported,
        String url) {
}
