import React, { useState } from 'react';
import { Star, Play, Award, ChevronRight, X, Lock, Sparkles } from 'lucide-react';
import { UserProgress, getStageProgressData, isExIslandUnlocked } from '../../services/storage';
import { sound } from '../../services/audio';

export type GameModuleType = 'lever' | 'block' | 'tsurukame' | 'gear' | 'cube_net' | 'algo_maze';

export interface Island {
  id: string;
  category: 'S' | 'T' | 'E' | 'A' | 'M' | 'EX';
  title: string;
  subtitle: string;
  examTopic: string;
  icon: string;
  bgGradient: string;
  borderColor: string;
  isEX?: boolean;
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
  },
  // EX: Secret Island (Unlocked with cumulative stamps >= 7)
  {
    id: 'ex_island',
    category: 'EX',
    title: 'EXアイランド',
    subtitle: '時空の超空間ラボ（裏ステージ）',
    examTopic: '中学入試最難関レベル・STEAM総合思考力（超ハイレベル融合問題）',
    icon: '🌌',
    bgGradient: 'from-violet-600 via-purple-700 to-indigo-950',
    borderColor: 'border-purple-400',
    isEX: true,
    games: [
      {
        type: 'lever',
        name: '【EX裏】多重モーメント・連鎖天秤パズル',
        stagePrefix: 'ex_lever',
        levels: [1, 2, 3]
      },
      {
        type: 'block',
        name: '【EX裏】超立体キューブ要塞・幻影積み木',
        stagePrefix: 'ex_block',
        levels: [1, 2, 3]
      },
      {
        type: 'tsurukame',
        name: '【EX裏】究極のつるかめ算ビジュアルアリーナ',
        stagePrefix: 'ex_tsuru',
        levels: [1, 2, 3]
      },
      {
        type: 'gear',
        name: '【EX裏】超遊星からくり大歯車機構',
        stagePrefix: 'ex_gear',
        levels: [1, 2, 3]
      },
      {
        type: 'cube_net',
        name: '【EX裏】立体超幾何・究極展開図マスター',
        stagePrefix: 'ex_net',
        levels: [1, 2, 3]
      },
      {
        type: 'algo_maze',
        name: '【EX裏】超難解AIアルゴリズム量子迷路',
        stagePrefix: 'ex_algo',
        levels: [1, 2, 3]
      }
    ]
  }
];

interface IslandMapProps {
  progress: UserProgress;
  selectedIslandId?: string | null;
  onSelectIslandId?: (islandId: string | null) => void;
  onLaunchGame: (gameType: GameModuleType, level: number, options?: { isEX?: boolean }) => void;
  onOpenDaily?: () => void;
  onOpenStamps?: () => void;
}

