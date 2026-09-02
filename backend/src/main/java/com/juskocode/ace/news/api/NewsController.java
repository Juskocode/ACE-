package com.juskocode.ace.news.api;

import com.juskocode.ace.news.application.NewsService;
import com.juskocode.ace.news.domain.NewsItem;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/news")
public class NewsController {
    private final NewsService service;

    public NewsController(NewsService service) {
        this.service = service;
    }

    @GetMapping
    public List<NewsItem> list() {
        return service.list();
    }
}
