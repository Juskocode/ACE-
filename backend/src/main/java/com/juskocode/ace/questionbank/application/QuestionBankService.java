package com.juskocode.ace.questionbank.application;

import com.juskocode.ace.questionbank.domain.Question;
import com.juskocode.ace.questionbank.infrastructure.QuestionJdbcRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class QuestionBankService {
    private final QuestionJdbcRepository repository;

    public QuestionBankService(QuestionJdbcRepository repository) {
        this.repository = repository;
    }

    public List<Question> findQuestions(String area, int limit) {
        return repository.find(area, limit);
    }

    public List<Question> allPublishedQuestions() {
        return repository.find(null, 200).stream()
                .filter(question -> "Revista".equals(question.status()))
                .toList();
    }
}
