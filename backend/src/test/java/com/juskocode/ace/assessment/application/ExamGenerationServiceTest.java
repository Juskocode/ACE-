package com.juskocode.ace.assessment.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.juskocode.ace.assessment.api.GenerateExamRequest;
import com.juskocode.ace.questionbank.application.QuestionBankService;
import com.juskocode.ace.questionbank.domain.Question;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExamGenerationServiceTest {
    @Mock
    private QuestionBankService questionBank;

    @Test
    void sameSeedProducesSameQuestionOrderWithoutDuplicates() {
        when(questionBank.allPublishedQuestions()).thenReturn(List.of(
                question("q-1", "Medicina"),
                question("q-2", "Cirurgia"),
                question("q-3", "Pediatria")));
        var service = new ExamGenerationService(questionBank);
        var request = new GenerateExamRequest("Misto", 3, 30, List.of(), "Equilibrada", false, 4271);

        var first = service.generate(request);
        var second = service.generate(request);

        assertThat(first.items()).extracting(Question::id)
                .containsExactlyElementsOf(second.items().stream().map(Question::id).toList());
        assertThat(first.items()).extracting(Question::id).doesNotHaveDuplicates();
    }

    @Test
    void filtersByRequestedAreaAndRecordsRelaxedCount() {
        when(questionBank.allPublishedQuestions()).thenReturn(List.of(
                question("q-1", "Medicina"),
                question("q-2", "Pediatria")));
        var service = new ExamGenerationService(questionBank);
        var request = new GenerateExamRequest("Focado", 10, 30, List.of("Pediatria"), "Equilibrada", false, 7);

        var exam = service.generate(request);

        assertThat(exam.items()).extracting(Question::area).containsOnly("Pediatria");
        assertThat(exam.questionCount()).isEqualTo(1);
        assertThat(exam.manifestNotes()).anyMatch(note -> note.contains("limitado"));
    }

    private Question question(String id, String area) {
        return new Question(id, area, "Tema", "Média", "A", "Diagnóstico", "Enunciado",
                List.of("A", "B", "C", "D"), 0, "Explicação", "Fonte", "https://example.test", "Revista");
    }
}
