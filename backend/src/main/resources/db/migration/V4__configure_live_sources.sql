update source_feeds
set source_url = 'https://www.dgs.pt/upload/DGSv9/rss/c5002.xml', feed_type = 'RSS'
where id = 's-003';

update source_feeds
set source_url = 'https://www.infarmed.pt/web/infarmed/rss-alertas/-/asset_publisher/grlvtkM7UJK8/rss?p_p_cacheability=cacheLevelFull',
    feed_type = 'RSS'
where id = 's-004';

update source_feeds set feed_type = 'Web' where id in ('s-002', 's-005');
