import { motion } from "framer-motion";
import { Loader2, Check, AlertCircle } from "lucide-react";

export interface PreloadStep {
  label: string;
  done: boolean;
  error: boolean;
}

export function SplashPreloader({
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
        <div suppressHydrationWarning>
          {logo ? (
            <img src={logo} alt="Logo" className="mb-6 h-20 w-auto max-w-[220px] object-contain" />
          ) : (
            <h1 className="mb-6 font-display text-4xl font-extrabold tracking-tight">
              FLOW<span className="text-gradient">TV</span>
            </h1>
          )}
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Carregando seu catálogo… {pct}%</p>

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
