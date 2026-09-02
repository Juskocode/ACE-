package com.juskocode.ace.materials.application;

import com.juskocode.ace.materials.domain.MaterialItem;
import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

@Service
public class MaterialsService {
    private final JdbcClient jdbc;

    public MaterialsService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<MaterialItem> list() {
        return jdbc.sql("""
                select id, title, publisher, item_type, area, updated_label,
                       progress, collection_name, source_url
                from materials order by collection_name, title
                """)
                .query((rs, row) -> new MaterialItem(
                        rs.getString("id"), rs.getString("title"), rs.getString("publisher"),
                        rs.getString("item_type"), rs.getString("area"), rs.getString("updated_label"),
                        rs.getInt("progress"), rs.getString("collection_name"), rs.getString("source_url")))
                .list();
    }
}
