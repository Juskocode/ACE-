package com.juskocode.ace.materials.domain;

public record MaterialItem(
        String id,
        String title,
        String publisher,
        String type,
        String area,
        String updatedAt,
        int progress,
        String collection,
        String sourceUrl) {
}
