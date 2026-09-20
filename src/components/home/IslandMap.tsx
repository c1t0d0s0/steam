import React, { useState } from 'react';
import { Star, Play, Award, ChevronRight, X, Lock, Sparkles } from 'lucide-react';
import { UserProgress, getStageProgressData, isExIslandUnlocked } from '../../services/storage';
import { sound } from '../../services/audio';

export type GameModuleType = 'lever' | 'block' | 'tsurukame' | 'gear' | 'cube_net' | 'algo_maze' | 'circuit' | 'contraption' | 'cross_section' | 'binary_cipher';

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
  islandTypeLabel: string;
  portName: string;
  coordinates: string;
  islandDecor: string[];
  seaRouteName?: string;
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
    islandTypeLabel: '清流と結晶のエメラルド環礁',
    portName: '⚓ ポート・サイエンス',
    coordinates: '08°N 138°E',
    islandDecor: ['🌴', '🔬', '🌊', '🧪'],
    seaRouteName: 'ひらめき海峡（S島 ⇄ T島）',
    examTopic: 'てこの規則性＆豆電球の電気回路（直列・並列・ショート回路）',
    icon: '🔬',
    bgGradient: 'from-emerald-500 via-teal-600 to-sky-600',
    borderColor: 'border-emerald-300',
    games: [
      {
        type: 'lever',
        name: 'てこ天秤の釣り合いパズル',
        stagePrefix: 'lever',
        levels: [1, 2, 3, 4, 5, 6]
      },
      {
        type: 'circuit',
        name: '豆電球と電気回路パズル',
        stagePrefix: 'circuit',
        levels: [1, 2, 3, 4, 5, 6]
      }
    ]
  },
  // T: Technology
  {
    id: 'tech',
    category: 'T',
    title: 'テックラボ',
    subtitle: 'AI・暗号研究所',
    islandTypeLabel: 'サイバー浮遊島・ネオテラ',
    portName: '⚓ ネオ・デジタルドック',
    coordinates: '15°N 142°E',
    islandDecor: ['📡', '💻', '🌐', '⚡'],
    seaRouteName: 'からくり潮流・機巧諸島航路（T島 ⇄ E島）',
    examTopic: 'アルゴリズム的思考＆論理回路（AND/OR/NOT）・2進数・デジタル暗号',
    icon: '💻',
    bgGradient: 'from-cyan-500 via-teal-600 to-blue-700',
    borderColor: 'border-cyan-300',
    games: [
      {
        type: 'algo_maze',
        name: 'アルゴリズム迷路探索',
        stagePrefix: 'algo',
        levels: [1, 2, 3, 4, 5, 6]
      },
      {
        type: 'binary_cipher',
        name: '論理回路＆2進数・暗号解読パズル',
        stagePrefix: 'cipher',
        levels: [1, 2, 3, 4, 5, 6]
      }
    ]
  },
  // E: Engineering
  {
    id: 'engineering',
    category: 'E',
    title: 'エンジニア鉱山',
    subtitle: 'からくり力学工場',
    islandTypeLabel: '蒸気と巨岩の機巧火山島',
    portName: '⚓ スチームハーバー',
    coordinates: '21°N 135°E',
    islandDecor: ['⚙️', '🌋', '🏭', '🚂'],
    seaRouteName: '創造の入江・クリスタル潮岬（E島 ⇄ A島）',
    examTopic: '歯車（ギア）伝達比＆ピタゴラ物理連鎖（斜面・バネ・滑車・ドミノ）',
    icon: '⚙️',
    bgGradient: 'from-amber-500 via-orange-600 to-yellow-600',
    borderColor: 'border-amber-300',
    games: [
      {
        type: 'gear',
        name: '歯車（ギア）伝達パズル',
        stagePrefix: 'gear',
        levels: [1, 2, 3, 4, 5, 6]
      },
      {
        type: 'contraption',
        name: 'からくりピタゴラ物理連鎖パズル',
        stagePrefix: 'contraption',
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
    islandTypeLabel: '幾何学と虹彩の大理石神殿島',
    portName: '⚓ パレットマリーナ',
    coordinates: '18°N 146°E',
    islandDecor: ['🏛️', '🎨', '💎', '✨'],
    seaRouteName: '数理の浅瀬・黄金珊瑚水道（A島 ⇄ M島）',
    examTopic: '立方体の展開図11種類＆立体の切断（切り口の多角形・平行面の法則）',
    icon: '🎨',
    bgGradient: 'from-purple-500 via-fuchsia-600 to-pink-600',
    borderColor: 'border-purple-300',
    games: [
      {
        type: 'cube_net',
        name: '立方体の展開図マスター',
        stagePrefix: 'net',
        levels: [1, 2, 3, 4, 5, 6]
      },
      {
        type: 'cross_section',
        name: '立体の切断・断面幾何パズル',
        stagePrefix: 'section',
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
    islandTypeLabel: '黄金比の立体砂丘・ブロック諸島',
    portName: '⚓ ナンバーピア',
    coordinates: '10°N 144°E',
    islandDecor: ['📐', '🧱', '🏖️', '☀️'],
    seaRouteName: '時空の裂け目・超空間海溝（M島 ⇄ EX島）',
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
    islandTypeLabel: '暗黒星雲の特異点・重力反転島',
    portName: '🌀 ワームホール・ゲート',
    coordinates: '99°X 999°Z',
    islandDecor: ['🪐', '🌀', '🌌', '☄️'],
    examTopic: '中学入試最難関レベル・STEAM総合思考力（超ハイレベル融合問題）',
    icon: '🌌',
    bgGradient: 'from-violet-700 via-purple-900 to-slate-950',
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
      },
      {
        type: 'circuit',
        name: '【EX裏】超電導・量子電気回路パズル',
        stagePrefix: 'ex_circuit',
        levels: [1, 2, 3]
      },
      {
        type: 'contraption',
        name: '【EX裏】時空連鎖・究極ピタゴラ力学要塞',
        stagePrefix: 'ex_contraption',
        levels: [1, 2, 3]
      },
      {
        type: 'cross_section',
        name: '【EX裏】多面体切断・極限断面幾何パズル',
        stagePrefix: 'ex_section',
        levels: [1, 2, 3]
      },
      {
        type: 'binary_cipher',
        name: '【EX裏】量子ビット・暗号解読・超論理ネットワーク',
        stagePrefix: 'ex_cipher',
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
          className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-[2rem] p-4 sm:p-5 text-white shadow-xl border-4 border-amber-300 mb-6 cursor-pointer hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left relative z-10">
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

          <div className="shrink-0 flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-2xl font-black text-sm shadow-md transition-all relative z-10">
            <span>挑戦する！</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Welcome Banner - Maritime Expedition Scroll */}
      <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-blue-700 rounded-[2rem] p-5 sm:p-6 text-white shadow-xl border-4 border-cyan-300 mb-6 text-center sm:text-left relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute right-8 top-3 text-6xl opacity-15 pointer-events-none select-none">🧭</div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black mb-2 border border-white/30 text-amber-200">
            <span>🧭 STEAM諸島・大航海マップ</span>
            <span className="hidden sm:inline text-white/80">• 全6海域巡回航路</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
            すきな島をえらんで探検に出発しよう！
          </h1>
          <p className="text-xs sm:text-sm text-cyan-100 font-bold mt-1.5 flex items-center justify-center sm:justify-start gap-1.5">
            <span>🌊</span>
            <span>カリブの海に浮かぶ6つの島（S・T・E・A・M・EX）！波を越えて知恵の秘宝を集めよう！</span>
          </p>
        </div>
      </div>

      {/* Islands Vertical Stack */}
      <div className="flex flex-col gap-4 sm:gap-5 w-full">
        {ISLANDS.map((island, islandIdx) => {
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
            <React.Fragment key={island.id}>
              {/* Sea Route Connector Between Islands */}
              {islandIdx > 0 && (
                <div className="flex items-center justify-center my-0.5 sm:my-1 gap-2 text-sky-900 font-black text-xs select-none">
                  <div className="hidden sm:block w-16 md:w-28 border-b-2 border-dashed border-sky-400/80"></div>
                  <div className="px-3.5 py-1.5 rounded-full bg-white/85 border-2 border-sky-300 shadow-sm flex items-center gap-2 backdrop-blur-xs text-sky-900 text-xs">
                    <span className="text-sm animate-bounce-slow">⛵</span>
                    <span className="font-extrabold">{ISLANDS[islandIdx - 1].seaRouteName || '定期航路'}</span>
                    <span className="text-sky-600 hidden md:inline">〜〜〜</span>
                  </div>
                  <div className="hidden sm:block w-16 md:w-28 border-b-2 border-dashed border-sky-400/80"></div>
                </div>
              )}

              {/* Island Card: Contoured Floating Island with Sandy Beach Shoreline */}
              <div
                onClick={() => {
                  sound.playClick();
                  if (isLocked) {
                    setIsExLockedNoticeOpen(true);
                    return;
                  }
                  setIslandId(island.id);
                }}
                className={`group relative rounded-[2.25rem] sm:rounded-[2.5rem] border-4 transition-all duration-300 p-3 sm:p-4 lg:p-5 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden ${
                  isLocked
                    ? 'border-slate-300 bg-slate-100/90 shadow-md opacity-90'
                    : isThisEx
                    ? 'border-purple-400 bg-gradient-to-b from-indigo-950/95 via-purple-950/90 to-slate-900 shadow-[0_12px_28px_-4px_rgba(147,51,234,0.45)] hover:border-purple-300 hover:shadow-[0_20px_35px_-4px_rgba(147,51,234,0.65)] hover:-translate-y-1.5'
                    : 'border-amber-300/90 bg-gradient-to-b from-amber-100/95 via-amber-50 to-amber-100/95 shadow-[0_12px_26px_-4px_rgba(3,105,161,0.35)] hover:border-amber-400 hover:shadow-[0_20px_35px_-4px_rgba(3,105,161,0.45)] hover:-translate-y-1.5'
                }`}
              >
                {/* Coastal Wave Foam Underlay */}
                <div className="absolute -bottom-1 inset-x-8 h-3 bg-white/70 rounded-full blur-[1px] pointer-events-none"></div>

                {/* Island Top Sandy Shoreline Header */}
                <div className="flex items-center justify-between px-1 pb-2.5 text-xs font-black select-none">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border shadow-xs flex items-center gap-1 ${
                        isThisEx
                          ? 'bg-purple-900/80 border-purple-400 text-purple-200'
                          : 'bg-amber-200/90 border-amber-300 text-amber-900'
                      }`}
                    >
                      <span>🏝️</span>
                      <span>CATEGORY {island.category}</span>
                    </span>
                    <span
                      className={`text-xs font-bold hidden sm:inline ${
                        isThisEx ? 'text-purple-300' : 'text-amber-800'
                      }`}
                    >
                      {island.portName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isThisEx ? 'bg-purple-900/50 text-purple-300' : 'bg-amber-200/60 text-amber-800'
                      }`}
                    >
                      🧭 {island.coordinates}
                    </span>
                    <div className="hidden sm:flex items-center gap-1 text-sm opacity-80">
                      {island.islandDecor?.map((dec, dIdx) => (
                        <span key={dIdx}>{dec}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Island Central Plateau / Biome Banner */}
                <div
                  className={`w-full rounded-[1.75rem] bg-gradient-to-r ${island.bgGradient} p-4 sm:p-5 lg:p-6 flex items-center justify-between shadow-inner relative overflow-hidden border-2 ${
                    isThisEx ? 'border-purple-400/40' : 'border-white/30'
                  }`}
                >
                  <div className="text-white z-10 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black bg-black/25 text-white/95 tracking-wide">
                        {island.islandTypeLabel}
                      </span>
                      <span className="text-xs sm:text-sm text-white/90 font-bold hidden md:inline">
                        • {island.subtitle}
                      </span>
                      {isThisEx && isExUnlocked && (
                        <span className="px-2.5 py-0.5 bg-yellow-400 text-purple-950 rounded-full text-[10px] font-black animate-pulse flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          <span>解放中！</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black drop-shadow-md flex items-center gap-2.5">
                      <span>{island.title}</span>
                      {isLocked && <Lock className="w-5 h-5 text-amber-300 inline shrink-0" />}
                    </h3>
                    <span className="text-xs text-white/95 font-bold block sm:hidden mt-0.5">
                      {island.subtitle}
                    </span>
                  </div>

                  {/* Island Main Landmark Icon */}
                  <div className="relative z-10 shrink-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/35 flex items-center justify-center text-4xl sm:text-5xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      {island.icon}
                    </div>
                  </div>

                  {/* Decorative Terrain Backdrops */}
                  <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full pointer-events-none"></div>
                  <div className="absolute left-1/2 -top-12 w-28 h-28 bg-white/5 rounded-full pointer-events-none"></div>
                </div>

                {/* Entrance Exam connection / Explorer's Mission Scroll */}
                <div
                  className={`mt-3 rounded-2xl p-2.5 sm:p-3.5 border-2 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm ${
                    isThisEx
                      ? 'bg-purple-900/60 border-purple-400/50 text-purple-100'
                      : 'bg-white/95 border-amber-200 text-amber-950'
                  }`}
                >
                  <Award className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isThisEx ? 'text-purple-300' : 'text-amber-600'}`} />
                  <span className="leading-snug">{island.examTopic}</span>
                </div>

                {/* Island Harbor Pier / Star Progress & Embark Action */}
                <div
                  className={`mt-3 pt-3 border-t flex items-center justify-between ${
                    isThisEx ? 'border-purple-800/60' : 'border-amber-200/60'
                  }`}
                >
                  {isLocked ? (
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-purple-400">
                      <Lock className="w-4 h-4 text-purple-400" />
                      <span>
                        🔒 累計スタンプ 7個 で解放！（現在: {progress.stamps.length} / 7個）
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-black">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100/90 border border-amber-300/80 text-amber-900">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>
                          {islandEarnedStars} / {islandTotalStars}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold hidden sm:inline ${isThisEx ? 'text-purple-300' : 'text-slate-600'}`}>
                        {island.portName}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm shadow-sm transition-all ${
                      isLocked
                        ? 'bg-slate-200 text-slate-500'
                        : isThisEx
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white group-hover:scale-105'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white group-hover:scale-105'
                    }`}
                  >
                    <span>{isLocked ? '解放条件を見る' : isThisEx ? '裏ステージへ' : 'この島へ上陸'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Coastal Wave Foam Base Strip */}
                <div
                  className={`mt-2.5 -mx-3 sm:-mx-4 lg:-mx-5 -mb-3 sm:-mb-4 lg:-mb-5 py-1 px-3 border-t text-[10px] font-black flex items-center justify-between select-none ${
                    isThisEx
                      ? 'bg-purple-950/70 border-purple-900 text-purple-400'
                      : 'bg-sky-200/70 border-sky-300 text-sky-800'
                  }`}
                >
                  <span>〜〜 白波の波打ち際 〜〜</span>
                  <span className="hidden sm:inline">⚓ {island.portName}</span>
                  <span>〜〜〜</span>
                </div>
              </div>
            </React.Fragment>
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

            {/* Modal Title with Island Harbor Arrival Badge */}
            <div className="flex items-center gap-3.5 mb-3.5 pb-2.5 border-b border-amber-200/80">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-sm shrink-0">
                {selectedIsland.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black flex items-center gap-1">
                    <span>{selectedIsland.portName}</span>
                    <span>に上陸！</span>
                  </span>
                  {selectedIsland.isEX && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
                      裏ステージ
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>{selectedIsland.title}</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold">{selectedIsland.subtitle} • {selectedIsland.islandTypeLabel}</p>
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
