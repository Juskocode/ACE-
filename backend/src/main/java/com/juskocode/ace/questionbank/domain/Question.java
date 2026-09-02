package com.juskocode.ace.questionbank.domain;

import java.util.List;

public record Question(
        String id,
        String area,
        String topic,
        String difficulty,
        String relevance,
        String competency,
        String stem,
        List<String> options,
        int correctIndex,
        String explanation,
        String source,
        String sourceUrl,
        String status) {
}
