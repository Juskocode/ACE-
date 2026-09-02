package com.juskocode.ace.ingestion.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class FeedIngestionServiceCooldownTest {
    @Test
    void rejectsSequentialSyncsUntilThePerSourceCooldownExpires() {
        var clock = new MutableClock(Instant.parse("2026-09-02T19:00:00Z"));
        var guard = new FeedIngestionService.SourceSyncGuard(Duration.ofSeconds(120), clock);

        guard.acquire("s-004");
        guard.release("s-004");

        clock.advance(Duration.ofSeconds(119));
        assertThatThrownBy(() -> guard.acquire("s-004"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
                    assertThat(exception.getReason()).contains("1 segundo.");
                });

        clock.advance(Duration.ofSeconds(1));
        assertThatCode(() -> guard.acquire("s-004")).doesNotThrowAnyException();
        guard.release("s-004");
    }

    @Test
    void keepsConcurrentSyncsAsConflictsAndTracksSourcesIndependently() {
        var clock = new MutableClock(Instant.parse("2026-09-02T19:00:00Z"));
        var guard = new FeedIngestionService.SourceSyncGuard(Duration.ofSeconds(120), clock);

        guard.acquire("s-004");

        assertThatThrownBy(() -> guard.acquire("s-004"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        assertThatCode(() -> guard.acquire("s-003")).doesNotThrowAnyException();

        guard.release("s-003");
        guard.release("s-004");
    }

    private static final class MutableClock extends Clock {
        private Instant current;

        private MutableClock(Instant current) {
            this.current = current;
        }

        void advance(Duration duration) {
            current = current.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return current;
        }
    }
}
