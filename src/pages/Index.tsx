import { useState } from "react";
import { TeamDraft } from "@/components/TeamDraft";
import { Tournament } from "@/components/Tournament";
import { Shuffle, Trophy, Gamepad2 } from "lucide-react";

const Index = () => {
  const [tab, setTab] = useState<"draft" | "tournament">("draft");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <Gamepad2 className="w-7 h-7 text-primary" />
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-black tracking-widest text-glow leading-none">
              FIFA 2026
            </h1>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
              Sorteio & Campeonato
            </p>
          </div>
          <span className="text-2xl">⚽</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-8 p-1 bg-muted/30 rounded-xl">
          <button
            onClick={() => setTab("draft")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
              tab === "draft"
                ? "bg-primary text-primary-foreground glow-primary shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Shuffle className="w-4 h-4" />
            Sorteio
          </button>
          <button
            onClick={() => setTab("tournament")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
              tab === "tournament"
                ? "bg-accent text-accent-foreground glow-accent shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Campeonato
          </button>
        </div>

        {tab === "draft" ? <TeamDraft /> : <Tournament />}

        <footer className="text-center py-8 mt-8 text-muted-foreground text-xs border-t border-border/30">
         ©Jordaens Aristil. Todos os direitos reservados.⚽
        </footer>
      </div>
    </div>
  );
};

export default Index;
