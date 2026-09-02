package com.juskocode.ace;

import static org.assertj.core.api.Assertions.assertThat;

import com.juskocode.ace.questionbank.application.QuestionBankService;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

@SpringBootTest
class AceApplicationTest {
    @Autowired
    JdbcClient jdbc;

    @Autowired
    QuestionBankService questionBank;

    @Test
    void migrationsCreateAndSeedTheQuestionPool() {
        var count = jdbc.sql("select count(*) from questions").query(Integer.class).single();
        var usableCount = questionBank.allPublishedQuestions().size();
        var areaCounts = jdbc.sql("select area, count(*) as item_count from questions group by area")
                .query((rs, rowNum) -> Map.entry(rs.getString("area"), rs.getInt("item_count")))
                .list();
        var difficultyCounts = jdbc.sql("""
                        select area, difficulty, count(*) as item_count
                        from questions
                        group by area, difficulty
                        """)
                .query((rs, rowNum) -> Map.entry(
                        rs.getString("area") + "/" + rs.getString("difficulty"),
                        rs.getInt("item_count")))
                .list();

        assertThat(count).isGreaterThanOrEqualTo(200);
        assertThat(usableCount).isGreaterThanOrEqualTo(200);
        assertThat(areaCounts).containsExactlyInAnyOrder(
                Map.entry("Medicina", 40),
                Map.entry("Pediatria", 40),
                Map.entry("Cirurgia", 40),
                Map.entry("Ginecologia/Obstetrícia", 40),
                Map.entry("Psiquiatria", 40));
        assertThat(difficultyCounts).containsExactlyInAnyOrder(
                Map.entry("Medicina/Fácil", 13),
                Map.entry("Medicina/Média", 14),
                Map.entry("Medicina/Difícil", 13),
                Map.entry("Pediatria/Fácil", 13),
                Map.entry("Pediatria/Média", 14),
                Map.entry("Pediatria/Difícil", 13),
                Map.entry("Cirurgia/Fácil", 13),
                Map.entry("Cirurgia/Média", 14),
                Map.entry("Cirurgia/Difícil", 13),
                Map.entry("Ginecologia/Obstetrícia/Fácil", 13),
                Map.entry("Ginecologia/Obstetrícia/Média", 14),
                Map.entry("Ginecologia/Obstetrícia/Difícil", 13),
                Map.entry("Psiquiatria/Fácil", 13),
                Map.entry("Psiquiatria/Média", 14),
                Map.entry("Psiquiatria/Difícil", 13));
    }

    @Test
    void demonstrationQuestionsRemainExplicitlyUnreviewedAndAnswersArePositionallyBalanced() {
        var demoCount = jdbc.sql("select count(*) from questions where status = 'Demonstração'")
                .query(Integer.class)
                .single();
        var needsReviewCount = jdbc.sql("""
                        select count(*) from questions
                        where content_origin = 'DEMONSTRATION'
                          and review_status = 'REQUIRES_CLINICAL_REVIEW'
                        """)
                .query(Integer.class)
                .single();
        var answerPositionCounts = jdbc.sql("""
                        select correct_index, count(*) as item_count
                        from questions
                        group by correct_index
                        order by correct_index
                        """)
                .query((rs, rowNum) -> rs.getInt("item_count"))
                .list();

        assertThat(demoCount).isEqualTo(200);
        assertThat(needsReviewCount).isEqualTo(200);
        assertThat(answerPositionCounts).containsExactly(50, 50, 50, 50);
    }
}
