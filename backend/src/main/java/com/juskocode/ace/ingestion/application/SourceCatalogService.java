package com.juskocode.ace.ingestion.application;

import com.juskocode.ace.ingestion.domain.SourceFeed;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

@Service
public class SourceCatalogService {
    private final JdbcClient jdbc;

    public SourceCatalogService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<SourceFeed> list() {
        return jdbc.sql("""
                select id, name, authority, feed_type, status, last_sync_label,
                       items_imported, source_url
                from source_feeds order by authority
                """)
                .query((rs, row) -> new SourceFeed(
                        rs.getString("id"), rs.getString("name"), rs.getString("authority"),
                        rs.getString("feed_type"), rs.getString("status"), rs.getString("last_sync_label"),
                        rs.getInt("items_imported"), rs.getString("source_url")))
                .list();
    }

    public Optional<SourceFeed> findById(String sourceId) {
        return jdbc.sql("""
                select id, name, authority, feed_type, status, last_sync_label,
                       items_imported, source_url
                from source_feeds where id = :sourceId
                """)
                .param("sourceId", sourceId)
                .query((rs, row) -> new SourceFeed(
                        rs.getString("id"), rs.getString("name"), rs.getString("authority"),
                        rs.getString("feed_type"), rs.getString("status"), rs.getString("last_sync_label"),
                        rs.getInt("items_imported"), rs.getString("source_url")))
                .optional();
    }
}
