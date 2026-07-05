"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import BottomNav from "@/components/ui/BottomNav";
import {
  ChevronLeft,
  Trophy,
  Swords,
  Users,
  TrendingUp,
  Eye,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { AVATARS } from "@/types/gameplay";

interface Player {
  id: string;
  username: string;
  avatar_id: string;
  level: number;
  camp: string;
  sessions_won: number;
  win_rate: number;
  tokens: number;
  rank: number;
}

interface Camp {
  id: string;
  name: string;
  influence: number;
  rank: number;
}

interface Rival {
  id: string;
  username: string;
  avatar_id: string;
  camp: string;
  status: string;
  description: string;
}

export default function WorldPage() {
  const [activeTab, setActiveTab] = useState("players");
  const [players, setPlayers] = useState<Player[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [rivals, setRivals] = useState<Rival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Mock data for now
        setPlayers([
          {
            id: "1",
            username: "PhantomX",
            avatar_id: AVATARS[0].id,
            level: 18,
            camp: "Eclipse Camp",
            sessions_won: 156,
            win_rate: 78,
            tokens: 24850,
            rank: 1
          },
          {
            id: "2",
            username: "DarkRider",
            avatar_id: AVATARS[1].id,
            level: 17,
            camp: "Nightfall Camp",
            sessions_won: 142,
            win_rate: 73,
            tokens: 22410,
            rank: 2
          },
          {
            id: "3",
            username: "NovaStrike",
            avatar_id: AVATARS[2].id,
            level: 17,
            camp: "Eclipse Camp",
            sessions_won: 118,
            win_rate: 69,
            tokens: 19230,
            rank: 3
          },
          {
            id: "4",
            username: "SilentKiller",
            avatar_id: AVATARS[3].id,
            level: 16,
            camp: "ShadowX",
            sessions_won: 98,
            win_rate: 66,
            tokens: 16540,
            rank: 4
          },
          {
            id: "5",
            username: "IronFang",
            avatar_id: AVATARS[4].id,
            level: 15,
            camp: "Nightfall Camp",
            sessions_won: 92,
            win_rate: 64,
            tokens: 15870,
            rank: 5
          }
        ]);

        setCamps([
          { id: "1", name: "Eclipse Camp", influence: 18450, rank: 1 },
          { id: "2", name: "Nightfall Camp", influence: 17230, rank: 2 },
          { id: "3", name: "ShadowX", influence: 15890, rank: 3 }
        ]);

        setRivals([
          {
            id: "1",
            username: "StealthX",
            avatar_id: AVATARS[0].id,
            camp: "Nightfall Camp",
            status: "STOLE 3 TOKENS FROM YOU",
            description: "2h ago"
          },
          {
            id: "2",
            username: "VoidWalker",
            avatar_id: AVATARS[1].id,
            camp: "Void Camp",
            status: "ELIMINATED YOU 2 SESSIONS AGO",
            description: "2 sessions ago"
          },
          {
            id: "3",
            username: "ShadowBeast",
            avatar_id: AVATARS[2].id,
            camp: "Eclipse Camp",
            status: "DEFEATED YOU IN THE FINAL ROUND",
            description: "3d ago"
          },
          {
            id: "4",
            username: "BloodHawk",
            avatar_id: AVATARS[3].id,
            camp: "Nightfall Camp",
            status: "CLOSE MATCH LAST SESSION",
            description: "Last session"
          }
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/home" className="p-3 rounded-full hover:bg-phantom-surface transition-colors">
            <ChevronLeft className="w-6 h-6 text-phantom-muted" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">RIVALS</h1>
            <p className="text-sm text-phantom-muted">
              Know your enemies. Take your place.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <Button variant="secondary" className="px-4 py-3 text-sm flex items-center gap-2 flex-1 md:flex-none">
            <Swords className="w-5 h-5" />
            RIVALRIES
          </Button>
          <Button variant="secondary" className="px-4 py-3 text-sm flex items-center gap-2 flex-1 md:flex-none">
            <TrendingUp className="w-5 h-5" />
            CAMP WAR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-500 text-2xl">💲</span>
            <span className="text-sm text-phantom-muted uppercase">
              Wallet Balance
            </span>
            <span className="ml-auto text-xs bg-phantom-surface px-3 py-1.5 rounded text-phantom-muted">
              USD
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-mono font-bold text-white">$25.00</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-phantom-purple text-2xl">💎</span>
            <span className="text-sm text-phantom-muted uppercase">
              Phantom Tokens
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-mono font-bold text-white">250</p>
        </Card>
        <Card className="p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-500 text-2xl">🔶</span>
            <span className="text-sm text-phantom-muted uppercase">
              Squad Tokens
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-mono font-bold text-white">0</p>
          <p className="text-xs sm:text-sm text-phantom-muted mt-2">
            Earn after your first completed session
          </p>
        </Card>
      </div>

      <div className="flex items-start gap-3 px-4 py-4 bg-phantom-purple/10 rounded-lg border border-phantom-purple/30">
        <span className="text-green-500 animate-pulse mt-1 flex-shrink-0">●</span>
        <div className="flex-1">
          <p className="text-sm sm:text-base text-phantom-muted">
            Eclipse Squad just overtook Nightfall Crew for #2 in Camp Rankings!
          </p>
        </div>
        <span className="text-xs text-phantom-muted flex-shrink-0 whitespace-nowrap">1m ago</span>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-center mb-4">
          <p className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
            Camp Dominance
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-white">ECLIPSE</p>
            <div className="flex items-center justify-center my-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-purple-900/30 border-2 border-purple-700 flex items-center justify-center">
                <span className="text-5xl sm:text-6xl">⚔️</span>
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">18,450</p>
            <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Influence</p>
            <p className="text-xs sm:text-sm text-phantom-purple mt-1">#1</p>
          </div>
          <div className="text-center order-first lg:order-none">
            <p className="text-xs sm:text-sm text-phantom-muted uppercase">Season 1</p>
            <p className="text-base sm:text-lg text-white mt-1">Ends in:</p>
            <p className="text-base sm:text-xl font-bold text-white mt-1">12D : 14H : 22M</p>
            <Button variant="secondary" className="mt-6 w-full text-xs sm:text-sm">
              View Camp Leaderboard
            </Button>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-white">NIGHTFALL</p>
            <div className="flex items-center justify-center my-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-900/30 border-2 border-red-700 flex items-center justify-center">
                <span className="text-5xl sm:text-6xl">🔺</span>
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-white">17,230</p>
            <p className="text-xs sm:text-sm text-phantom-muted uppercase mt-1">Influence</p>
            <p className="text-xs sm:text-sm text-red-500 mt-1">#2</p>
          </div>
        </div>
        <div className="mt-6 h-3 bg-phantom-border rounded-full overflow-hidden">
          <div className="h-full bg-phantom-purple" style={{ width: "52%" }}></div>
        </div>
      </Card>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={activeTab === "players" ? "primary" : "secondary"}
          className="flex-1 min-w-[100px]"
          onClick={() => setActiveTab("players")}
        >
          PLAYERS
        </Button>
        <Button
          variant={activeTab === "squads" ? "primary" : "secondary"}
          className="flex-1 min-w-[100px]"
          onClick={() => setActiveTab("squads")}
        >
          SQUADS
        </Button>
        <Button
          variant={activeTab === "camps" ? "primary" : "secondary"}
          className="flex-1 min-w-[100px]"
          onClick={() => setActiveTab("camps")}
        >
          CAMPS
        </Button>
        <div className="flex items-center gap-2 bg-phantom-surface px-4 py-3 rounded-lg ml-auto flex-shrink-0">
          <p className="text-xs sm:text-sm text-phantom-muted">Season 1</p>
          <ChevronRight className="w-5 h-5 text-phantom-muted" />
        </div>
      </div>

      {activeTab === "players" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
              Top Players
            </h3>
            <Link href="#" className="text-xs sm:text-sm text-phantom-purple flex items-center gap-1">
              VIEW ALL
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-phantom-surface animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-phantom-surface rounded animate-pulse" />
                    <div className="h-4 w-32 bg-phantom-surface rounded animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          )}

          {error && (
            <Card className="p-5">
              <p className="text-phantom-danger">{error}</p>
            </Card>
          )}

          {!loading && !error && players.map((player) => {
            const avatar = AVATARS.find((a) => a.id === player.avatar_id);
            return (
              <Card key={player.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div
                    className={`text-2xl sm:text-3xl font-bold w-8 text-center flex-shrink-0 ${
                      player.rank === 1
                        ? "text-yellow-500"
                        : player.rank === 2
                        ? "text-gray-400"
                        : player.rank === 3
                        ? "text-amber-700"
                        : "text-phantom-muted"
                    }`}
                  >
                    {player.rank}
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-phantom-surface border border-phantom-border flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl sm:text-4xl">{avatar?.emoji ?? "🌑"}</span>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base sm:text-lg font-semibold text-white">
                        {player.username}
                      </p>
                      <Badge variant="purple" className="text-xs sm:text-sm">
                        LVL {player.level}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-phantom-muted mt-1">{player.camp}</p>
                  </div>
                  <div className="text-right flex-1 min-w-[100px]">
                    <p className="text-[10px] sm:text-xs text-phantom-muted uppercase">
                      Sessions Won
                    </p>
                    <p className="text-sm sm:text-base font-bold text-white">
                      {player.sessions_won}
                    </p>
                  </div>
                  <div className="text-right flex-1 min-w-[100px]">
                    <p className="text-[10px] sm:text-xs text-phantom-muted uppercase">
                      Win Rate
                    </p>
                    <p className="text-sm sm:text-base font-bold text-green-500">
                      {player.win_rate}%
                    </p>
                  </div>
                  <div className="text-right flex-1 min-w-[100px]">
                    <p className="text-[10px] sm:text-xs text-phantom-muted uppercase">
                      Tokens
                    </p>
                    <p className="text-sm sm:text-base font-bold text-purple-500">
                      {player.tokens.toLocaleString()}
                    </p>
                  </div>
                  <button className="p-3 bg-phantom-surface rounded-full hover:bg-phantom-surface/80 transition-colors flex-shrink-0">
                    <Eye className="w-5 h-5 text-phantom-purple" />
                  </button>
                </div>
              </Card>
            );
          })}

          <Card className="p-5 flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-900/30 border border-purple-700 flex items-center justify-center flex-shrink-0">
              <Swords className="w-7 h-7 text-purple-500" />
            </div>
            <div className="flex-1 w-full md:w-auto">
              <p className="text-sm sm:text-base font-semibold text-white">
                Climb the ranks. Earn respect.
              </p>
              <p className="text-xs sm:text-sm text-phantom-muted mt-1">
                Make enemies fear your name.
              </p>
            </div>
            <Button className="bg-purple-800 hover:bg-purple-900 text-white flex items-center gap-2 w-full md:w-auto">
              <Trophy className="w-5 h-5" />
              VIEW FULL LEADERBOARD
            </Button>
          </Card>
        </div>
      )}

      {activeTab === "camps" && (
        <div className="space-y-4">
          {camps.map((camp) => (
            <Card key={camp.id} className="p-5">
              <div className="flex items-center gap-4">
                <p
                  className={`text-2xl sm:text-3xl font-bold w-8 text-center flex-shrink-0 ${
                    camp.rank === 1 ? "text-yellow-500" : "text-phantom-muted"
                  }`}
                >
                  {camp.rank}
                </p>
                <div className="flex-1">
                  <p className="text-base sm:text-lg font-semibold text-white">{camp.name}</p>
                  <p className="text-xs sm:text-sm text-phantom-muted mt-1">Influence</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white flex-shrink-0">
                  {camp.influence.toLocaleString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "squads" && (
        <div className="space-y-4">
          <Card className="p-8">
            <p className="text-phantom-muted text-center text-base sm:text-lg">Squads coming soon!</p>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
            Rivals to Watch
          </h3>
          <Link href="#" className="text-xs sm:text-sm text-phantom-purple flex items-center gap-1">
            VIEW ALL
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rivals.map((rival) => {
            const avatar = AVATARS.find((a) => a.id === rival.avatar_id);
            return (
              <Card key={rival.id} className="p-5 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-phantom-surface border border-red-900 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  <span className="text-4xl sm:text-5xl">{avatar?.emoji ?? "💀"}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white">{rival.username}</p>
                <p className="text-[10px] sm:text-xs text-phantom-muted mt-1">{rival.camp}</p>
                <div className="mt-3 bg-red-900/20 px-3 py-2 rounded text-[10px] sm:text-xs text-red-500 font-semibold uppercase border border-red-900/50">
                  {rival.status}
                </div>
                <p className="text-[10px] sm:text-xs text-phantom-muted mt-2">{rival.description}</p>
                <Button variant="secondary" className="mt-3 w-full text-[10px] sm:text-xs">
                  REVENGE
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-phantom-muted">
            Recent Champions
          </h3>
          <Link href="#" className="text-xs sm:text-sm text-phantom-purple flex items-center gap-1">
            VIEW ALL
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {players.slice(0, 3).map((player, index) => {
            const avatar = AVATARS.find((a) => a.id === player.avatar_id);
            return (
              <Card key={player.id} className="p-6 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-purple-900/20 border-2 border-purple-700 flex items-center justify-center mx-auto mb-3">
                  <span className="text-5xl sm:text-6xl">{avatar?.emoji ?? "🌑"}</span>
                </div>
                <p className="text-sm sm:text-lg font-semibold text-white">{player.username}</p>
                <p className="text-xs sm:text-sm text-phantom-muted mt-1">{player.camp}</p>
                <p className="text-xs sm:text-sm text-green-500 font-bold mt-2">
                  WON ${[2450, 1980, 1275][index]}
                </p>
                <p className="text-[10px] sm:text-xs text-phantom-muted mt-1">
                  {["2h ago", "1d ago", "2d ago"][index]}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
