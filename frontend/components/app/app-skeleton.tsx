import { Skeleton } from '@/components/ui/skeleton';

export function AppSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-label="A carregar a área de estudo" aria-busy="true">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[242px] shrink-0 border-r border-border bg-sidebar p-5 lg:block">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-2 w-14" /></div>
          </div>
          <div className="mt-10 space-y-3">
            {Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-10 w-full rounded-xl" />)}
          </div>
          <Skeleton className="mt-[34vh] h-32 w-full rounded-2xl" />
        </aside>
        <section className="min-w-0 flex-1">
          <div className="flex h-[72px] items-center border-b border-border px-5 sm:px-8 xl:px-12">
            <Skeleton className="h-9 w-full max-w-[400px] rounded-xl" />
            <Skeleton className="ml-auto size-9 rounded-full" />
          </div>
          <div className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8 xl:px-12 xl:py-10">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-4 h-10 w-72" />
            <Skeleton className="mt-3 h-4 w-96 max-w-full" />
            <div className="mt-8 grid gap-5 xl:grid-cols-[1.45fr_.9fr]">
              <Skeleton className="h-[320px] rounded-2xl" />
              <Skeleton className="h-[320px] rounded-2xl" />
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-40 rounded-2xl" />)}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
