'use client';

import { CheckCircle2, DatabaseZap, ExternalLink, RefreshCw, Rss, ShieldCheck } from 'lucide-react';

import { PageIntro } from '@/components/app/page-intro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SourceFeed } from '@/lib/types';

export function SourcesView({ sources }: { sources: SourceFeed[] }) {
  return (
    <div>
      <PageIntro eyebrow="Propagação de conhecimento" title="Fontes com proveniência visível." description="Estado das recolhas oficiais e científicas. Cada item mantém URL canónico, autoridade, data, checksum e ligação à matriz." icon={DatabaseZap} action={<Button className="h-11 rounded-xl"><RefreshCw className="size-4" /> Sincronizar agora</Button>} />

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_36px_rgb(31_55_52/5%)]">
        <div className="grid grid-cols-[1fr_auto] border-b border-border bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-[0.09em] text-muted-foreground sm:grid-cols-[1.4fr_.6fr_.5fr_.6fr_auto]"><span>Fonte</span><span className="hidden sm:block">Tipo</span><span className="hidden sm:block">Itens</span><span className="hidden sm:block">Última recolha</span><span>Estado</span></div>
        {sources.map((source) => (
          <div key={source.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-[1.4fr_.6fr_.5fr_.6fr_auto]">
            <div className="flex min-w-0 items-center gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><Rss className="size-4" /></div><div className="min-w-0"><a href={source.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 truncate text-sm font-semibold hover:text-primary">{source.name}<ExternalLink className="size-3 shrink-0" /></a><p className="mt-0.5 text-xs text-muted-foreground">{source.authority}</p></div></div>
            <span className="hidden text-xs text-muted-foreground sm:block">{source.type}</span><span className="hidden text-sm font-medium tabular-nums sm:block">{source.itemsImported}</span><span className="hidden text-xs text-muted-foreground sm:block">{source.lastSync}</span><Badge className="bg-teal-50 text-teal-700"><CheckCircle2 className="size-3" />{source.status}</Badge>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><ShieldCheck className="size-5 text-teal-700" /><h2 className="mt-3 text-sm font-semibold">Direitos e robots</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Adaptadores verificam permissões e preferem metadados, excertos seguros e APIs oficiais.</p></CardContent></Card>
        <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><DatabaseZap className="size-5 text-sky-700" /><h2 className="mt-3 text-sm font-semibold">Deduplicação</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">URL canónico, identificador do documento e checksum impedem entradas repetidas.</p></CardContent></Card>
        <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><RefreshCw className="size-5 text-amber-700" /><h2 className="mt-3 text-sm font-semibold">Atualizações seguras</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Documentos substituídos ou retirados ficam marcados; nunca são fundidos silenciosamente.</p></CardContent></Card>
      </div>
    </div>
  );
}
