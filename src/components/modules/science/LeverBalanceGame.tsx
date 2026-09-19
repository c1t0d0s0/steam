import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';

interface LeverBalanceGameProps {
  level: number; // 1, 2, 3
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: PuzzleData[];
  customTitle?: string;
  customBadge?: string;
}

interface WeightSlot {
  pos: number; // -4 to -1 for left, 1 to 4 for right
  weight: number; // in grams
  locked?: boolean;
}

interface PuzzleData {
  targetPos: number;
  initialWeights: WeightSlot[];
  explanation: string;
  examTip: string;
  availableWeights: number[];
}

export const LeverBalanceGame: React.FC<LeverBalanceGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  // Preset puzzles per level (3 variations per level = 18 problems total)
  const getLevelPuzzles = (lvl: number): PuzzleData[] => {
    switch (lvl) {
      case 1:
        return [
          {
            targetPos: 2,
            initialWeights: [{ pos: -3, weight: 20, locked: true }],
            explanation: '左の力は「きょり 3 × 重さ 20g = 60」。右のきょり 2 には「30g」を置くと「2 × 30g = 60」でピタリと釣り合います！',
            examTip: 'てこの基本公式：【支点からの距離 × おもりの重さ】が左右で同じになると釣り合います！',
            availableWeights: [10, 20, 30, 40, 50]
          },
          {
            targetPos: 3,
            initialWeights: [{ pos: -2, weight: 30, locked: true }],
            explanation: '左の力は「きょり 2 × 重さ 30g = 60」。右のきょり 3 には「20g」を置くと「3 × 20g = 60」で釣り合います！',
            examTip: '支点からの距離が1.5倍になると、釣り合うために必要なおもりは2/3の重さで済みます！',
            availableWeights: [10, 20, 30, 40, 50]
          },
          {
            targetPos: 2,
            initialWeights: [{ pos: -4, weight: 10, locked: true }],
            explanation: '左の力は「きょり 4 × 重さ 10g = 40」。右のきょり 2 に「20g」を置くと「2 × 20g = 40」で釣り合います！',
            examTip: '支点からの距離が半分（4から2）なら、必要な重さは2倍（10gから20g）になります！',
            availableWeights: [10, 20, 30, 40, 50]
          }
        ];
      case 2:
        return [
          {
            targetPos: 3,
            initialWeights: [
              { pos: -4, weight: 10, locked: true },
              { pos: -1, weight: 30, locked: true },
              { pos: 1, weight: 10, locked: true }
            ],
            explanation: '左側の力の合計は (4×10g) + (1×30g) = 70。右側は (1×10g) + (3×20g) = 70 で左右の力がぴったり一致します！',
            examTip: '複数の場所におもりがある時は、それぞれの【距離 × 重さ】を計算して全部「足し算」します！',
            availableWeights: [10, 20, 30, 40]
          },
          {
            targetPos: 3,
            initialWeights: [
              { pos: -3, weight: 20, locked: true },
              { pos: -2, weight: 10, locked: true },
              { pos: 1, weight: 20, locked: true }
            ],
            explanation: '左の力は (3×20g) + (2×10g) = 80。右側は (1×20g) + (3×20g) = 80 で完璧に水平になります！',
            examTip: '左右どちらにも複数のおもりがある場合も、左右それぞれの合計トルクを出して引き算で不足分を求めます！',
            availableWeights: [10, 20, 30, 40]
          },
          {
            targetPos: 3,
            initialWeights: [
              { pos: -4, weight: 10, locked: true },
              { pos: -2, weight: 20, locked: true },
              { pos: 2, weight: 10, locked: true }
            ],
            explanation: '左の力は (4×10g) + (2×20g) = 80。右側は (2×10g) + (3×20g) = 80 で左右が釣り合います！',
            examTip: '試験では「あと何gのおもりをどこに吊るせばよいか」という逆算形式で出題されます。',
            availableWeights: [10, 20, 30, 40]
          }
        ];
      case 3:
        return [
          {
            targetPos: 3,
            initialWeights: [
              { pos: -4, weight: 20, locked: true },
              { pos: -2, weight: 20, locked: true }
            ],
            explanation: '左の力は (4×20g) + (2×20g) = 120。右のきょり 3 の位置に「40g」を置くと、3 × 40g = 120 となり大成功です！',
            examTip: '中学入試頻出！左右のつり合いだけでなく「支点にかかる全体の重さ」も問われることがあります（今回は20+20+40=80g）。',
            availableWeights: [10, 20, 30, 40, 50, 60]
          },
          {
            targetPos: 4,
            initialWeights: [
              { pos: -3, weight: 30, locked: true },
              { pos: -1, weight: 30, locked: true }
            ],
            explanation: '左の力は (3×30g) + (1×30g) = 120。右のきょり 4 に「30g」を置くと 4 × 30g = 120 で釣り合います！',
            examTip: '支点からの距離が遠いフックを使うと、より小さなおもりで重いものを釣り合わせることができます。',
            availableWeights: [10, 20, 30, 40, 50, 60]
          },
          {
            targetPos: 4,
            initialWeights: [
              { pos: -3, weight: 40, locked: true },
              { pos: 2, weight: 20, locked: true }
            ],
            explanation: '左の力は 3×40g = 120。右は既に 2×20g = 40 あるので残り 80。きょり 4 に 20g (4×20=80) で釣り合います！',
            examTip: '右側にある既知のおもりのモーメントを左から差し引く「逆算の立式」を身につけましょう！',
            availableWeights: [10, 20, 30, 40, 50, 60]
          }
        ];
      case 4:
        return [
          {
            targetPos: 4,
            initialWeights: [
              { pos: -1, weight: 60, locked: true },
              { pos: -3, weight: 30, locked: true },
              { pos: 2, weight: 15, locked: true }
            ],
            explanation: '左の力は (1×60g) + (3×30g) = 150。右側は (2×15g) + (4×30g) = 150 でピタリ一致！',
            examTip: '支点近くの重いおもりと遠くの軽いおもり。釘抜きやハサミなど、身の回りの道具に応用されている原理です！',
            availableWeights: [15, 20, 30, 40, 50, 60]
          },
          {
            targetPos: 3,
            initialWeights: [
              { pos: -2, weight: 50, locked: true },
              { pos: -1, weight: 40, locked: true },
              { pos: 1, weight: 20, locked: true }
            ],
            explanation: '左の力は (2×50g) + (1×40g) = 140。右側は (1×20g) + (3×40g) = 140 で見事水平！',
            examTip: '入試問題では支点の位置が端にある「第2種・第3種のてこ（栓抜きやピンセット）」も出題されます。',
            availableWeights: [10, 20, 30, 40, 50, 60]
          },
          {
            targetPos: 4,
            initialWeights: [
              { pos: -4, weight: 20, locked: true },
              { pos: -3, weight: 20, locked: true },
              { pos: -1, weight: 20, locked: true },
              { pos: 2, weight: 20, locked: true }
            ],
            explanation: '左の力は 80 + 60 + 20 = 160。右側は 40 + (4×30g) = 160 で釣り合います！',
            examTip: 'おもりの数が増えても慌てず、左側のモーメントの和 ＝ 右側のモーメントの和 と立式しましょう。',
            availableWeights: [10, 20, 30, 40, 50, 60]
          }
        ];
      case 5:
        return [
          {
            targetPos: 4,
            initialWeights: [
              { pos: -4, weight: 30, locked: true },
              { pos: -2, weight: 30, locked: true },
              { pos: 2, weight: 30, locked: true }
            ],
            explanation: '左の力は (4×30) + (2×30) = 180。右側は (2×30) + (4×30) = 180 で釣り合います！',
            examTip: '【難関中の逆算てこ】未知のおもりを□とおいて、180 = 60 + (4×□) から □=30g を求めます！',
            availableWeights: [15, 20, 25, 30, 40, 50]
          },
          {
            targetPos: 4,
            initialWeights: [
              { pos: -4, weight: 40, locked: true },
              { pos: -1, weight: 40, locked: true },
              { pos: 1, weight: 20, locked: true },
              { pos: 3, weight: 20, locked: true }
            ],
            explanation: '左は 160 + 40 = 200。右は (1×20) + (3×20) = 80。不足する 120 を きょり4 に「30g」置くことで 80 + 120 = 200！',
            examTip: '複数のフックにおもりが吊るされた状態からの逆算は、御三家・難関校の頻出パターンです！',
            availableWeights: [10, 20, 30, 40, 50, 60]
          },
          {
            targetPos: 3,
            initialWeights: [
              { pos: -3, weight: 50, locked: true },
              { pos: -2, weight: 30, locked: true },
              { pos: 1, weight: 30, locked: true },
              { pos: 2, weight: 30, locked: true }
            ],
            explanation: '左は 150 + 60 = 210。右は 30 + 60 = 90。不足する 120 を きょり3 に「40g」置いて 90 + 120 = 210！',
            examTip: '左右のつり合いだけでなく、支点を吊り下げる糸の張力（全体の重さの和）も計算できるようにしましょう！',
            availableWeights: [20, 30, 40, 50, 60]
          }
        ];
      case 6:
      default:
        return [
          {
            targetPos: 4,
            initialWeights: [
              { pos: -4, weight: 20, locked: true },
              { pos: -3, weight: 30, locked: true },
              { pos: -2, weight: 20, locked: true },
              { pos: 1, weight: 10, locked: true },
              { pos: 2, weight: 40, locked: true }
            ],
            explanation: '左の力は 80 + 90 + 40 = 210。右は 10 + 80 = 90。残り 120 を きょり4 に「30g」で 210 に完全一致！',
            examTip: '【達人級・力のモーメント】最難関校の物理分野で出題される複雑な重心・てこ問題も、この原理の応用です！',
            availableWeights: [10, 20, 30, 40, 50, 60]
          },
          {
            targetPos: 3,
            initialWeights: [
              { pos: -4, weight: 30, locked: true },
              { pos: -3, weight: 20, locked: true },
              { pos: -1, weight: 50, locked: true },
              { pos: 1, weight: 30, locked: true },
              { pos: 2, weight: 40, locked: true }
            ],
            explanation: '左の力は 120 + 60 + 50 = 230。右は 30 + 80 = 110。不足 120 を きょり3 に「40g」で 230 の完璧な釣り合い！',
            examTip: '支点からの距離とおもりの重さの関係を完全にマスターしました。中学理科の物理基礎は完璧です！',
            availableWeights: [10, 20, 30, 40, 50, 60]
          },
          {
            targetPos: 4,
            initialWeights: [
              { pos: -4, weight: 25, locked: true },
              { pos: -2, weight: 50, locked: true },
              { pos: 1, weight: 20, locked: true },
              { pos: 3, weight: 20, locked: true }
            ],
            explanation: '左の力は 100 + 100 = 200。右は 20 + 60 = 80。残り 120 を きょり4 に「30g」置いて 200 で見事バランス！',
            examTip: '入試本番でも、てこの問題を見たらまず左右それぞれの「距離×重さ」をメモする習慣を続けましょう！',
            availableWeights: [10, 20, 25, 30, 40, 50]
          }
        ];
    }
  };

  const puzzles = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level);
  const [problemIndex, setProblemIndex] = useState(0);
  const puzzle = puzzles[problemIndex % puzzles.length];

  const [weights, setWeights] = useState<WeightSlot[]>(puzzle.initialWeights);
  const [selectedWeight, setSelectedWeight] = useState<number>(puzzle.availableWeights[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('右側のフックにおもりを置いて天秤を釣り合わせよう！');
  const [showHint, setShowHint] = useState(false);

  const switchProblem = (idx: number) => {
    const nextPuzzle = puzzles[idx % puzzles.length];
    setProblemIndex(idx % puzzles.length);
    setWeights(nextPuzzle.initialWeights);
    setSelectedWeight(nextPuzzle.availableWeights[0]);
    setIsCompleted(false);
    setFeedbackMsg('右側のフックにおもりを置いて天秤を釣り合わせよう！');
  };

  // Calculate torque (distance from pivot * weight)
  const leftTorque = weights
    .filter((w) => w.pos < 0)
    .reduce((sum, w) => sum + Math.abs(w.pos) * w.weight, 0);

  const rightTorque = weights
    .filter((w) => w.pos > 0)
    .reduce((sum, w) => sum + w.pos * w.weight, 0);

  // Calculate tilt angle in degrees (-15 to +15)
  const diff = rightTorque - leftTorque;
  const tiltAngle = Math.max(-12, Math.min(12, diff * 0.25));

  const handleSlotClick = (pos: number) => {
    sound.playClick();
    // Check if slot has a locked weight
    const existingIndex = weights.findIndex((w) => w.pos === pos);
    if (existingIndex >= 0 && weights[existingIndex].locked) {
      return; // Can't remove locked initial weights
    }

    if (existingIndex >= 0) {
      // Remove weight
      setWeights(weights.filter((_, idx) => idx !== existingIndex));
    } else {
      // Add selected weight
      setWeights([...weights, { pos, weight: selectedWeight }]);
    }
  };

  const handleCheck = () => {
    if (leftTorque === rightTorque && rightTorque > 0) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedbackMsg('大正解！みごとに水平につり合いました！');
      onComplete(3);
    } else {
      sound.playWrong();
      if (leftTorque > rightTorque) {
        setFeedbackMsg(`左が重いよ！（左: ${leftTorque} vs 右: ${rightTorque}）右に足そう！`);
      } else {
        setFeedbackMsg(`右が重いよ！（左: ${leftTorque} vs 右: ${rightTorque}）`);
      }
    }
  };

  return (
    <GameModalWrapper
      title={customTitle || "てこ天秤の釣り合いパズル"}
      badgeTag={customBadge || `理科ラボ Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={puzzle.explanation}
      examTip={puzzle.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      problemIndex={problemIndex}
      totalProblems={puzzles.length}
      onSwitchProblem={switchProblem}
      onNextProblem={() => switchProblem(problemIndex + 1)}
      onRetry={() => {
        setWeights(puzzle.initialWeights);
        setIsCompleted(false);
      }}
      onOpenHelp={() => setShowHint(!showHint)}
    >
      <div className="flex flex-col items-center select-none">
        {/* Status Prompt */}
        <div className="w-full text-center py-2 px-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 font-extrabold text-amber-900 text-sm sm:text-base">
          {feedbackMsg}
        </div>

        {/* Real-time Torque Monitor Cards */}
        <div className="flex justify-between w-full max-w-lg mb-6 gap-3">
          <div className="flex-1 bg-sky-50 border-2 border-sky-300 rounded-2xl p-2.5 text-center shadow-sm">
            <span className="text-xs font-bold text-sky-700 block">左のまわす力 (距離×重さ)</span>
            <span className="text-2xl font-black text-sky-900">{leftTorque}</span>
          </div>
          <div className="flex items-center justify-center font-black text-slate-400 text-lg">
            {leftTorque === rightTorque && rightTorque > 0 ? '==' : 'vs'}
          </div>
          <div className="flex-1 bg-rose-50 border-2 border-rose-300 rounded-2xl p-2.5 text-center shadow-sm">
            <span className="text-xs font-bold text-rose-700 block">右のまわす力 (距離×重さ)</span>
            <span className="text-2xl font-black text-rose-900">{rightTorque}</span>
          </div>
        </div>

        {/* Seesaw Simulation Area */}
        <div className="w-full max-w-lg h-56 relative flex items-center justify-center mb-6 overflow-hidden bg-gradient-to-b from-sky-50 to-emerald-50/40 rounded-3xl border-2 border-slate-200 shadow-inner">
          {/* Ceiling / Support wire guide */}
          <div className="absolute top-0 w-1 h-12 bg-slate-300"></div>

          {/* Pivot Fulcrum (Triangle) */}
          <div className="absolute bottom-6 w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[60px] border-b-amber-600 drop-shadow-md">
            <div className="absolute top-10 -left-1.5 w-3 h-3 bg-amber-200 rounded-full"></div>
          </div>
          <div className="absolute bottom-4 text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            支点（中心）
          </div>

          {/* Beam (Tilts dynamically) */}
          <div
            className="absolute w-[88%] h-5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full shadow-lg transition-transform duration-500 flex items-center justify-between px-2"
            style={{
              transform: `translateY(-30px) rotate(${tiltAngle}deg)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Center Pivot Point */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-300 rounded-full border-2 border-amber-900 shadow"></div>

            {/* Position Hooks: Left (-4 to -1) and Right (1 to 4) */}
            {[-4, -3, -2, -1, 1, 2, 3, 4].map((pos) => {
              const currentSlotWeight = weights.find((w) => w.pos === pos);
              const isLeft = pos < 0;
              return (
                <button
                  key={pos}
                  onClick={() => handleSlotClick(pos)}
                  className={`relative group flex flex-col items-center justify-center transition-all ${
                    currentSlotWeight?.locked ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{
                    position: 'absolute',
                    left: `${50 + pos * 11.5}%`,
                    transform: 'translateX(-50%)'
                  }}
                  title={`距離 ${Math.abs(pos)}`}
                >
                  {/* Hook pin */}
                  <div className="w-2.5 h-2.5 bg-yellow-100 rounded-full border border-amber-900"></div>
                  <span className="text-[10px] font-black text-amber-100 -mt-1 drop-shadow">
                    {Math.abs(pos)}
                  </span>

                  {/* Hanging Weight */}
                  {currentSlotWeight ? (
                    <div
                      className={`absolute top-5 flex flex-col items-center animate-bounce-slow ${
                        currentSlotWeight.locked ? 'opacity-95' : 'hover:scale-110'
                      }`}
                    >
                      <div className="w-0.5 h-3 bg-slate-600"></div>
                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-black shadow-md border-2 ${
                          isLeft
                            ? 'bg-sky-500 text-white border-sky-300'
                            : 'bg-rose-500 text-white border-rose-300'
                        }`}
                      >
                        {currentSlotWeight.weight}g
                      </div>
                      {currentSlotWeight.locked && (
                        <span className="text-[9px] text-amber-800 font-extrabold bg-amber-200 rounded px-1 -mt-1 shadow-sm">
                          固定
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="absolute top-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-0.5 h-3 bg-dashed border-l border-slate-400"></div>
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-500 bg-white/70">
                        +
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Weight Selector Bar */}
        <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-600 mb-2">
            置きたいおもりの重さを選んでから、右側のフックをタップしてね！
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {puzzle.availableWeights.map((w) => (
              <button
                key={w}
                onClick={() => {
                  sound.playClick();
                  setSelectedWeight(w);
                }}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all active:scale-95 ${
                  selectedWeight === w
                    ? 'bg-rose-500 text-white shadow-md scale-105 border-2 border-rose-200'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {w}g
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCheck}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>⚖️ つり合いを判定する！</span>
        </button>

        {/* Hint Box */}
        {showHint && (
          <div className="w-full max-w-lg mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 text-xs sm:text-sm">
            <span className="font-black block mb-1">💡 ヒント</span>
            左の力（{leftTorque}）と右の力が同じになれば水平になります。「右のきょり × 置く重さ = {leftTorque}」になる数字を探してみよう！
          </div>
        )}
      </div>
    </GameModalWrapper>
  );
};
