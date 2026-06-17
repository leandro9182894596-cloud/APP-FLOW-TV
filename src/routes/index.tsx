import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Play, Info, Loader2, History, X, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "../components/AppShell";
import { ContentCard } from "../components/ContentCard";
import { SeriesCard } from "../components/SeriesCard";
import { useRequireAccount } from "../hooks/use-require-account";
import { useSettings } from "../hooks/use-settings";
import { useCachedQuery, accountKey } from "../lib/queries";
import { getVodStreams, getSeries, getLiveStreams, proxiedImage, type Account, type SeriesItem } from "../lib/xtream";
import { loadProgress, removeProgress, type ProgressEntry } from "../lib/storage";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FLOW TV — Início" },
      { name: "description", content: "Canais ao vivo, filmes e séries com player inteligente no FLOW TV." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { account, ready } = useRequireAccount();
  const key = accountKey(account);
  const settings = useSettings();

  const movies = useCachedQuery(`${key}:vod:all`, () => getVodStreams(account!), { enabled: !!account });
  const series = useCachedQuery(`${key}:series:all`, () => getSeries(account!), { enabled: !!account });
  const live = useCachedQuery(`${key}:live:all`, () => getLiveStreams(account!), { enabled: !!account });

  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const featured = useMemo(() => {
    const list = movies.data ?? [];
    const withImg = list.filter((m) => m.stream_icon);
    return withImg.length ? withImg[Math.floor(Math.random() * Math.min(withImg.length, 30))] : list[0];
  }, [movies.data]);

  // Preload buffer: fetch movies, series and live TV in parallel and report
  // per-step progress before releasing the app.
  const steps: PreloadStep[] = [
    { label: "Filmes", done: !!movies.data, error: !!movies.error },
    { label: "Séries", done: !!series.data, error: !!series.error },
    { label: "TV ao Vivo", done: !!live.data, error: !!live.error },
  ];
  const settled = steps.filter((s) => s.done || s.error).length;
  const preloading = !!account && settled < steps.length;

  if (!ready || !account) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (preloading) {
    return <SplashPreloader logo={settings.logo} background={settings.background} steps={steps} />;
  }


  const removeFromHistory = (k: string) => {
    removeProgress(k);
    setProgress(loadProgress());
  };

  return (
    <>
      {/* Tela de Renovação desativada */}
      
      <AppShell>
        {/* Hero */}
        {featured && (
          <section className="relative h-[56vh] min-h-[380px] w-full overflow-hidden">
            {featured.stream_icon && (
              <img
                src={proxiedImage(featured.stream_icon)}
                alt={featured.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="relative z-10 flex h-full flex-col justify-end p-6 lg:p-12">
              <div className="w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
                Em destaque
              </div>
              <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight text-white drop-shadow-lg lg:text-5xl">
                {featured.name}
              </h1>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/movie/$id"
                  params={{ id: String(featured.stream_id) }}
                  className="focusable inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
                >
                  <Play className="h-5 w-5" fill="currentColor" /> Assistir
                </Link>
                <Link
                  to="/movie/$id"
                  params={{ id: String(featured.stream_id) }}
                  className="focusable inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Info className="h-5 w-5" /> Detalhes
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Ad banner — below the featured hero */}
        {(() => {
          // Tenta banners múltiplos primeiro, senão usa o banner único
          let bannersList: Array<{ image: string; link?: string }> = [];
          
          if (settings.banners && Array.isArray(settings.banners) && settings.banners.length > 0) {
            bannersList = settings.banners.filter((b: any) => {
              // More flexible check for banner image
              return b.image || b.banner || b.src || b.url;
            }).map((b: any) => ({
              image: b.image || b.banner || b.src || b.url,
              link: b.link || b.href || b.url
            }));
          } else if (settings.banner) {
            bannersList = [{ image: settings.banner, link: settings.bannerLink }];
          }
          
          if (bannersList.length > 0) {
            return (
              <div className="px-4 pt-6 lg:px-12">
                <AdBanner banners={bannersList} />
              </div>
            );
          }
          
          // Debug banner placeholder
          return (
            <div className="px-4 pt-6 lg:px-12">
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/30 p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum banner encontrado. Adicione um na página /admin!
                </p>
              </div>
            </div>
          );
        })()}

        <div className="space-y-10 px-4 py-8 lg:px-12">



        {/* Continue watching */}
        {progress.length > 0 && (
          <Row title="Continuar assistindo" icon={<History className="h-5 w-5 text-primary" />}>
            {progress.map((p) => (
              <div key={p.key} className="group/cw relative">
                <ContentCard
                  to={p.type === "movie" ? "/movie/$id" : "/series/$id"}
                  params={{ id: String(p.refId) }}
                  title={p.title}
                  image={p.poster}
                  progress={p.duration ? p.position / p.duration : 0}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromHistory(p.key);
                  }}
                  className="absolute right-1.5 top-1.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-foreground opacity-0 transition-opacity group-hover/cw:opacity-100"
                  aria-label="Remover"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Row>
        )}

        <RowSection
          title="Filmes em destaque"
          loading={movies.isLoading && !movies.data}
          to="/movies"
          items={(movies.data ?? []).slice(0, 18).map((m) => ({
            id: m.stream_id,
            to: "/movie/$id",
            title: m.name,
            image: m.stream_icon,
            rating: m.rating,
          }))}
        />

        <SeriesHomeRow loading={series.isLoading && !series.data} items={(series.data ?? []).slice(0, 18)} account={account} cacheKey={key} />

        <RowSection
          title="Canais ao vivo"
          loading={live.isLoading && !live.data}
          to="/live"
          wide
          items={(live.data ?? []).slice(0, 18).map((c) => ({
            id: c.stream_id,
            to: "/live",
            title: c.name,
            image: c.stream_icon,
          }))}
        />
      </div>
    </AppShell>
    </>
  );
}

function Row({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="font-display text-xl font-bold">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {Array.isArray(children) ? (
          children.map((c, i) => (
            <div key={i} className="w-32 shrink-0 sm:w-40">
              {c}
            </div>
          ))
        ) : (
          <>{children}</>
        )}
      </div>
    </section>
  );
}

interface RowItem {
  id: number;
  to: string;
  title: string;
  image?: string;
  rating?: string;
}

function RowSection({
  title,
  items,
  loading,
  to,
  wide,
}: {
  title: string;
  items: RowItem[];
  loading: boolean;
  to: string;
  wide?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <Link to={to as never} className="focusable text-sm font-medium text-primary hover:underline">
          Ver tudo
        </Link>
      </div>
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`shrink-0 animate-pulse rounded-xl bg-card ${wide ? "aspect-video w-56" : "aspect-[2/3] w-32 sm:w-40"}`}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum conteúdo disponível.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {items.map((item) => (
            <div key={item.id} className={`shrink-0 ${wide ? "w-56" : "w-32 sm:w-40"}`}>
              <ContentCard
                to={item.to}
                params={{ id: String(item.id) }}
                title={item.title}
                image={item.image}
                rating={item.rating}
                wide={wide}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SeriesHomeRow({
  items,
  loading,
  account,
  cacheKey,
}: {
  items: SeriesItem[];
  loading: boolean;
  account: Account;
  cacheKey: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Séries populares</h2>
        <Link to="/series" className="focusable text-sm font-medium text-primary hover:underline">
          Ver tudo
        </Link>
      </div>
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-32 shrink-0 animate-pulse rounded-xl bg-card sm:w-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum conteúdo disponível.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {items.map((item) => (
            <div key={item.series_id} className="w-32 shrink-0 sm:w-40">
              <SeriesCard account={account} cacheKey={cacheKey} series={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AdBanner({ banners }: { banners: Array<{ image: string; link?: string }> }) {
  // Filtra apenas banners válidos
  const validBanners = banners.filter(b => b && b.image && b.image.trim());
  
  if (validBanners.length === 0) return null;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset error when banner changes
    setImageError(false);
  }, [currentIndex]);

  useEffect(() => {
    if (validBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validBanners.length);
    }, 5000); // 5 segundos por banner

    return () => clearInterval(interval);
  }, [validBanners.length]);

  const currentBanner = validBanners[currentIndex];

  const content = (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 shadow-glow ring-1 ring-primary/20">
      <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
        Anúncio
      </span>
      
      {!imageError ? (
        <motion.img
          src={currentBanner.image}
          alt="Anúncio"
          className="w-full object-contain sm:object-cover"
          style={{
            maxHeight: '50vh',
            minHeight: '120px',
            aspectRatio: '16/9'
          }}
          loading="eager"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback se a imagem não carregar
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary p-3 text-center" style={{
          maxHeight: '50vh',
          minHeight: '120px',
          aspectRatio: '16/9'
        }}>
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-muted-foreground">Anúncio</span>
        </div>
      )}
      
      {/* Indicadores */}
      {validBanners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {validBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (currentBanner.link) {
    return (
      <a href={currentBanner.link} target="_blank" rel="noopener noreferrer" className="focusable block">
        {content}
      </a>
    );
  }
  return content;
}


interface PreloadStep {
  label: string;
  done: boolean;
  error: boolean;
}

function SplashPreloader({
  logo,
  background,
  steps,
}: {
  logo?: string;
  background?: string;
  steps: PreloadStep[];
}) {
  const settled = steps.filter((s) => s.done || s.error).length;
  const pct = Math.round((settled / steps.length) * 100);
  const activeIndex = steps.findIndex((s) => !s.done && !s.error);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-6">
      {background && (
        <div className="pointer-events-none absolute inset-0">
          <img src={background} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-background/85" />
        </div>
      )}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
      >
        {logo ? (
          <img src={logo} alt="Logo" className="mb-6 h-20 w-auto max-w-[220px] object-contain" />
        ) : (
          <h1 className="mb-6 font-display text-4xl font-extrabold tracking-tight">
            FLOW<span className="text-gradient">TV</span>
          </h1>
        )}

        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Carregando seu catálogo… {pct}%</p>

        {/* Per-step progress */}
        <ul className="mt-6 w-full space-y-2 text-left">
          {steps.map((step, i) => {
            const isActive = i === activeIndex;
            return (
              <li
                key={step.label}
                className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                  step.done
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : step.error
                      ? "border-destructive/40 bg-destructive/10 text-foreground"
                      : isActive
                        ? "border-border bg-card/70 text-foreground"
                        : "border-border/60 bg-card/30 text-muted-foreground"
                }`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center">
                  {step.done ? (
                    <Check className="h-5 w-5 text-primary" />
                  ) : step.error ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                  )}
                </span>
                <span className="flex-1 font-medium">{step.label}</span>
                <span className="text-xs text-muted-foreground">
                  {step.done ? "Pronto" : step.error ? "Falhou" : isActive ? "Carregando…" : "Aguardando"}
                </span>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}


