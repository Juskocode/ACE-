package com.juskocode.ace.dashboard.application;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private static final LocalDate EXAM_DATE = LocalDate.of(2026, 11, 25);

    public DashboardData dashboard() {
        var today = LocalDate.now(ZoneId.of("Europe/Lisbon"));
        var days = Math.max(0, ChronoUnit.DAYS.between(today, EXAM_DATE));
        return new DashboardData(
                "Marta",
                "PNA 2026 → IM 2027",
                "25 de novembro de 2026",
                days,
                72,
                4,
                "Alta",
                1286,
                222,
                300,
                8,
                new Recommendation(
                        "Consolidar insuficiência cardíaca",
                        "O desempenho neste tema está 14 pontos abaixo da média de Medicina. Uma sessão focada pode fechar esta lacuna.",
                        12,
                        18),
                List.of(
                        new SubjectScore("Medicina", 82, 88, 5, "Forte"),
                        new SubjectScore("Pediatria", 76, 73, 3, "Forte"),
                        new SubjectScore("Cirurgia", 69, 67, 2, "A consolidar"),
                        new SubjectScore("Psiquiatria", 66, 61, -1, "A consolidar"),
                        new SubjectScore("Ginecologia/Obstetrícia", 58, 49, 1, "Prioridade")),
                List.of(
                        new ActivityPoint("Seg", 28, 47),
                        new ActivityPoint("Ter", 34, 55),
                        new ActivityPoint("Qua", 18, 31),
                        new ActivityPoint("Qui", 42, 62),
                        new ActivityPoint("Sex", 12, 22),
                        new ActivityPoint("Sáb", 0, 0),
                        new ActivityPoint("Dom", 5, 5)));
    }

    public record DashboardData(
            String learnerName,
            String targetLabel,
            String examDate,
            long daysToExam,
            int readiness,
            int readinessDelta,
            String readinessConfidence,
            int answeredQuestions,
            int studyMinutesThisWeek,
            int weeklyGoalMinutes,
            int currentStreakDays,
            Recommendation recommendation,
            List<SubjectScore> subjectScores,
            List<ActivityPoint> weeklyActivity) {
    }

    public record Recommendation(String title, String description, int questionCount, int estimatedMinutes) {
    }

    public record SubjectScore(String name, int score, int coverage, int trend, String status) {
    }

    public record ActivityPoint(String label, int questions, int minutes) {
    }
}
