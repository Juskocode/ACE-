package com.juskocode.ace.questionbank.infrastructure;

import com.juskocode.ace.questionbank.domain.Question;
import java.util.Arrays;
import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class QuestionJdbcRepository {
    private static final String SELECT = """
            select id, area, topic, difficulty, relevance, competency, stem,
                   options_text, correct_index, explanation, source_name, source_url, status
            from questions
            """;

    private final JdbcClient jdbc;

    public QuestionJdbcRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Question> find(String area, int limit) {
        var normalizedLimit = Math.max(1, Math.min(limit, 200));
        if (area == null || area.isBlank()) {
            return jdbc.sql(SELECT + " order by area, topic limit :limit")
                    .param("limit", normalizedLimit)
                    .query(this::map)
                    .list();
        }
        return jdbc.sql(SELECT + " where lower(area) = lower(:area) order by topic limit :limit")
                .param("area", area)
                .param("limit", normalizedLimit)
                .query(this::map)
                .list();
    }

    private Question map(java.sql.ResultSet resultSet, int rowNumber) throws java.sql.SQLException {
        return new Question(
                resultSet.getString("id"),
                resultSet.getString("area"),
                resultSet.getString("topic"),
                resultSet.getString("difficulty"),
                resultSet.getString("relevance"),
                resultSet.getString("competency"),
                resultSet.getString("stem"),
                Arrays.asList(resultSet.getString("options_text").split("\\|", -1)),
                resultSet.getInt("correct_index"),
                resultSet.getString("explanation"),
                resultSet.getString("source_name"),
                resultSet.getString("source_url"),
                resultSet.getString("status"));
    }
}
