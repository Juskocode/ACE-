package com.juskocode.ace.assessment.api;

import com.juskocode.ace.assessment.application.ExamGenerationService;
import com.juskocode.ace.assessment.domain.GeneratedExam;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exams")
public class ExamController {
    private final ExamGenerationService service;

    public ExamController(ExamGenerationService service) {
        this.service = service;
    }

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public GeneratedExam generate(@Valid @RequestBody GenerateExamRequest request) {
        return service.generate(request);
    }
}
