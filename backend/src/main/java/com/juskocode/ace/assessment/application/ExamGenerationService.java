package com.juskocode.ace.assessment.application;

import com.juskocode.ace.assessment.api.GenerateExamRequest;
import com.juskocode.ace.assessment.domain.GeneratedExam;
import com.juskocode.ace.questionbank.application.QuestionBankService;
import com.juskocode.ace.questionbank.domain.Question;
import java.text.Normalizer;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ExamGenerationService {
    private static final Set<String> WEAK_AREAS = Set.of("ginecologia/obstetricia", "psiquiatria");
    private static final List<String> BALANCED_DIFFICULTIES = List.of("facil", "media", "dificil");
    private static final List<String> PROGRESSIVE_DIFFICULTIES = List.of("facil", "media", "media", "dificil");
    private static final long SELECTION_SEED_SALT = 0x9E3779B97F4A7C15L;
    private static final long ORDER_SEED_SALT = 0xD1B54A32D192ED03L;

    private final QuestionBankService questionBank;

    public ExamGenerationService(QuestionBankService questionBank) {
        this.questionBank = questionBank;
    }

    public GeneratedExam generate(GenerateExamRequest request) {
        var requestedAreas = request.areas() == null
                ? List.<String>of()
                : request.areas().stream()
                        .filter(area -> area != null && !area.isBlank())
                        .map(this::normalize)
                        .toList();
        var candidates = uniqueQuestions(questionBank.allPublishedQuestions()).stream()
                .filter(question -> requestedAreas.isEmpty() || matchesArea(question, requestedAreas))
                .filter(question -> matchesDifficultyConstraint(question, request.difficulty()))
                .toList();

        if (candidates.isEmpty()) {
            throw new IllegalArgumentException("Não existem questões publicadas para os filtros selecionados.");
        }

        var selectionRandom = new Random(mixSeed(request.seed(), SELECTION_SEED_SALT));
        var orderRandom = new Random(mixSeed(request.seed(), ORDER_SEED_SALT));
        var selectionOrder = buildSelectionOrder(
                candidates,
                request.difficulty(),
                request.boostWeakTopics(),
                selectionRandom);

        var actualCount = Math.min(request.questionCount(), selectionOrder.size());
        var items = new ArrayList<>(selectionOrder.subList(0, actualCount));
        Collections.shuffle(items, orderRandom);

        var manifest = new ArrayList<String>();
        manifest.add("Seleção e ordem aleatórias reproduzíveis com seed " + request.seed() + ".");
        manifest.add("Foram evitadas questões duplicadas dentro deste exame.");
        if (request.boostWeakTopics()) {
            manifest.add("Lacunas recentes receberam prioridade no balanceamento.");
        }
        if (actualCount < request.questionCount()) {
            manifest.add("O pedido de %d questões foi limitado às %d disponíveis para os filtros escolhidos."
                    .formatted(request.questionCount(), actualCount));
        }

        var areas = items.stream().map(Question::area).collect(
                Collectors.collectingAndThen(
                        Collectors.toCollection(LinkedHashSet::new),
                        List::copyOf));

        return new GeneratedExam(
                UUID.randomUUID().toString(),
                request.mode(),
                actualCount,
                request.durationMinutes(),
                request.mode(),
                areas,
                request.seed(),
                List.copyOf(manifest),
                List.copyOf(items));
    }

    private List<Question> uniqueQuestions(List<Question> questions) {
        return questions.stream()
                .collect(Collectors.toMap(
                        Question::id,
                        Function.identity(),
                        (first, ignored) -> first,
                        LinkedHashMap::new))
                .values().stream()
                .sorted(Comparator.comparing(Question::id))
                .toList();
    }

    private List<Question> buildSelectionOrder(
            List<Question> candidates,
            String difficulty,
            boolean boostWeakTopics,
            Random random) {
        var normalizedDifficulty = normalize(difficulty);
        if ("equilibrada".equals(normalizedDifficulty)) {
            return interleaveByDifficulty(candidates, BALANCED_DIFFICULTIES, boostWeakTopics, random);
        }
        if ("progressiva".equals(normalizedDifficulty)) {
            return interleaveByDifficulty(candidates, PROGRESSIVE_DIFFICULTIES, boostWeakTopics, random);
        }
        return randomizeForSelection(candidates, boostWeakTopics, random);
    }

    private List<Question> interleaveByDifficulty(
            List<Question> candidates,
            List<String> pattern,
            boolean boostWeakTopics,
            Random random) {
        var buckets = new LinkedHashMap<String, ArrayDeque<Question>>();
        for (var difficulty : BALANCED_DIFFICULTIES) {
            var bucket = candidates.stream()
                    .filter(question -> difficulty.equals(normalize(question.difficulty())))
                    .toList();
            buckets.put(difficulty, new ArrayDeque<>(randomizeForSelection(bucket, boostWeakTopics, random)));
        }

        var knownDifficulties = new LinkedHashSet<>(BALANCED_DIFFICULTIES);
        var otherQuestions = candidates.stream()
                .filter(question -> !knownDifficulties.contains(normalize(question.difficulty())))
                .toList();
        var remaining = new ArrayDeque<>(randomizeForSelection(otherQuestions, boostWeakTopics, random));
        var result = new ArrayList<Question>(candidates.size());

        while (result.size() < candidates.size()) {
            var addedKnownDifficulty = false;
            for (var difficulty : pattern) {
                var question = buckets.get(difficulty).pollFirst();
                if (question != null) {
                    result.add(question);
                    addedKnownDifficulty = true;
                }
            }
            if (!addedKnownDifficulty) {
                result.addAll(remaining);
                break;
            }
        }
        return result;
    }

    private List<Question> randomizeForSelection(
            List<Question> candidates,
            boolean boostWeakTopics,
            Random random) {
        var randomized = new ArrayList<>(candidates);
        Collections.shuffle(randomized, random);
        if (boostWeakTopics) {
            randomized.sort(Comparator.comparing(this::isWeakArea).reversed());
        }
        return randomized;
    }

    private boolean matchesArea(Question question, List<String> requestedAreas) {
        var questionArea = normalize(question.area());
        return requestedAreas.stream().anyMatch(questionArea::equals);
    }

    private boolean matchesDifficultyConstraint(Question question, String requestedDifficulty) {
        var normalizedDifficulty = normalize(requestedDifficulty);
        if (BALANCED_DIFFICULTIES.contains(normalizedDifficulty)) {
            return normalizedDifficulty.equals(normalize(question.difficulty()));
        }
        return true;
    }

    private boolean isWeakArea(Question question) {
        return WEAK_AREAS.contains(normalize(question.area()));
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT);
    }

    private long mixSeed(long seed, long salt) {
        var value = seed + salt;
        value = (value ^ (value >>> 30)) * 0xBF58476D1CE4E5B9L;
        value = (value ^ (value >>> 27)) * 0x94D049BB133111EBL;
        return value ^ (value >>> 31);
    }
}
