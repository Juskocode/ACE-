package com.juskocode.ace;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

@SpringBootTest
class AceApplicationTest {
    @Autowired
    JdbcClient jdbc;

    @Test
    void migrationsCreateAndSeedTheQuestionPool() {
        var count = jdbc.sql("select count(*) from questions").query(Integer.class).single();
        assertThat(count).isGreaterThanOrEqualTo(10);
    }
}
