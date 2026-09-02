package com.juskocode.ace.ingestion.application;

import com.juskocode.ace.ingestion.domain.IngestionResult;
import com.juskocode.ace.ingestion.domain.SourceFeed;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import javax.xml.parsers.DocumentBuilderFactory;
import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

@Service
public class FeedIngestionService {
    private static final Logger LOGGER = LoggerFactory.getLogger(FeedIngestionService.class);
    private static final int MAX_REDIRECTS = 3;
    private static final int MAX_RESPONSE_BYTES = 2_000_000;
    private static final Set<String> ALLOWED_HOSTS = Set.of(
            "acss.min-saude.pt", "www.acss.min-saude.pt",
            "diariodarepublica.pt", "www.diariodarepublica.pt",
            "dgs.pt", "www.dgs.pt",
            "infarmed.pt", "www.infarmed.pt",
            "ema.europa.eu", "www.ema.europa.eu",
            "ecdc.europa.eu", "www.ecdc.europa.eu",
            "europepmc.org", "www.europepmc.org");
    private static final Pattern DATE = Pattern.compile("\\b(?:\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4}|\\d{4}-\\d{2}-\\d{2})\\b");
    private static final Set<String> GENERIC_LINKS = Set.of(
            "início", "ver mais", "ler mais", "saiba mais", "contactos", "ajuda", "rss", "menu", "pesquisar");

    private final SourceCatalogService sources;
    private final JdbcClient jdbc;
    private final HttpClient httpClient;
    private final Set<String> runningSources = ConcurrentHashMap.newKeySet();

    public FeedIngestionService(SourceCatalogService sources, JdbcClient jdbc) {
        this.sources = sources;
        this.jdbc = jdbc;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(6))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    public IngestionResult sync(String sourceId) {
        var source = sources.findById(sourceId)
                .orElseThrow(() -> new IllegalArgumentException("Fonte de ingestão não encontrada."));
        if (!runningSources.add(sourceId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta fonte já está a ser sincronizada.");
        }
        try {
            return runSync(source);
        } finally {
            runningSources.remove(sourceId);
        }
    }

    private IngestionResult runSync(SourceFeed source) {
        var runId = UUID.randomUUID().toString();
        var started = Instant.now();
        jdbc.sql("insert into ingestion_runs (id, source_id, started_at, run_status) values (:id, :sourceId, :started, 'RUNNING')")
                .param("id", runId).param("sourceId", source.id()).param("started", Timestamp.from(started)).update();

        try {
            var fetch = fetch(validateUri(source.url()));
            var candidates = parse(fetch.body(), fetch.contentType(), source, fetch.uri());
            var imported = persist(candidates, source);
            var completed = Instant.now();
            jdbc.sql("update ingestion_runs set finished_at = :finished, run_status = 'SUCCESS', imported_count = :count where id = :id")
                    .param("finished", Timestamp.from(completed)).param("count", imported).param("id", runId).update();
            jdbc.sql("update source_feeds set last_sync_label = 'Agora', status = 'Ativa', items_imported = items_imported + :count where id = :id")
                    .param("count", imported).param("id", source.id()).update();
            return new IngestionResult(runId, source.id(), source.name(), "SUCCESS", candidates.size(), imported,
                    completed, imported == 0 ? "Fonte verificada; não foram encontrados itens novos." : "Novos itens adicionados com proveniência.");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            return fail(runId, source, exception);
        } catch (Exception exception) {
            return fail(runId, source, exception);
        }
    }

    private URI validateUri(String value) {
        var uri = URI.create(value);
        var scheme = uri.getScheme();
        var host = uri.getHost();
        if (host == null || scheme == null || !(scheme.equals("https") || scheme.equals("http")) || !ALLOWED_HOSTS.contains(host.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("A fonte não pertence à lista de autoridades permitidas.");
        }
        return uri;
    }

    private FetchResult fetch(URI initialUri) throws IOException, InterruptedException {
        var uri = initialUri;
        for (var redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
            var request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(12))
                    .header("Accept", "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8")
                    .header("User-Agent", "ACE-PNA-Research/0.1 (+educational prototype)")
                    .GET()
                    .build();
            var response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            try (var input = response.body()) {
                if (response.statusCode() >= 300 && response.statusCode() < 400) {
                    var location = response.headers().firstValue("Location")
                            .orElseThrow(() -> new IllegalStateException("A fonte devolveu um redirecionamento inválido."));
                    uri = validateUri(uri.resolve(location).toString());
                    continue;
                }
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new IllegalStateException("A fonte respondeu com HTTP " + response.statusCode());
                }
                var bytes = input.readNBytes(MAX_RESPONSE_BYTES + 1);
                if (bytes.length > MAX_RESPONSE_BYTES) {
                    throw new IllegalStateException("A resposta da fonte excede o limite de 2 MB.");
                }
                var contentType = response.headers().firstValue("Content-Type").orElse("");
                return new FetchResult(uri, bytes, contentType);
            }
        }
        throw new IllegalStateException("A fonte excedeu o limite de redirecionamentos.");
    }

