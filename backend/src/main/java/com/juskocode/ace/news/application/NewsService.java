package com.juskocode.ace.news.application;

import com.juskocode.ace.news.domain.NewsItem;
import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

@Service
public class NewsService {
    private final JdbcClient jdbc;

    public NewsService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<NewsItem> list() {
        return jdbc.sql("""
                select id, title, summary, publisher, published_label, area,
                       impact, source_url, related_questions
                from news_items order by retrieved_at desc
                """)
                .query((rs, row) -> new NewsItem(
                        rs.getString("id"), rs.getString("title"), rs.getString("summary"),
                        rs.getString("publisher"), rs.getString("published_label"), rs.getString("area"),
                        rs.getString("impact"), rs.getString("source_url"), rs.getInt("related_questions")))
                .list();
    }
}
