create table ingestion_runs (
  id varchar(40) primary key,
  source_id varchar(40) not null,
  started_at timestamp not null,
  finished_at timestamp,
  run_status varchar(30) not null,
  imported_count integer default 0 not null,
  error_message varchar(1000),
  constraint fk_ingestion_source foreign key (source_id) references source_feeds(id)
);

create unique index uk_news_source_url on news_items(source_url);
create index idx_ingestion_runs_source on ingestion_runs(source_id, started_at);
