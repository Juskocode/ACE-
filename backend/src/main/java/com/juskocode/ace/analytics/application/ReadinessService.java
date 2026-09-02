package com.juskocode.ace.analytics.application;

import com.juskocode.ace.analytics.domain.ReadinessPoint;
import java.util.List;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

@Service
public class ReadinessService {
    private final JdbcClient jdbc;

    public ReadinessService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<ReadinessPoint> timeline() {
        return jdbc.sql("select label, score, target from readiness_snapshots order by observed_on")
                .query((rs, row) -> new ReadinessPoint(
                        rs.getString("label"), rs.getInt("score"), rs.getInt("target")))
                .list();
    }
}
