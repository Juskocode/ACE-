package com.juskocode.ace.news.domain;

public record NewsItem(
        String id,
        String title,
        String summary,
        String publisher,
        String publishedAt,
        String area,
        String impact,
        String sourceUrl,
        int relatedQuestions) {
}