    private List<Candidate> parse(byte[] body, String contentType, SourceFeed source, URI sourceUri) throws Exception {
        var prefix = new String(body, 0, Math.min(body.length, 200), StandardCharsets.US_ASCII)
                .stripLeading().toLowerCase(Locale.ROOT);
        if (contentType.toLowerCase(Locale.ROOT).contains("xml")
                || prefix.startsWith("<?xml") || prefix.startsWith("<rss") || prefix.startsWith("<feed")) {
            return parseXml(body, sourceUri);
        }
        return parseHtml(body, source, sourceUri);
    }

    private List<Candidate> parseXml(byte[] xml, URI sourceUri) throws Exception {
        var factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        var document = factory.newDocumentBuilder().parse(new ByteArrayInputStream(xml));
        var nodes = document.getElementsByTagName("item");
        if (nodes.getLength() == 0) {
            nodes = document.getElementsByTagNameNS("*", "entry");
        }

        var candidates = new ArrayList<Candidate>();
        for (var index = 0; index < Math.min(nodes.getLength(), 12); index++) {
            var element = (Element) nodes.item(index);
            var title = text(element, "title");
            var link = normalizeItemUrl(link(element), sourceUri);
            if (title.isBlank() || link.isBlank()) continue;
            var summary = firstNonBlank(text(element, "description"), text(element, "summary"), text(element, "content"));
            var published = firstNonBlank(text(element, "pubDate"), text(element, "published"), text(element, "updated"));
            candidates.add(new Candidate(clean(title, 500), clean(summary, 1500), link.strip(), clean(published, 100)));
        }
        return candidates;
    }

    private List<Candidate> parseHtml(byte[] html, SourceFeed source, URI sourceUri) throws IOException {
        var document = Jsoup.parse(new ByteArrayInputStream(html), null, sourceUri.toString());
        var links = document.select("main article a[href], main h2 a[href], main h3 a[href], "
                + ".portlet-body h2 a[href], .portlet-body h3 a[href], .portlet-body h4 a[href]");
        if (links.isEmpty()) {
            links = document.select("main a[href], #content a[href], .journal-content-article a[href]");
        }

        var candidates = new ArrayList<Candidate>();
        var seen = new HashSet<String>();
        for (var link : links) {
            var title = clean(firstNonBlank(link.attr("title"), link.text()), 500);
            var url = normalizeItemUrl(link.absUrl("href"), sourceUri);
            if (title.length() < 12 || GENERIC_LINKS.contains(title.toLowerCase(Locale.ROOT))
                    || url.isBlank() || url.equals(sourceUri.toString()) || !seen.add(url)) {
                continue;
            }
            var container = closestContent(link);
            var containerText = container == null ? "" : clean(container.text(), 1500);
            var summary = containerText.equals(title) ? "" : containerText;
            var dateMatcher = DATE.matcher(containerText);
            var published = dateMatcher.find() ? dateMatcher.group() : LocalDate.now().format(DateTimeFormatter.ISO_DATE);
            candidates.add(new Candidate(title, summary, url, published));
            if (candidates.size() == 12) break;
        }

        if (candidates.isEmpty()) {
            var title = clean(document.title(), 500);
            return List.of(new Candidate(
                    title.isBlank() ? source.name() : title,
                    "Página oficial verificada; não foram detetadas entradas editoriais estruturadas.",
                    source.url(),
                    LocalDate.now().format(DateTimeFormatter.ISO_DATE)));
        }
        return candidates;
    }

    private org.jsoup.nodes.Element closestContent(org.jsoup.nodes.Element link) {
        for (var element = link.parent(); element != null; element = element.parent()) {
            if (element.is("article, li, .asset-full-content, .list-item, .portlet-body")) return element;
            if (element.is("main, body")) break;
        }
        return link.parent();
    }

