package com.juskocode.ace.assessment.application;

import com.juskocode.ace.assessment.api.GenerateExamRequest;
import com.juskocode.ace.assessment.domain.GeneratedExam;
import com.juskocode.ace.questionbank.application.QuestionBankService;
import com.juskocode.ace.questionbank.domain.Question;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class ExamGenerationService {
    private static final List<String> WEAK_AREAS = List.of("Ginecologia/Obstetrícia", "Psiquiatria");

    private final QuestionBankService questionBank;

    public ExamGenerationService(QuestionBankService questionBank) {
        this.questionBank = questionBank;
    }

    public GeneratedExam generate(GenerateExamRequest request) {
        var requestedAreas = request.areas() == null ? List.<String>of() : request.areas();
        var candidates = questionBank.allPublishedQuestions().stream()
                .filter(question -> requestedAreas.isEmpty() || matchesArea(question, requestedAreas))
                .toList();

        if (candidates.isEmpty()) {
            throw new IllegalArgumentException("Não existem questões publicadas para as áreas selecionadas.");
        }

        var shuffled = new ArrayList<>(candidates);
        Collections.shuffle(shuffled, new Random(request.seed()));
        if (request.boostWeakTopics()) {
            shuffled.sort((left, right) -> Boolean.compare(WEAK_AREAS.contains(right.area()), WEAK_AREAS.contains(left.area())));
        }

        var actualCount = Math.min(request.questionCount(), shuffled.size());
        var items = List.copyOf(shuffled.subList(0, actualCount));
        var manifest = new ArrayList<String>();
        manifest.add("Seleção determinística guardada com seed " + request.seed() + ".");
        manifest.add("Foram evitadas questões duplicadas dentro deste exame.");
        if (request.boostWeakTopics()) {
            manifest.add("Lacunas recentes receberam prioridade no balanceamento.");
        }
        if (actualCount < request.questionCount()) {
            manifest.add("Protótipo: o pedido de %d questões foi limitado às %d revistas disponíveis."
                    .formatted(request.questionCount(), actualCount));
        }

        var areas = items.stream().map(Question::area).collect(
                java.util.stream.Collectors.collectingAndThen(
                        java.util.stream.Collectors.toCollection(LinkedHashSet::new),
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
                items);
    }

    private boolean matchesArea(Question question, List<String> requestedAreas) {
        return requestedAreas.stream().anyMatch(area -> question.area().toLowerCase(Locale.ROOT)
                .equals(area.toLowerCase(Locale.ROOT)));
    }
}
