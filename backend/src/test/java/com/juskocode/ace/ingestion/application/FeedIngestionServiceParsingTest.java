package com.juskocode.ace.ingestion.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.juskocode.ace.ingestion.domain.SourceFeed;
import java.lang.reflect.Method;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.simple.JdbcClient;

class FeedIngestionServiceParsingTest {
    private final FeedIngestionService service = new FeedIngestionService(
            mock(SourceCatalogService.class), mock(JdbcClient.class), Duration.ofSeconds(120));

    @Test
    void discardsItemLinksOutsideTheAuthorityAllowlist() throws Exception {
        var sourceUri = URI.create("https://www.acss.min-saude.pt/pna/");

        assertThat(normalizeItemUrl("https://eur03.safelinks.protection.outlook.com/form", sourceUri))
                .isEmpty();
        assertThat(normalizeItemUrl("/wp-content/uploads/pna.pdf", sourceUri))
                .isEqualTo("https://www.acss.min-saude.pt/wp-content/uploads/pna.pdf");
    }

    @Test
    void returnsNoCandidatesForHtmlWithoutStructuredEntries() throws Exception {
        var html = """
                <!doctype html>
                <html><head><title>JavaScript application</title></head>
                <body><div id="reactContainer"></div></body></html>
                """;

        assertThat(parseHtml(html)).isEmpty();
    }

    @Test
    void skipsDisallowedLinksWhileKeepingAllowedHtmlEntries() throws Exception {
        var html = """
                <main>
                  <h2><a href="https://www.infarmed.pt/alertas/medicamento">Alerta oficial de medicamento</a></h2>
                  <h2><a href="https://example.org/untrusted">Publicação alojada fora da autoridade</a></h2>
                </main>
                """;

        var candidates = parseHtml(html);

        assertThat(candidates).hasSize(1);
        assertThat(candidates.getFirst().toString()).contains("www.infarmed.pt").doesNotContain("example.org");
    }

    private String normalizeItemUrl(String value, URI sourceUri) throws Exception {
        var method = method("normalizeItemUrl", String.class, URI.class);
        return (String) method.invoke(service, value, sourceUri);
    }

    @SuppressWarnings("unchecked")
    private List<Object> parseHtml(String html) throws Exception {
        var method = method("parseHtml", byte[].class, SourceFeed.class, URI.class);
        var source = new SourceFeed(
                "s-test", "Fonte de teste", "Teste", "Web", "Ativa", "Agora", 0,
                "https://www.infarmed.pt/feed");
        return (List<Object>) method.invoke(
                service,
                html.getBytes(StandardCharsets.UTF_8),
                source,
                URI.create(source.url()));
    }

    private Method method(String name, Class<?>... parameterTypes) throws NoSuchMethodException {
        var method = FeedIngestionService.class.getDeclaredMethod(name, parameterTypes);
        method.setAccessible(true);
        return method;
    }
}
