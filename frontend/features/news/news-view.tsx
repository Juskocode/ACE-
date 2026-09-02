'use client';

import { Bookmark, ExternalLink, Newspaper, PlusCircle, Radio, Sparkles } from 'lucide-react';

import { PageIntro } from '@/components/app/page-intro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { NewsItem, ViewKey } from '@/lib/types';

export function NewsView({ news, onNavigate }: { news: NewsItem[]; onNavigate: (view: ViewKey) => void }) {
  return (
    <div>
      <PageIntro eyebrow="Atualizações clínicas" title="O que mudou e porque importa." description="Publicações oficiais e clínicas relacionadas com os teus materiais, priorizadas pelo potencial impacto no estudo." icon={Newspaper} action={<Button variant="outline" className="h-11 rounded-xl" onClick={() => onNavigate('sources')}><Radio className="size-4" /> Ver fontes ativas</Button>} />

      <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {news.map((item) => (
            <Card key={item.id} className="border-0 py-0 ring-1 ring-border">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2"><Badge variant={item.impact === 'Alto' ? 'default' : 'secondary'} className={item.impact === 'Alto' ? 'bg-orange-600' : ''}>Impacto {item.impact.toLowerCase()}</Badge><Badge variant="outline">{item.area}</Badge><span className="ml-auto text-xs text-muted-foreground">{item.publishedAt}</span></div>
                <h2 className="mt-4 font-display text-xl font-semibold leading-7 tracking-tight">{item.title}</h2>
                <div className="mt-4 rounded-xl bg-muted/65 p-4"><div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary"><Sparkles className="size-3.5" /> Resumo automático</div><p className="mt-2 text-sm leading-6 text-foreground/70">{item.summary}</p></div>
                <div className="mt-5 flex flex-wrap items-center gap-3"><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">{item.publisher} · ver original <ExternalLink className="size-3.5" /></a><span className="text-xs text-muted-foreground">{item.relatedQuestions ? `${item.relatedQuestions} questões relacionadas` : 'Aviso administrativo'}</span><div className="ml-auto flex gap-1"><Button size="sm" variant="ghost"><Bookmark className="size-3.5" /> Guardar</Button><Button size="sm" variant="outline"><PlusCircle className="size-3.5" /> Criar questões</Button></div></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="space-y-4">
          <Card className="border-0 bg-ink py-0 text-white ring-0"><CardContent className="p-6"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-teal-200">Radar pessoal</p><h2 className="mt-4 font-display text-xl font-semibold">4 atualizações tocam nas tuas lacunas</h2><p className="mt-2 text-xs leading-5 text-white/55">Cardiologia, saúde materna e farmacologia foram cruzadas com a matriz e com os teus resultados.</p><div className="mt-5 flex flex-wrap gap-2"><Badge className="bg-white/10 text-white">Cardiologia</Badge><Badge className="bg-white/10 text-white">Obstetrícia</Badge><Badge className="bg-white/10 text-white">Farmacologia</Badge></div></CardContent></Card>
          <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><p className="text-xs font-semibold">Como a feed é preparada</p><ol className="mt-4 space-y-3 text-xs leading-5 text-muted-foreground"><li><strong className="mr-2 text-primary">01</strong>Recolha via RSS, API ou página permitida.</li><li><strong className="mr-2 text-primary">02</strong>Deduplicação e ligação à matriz PNA.</li><li><strong className="mr-2 text-primary">03</strong>Resumo com atribuição e data de recolha.</li><li><strong className="mr-2 text-primary">04</strong>Revisão antes de gerar conteúdo publicado.</li></ol></CardContent></Card>
        </aside>
      </div>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">Resumo automático; consulta a publicação original e respetiva data de atualização. O conteúdo é exclusivamente educativo.</p>
    </div>
  );
}
