package com.juskocode.ace.ingestion.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.juskocode.ace.ingestion.application.FeedIngestionService;
import com.juskocode.ace.ingestion.application.SourceCatalogService;
import com.juskocode.ace.ingestion.domain.IngestionResult;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class SourceControllerTest {
    private final SourceCatalogService catalog = mock(SourceCatalogService.class);
    private final FeedIngestionService ingestion = mock(FeedIngestionService.class);

    @Test
    void rejectsManualSyncWithoutTheServerSideKey() {
        var controller = new SourceController(catalog, ingestion, "test-secret");

        assertThatThrownBy(() -> controller.sync("s-004", null))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
        verifyNoInteractions(ingestion);
    }

    @Test
    void acceptsManualSyncWithTheConfiguredKey() {
        var controller = new SourceController(catalog, ingestion, "test-secret");
        var result = new IngestionResult(
                "run-1", "s-004", "INFARMED", "SUCCESS", 12, 3, Instant.now(), "Concluído.");
        when(ingestion.sync("s-004")).thenReturn(result);

        var response = controller.sync("s-004", "test-secret");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(result);
    }
}
