package com.juskocode.ace.assessment.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.juskocode.ace.assessment.api.GenerateExamRequest;
import com.juskocode.ace.questionbank.application.QuestionBankService;
import com.juskocode.ace.questionbank.domain.Question;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExamGenerationServiceTest {
    @Mock
    private QuestionBankService questionBank;

    @Test
    void sameSeedProducesTheSameSelectionAndOrderWithoutDuplicates() {
        when(questionBank.allPublishedQuestions()).thenReturn(questionPool(60));
        var service = new ExamGenerationService(questionBank);
        var request = request(18, "Equilibrada", false, 4271);

        var first = service.generate(request);
        var second = service.generate(request);

        assertThat(ids(first.items())).containsExactlyElementsOf(ids(second.items()));
        assertThat(first.items()).extracting(Question::id).doesNotHaveDuplicates();
        assertThat(first.seed()).isEqualTo(4271);
    }

    @Test
    void reproducibilityDoesNotDependOnRepositoryOrder() {
        var ordered = questionPool(36);
        var reversed = new ArrayList<>(ordered);
        Collections.reverse(reversed);
        when(questionBank.allPublishedQuestions()).thenReturn(ordered, reversed);
        var service = new ExamGenerationService(questionBank);
        var request = request(15, "Equilibrada", false, 8842);

        var first = service.generate(request);
        var second = service.generate(request);

        assertThat(ids(first.items())).containsExactlyElementsOf(ids(second.items()));
    }

    @Test
    void differentSeedsChangeBothTheSelectionAndThePresentedOrder() {
        when(questionBank.allPublishedQuestions()).thenReturn(questionPool(90));
        var service = new ExamGenerationService(questionBank);

        var first = service.generate(request(21, "Equilibrada", false, 101));
        var second = service.generate(request(21, "Equilibrada", false, 202));
        var firstFullPool = service.generate(request(90, "Equilibrada", false, 303));
        var secondFullPool = service.generate(request(90, "Equilibrada", false, 404));

        assertThat(ids(first.items()).stream().sorted().toList())
                .isNotEqualTo(ids(second.items()).stream().sorted().toList());
        assertThat(ids(firstFullPool.items()).stream().sorted().toList())
                .containsExactlyElementsOf(ids(secondFullPool.items()).stream().sorted().toList());
        assertThat(ids(firstFullPool.items())).isNotEqualTo(ids(secondFullPool.items()));
    }

    @Test
    void appliesAreaAndExactDifficultyFiltersIgnoringCaseAndAccents() {
        when(questionBank.allPublishedQuestions()).thenReturn(List.of(
                question("q-1", "Pediatria", "Difícil"),
                question("q-2", "PEDIATRIA", "DIFÍCIL"),
                question("q-3", "Pediatria", "Média"),
                question("q-4", "Medicina", "Difícil")));
        var service = new ExamGenerationService(questionBank);
        var request = new GenerateExamRequest(
                "Focado", 10, 30, List.of(" pediatria "), "dificil", false, 7);

        var exam = service.generate(request);

        assertThat(exam.items()).extracting(Question::id).containsExactlyInAnyOrder("q-1", "q-2");
        assertThat(exam.items()).extracting(Question::area).allMatch(area -> area.equalsIgnoreCase("Pediatria"));
        assertThat(exam.items()).extracting(Question::difficulty)
                .allMatch(difficulty -> difficulty.equalsIgnoreCase("Difícil"));
        assertThat(exam.questionCount()).isEqualTo(2);
        assertThat(exam.manifestNotes()).anyMatch(note -> note.contains("limitado"));
    }

    @Test
    void balancedProfileSelectsAnEvenDifficultyMixBeforeRandomizingOutputOrder() {
        when(questionBank.allPublishedQuestions()).thenReturn(questionPool(36));
        var service = new ExamGenerationService(questionBank);

        var exam = service.generate(request(12, "Equilibrada", false, 51));

        assertThat(countByDifficulty(exam.items()))
                .containsEntry("Fácil", 4L)
                .containsEntry("Média", 4L)
                .containsEntry("Difícil", 4L);
        assertDifficultyOrderIsRandomized(exam.items());
    }

    @Test
    void progressiveProfileUsesItsDifficultyMixButStillRandomizesOutputOrder() {
        when(questionBank.allPublishedQuestions()).thenReturn(questionPool(48));
        var service = new ExamGenerationService(questionBank);

        var exam = service.generate(request(12, "Progressiva", false, 123));

        assertThat(countByDifficulty(exam.items()))
                .containsEntry("Fácil", 3L)
                .containsEntry("Média", 6L)
                .containsEntry("Difícil", 3L);
        assertDifficultyOrderIsRandomized(exam.items());
    }

    @Test
    void weakAreaBoostAffectsSelectionWithoutForcingWeakQuestionsToTheFront() {
        var candidates = new ArrayList<Question>();
        IntStream.rangeClosed(1, 4)
                .mapToObj(index -> question("weak-" + index, "Psiquiatria", "Média"))
                .forEach(candidates::add);
        IntStream.rangeClosed(1, 12)
                .mapToObj(index -> question("regular-" + index, "Medicina", "Média"))
                .forEach(candidates::add);
        when(questionBank.allPublishedQuestions()).thenReturn(candidates);
        var service = new ExamGenerationService(questionBank);

        var exam = service.generate(request(8, "Média", true, 309));
        var selectedAreas = exam.items().stream().map(Question::area).toList();

        assertThat(selectedAreas).filteredOn("Psiquiatria"::equals).hasSize(4);
        assertThat(selectedAreas.indexOf("Medicina"))
                .isLessThan(selectedAreas.lastIndexOf("Psiquiatria"));
    }

    @Test
    void duplicateQuestionIdsAreRemovedAndRequestedCountIsCappedToAvailability() {
        when(questionBank.allPublishedQuestions()).thenReturn(List.of(
                question("q-1", "Medicina", "Média"),
                question("q-1", "Medicina", "Média"),
                question("q-2", "Cirurgia", "Média")));
        var service = new ExamGenerationService(questionBank);

        var exam = service.generate(request(10, "Média", false, 19));

        assertThat(exam.items()).extracting(Question::id).containsExactlyInAnyOrder("q-1", "q-2");
        assertThat(exam.questionCount()).isEqualTo(2);
        assertThat(exam.manifestNotes()).anyMatch(note -> note.contains("limitado"));
    }

    private GenerateExamRequest request(int questionCount, String difficulty, boolean boostWeakTopics, long seed) {
        return new GenerateExamRequest("Misto", questionCount, 30, List.of(), difficulty, boostWeakTopics, seed);
    }

    private List<Question> questionPool(int size) {
        var difficulties = List.of("Fácil", "Média", "Difícil");
        var areas = List.of("Medicina", "Cirurgia", "Pediatria", "Psiquiatria");
        return IntStream.range(0, size)
                .mapToObj(index -> question(
                        "q-%03d".formatted(index),
                        areas.get(index % areas.size()),
                        difficulties.get(index % difficulties.size())))
                .toList();
    }

    private Question question(String id, String area, String difficulty) {
        return new Question(id, area, "Tema", difficulty, "A", "Diagnóstico", "Enunciado",
                List.of("A", "B", "C", "D"), 0, "Explicação", "Fonte", "https://example.test", "Revista");
    }

    private List<String> ids(List<Question> questions) {
        return questions.stream().map(Question::id).toList();
    }

    private Map<String, Long> countByDifficulty(List<Question> questions) {
        return questions.stream().map(Question::difficulty)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
    }

    private void assertDifficultyOrderIsRandomized(List<Question> questions) {
        var presentedOrder = questions.stream().map(Question::difficulty).toList();
        var sortedOrder = presentedOrder.stream().sorted(difficultyComparator()).toList();
        assertThat(presentedOrder).isNotEqualTo(sortedOrder);
    }

    private Comparator<String> difficultyComparator() {
        var rank = Map.of("Fácil", 0, "Média", 1, "Difícil", 2);
        return Comparator.comparingInt(rank::get);
    }
}
