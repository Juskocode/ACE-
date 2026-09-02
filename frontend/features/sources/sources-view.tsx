'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, DatabaseZap, ExternalLink, LoaderCircle, RefreshCw, Rss, ShieldCheck } from 'lucide-react';

import { PageIntro } from '@/components/app/page-intro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { syncSource } from '@/lib/api';
import type { IngestionResult, SourceFeed } from '@/lib/types';

export function SourcesView({ sources }: { sources: SourceFeed[] }) {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const rssSource = sources.find((source) => source.id === 's-004') ?? sources.find((source) => source.type === 'RSS') ?? sources[0];

  async function handleSync(sourceId: string) {
    setSyncing(sourceId);
    setResult(null);
    try {
      setResult(await syncSource(sourceId));
    } catch (error) {
      const source = sources.find((item) => item.id === sourceId);
      setResult({
        runId: 'unavailable',
        sourceId,
        sourceName: source?.name ?? 'Fonte selecionada',
        status: 'FAILED',
        discovered: 0,
        imported: 0,
        completedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Não foi possível sincronizar esta fonte.',
      });
    } finally {
      setSyncing(null);
    }
  }

  return (
    <div>
      <PageIntro eyebrow="Propagação de conhecimento" title="Fontes com proveniência visível." description="Estado das recolhas oficiais e científicas. Cada item mantém a autoridade, o URL de origem, a data e a área associada." icon={DatabaseZap} action={<Button className="h-11 rounded-xl" disabled={Boolean(syncing) || !rssSource} onClick={() => { if (rssSource) void handleSync(rssSource.id); }}>{syncing === rssSource?.id ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} {syncing === rssSource?.id ? 'A sincronizar RSS' : 'Sincronizar feed RSS'}</Button>} />

      {result ? <div role={result.status === 'SUCCESS' ? 'status' : 'alert'} aria-live="polite" className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${result.status === 'SUCCESS' ? 'border-teal-200 bg-teal-50 text-teal-950' : 'border-orange-200 bg-orange-50 text-orange-950'}`}>{result.status === 'SUCCESS' ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-teal-700" /> : <AlertCircle className="mt-0.5 size-5 shrink-0 text-orange-700" />}<div><p className="font-semibold">{result.sourceName}: {result.status === 'SUCCESS' ? 'sincronização concluída' : 'sincronização por rever'}</p><p className="mt-1 text-xs leading-5 opacity-75">{result.message} {result.status === 'SUCCESS' ? `${result.discovered} encontrados · ${result.imported} novos.` : ''}</p></div></div> : null}

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_36px_rgb(31_55_52/5%)]">
        <div className="grid grid-cols-[1fr_auto] border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground sm:grid-cols-[1.4fr_.6fr_.5fr_.6fr_auto]"><span>Fonte</span><span className="hidden sm:block">Tipo</span><span className="hidden sm:block">Itens</span><span className="hidden sm:block">Última recolha</span><span>Estado</span></div>
        {sources.map((source) => {
          const sourceResult = result?.sourceId === source.id ? result : null;
          const sourceIsSyncing = syncing === source.id;
          const sourceStatus = sourceIsSyncing ? 'A sincronizar' : sourceResult?.status === 'SUCCESS' ? 'Sincronizada' : sourceResult?.status === 'FAILED' ? 'A rever' : source.status;

          return (
          <div key={source.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-[1.4fr_.6fr_.5fr_.6fr_auto]">
            <div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Rss className="size-4" /></div><div className="min-w-0"><a href={source.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-sm font-semibold hover:text-primary">{source.name}<ExternalLink className="size-3 shrink-0" /></a><p className="mt-0.5 text-xs text-muted-foreground">{source.authority}</p></div></div>
            <span className="hidden text-xs text-muted-foreground sm:block">{source.type}</span><span className="hidden text-sm font-medium tabular-nums sm:block">{sourceResult?.status === 'SUCCESS' ? source.itemsImported + sourceResult.imported : source.itemsImported}</span><span className="hidden text-xs text-muted-foreground sm:block">{sourceResult?.status === 'SUCCESS' ? 'Agora' : source.lastSync}</span><button onClick={() => void handleSync(source.id)} disabled={Boolean(syncing)} aria-busy={sourceIsSyncing} className="rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40" aria-label={`Sincronizar ${source.name}`}><Badge className={sourceResult?.status === 'FAILED' ? 'bg-orange-50 text-orange-700' : 'bg-teal-50 text-teal-700'}>{sourceIsSyncing ? <LoaderCircle className="size-3 animate-spin" /> : sourceResult?.status === 'FAILED' ? <AlertCircle className="size-3" /> : <CheckCircle2 className="size-3" />}{sourceStatus}</Badge></button>
          </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><ShieldCheck className="size-5 text-teal-700" /><h2 className="mt-3 text-sm font-semibold">Lista de domínios</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">A recolha só aceita endereços presentes na lista técnica configurada.</p></CardContent></Card>
        <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><DatabaseZap className="size-5 text-sky-700" /><h2 className="mt-3 text-sm font-semibold">Deduplicação por URL</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Um URL de origem já importado não volta a criar a mesma notícia.</p></CardContent></Card>
        <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><RefreshCw className="size-5 text-amber-700" /><h2 className="mt-3 text-sm font-semibold">Recolha controlada</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Cada fonte permite uma execução de cada vez e aplica um intervalo entre recolhas.</p></CardContent></Card>
      </div>
    </div>
  );
}
