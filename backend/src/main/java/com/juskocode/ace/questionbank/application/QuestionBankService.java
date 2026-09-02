package com.juskocode.ace.questionbank.application;

import com.juskocode.ace.questionbank.domain.Question;
import com.juskocode.ace.questionbank.infrastructure.QuestionJdbcRepository;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class QuestionBankService {
    private static final Set<String> USABLE_STATUSES = Set.of("Revista", "Demonstração");

    private final QuestionJdbcRepository repository;

    public QuestionBankService(QuestionJdbcRepository repository) {
        this.repository = repository;
    }

    public List<Question> findQuestions(String area, int limit) {
        return repository.find(area, limit);
    }

    public List<Question> allPublishedQuestions() {
        return repository.find(null, 200).stream()
                .filter(question -> USABLE_STATUSES.contains(question.status()))
                .toList();
    }
}
