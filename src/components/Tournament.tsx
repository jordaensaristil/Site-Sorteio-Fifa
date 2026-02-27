import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Trophy, Swords, RotateCcw, AlertTriangle } from "lucide-react";

interface Match {
  id: string;
  player1: string;
  player2: string;
  score1: number | null;
  score2: number | null;
  winner: string | null;
}

interface Round {
  name: string;
  matches: Match[];
}

export const Tournament = () => {
  const [participants, setParticipants] = useState<string[]>(["", ""]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [champion, setChampion] = useState<string | null>(null);
  const [drawError, setDrawError] = useState<{ round: number; match: number } | null>(null);

  const addParticipant = () => setParticipants([...participants, ""]);
  const removeParticipant = (i: number) => setParticipants(participants.filter((_, idx) => idx !== i));
  const updateParticipant = (i: number, name: string) => {
    const updated = [...participants];
    updated[i] = name;
    setParticipants(updated);
  };

  const validCount = participants.filter((p) => p.trim()).length;
  const isEven = validCount % 2 === 0;
  const canStart = validCount >= 2 && isEven;

  const getRoundName = (totalRounds: number, roundIndex: number) => {
    const remaining = totalRounds - roundIndex;
    if (remaining === 1) return "🏆 FINAL";
    if (remaining === 2) return "Semifinal";
    if (remaining === 3) return "Quartas de Final";
    if (remaining === 4) return "Oitavas de Final";
    return `Rodada ${roundIndex + 1}`;
  };

  const generateTournament = () => {
    if (!canStart) return;
    const valid = participants.filter((p) => p.trim());

    // Pad to power of 2
    let size = 2;
    while (size < valid.length) size *= 2;
    const padded = [...valid];
    while (padded.length < size) padded.push("BYE");

    const shuffled = padded.sort(() => Math.random() - 0.5);
    const matches: Match[] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      const isBye = shuffled[i + 1] === "BYE";
      matches.push({
        id: `r0-m${i / 2}`,
        player1: shuffled[i],
        player2: shuffled[i + 1],
        score1: null,
        score2: null,
        winner: isBye ? shuffled[i] : null,
      });
    }

    const totalRounds = Math.log2(size);
    setRounds([{ name: getRoundName(totalRounds, 0), matches }]);
    setChampion(null);
    setDrawError(null);
  };

  const setScore = (roundIdx: number, matchIdx: number, player: 1 | 2, score: number) => {
    const updated = [...rounds];
    const match = updated[roundIdx].matches[matchIdx];
    if (player === 1) match.score1 = score;
    else match.score2 = score;
    setRounds(updated);
    // Clear draw error for this match
    if (drawError?.round === roundIdx && drawError?.match === matchIdx) {
      setDrawError(null);
    }
  };

  const confirmMatch = (roundIdx: number, matchIdx: number) => {
    const updated = [...rounds];
    const match = updated[roundIdx].matches[matchIdx];
    if (match.score1 === null || match.score2 === null) return;

    // Não aceita empate!
    if (match.score1 === match.score2) {
      setDrawError({ round: roundIdx, match: matchIdx });
      return;
    }

    setDrawError(null);
    match.winner = match.score1 > match.score2 ? match.player1 : match.player2;

    // Check if all matches in round are done
    const allDone = updated[roundIdx].matches.every((m) => m.winner);
    if (allDone) {
      const winners = updated[roundIdx].matches.map((m) => m.winner!);
      if (winners.length === 1) {
        setChampion(winners[0]);
      } else {
        const nextMatches: Match[] = [];
        for (let i = 0; i < winners.length; i += 2) {
          nextMatches.push({
            id: `r${roundIdx + 1}-m${i / 2}`,
            player1: winners[i],
            player2: winners[i + 1] || "BYE",
            score1: null,
            score2: null,
            winner: winners[i + 1] ? null : winners[i],
          });
        }
        const totalRounds = Math.log2(updated[0].matches.length * 2);
        updated.push({
          name: getRoundName(totalRounds, roundIdx + 1),
          matches: nextMatches,
        });
      }
    }

    setRounds(updated);
  };

  const replayMatch = (roundIdx: number, matchIdx: number) => {
    const updated = [...rounds];
    const match = updated[roundIdx].matches[matchIdx];
    match.score1 = null;
    match.score2 = null;
    match.winner = null;
    setDrawError(null);
    setRounds(updated);
  };

  const reset = () => {
    setRounds([]);
    setChampion(null);
    setDrawError(null);
  };

  return (
    <div className="space-y-8">
      {rounds.length === 0 ? (
        <Card className="border-accent/20 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Montar Campeonato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Regras */}
            <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-1">
              <p className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" /> Regras
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Número de participantes deve ser <span className="text-accent font-semibold">par</span></li>
                <li><span className="text-destructive font-semibold">Empate não é permitido</span> — em caso de empate, jogue novamente</li>
                <li>Eliminação direta (mata-mata)</li>
              </ul>
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                Participantes (Jogador + Time)
              </label>
              <div className="space-y-2">
                {participants.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground w-6 text-right font-mono">{i + 1}.</span>
                    <Input
                      placeholder={`Ex: João (Real Madrid)`}
                      value={p}
                      onChange={(e) => updateParticipant(i, e.target.value)}
                      className="bg-muted/50 border-border"
                    />
                    {participants.length > 2 && (
                      <Button variant="ghost" size="icon" onClick={() => removeParticipant(i)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <Button variant="outline" size="sm" onClick={addParticipant} className="gap-1">
                  <Plus className="w-3 h-3" /> Adicionar
                </Button>
                <span className={`text-xs font-semibold ${isEven && validCount >= 2 ? "text-primary" : "text-destructive"}`}>
                  {validCount} participante{validCount !== 1 ? "s" : ""} {!isEven && validCount > 0 ? "(precisa ser par!)" : ""}
                </span>
              </div>
            </div>

            <Button
              onClick={generateTournament}
              disabled={!canStart}
              className="w-full text-lg font-bold h-12 gap-2 glow-accent bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
              size="lg"
            >
              <Swords className="w-5 h-5" />
              GERAR CHAVEAMENTO
            </Button>
            {!canStart && validCount > 0 && (
              <p className="text-xs text-destructive text-center">
                {!isEven ? "Adicione ou remova um participante para ter um número par." : "Mínimo 2 participantes."}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-glow">Chaveamento</h3>
            <Button variant="outline" size="sm" onClick={reset} className="gap-1">
              <RotateCcw className="w-3 h-3" /> Novo
            </Button>
          </div>

          {champion && (
            <Card className="border-accent/50 bg-accent/10 text-center p-6 animate-fade-in-up">
              <div className="text-5xl mb-2">🏆</div>
              <h2 className="text-3xl font-black text-accent tracking-wider">{champion}</h2>
              <p className="text-muted-foreground mt-1 uppercase tracking-widest text-sm">Campeão!</p>
            </Card>
          )}

          <div className="space-y-6">
            {rounds.map((round, rIdx) => (
              <div key={rIdx} className="space-y-3">
                <h4 className="text-lg font-bold text-primary uppercase tracking-wider border-l-4 border-primary pl-3">
                  {round.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {round.matches.map((match, mIdx) => {
                    const isDraw = drawError?.round === rIdx && drawError?.match === mIdx;
                    return (
                      <Card
                        key={match.id}
                        className={`border-border bg-card/80 backdrop-blur overflow-hidden ${
                          match.winner ? "opacity-80" : ""
                        } ${isDraw ? "border-destructive" : ""}`}
                      >
                        <div className={`h-1 ${match.winner ? "bg-primary" : isDraw ? "bg-destructive" : "bg-muted"}`} />
                        <CardContent className="p-4 space-y-2">
                          {match.player2 === "BYE" ? (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-semibold text-foreground">{match.player1}</span> avança automaticamente
                            </p>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`flex-1 font-semibold text-sm ${
                                    match.winner === match.player1 ? "text-primary" : ""
                                  }`}
                                >
                                  {match.player1}
                                </span>
                                {!match.winner && (
                                  <Input
                                    type="number"
                                    min={0}
                                    className="w-16 text-center bg-muted/50 h-8"
                                    value={match.score1 ?? ""}
                                    onChange={(e) => setScore(rIdx, mIdx, 1, Number(e.target.value))}
                                  />
                                )}
                                {match.winner && (
                                  <span className="text-sm font-bold">{match.score1}</span>
                                )}
                              </div>
                              <div className="text-center text-xs text-muted-foreground font-bold">VS</div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`flex-1 font-semibold text-sm ${
                                    match.winner === match.player2 ? "text-primary" : ""
                                  }`}
                                >
                                  {match.player2}
                                </span>
                                {!match.winner && (
                                  <Input
                                    type="number"
                                    min={0}
                                    className="w-16 text-center bg-muted/50 h-8"
                                    value={match.score2 ?? ""}
                                    onChange={(e) => setScore(rIdx, mIdx, 2, Number(e.target.value))}
                                  />
                                )}
                                {match.winner && (
                                  <span className="text-sm font-bold">{match.score2}</span>
                                )}
                              </div>

                              {isDraw && (
                                <div className="bg-destructive/10 border border-destructive/30 rounded-md p-2 text-center space-y-2">
                                  <p className="text-xs text-destructive font-bold">
                                    ⚠️ EMPATE! Jogue novamente!
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => replayMatch(rIdx, mIdx)}
                                    className="w-full text-xs"
                                  >
                                    <RotateCcw className="w-3 h-3 mr-1" /> Jogar Novamente
                                  </Button>
                                </div>
                              )}

                              {!match.winner && !isDraw && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => confirmMatch(rIdx, mIdx)}
                                  className="w-full mt-2"
                                  disabled={match.score1 === null || match.score2 === null}
                                >
                                  Confirmar Resultado
                                </Button>
                              )}
                              {match.winner && (
                                <p className="text-xs text-primary text-center mt-1 font-bold">
                                  ✓ {match.winner} venceu
                                </p>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
