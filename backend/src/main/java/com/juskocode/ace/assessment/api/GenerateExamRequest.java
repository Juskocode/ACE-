package com.juskocode.ace.assessment.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record GenerateExamRequest(
        @NotBlank String mode,
        @Min(5) @Max(150) int questionCount,
        @Min(10) @Max(240) int durationMinutes,
        List<String> areas,
        String difficulty,
        boolean boostWeakTopics,
        long seed) {
}