export const IslandMap: React.FC<IslandMapProps> = ({
  progress,
  selectedIslandId = null,
  onSelectIslandId,
  onLaunchGame,
  onOpenDaily,
  onOpenStamps
}) => {
  const [internalSelectedIslandId, setInternalSelectedIslandId] = useState<string | null>(null);
  const [isExLockedNoticeOpen, setIsExLockedNoticeOpen] = useState(false);

  const currentIslandId = onSelectIslandId !== undefined ? selectedIslandId : internalSelectedIslandId;
  const setIslandId = onSelectIslandId || setInternalSelectedIslandId;

  const selectedIsland = ISLANDS.find((i) => i.id === currentIslandId) || null;
  const isExUnlocked = isExIslandUnlocked(progress.stamps.length);

  const getStageStars = (stagePrefix: string, lvl: number): number => {
    return getStageProgressData(progress.stageProgress, stagePrefix, lvl, progress.grade || 3).stars;
  };

  const isDailyCompleted = progress.dailyChallenge?.completed || (progress.dailyChallenge?.clearedIndices?.length || 0) >= 5;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 py-4 sm:px-6 sm:py-6">
      {/* Daily Challenge Interactive Banner */}
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
                全5問クリアで ⭐100星 ＆ 80XP 獲得！（現在: {progress.dailyChallenge?.clearedIndices?.length || 0} / 5 問クリア）
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

      {/* Islands Vertical Stack */}
      <div className="flex flex-col gap-3.5 sm:gap-4 w-full">
        {ISLANDS.map((island) => {
          const isThisEx = island.isEX;
          const isLocked = isThisEx && !isExUnlocked;

          // Calculate total stars for this island
          let islandEarnedStars = 0;
          let islandTotalStars = 0;
          island.games.forEach((g) => {
            g.levels.forEach((lvl) => {
              islandTotalStars += 3;
              islandEarnedStars += getStageStars(g.stagePrefix, lvl);
            });
          });

          return (
            <div
              key={island.id}
              onClick={() => {
                sound.playClick();
                if (isLocked) {
                  setIsExLockedNoticeOpen(true);
                  return;
                }
                setIslandId(island.id);
              }}
              className={`group bg-white rounded-3xl border-4 transition-all duration-300 p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between cursor-pointer active:scale-[0.99] relative overflow-hidden ${
                isLocked
                  ? 'border-slate-300 bg-slate-50/90 shadow-sm opacity-90'
                  : isThisEx
                  ? 'border-purple-400 shadow-lg shadow-purple-500/15 hover:border-purple-500 hover:shadow-2xl'
                  : 'border-slate-200 hover:border-amber-400 shadow-md hover:shadow-xl'
              }`}
            >
              {/* Island Header banner */}
              <div
                className={`w-full rounded-2xl bg-gradient-to-r ${island.bgGradient} p-3.5 sm:p-4 lg:p-5 flex items-center justify-between shadow-inner relative overflow-hidden`}
              >
                <div className="text-white z-10 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-black tracking-wide whitespace-nowrap ${
                        isThisEx ? 'bg-purple-950/60 text-purple-200' : 'bg-black/25 text-white'
                      }`}
                    >
                      CATEGORY: {island.category}
                    </span>
                    <span className="text-xs sm:text-sm text-white/90 font-bold hidden sm:inline">
                      • {island.subtitle}
                    </span>
                    {isThisEx && isExUnlocked && (
                      <span className="px-2 py-0.5 bg-yellow-400 text-purple-950 rounded-full text-[10px] font-black animate-pulse flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>解放中！</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black drop-shadow flex items-center gap-2">
                    <span>{island.title}</span>
                    {isLocked && <Lock className="w-5 h-5 text-amber-300 inline shrink-0" />}
                  </h3>
                  <span className="text-xs text-white/95 font-bold block sm:hidden mt-0.5">
                    {island.subtitle}
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl filter drop-shadow group-hover:scale-110 transition-transform z-10 shrink-0">
                  {island.icon}
                </div>

                {/* Decorative circle backdrop */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none"></div>
              </div>

              {/* Entrance Exam connection */}
              <div
                className={`mt-3 rounded-xl p-2.5 sm:p-3 border text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  isThisEx
                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <Award className={`w-4 h-4 shrink-0 ${isThisEx ? 'text-purple-600' : 'text-amber-600'}`} />
                <span>{island.examTopic}</span>
              </div>

              {/* Island footer / Stars & Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                {isLocked ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-purple-700">
                    <Lock className="w-4 h-4 text-purple-500" />
                    <span>
                      🔒 累計スタンプ 7個 で解放！（現在: {progress.stamps.length} / 7個）
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-600">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>
                      {islandEarnedStars} / {islandTotalStars}
                    </span>
                  </div>
                )}

                <div
                  className={`flex items-center gap-1 text-xs sm:text-sm font-black transition-transform ${
                    isLocked
                      ? 'text-slate-500'
                      : isThisEx
                      ? 'text-purple-600 group-hover:translate-x-1'
                      : 'text-indigo-600 group-hover:translate-x-1'
                  }`}
                >
                  <span>{isLocked ? '解放条件を見る' : '裏ステージへ'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Select Modal */}
      {selectedIsland && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div
            className={`bg-white rounded-3xl border-4 shadow-2xl max-w-2xl sm:max-w-3xl w-full p-4 sm:p-6 relative flex flex-col max-h-[90vh] overflow-y-auto ${
              selectedIsland.isEX ? 'border-purple-400' : 'border-amber-300'
            }`}
          >
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
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>{selectedIsland.title}</span>
                  {selectedIsland.isEX && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
                      裏ステージ
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 font-bold">{selectedIsland.subtitle}</p>
              </div>
            </div>

            {/* Info Banner with Grade Indication */}
            <div
              className={`mb-3 px-3 py-2 border rounded-xl text-xs font-bold flex items-center justify-between gap-2 ${
                selectedIsland.isEX
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-950'
                  : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950'
              }`}
            >
              <span>
                {selectedIsland.isEX
                  ? '🌌 最難関中学受験レベル・全6大モジュール超難問ステージ'
                  : '✨ 全6ステージ × 各3問（計18問）'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg font-black text-xs shadow-sm shrink-0 ${
                  selectedIsland.isEX
                    ? 'bg-purple-600 text-white'
                    : 'bg-amber-400 text-slate-900'
                }`}
              >
                {selectedIsland.isEX ? '🏆 EXマスター級' : `🎒 小学${progress.grade}年生レベル`}
              </span>
            </div>

            {/* Games and Levels */}
            <div className="space-y-4">
              {selectedIsland.games.map((game) => (
                <div
                  key={game.type}
                  className={`p-3 sm:p-4 rounded-2xl border ${
                    selectedIsland.isEX ? 'bg-purple-50/40 border-purple-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <h4 className="text-sm font-black text-slate-800 mb-2.5 flex items-center gap-1.5">
                    <span>🎮</span>
                    <span>{game.name}</span>
                  </h4>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                    {game.levels.map((lvl) => {
                      const stars = getStageStars(game.stagePrefix, lvl);
                      const difficultyLabel = selectedIsland.isEX
                        ? lvl === 1
                          ? 'EX初級'
                          : lvl === 2
                          ? 'EX中級'
                          : 'EX究極'
                        : lvl === 1
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
                            onLaunchGame(game.type, lvl, { isEX: selectedIsland.isEX });
                          }}
                          className={`p-2 sm:p-2.5 rounded-xl border-2 bg-white active:scale-95 shadow-sm transition-all flex flex-col items-center text-center w-full min-w-0 ${
                            selectedIsland.isEX
                              ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                              : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                          }`}
                        >
                          <span
                            className={`text-[11px] sm:text-xs font-black mb-1 whitespace-nowrap ${
                              selectedIsland.isEX ? 'text-purple-900' : 'text-amber-900'
                            }`}
                          >
                            Lv.{lvl} ({difficultyLabel})
                          </span>

                          <div className="flex gap-0.5 mb-1 shrink-0">
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

                          <div
                            className={`w-full flex items-center justify-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-black px-1 sm:px-2 py-0.5 rounded-md mt-0.5 whitespace-nowrap shrink-0 border ${
                              selectedIsland.isEX
                                ? 'text-purple-700 bg-purple-50 border-purple-200'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            }`}
                          >
                            <Play
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${
                                selectedIsland.isEX ? 'fill-purple-600 text-purple-600' : 'fill-emerald-600 text-emerald-600'
                              }`}
                            />
                            <span className="whitespace-nowrap">スタート</span>
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

      {/* EX Island Locked Notice Modal */}
      {isExLockedNoticeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 via-purple-950 to-indigo-950 rounded-3xl border-4 border-purple-400 shadow-2xl max-w-md w-full p-6 text-white text-center relative">
            <button
              onClick={() => {
                sound.playClick();
                setIsExLockedNoticeOpen(false);
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border-2 border-purple-400 mx-auto flex items-center justify-center text-4xl mb-3 shadow-inner">
              🌌
            </div>

            <h3 className="text-xl font-black mb-1 text-purple-200">
              裏ステージ「EXアイランド」は封印中！
            </h3>
            <p className="text-xs text-purple-300 mb-4 font-bold">
              時空の歪みに隠された幻の超難問ステージです。
            </p>

            <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/10 text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-black">
                <span>🔓 解放条件:</span>
                <span>累計スタンプ 7個 達成</span>
              </div>
              <div className="flex items-center justify-between text-white font-bold">
                <span>現在のスタンプ:</span>
                <span>{progress.stamps.length} / 7 個 (あと {Math.max(0, 7 - progress.stamps.length)}個)</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((progress.stamps.length / 7) * 100))}%` }}
                />
              </div>
            </div>

            {onOpenStamps && (
              <button
                onClick={() => {
                  sound.playClick();
                  setIsExLockedNoticeOpen(false);
                  onOpenStamps();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>💮 スタンプ帳を開いて押印する</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
