import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Play, Info, History, X } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ContentCard } from "../components/ContentCard";
import { SeriesCard } from "../components/SeriesCard";
import { useRequireAccount } from "../hooks/use-require-account";
import { useSettings } from "../hooks/use-settings";
import { useCachedQuery, accountKey } from "../lib/queries";
import { getVodStreams, getSeries, getLiveStreams, proxiedImage, type Account, type SeriesItem } from "../lib/xtream";
import { loadProgress, removeProgress, type ProgressEntry } from "../lib/storage";
import { SplashPreloader } from "../components/SplashPreloader";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FLOW TV — Início" },
      { name: "description", content: "Canais ao vivo, filmes e séries com player inteligente no FLOW TV." },
    ],
  }),
  component: Home,
});

function Home() {
  const { account, ready } = useRequireAccount();
  const key = accountKey(account);
  const { settings } = useSettings();

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

  if (!ready || !account) {
    return (
      <SplashPreloader
        logo={settings.logo}
        background={settings.background}
        steps={[
          { label: "Conectando…", done: false, error: false },
          { label: "Canais ao vivo", done: false, error: false },
          { label: "Catálogo de filmes", done: false, error: false },
          { label: "Séries", done: false, error: false },
        ]}
      />
    );
  }

  if (movies.isLoading || series.isLoading || live.isLoading) {
    return (
      <SplashPreloader
        logo={settings.logo}
        background={settings.background}
        steps={[
          { label: "Canais ao vivo", done: !live.isLoading, error: false },
          { label: "Catálogo de filmes", done: !movies.isLoading, error: false },
          { label: "Séries", done: !series.isLoading, error: false },
        ]}
      />
    );
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
          toSearch={{ sort: "recent" }}
          items={(movies.data ?? []).slice(0, 18).map((m) => ({
            id: m.stream_id,
            to: "/movie/$id",
            title: m.name,
            image: m.stream_icon,
            rating: m.rating,
          }))}
        />

        <SeriesHomeRow loading={series.isLoading && !series.data} items={(series.data ?? []).slice(0, 18)} account={account} cacheKey={key} toSearch={{ sort: "recent" }} />

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
  toSearch,
  wide,
}: {
  title: string;
  items: RowItem[];
  loading: boolean;
  to: string;
  toSearch?: Record<string, string>;
  wide?: boolean;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <Link to={to as never} search={toSearch} className="focusable text-sm font-medium text-primary hover:underline">
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
  toSearch,
}: {
  items: SeriesItem[];
  loading: boolean;
  account: Account;
  cacheKey: string;
  toSearch?: Record<string, string>;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Séries populares</h2>
        <Link to="/series" search={toSearch} className="focusable text-sm font-medium text-primary hover:underline">
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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Reset error when banner changes
    setImageError(false);
  }, [currentIndex]);

  useEffect(() => {
    if (validBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % validBanners.length);
        setIsTransitioning(false);
      }, 300); // Tempo de transição: 300ms
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
        <img
          key={currentBanner.image}
          src={currentBanner.image}
          alt="Anúncio"
          className={`w-full object-contain sm:object-cover transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          style={{
            maxHeight: '50vh',
            minHeight: '120px',
            aspectRatio: '16/9'
          }}
          loading="eager"
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback se a imagem não carregar
        <div key="fallback" className="flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary p-3 text-center" style={{
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
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsTransitioning(false);
                }, 300);
              }}
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




