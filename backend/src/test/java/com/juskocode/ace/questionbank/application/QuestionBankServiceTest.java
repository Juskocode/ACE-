package com.juskocode.ace.questionbank.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.juskocode.ace.questionbank.domain.Question;
import com.juskocode.ace.questionbank.infrastructure.QuestionJdbcRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QuestionBankServiceTest {
    @Mock
    private QuestionJdbcRepository repository;

    @Test
    void makesReviewedAndClearlyLabelledDemonstrationItemsUsableButExcludesDrafts() {
        when(repository.find(null, 200)).thenReturn(List.of(
                question("reviewed", "Revista"),
                question("demo", "Demonstração"),
                question("draft", "Rascunho")));

        var questions = new QuestionBankService(repository).allPublishedQuestions();

        assertThat(questions).extracting(Question::id).containsExactly("reviewed", "demo");
    }

    private Question question(String id, String status) {
        return new Question(
                id,
                "Medicina",
                "Tema",
                "Média",
                "A",
                "Diagnóstico",
                "Enunciado",
                List.of("A", "B", "C", "D"),
                0,
                "Explicação",
                "Fonte",
                "https://example.test",
                status);
    }
}
