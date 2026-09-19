import React, { useState } from 'react';
import { Star, Play, Award, ChevronRight, X } from 'lucide-react';
import { UserProgress } from '../../services/storage';
import { sound } from '../../services/audio';

export type GameModuleType = 'lever' | 'block' | 'tsurukame' | 'gear' | 'cube_net' | 'algo_maze';

interface Island {
  id: string;
  category: 'S' | 'T' | 'E' | 'A' | 'M';
  title: string;
  subtitle: string;
  examTopic: string;
  icon: string;
  bgGradient: string;
  borderColor: string;
  games: {
    type: GameModuleType;
    name: string;
    stagePrefix: string;
    levels: number[];
  }[];
}

export const ISLANDS: Island[] = [
  // S: Science
  {
    id: 'science',
    category: 'S',
    title: 'サイエンス島',
    subtitle: '理科ラボの実験室',
    examTopic: 'てこの規則性・釣り合い・力のモーメント',
    icon: '🔬',
    bgGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    borderColor: 'border-sky-300',
    games: [
      {
        type: 'lever',
        name: 'てこ天秤の釣り合いパズル',
        stagePrefix: 'lever',
        levels: [1, 2, 3, 4, 5, 6]
      }
    ]
  },
  // T: Technology
  {
    id: 'tech',
    category: 'T',
    title: 'テックラボ',
    subtitle: '情報・論理研究所',
    examTopic: 'プログラミング的思考・アルゴリズム・順次処理',
    icon: '🤖',
    bgGradient: 'from-cyan-400 via-blue-500 to-teal-500',
    borderColor: 'border-cyan-300',
    games: [
      {
        type: 'algo_maze',
        name: 'プログラミング迷路探索',
        stagePrefix: 'algo',
        levels: [1, 2, 3, 4, 5, 6]
      }
    ]
  },
  // E: Engineering
  {
    id: 'engineering',
    category: 'E',
    title: 'エンジニア鉱山',
    subtitle: '工学・からくり工場',
    examTopic: '歯車の回転方向・噛み合わせ・歯数と回転比',
    icon: '⚙️',
    bgGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    borderColor: 'border-emerald-300',
    games: [
      {
        type: 'gear',
        name: '歯車（ギア）伝達パズル',
        stagePrefix: 'gear',
        levels: [1, 2, 3, 4, 5, 6]
      }
    ]
  },
  // A: Art
  {
    id: 'art',
    category: 'A',
    title: 'デザイン神殿',
    subtitle: '空間幾何・アート工房',
    examTopic: '立方体の展開図11種類・対面とサイコロの目',
    icon: '🎨',
    bgGradient: 'from-purple-400 via-fuchsia-500 to-pink-500',
    borderColor: 'border-purple-300',
    games: [
      {
        type: 'cube_net',
        name: '立方体の展開図マスター',
        stagePrefix: 'net',
        levels: [1, 2, 3, 4, 5, 6]
      }
    ]
  },
  // M: Math
  {
    id: 'math',
    category: 'M',
    title: 'マス・アイランド',
    subtitle: '算数アリーナ',
    examTopic: '空間把握（積み木）＆ 和差算・つるかめ算',
    icon: '📐',
    bgGradient: 'from-amber-400 via-orange-500 to-rose-500',
    borderColor: 'border-amber-300',
    games: [
      {
        type: 'block',
        name: '立体ブロック積み木数え',
        stagePrefix: 'block',
        levels: [1, 2, 3, 4, 5, 6]
      },
      {
        type: 'tsurukame',
        name: 'つるかめ算ビジュアルアリーナ',
        stagePrefix: 'tsuru',
        levels: [1, 2, 3, 4, 5, 6]
      }
    ]
  }
];

interface IslandMapProps {
  progress: UserProgress;
  selectedIslandId?: string | null;
  onSelectIslandId?: (islandId: string | null) => void;
  onLaunchGame: (gameType: GameModuleType, level: number) => void;
  onOpenDaily?: () => void;
}

