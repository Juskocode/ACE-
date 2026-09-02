package com.juskocode.ace.assessment.domain;

import com.juskocode.ace.questionbank.domain.Question;
import java.util.List;

public record GeneratedExam(
        String id,
        String title,
        int questionCount,
        int durationMinutes,
        String mode,
        List<String> areas,
        long seed,
        List<String> manifestNotes,
        List<Question> items) {
}
