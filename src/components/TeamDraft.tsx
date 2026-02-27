import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fifaTeams, type FifaTeam, type TeamType, type TeamTier } from "@/data/fifaTeams";
import { Shuffle, Plus, Trash2, Star, Trophy, Shield, Flag } from "lucide-react";

export const TeamDraft = () => {
  const [players, setPlayers] = useState<string[]>([""]);
  const [teamsPerPlayer, setTeamsPerPlayer] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<Set<TeamType>>(new Set(["club", "selecao"]));
  const [selectedTiers, setSelectedTiers] = useState<Set<TeamTier>>(new Set(["bom"]));
  const [results, setResults] = useState<{ player: string; teams: FifaTeam[] }[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);

  const addPlayer = () => setPlayers([...players, ""]);
  const removePlayer = (i: number) => setPlayers(players.filter((_, idx) => idx !== i));
  const updatePlayer = (i: number, name: string) => {
    const updated = [...players];
    updated[i] = name;
    setPlayers(updated);
  };

  const toggleType = (type: TeamType) => {
    const next = new Set(selectedTypes);
    if (next.has(type)) {
      if (next.size > 1) next.delete(type);
    } else {
      next.add(type);
    }
    setSelectedTypes(next);
  };

  const toggleTier = (tier: TeamTier) => {
    const next = new Set(selectedTiers);
    if (next.has(tier)) {
      if (next.size > 1) next.delete(tier);
    } else {
      next.add(tier);
    }
    setSelectedTiers(next);
  };

  const sortear = () => {
    const validPlayers = players.filter((p) => p.trim());
    if (validPlayers.length === 0) return;

    setIsSpinning(true);

    const filtered = fifaTeams.filter(
      (t) => selectedTypes.has(t.type) && selectedTiers.has(t.tier)
    );
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const totalNeeded = validPlayers.length * teamsPerPlayer;

    if (shuffled.length < totalNeeded) {
      alert("Não há times suficientes! Mude os filtros ou reduza o número de times por jogador.");
      setIsSpinning(false);
      return;
    }

    setTimeout(() => {
      const draft: { player: string; teams: FifaTeam[] }[] = [];
      let idx = 0;
      for (const player of validPlayers) {
        const teams = shuffled.slice(idx, idx + teamsPerPlayer);
        draft.push({ player, teams });
        idx += teamsPerPlayer;
      }
      setResults(draft);
      setIsSpinning(false);
    }, 1200);
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    return (
      <span className="flex gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-accent text-accent" />
        ))}
        {half && <Star className="w-3 h-3 fill-accent/50 text-accent" />}
      </span>
    );
  };

  const filteredCount = fifaTeams.filter(
    (t) => selectedTypes.has(t.type) && selectedTiers.has(t.tier)
  ).length;

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-primary" />
            Configurar Sorteio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Jogadores */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
              Jogadores
            </label>
            <div className="space-y-2">
              {players.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Jogador ${i + 1}`}
                    value={p}
                    onChange={(e) => updatePlayer(i, e.target.value)}
                    className="bg-muted/50 border-border"
                  />
                  {players.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removePlayer(i)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addPlayer} className="mt-2 gap-1">
              <Plus className="w-3 h-3" /> Adicionar Jogador
            </Button>
          </div>

          {/* Tipo: Times ou Seleções */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
              Tipo
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => toggleType("club")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all border ${
                  selectedTypes.has("club")
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Shield className="w-4 h-4" />
                Times
              </button>
              <button
                onClick={() => toggleType("selecao")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all border ${
                  selectedTypes.has("selecao")
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Flag className="w-4 h-4" />
                Seleções
              </button>
            </div>
          </div>

          {/* Qualidade */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
              Qualidade
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => toggleTier("bom")}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all border ${
                  selectedTiers.has("bom")
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                ⭐ Bom
              </button>
              <button
                onClick={() => toggleTier("medio")}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all border ${
                  selectedTiers.has("medio")
                    ? "bg-accent/20 border-accent text-accent"
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                👍 Médio
              </button>
              <button
                onClick={() => toggleTier("ruim")}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all border ${
                  selectedTiers.has("ruim")
                    ? "bg-destructive/20 border-destructive text-destructive"
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                💀 Ruim
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filteredCount} times disponíveis
            </p>
          </div>

          {/* Times por jogador */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Times por Jogador
            </label>
            <Input
              type="number"
              min={1}
              max={5}
              value={teamsPerPlayer}
              onChange={(e) => setTeamsPerPlayer(Number(e.target.value))}
              className="bg-muted/50 border-border w-32"
            />
          </div>

          <Button
            onClick={sortear}
            disabled={isSpinning}
            className="w-full text-lg font-bold h-12 gap-2 glow-primary"
            size="lg"
          >
            {isSpinning ? (
              <span className="animate-spin">⚽</span>
            ) : (
              <Shuffle className="w-5 h-5" />
            )}
            {isSpinning ? "Sorteando..." : "SORTEAR TIMES"}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          <h3 className="text-2xl font-bold text-center text-glow flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-accent" />
            Resultado do Sorteio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r, i) => (
              <Card key={i} className="border-primary/30 bg-card/80 backdrop-blur overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-4">
                  <p className="text-lg font-bold text-primary mb-3">{r.player}</p>
                  {r.teams.map((team, j) => (
                    <div
                      key={j}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/30 mb-1"
                    >
                      <span className="font-semibold">{team.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{team.league}</span>
                        {renderStars(team.rating)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