export const IslandMap: React.FC<IslandMapProps> = ({
  progress,
  selectedIslandId = null,
  onSelectIslandId,
  onLaunchGame,
  onOpenDaily
}) => {
  const [internalSelectedIslandId, setInternalSelectedIslandId] = useState<string | null>(null);

  const currentIslandId = onSelectIslandId !== undefined ? selectedIslandId : internalSelectedIslandId;
  const setIslandId = onSelectIslandId || setInternalSelectedIslandId;

  const selectedIsland = ISLANDS.find((i) => i.id === currentIslandId) || null;

  const getStageStars = (stageKey: string): number => {
    return progress.stageProgress[stageKey]?.stars || 0;
  };

  const isDailyCompleted = progress.dailyChallenge?.completed || (progress.dailyChallenge?.clearedIndices?.length || 0) >= 5;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-6">
      {/* Daily Challenge Interactive Banner (Only displayed when NOT yet cleared today) */}
      {onOpenDaily && !isDailyCompleted && (
        <div
          onClick={() => {
            sound.playClick();
            onOpenDaily();
          }}
          className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-4 sm:p-5 text-white shadow-lg border-4 border-amber-300 mb-6 cursor-pointer hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              🎯
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-black tracking-wide">
                  まいにち日替わり
                </span>
                {progress.dailyStreak > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 text-[11px] font-black flex items-center gap-1 shadow-sm">
                    🔥 {progress.dailyStreak}日連続
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">
                本日のデイリーチャレンジ（5島横断ラリー）
              </h2>
              <p className="text-xs sm:text-sm text-amber-950 font-bold">
                全5問クリアで ⭐100コイン ＆ 80XP 獲得！（現在: {progress.dailyChallenge?.clearedIndices?.length || 0} / 5 問クリア）
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-2xl font-black text-sm shadow-md transition-all">
            <span>挑戦する！</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-3xl p-5 sm:p-6 text-white shadow-lg border-4 border-amber-300 mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-black mb-1.5">
          <span>✨ ひらめき冒険マップ</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
          すきな島をえらんで探検に出発しよう！
        </h1>
        <p className="text-xs sm:text-sm text-amber-950 font-bold mt-1">
          中学受験で差がつく算数・理科の最重要テーマを、ゲームで体感マスター！
        </p>
      </div>

      {/* Islands Grid: 1 column on Smartphone, 1 horizontal row (5 columns) on PC */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 lg:gap-4">
        {ISLANDS.map((island) => {
          // Calculate total stars for this island
          let islandEarnedStars = 0;
          let islandTotalStars = 0;
          island.games.forEach((g) => {
            g.levels.forEach((lvl) => {
              islandTotalStars += 3;
              islandEarnedStars += getStageStars(`${g.stagePrefix}_${lvl}`);
            });
          });

          return (
            <div
              key={island.id}
              onClick={() => {
                sound.playClick();
                setIslandId(island.id);
              }}
              className="group bg-white rounded-3xl border-4 border-slate-200 hover:border-amber-400 shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-3 lg:p-4 flex flex-col justify-between cursor-pointer active:scale-[0.98] relative overflow-hidden"
            >
              {/* Island Header banner */}
              <div
                className={`w-full h-24 sm:h-28 rounded-2xl bg-gradient-to-r ${island.bgGradient} p-2.5 sm:p-3 flex items-center justify-between shadow-inner relative overflow-hidden`}
              >
                <div className="text-white z-10 min-w-0 pr-1">
                  <span className="px-1.5 py-0.5 bg-black/20 rounded-lg text-[10px] font-black tracking-wide whitespace-nowrap">
                    CATEGORY: {island.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-black mt-0.5 drop-shadow truncate">{island.title}</h3>
                  <span className="text-[11px] sm:text-xs text-white/90 font-bold block truncate">{island.subtitle}</span>
                </div>
                <div className="text-4xl sm:text-3xl lg:text-4xl filter drop-shadow group-hover:scale-110 transition-transform z-10 shrink-0">
                  {island.icon}
                </div>

                {/* Decorative circle backdrop */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none"></div>
              </div>

              {/* Entrance Exam connection */}
              <div className="mt-2.5 bg-amber-50 rounded-xl p-2 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-start gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{island.examTopic}</span>
              </div>

              {/* Island footer / Stars & Action */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-600">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>
                    {islandEarnedStars} / {islandTotalStars}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-[11px] sm:text-xs font-black text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span className="hidden sm:inline">ステージ</span>
                  <span className="sm:hidden">選択</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Select Modal */}
      {selectedIsland && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-amber-300 shadow-2xl max-w-xl w-full p-5 sm:p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                sound.playClick();
                setIslandId(null);
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{selectedIsland.icon}</span>
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedIsland.title}</h3>
                <p className="text-xs text-slate-500 font-bold">{selectedIsland.subtitle}</p>
              </div>
            </div>

            {/* Info Banner with Grade Indication */}
            <div className="mb-3 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-950 flex items-center justify-between gap-2">
              <span>✨ 全6ステージ × 各3問（計18問）</span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-900 font-black text-xs shadow-sm shrink-0">
                🎒 小学{progress.grade}年生レベル
              </span>
            </div>

            {/* Games and Levels */}
            <div className="space-y-4">
              {selectedIsland.games.map((game) => (
                <div key={game.type} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <h4 className="text-sm font-black text-slate-800 mb-2.5 flex items-center gap-1.5">
                    <span>🎮</span>
                    <span>{game.name}</span>
                  </h4>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {game.levels.map((lvl) => {
                      const stars = getStageStars(`${game.stagePrefix}_${lvl}`);
                      const difficultyLabel =
                        lvl === 1
                          ? '初級'
                          : lvl === 2
                          ? '中級'
                          : lvl === 3
                          ? '上級'
                          : lvl === 4
                          ? '発展'
                          : lvl === 5
                          ? '応用'
                          : '達人';
                      return (
                        <button
                          key={lvl}
                          onClick={() => {
                            sound.playClick();
                            onLaunchGame(game.type, lvl);
                          }}
                          className="p-2 sm:p-2.5 rounded-xl border-2 border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50 active:scale-95 shadow-sm transition-all flex flex-col items-center text-center"
                        >
                          <span className="text-[11px] sm:text-xs font-black text-amber-900 mb-1 whitespace-nowrap">
                            Lv.{lvl} ({difficultyLabel})
                          </span>

                          <div className="flex gap-0.5 mb-1">
                            {[1, 2, 3].map((starNum) => (
                              <Star
                                key={starNum}
                                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                                  stars >= starNum
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>

                          <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mt-0.5">
                            <Play className="w-2.5 h-2.5 fill-emerald-600" />
                            <span>スタート</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