    private String normalizeItemUrl(String value, URI sourceUri) {
        try {
            var resolved = sourceUri.resolve(value.strip());
            var scheme = resolved.getScheme();
            return scheme != null && (scheme.equalsIgnoreCase("https") || scheme.equalsIgnoreCase("http"))
                    ? resolved.toString()
                    : "";
        } catch (IllegalArgumentException exception) {
            return "";
        }
    }

    private int persist(List<Candidate> candidates, SourceFeed source) {
        var imported = 0;
        for (var candidate : candidates) {
            var exists = jdbc.sql("select count(*) from news_items where source_url = :url")
                    .param("url", candidate.url()).query(Integer.class).single();
            if (exists > 0) continue;
            var id = UUID.nameUUIDFromBytes(candidate.url().getBytes(StandardCharsets.UTF_8)).toString();
            jdbc.sql("""
                    insert into news_items
                      (id, title, summary, publisher, published_label, area, impact, source_url, related_questions)
                    values
                      (:id, :title, :summary, :publisher, :published, :area, :impact, :url, 0)
                    """)
                    .param("id", id)
                    .param("title", candidate.title())
                    .param("summary", candidate.summary().isBlank() ? "Nova publicação detetada; consulta a fonte original." : candidate.summary())
                    .param("publisher", source.authority())
                    .param("published", candidate.published().isBlank() ? LocalDate.now().format(DateTimeFormatter.ISO_DATE) : candidate.published())
                    .param("area", inferArea(candidate.title() + " " + candidate.summary()))
                    .param("impact", inferImpact(candidate.title()))
                    .param("url", candidate.url())
                    .update();
            imported++;
        }
        return imported;
    }

    private IngestionResult fail(String runId, SourceFeed source, Exception exception) {
        var completed = Instant.now();
        var message = clean(exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage(), 900);
        LOGGER.warn("Source sync {} failed: {}", source.id(), message);
        jdbc.sql("update ingestion_runs set finished_at = :finished, run_status = 'FAILED', error_message = :message where id = :id")
                .param("finished", Timestamp.from(completed)).param("message", message).param("id", runId).update();
        jdbc.sql("update source_feeds set status = 'A rever', last_sync_label = 'Falhou agora' where id = :id")
                .param("id", source.id()).update();
        return new IngestionResult(runId, source.id(), source.name(), "FAILED", 0, 0, completed,
                "Não foi possível sincronizar a fonte. Consulta o registo técnico da execução.");
    }

    private String link(Element element) {
        var elements = element.getElementsByTagName("link");
        if (elements.getLength() == 0) elements = element.getElementsByTagNameNS("*", "link");
        if (elements.getLength() == 0) return "";
        var node = (Element) elements.item(0);
        return node.hasAttribute("href") ? node.getAttribute("href") : node.getTextContent();
    }

    private String text(Element element, String name) {
        var nodes = element.getElementsByTagName(name);
        if (nodes.getLength() == 0) nodes = element.getElementsByTagNameNS("*", name);
        if (nodes.getLength() == 0) return "";
        var node = nodes.item(0);
        return node.getNodeType() == Node.ELEMENT_NODE ? node.getTextContent() : "";
    }

    private String firstNonBlank(String... values) {
        for (var value : values) if (value != null && !value.isBlank()) return value;
        return "";
    }

    private String clean(String value, int maxLength) {
        var plain = Jsoup.parseBodyFragment(value == null ? "" : value).text()
                .replaceAll("\\s+", " ").strip();
        return plain.length() <= maxLength ? plain : plain.substring(0, maxLength - 1) + "…";
    }

    private String inferArea(String value) {
        var text = value.toLowerCase(Locale.ROOT);
        if (text.contains("pediatr") || text.contains("crianç")) return "Pediatria";
        if (text.contains("gravidez") || text.contains("materna") || text.contains("obstetr")) return "Ginecologia/Obstetrícia";
        if (text.contains("psiqu") || text.contains("saúde mental")) return "Psiquiatria";
        if (text.contains("cirurg") || text.contains("trauma")) return "Cirurgia";
        return "Medicina";
    }

    private String inferImpact(String title) {
        var text = title.toLowerCase(Locale.ROOT);
        return text.contains("alerta") || text.contains("segurança") || text.contains("norma") ? "Alto" : "Médio";
    }

    private record Candidate(String title, String summary, String url, String published) {
    }

    private record FetchResult(URI uri, byte[] body, String contentType) {
    }
}
