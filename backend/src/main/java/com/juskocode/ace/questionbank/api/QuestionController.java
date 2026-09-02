package com.juskocode.ace.questionbank.api;

import com.juskocode.ace.questionbank.application.QuestionBankService;
import com.juskocode.ace.questionbank.domain.Question;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/questions")
public class QuestionController {
    private final QuestionBankService service;

    public QuestionController(QuestionBankService service) {
        this.service = service;
    }

    @GetMapping
    public List<Question> find(
            @RequestParam(required = false) String area,
            @RequestParam(defaultValue = "40") int limit) {
        return service.findQuestions(area, limit);
    }
}
