import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Lightbulb, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

interface TsurukameGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: TsurukameProblem[];
  customTitle?: string;
  customBadge?: string;
}
interface TsurukameProblem {
  totalHeads: number;
  totalLegs: number;
  correctCranes: number;
  correctTurtles: number;
  explanation: string;
  examTip: string;
}

interface CheckedResult {
  cranes: number;
  turtles: number;
  legs: number;
  isCorrect: boolean;
}

export const TsurukameGame: React.FC<TsurukameGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const getLevelProblems = (lvl: number): TsurukameProblem[] => {
    switch (lvl) {
      case 1:
        return [
          {
            totalHeads: 5,
            totalLegs: 14,
            correctCranes: 3,
            correctTurtles: 2,
            explanation: 'もし全員ツル（足2本）なら 5匹 × 2本 = 10本。足りない足は 14 - 10 = 4本。ツルをカメに変えると足が2本ずつ増えるので、4本 ÷ 2 = 2匹がカメ！ツルは 5 - 2 = 3羽です。',
            examTip: 'つるかめ算の鉄則：【もしも全員ツルだったら】と仮定し、足りない足を「カメとツルの足の差(2本)」で割るとカメの数が出ます！'
          },
          {
            totalHeads: 6,
            totalLegs: 16,
            correctCranes: 4,
            correctTurtles: 2,
            explanation: '全員ツルなら 6 × 2 = 12本。足りない足は 16 - 12 = 4本。4 ÷ 2 = 2匹がカメ！ツルは 6 - 2 = 4羽です。',
            examTip: 'まずは「全員ツル」と仮定して計算する手順を体に染み込ませましょう！'
          },
          {
            totalHeads: 6,
            totalLegs: 18,
            correctCranes: 3,
            correctTurtles: 3,
            explanation: '全員ツルなら 6 × 2 = 12本。不足は 18 - 12 = 6本。6 ÷ 2 = 3匹がカメ！ツルは 6 - 3 = 3羽です。',
            examTip: 'ツルとカメが同数のときは、1組（2本+4本=6本）のグループで考える解法もあります！'
          }
        ];
      case 2:
        return [
          {
            totalHeads: 8,
            totalLegs: 26,
            correctCranes: 3,
            correctTurtles: 5,
            explanation: '全員ツルなら 8 × 2 = 16本。不足は 26 - 16 = 10本。10本 ÷ 2本 = 5匹がカメ！ツルは 8 - 5 = 3羽です。',
            examTip: '面積図を描くときは、たてを「足の本数(2本と4本)」、横を「匹数」にして、欠けた長方形の面積に注目します！'
          },
          {
            totalHeads: 7,
            totalLegs: 20,
            correctCranes: 4,
            correctTurtles: 3,
            explanation: '全員ツルなら 7 × 2 = 14本。不足は 20 - 14 = 6本。6 ÷ 2 = 3匹がカメ！ツルは 7 - 3 = 4羽です。',
            examTip: '「全員カメだったら」と仮定しても解けます。その場合は余った足を引いてツルの数を求めます！'
          },
          {
            totalHeads: 8,
            totalLegs: 22,
            correctCranes: 5,
            correctTurtles: 3,
            explanation: '全員ツルなら 8 × 2 = 16本。不足は 22 - 16 = 6本。6 ÷ 2 = 3匹がカメ！ツルは 8 - 3 = 5羽です。',
            examTip: '検算の習慣をつけよう！「5羽 × 2本 + 3匹 × 4本 = 10 + 12 = 22本」でバッチリ！'
          }
        ];
      case 3:
        return [
          {
            totalHeads: 12,
            totalLegs: 38,
            correctCranes: 5,
            correctTurtles: 7,
            explanation: '全員ツルなら 12 × 2 = 24本。不足は 38 - 24 = 14本。14本 ÷ 2本 = 7匹がカメ！ツルは 12 - 7 = 5羽です。',
            examTip: '難関校では「カブトムシ(足6本)とクモ(足8本)」や「50円切手と80円切手」のように形を変えて出題されますが、考え方は全く同じです！'
          },
          {
            totalHeads: 10,
            totalLegs: 32,
            correctCranes: 4,
            correctTurtles: 6,
            explanation: '全員ツルなら 10 × 2 = 20本。不足は 32 - 20 = 12本。12 ÷ 2 = 6匹がカメ！ツルは 10 - 6 = 4羽です。',
            examTip: '「つるかめ算」は方程式を使わずに解く小学生のスーパーテクニックです！'
          },
          {
            totalHeads: 15,
            totalLegs: 46,
            correctCranes: 7,
            correctTurtles: 8,
            explanation: '全員ツルなら 15 × 2 = 30本。不足は 46 - 30 = 16本。16 ÷ 2 = 8匹がカメ！ツルは 15 - 8 = 7羽です。',
            examTip: '頭数が増えても計算のアルゴリズムは全く変わりません！自信を持って解き進めましょう。'
          }
        ];
      case 4:
        return [
          {
            totalHeads: 14,
            totalLegs: 42,
            correctCranes: 7,
            correctTurtles: 7,
            explanation: '全員ツルなら 14 × 2 = 28本。不足は 42 - 28 = 14本。14 ÷ 2 = 7匹がカメ！ツルは 14 - 7 = 7羽です。',
            examTip: 'ツルとカメがちょうど同数になるパターン。1組6本で 42 ÷ 6 = 7組 と解くこともできます！'
          },
          {
            totalHeads: 16,
            totalLegs: 50,
            correctCranes: 7,
            correctTurtles: 9,
            explanation: '全員ツルなら 16 × 2 = 32本。不足は 50 - 32 = 18本。18 ÷ 2 = 9匹がカメ！ツルは 16 - 9 = 7羽です。',
            examTip: '計算ミスを防ぐために、掛け算・引き算・割り算をメモしながら進めましょう！'
          },
          {
            totalHeads: 18,
            totalLegs: 56,
            correctCranes: 8,
            correctTurtles: 10,
            explanation: '全員ツルなら 18 × 2 = 36本。不足は 56 - 36 = 20本。20 ÷ 2 = 10匹がカメ！ツルは 18 - 10 = 8羽です。',
            examTip: '大きな数になっても、考え方の軸がブレなければ素早く確実に正解できます！'
          }
        ];
      case 5:
        return [
          {
            totalHeads: 20,
            totalLegs: 62,
            correctCranes: 9,
            correctTurtles: 11,
            explanation: '全員ツルなら 20 × 2 = 40本。不足は 62 - 40 = 22本。22 ÷ 2 = 11匹がカメ！ツルは 20 - 11 = 9羽です。',
            examTip: '「差集め算」や「弁償算（テストで正解なら+点、間違いなら-点）」もつるかめ算の親戚です！'
          },
          {
            totalHeads: 22,
            totalLegs: 68,
            correctCranes: 10,
            correctTurtles: 12,
            explanation: '全員ツルなら 22 × 2 = 44本。不足は 68 - 44 = 24本。24 ÷ 2 = 12匹がカメ！ツルは 22 - 12 = 10羽です。',
            examTip: '上位校入試では3つの量（ツル・カメ・トンボなど）が出ることもありますが、2つの関係に注目して解きます！'
          },
          {
            totalHeads: 24,
            totalLegs: 74,
            correctCranes: 11,
            correctTurtles: 13,
            explanation: '全員ツルなら 24 × 2 = 48本。不足は 74 - 48 = 26本。26 ÷ 2 = 13匹がカメ！ツルは 24 - 13 = 11羽です。',
            examTip: '面積図をフリーハンドでサッと描けるようになると、入試本番で強力な武器になります！'
          }
        ];
      case 6:
      default:
        return [
          {
            totalHeads: 30,
            totalLegs: 94,
            correctCranes: 13,
            correctTurtles: 17,
            explanation: '全員ツルなら 30 × 2 = 60本。不足は 94 - 60 = 34本。34 ÷ 2 = 17匹がカメ！ツルは 30 - 17 = 13羽です。',
            examTip: '【達人級マスター】暗算で「(94 - 30×2) ÷ 2 = 17匹」と即答できるようになったら完璧です！'
          },
          {
            totalHeads: 28,
            totalLegs: 86,
            correctCranes: 13,
            correctTurtles: 15,
            explanation: '全員ツルなら 28 × 2 = 56本。不足は 86 - 56 = 30本。30 ÷ 2 = 15匹がカメ！ツルは 28 - 15 = 13羽です。',
            examTip: '難関中学の算数でも頻出のつるかめ算。本質は「仮定して差を埋める」論理的思考です！'
          },
          {
            totalHeads: 25,
            totalLegs: 70,
            correctCranes: 15,
            correctTurtles: 10,
            explanation: '全員ツルなら 25 × 2 = 50本。不足は 70 - 50 = 20本。20 ÷ 2 = 10匹がカメ！ツルは 25 - 10 = 15羽です。',
            examTip: 'どんな変形問題が来ても「もしも〜だったら」と仮定する力は、数学・科学全般の武器になります！'
          }
        ];
    }
  };

  const problems = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelProblems(level);
  const [problemIndex, setProblemIndex] = useState(0);
  const problem = problems[problemIndex % problems.length];

  // User hypothesis: number of turtles (0 to totalHeads)
  const [turtleCount, setTurtleCount] = useState<number>(0);
  const craneCount = problem.totalHeads - turtleCount;

  // Calculation result is masked until checked
  const [lastCheckedResult, setLastCheckedResult] = useState<CheckedResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(
    `ツル（足2本）とカメ（足4本）が合わせて ${problem.totalHeads} 匹、足の合計が ${problem.totalLegs} 本になる組み合わせを考えよう！`
  );

  const updateTurtleCount = (newTurtles: number) => {
    sound.playClick();
    const clamped = Math.max(0, Math.min(problem.totalHeads, newTurtles));
    setTurtleCount(clamped);
    setLastCheckedResult(null); // Clear checked state when adjusting
  };

  const switchProblem = (idx: number) => {
    const nextIdx = idx % problems.length;
    const nextP = problems[nextIdx];
    setProblemIndex(nextIdx);
    setTurtleCount(0);
    setLastCheckedResult(null);
    setShowHint(false);
    setIsCompleted(false);
    setFeedback(
      `ツル（足2本）とカメ（足4本）が合わせて ${nextP.totalHeads} 匹、足の合計が ${nextP.totalLegs} 本になる組み合わせを考えよう！`
    );
  };

  const handleCheck = () => {
    const calcLegs = craneCount * 2 + turtleCount * 4;
    const isCorrect = turtleCount === problem.correctTurtles;
    setLastCheckedResult({
      cranes: craneCount,
      turtles: turtleCount,
      legs: calcLegs,
      isCorrect
    });

    if (isCorrect) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback(
        `🎉 大正解！ツル ${craneCount}羽（${craneCount * 2}本）＋ カメ ${turtleCount}匹（${turtleCount * 4}本）で足の合計がピッタリ ${problem.totalLegs}本 になりました！`
      );
      onComplete(3);
    } else {
      sound.playWrong();
      if (calcLegs < problem.totalLegs) {
        setFeedback(
          `計算結果は ${calcLegs}本 でした！目標（${problem.totalLegs}本）まであと ${problem.totalLegs - calcLegs}本 足りないよ。カメを増やしてみよう！`
        );
      } else {
        setFeedback(
          `計算結果は ${calcLegs}本 でした！目標（${problem.totalLegs}本）より ${calcLegs - problem.totalLegs}本 多いよ。ツルを増やしてみよう！`
        );
      }
    }
  };

  const allCraneLegs = problem.totalHeads * 2;
  const shortage = problem.totalLegs - allCraneLegs;

  return (
    <GameModalWrapper
      title={customTitle || "つるかめ算ビジュアルアリーナ"}
      badgeTag={customBadge || `算数アリーナ Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={problem.explanation}
      examTip={problem.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      problemIndex={problemIndex}
      totalProblems={problems.length}
      onSwitchProblem={switchProblem}
      onNextProblem={() => switchProblem(problemIndex + 1)}
      onRetry={() => {
        setTurtleCount(0);
        setLastCheckedResult(null);
        setShowHint(false);
        setIsCompleted(false);
        setFeedback(
          `ツル（足2本）とカメ（足4本）が合わせて ${problem.totalHeads} 匹、足の合計が ${problem.totalLegs} 本になる組み合わせを考えよう！`
        );
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-3 font-extrabold text-emerald-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* Goal Banner */}
        <div className="flex justify-center items-center gap-4 mb-4 bg-amber-50 border-2 border-amber-200 px-6 py-2.5 rounded-2xl">
          <div className="text-center">
            <span className="text-xs font-bold text-amber-700 block">あたまの数（合計匹数）</span>
            <span className="text-2xl font-black text-amber-900">{problem.totalHeads} 匹</span>
          </div>
          <div className="text-xl font-bold text-slate-300">|</div>
          <div className="text-center">
            <span className="text-xs font-bold text-amber-700 block">めざす足の合計</span>
            <span className="text-2xl font-black text-rose-600">{problem.totalLegs} 本</span>
          </div>
        </div>

        {/* Animal Visualizer Box */}
        <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 mb-4 shadow-inner">
          {/* Visual Animals Gallery */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 min-h-[60px]">
            {/* Cranes */}
            {Array.from({ length: craneCount }).map((_, i) => (
              <div
                key={`crane-${i}`}
                className="flex flex-col items-center bg-sky-100 border border-sky-300 rounded-2xl px-2 py-1 shadow-sm"
              >
                <span className="text-2xl sm:text-3xl">🦩</span>
                <span className="text-[10px] font-black text-sky-800">ツル (2本)</span>
              </div>
            ))}
            {/* Turtles */}
            {Array.from({ length: turtleCount }).map((_, i) => (
              <div
                key={`turtle-${i}`}
                className="flex flex-col items-center bg-emerald-100 border border-emerald-300 rounded-2xl px-2 py-1 shadow-sm"
              >
                <span className="text-2xl sm:text-3xl">🐢</span>
                <span className="text-[10px] font-black text-emerald-800">カメ (4本)</span>
              </div>
            ))}
          </div>

          {/* Leg Calculation Result: MASKED while adjusting; revealed only after checking */}
          {lastCheckedResult !== null ? (
            <div
              className={`rounded-2xl p-3 border ${
                lastCheckedResult.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              } flex flex-col sm:flex-row items-center justify-around gap-2 text-center text-xs sm:text-sm font-bold shadow-sm`}
            >
              <div>
                ツル: <span className="text-sky-600 font-black text-base">{lastCheckedResult.cranes}羽</span> × 2本 ={' '}
                <span className="font-black">{lastCheckedResult.cranes * 2}本</span>
              </div>
              <div className="text-slate-400">+</div>
              <div>
                カメ: <span className="text-emerald-600 font-black text-base">{lastCheckedResult.turtles}匹</span> × 4本 ={' '}
                <span className="font-black">{lastCheckedResult.turtles * 4}本</span>
              </div>
              <div className="text-slate-400">=</div>
              <div
                className={`px-3 py-1 rounded-xl border font-black ${
                  lastCheckedResult.isCorrect
                    ? 'bg-emerald-200 border-emerald-400 text-emerald-950'
                    : 'bg-rose-200 border-rose-400 text-rose-950'
                }`}
              >
                計算結果: {lastCheckedResult.legs} 本（目標: {problem.totalLegs}本）
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col sm:flex-row items-center justify-around gap-2 text-center text-xs sm:text-sm font-bold text-slate-700">
              <div>
                🦩 ツル: <span className="text-sky-600 font-black text-base">{craneCount}羽</span>（足2本）
              </div>
              <div className="text-slate-300 font-black">+</div>
              <div>
                🐢 カメ: <span className="text-emerald-600 font-black text-base">{turtleCount}匹</span>（足4本）
              </div>
              <div className="text-slate-300 font-black">=</div>
              <div className="px-3 py-1 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 font-black flex items-center gap-1.5">
                <span>足の合計:</span>
                <span className="text-base font-black text-amber-700">❓ 本</span>
                <span className="text-[10px] text-amber-800 font-normal">（計算ボタンで判定）</span>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Stepper & Slider Box */}
        <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-2xl p-4 mb-3 shadow-sm">
          <div className="flex justify-between items-center text-xs font-black text-slate-700 mb-2.5">
            <span>🐢 カメの予想匹数をセット</span>
            <span className="text-emerald-700 font-extrabold text-base bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {turtleCount} 匹
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => updateTurtleCount(turtleCount - 1)}
              disabled={turtleCount <= 0}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-black text-slate-700 border border-slate-300 active:scale-95 transition-all shrink-0"
              aria-label="カメを1匹減らす"
            >
              <Minus className="w-5 h-5" />
            </button>

            <input
              type="range"
              min="0"
              max={problem.totalHeads}
              value={turtleCount}
              onChange={(e) => updateTurtleCount(parseInt(e.target.value, 10))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <button
              onClick={() => updateTurtleCount(turtleCount + 1)}
              disabled={turtleCount >= problem.totalHeads}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-black text-slate-700 border border-slate-300 active:scale-95 transition-all shrink-0"
              aria-label="カメを1匹増やす"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1.5">
            <span>0匹（全部ツル）</span>
            <span>{problem.totalHeads}匹（全部カメ）</span>
          </div>
        </div>

        {/* Collapsible Middle School Exam Hint */}
        <div className="w-full max-w-md mb-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-black text-amber-900 flex items-center justify-between transition-colors shadow-sm"
          >
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>💡 中学受験の解法ヒント（もし全員ツルだったら？）</span>
            </div>
            {showHint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHint && (
            <div className="mt-2 bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 font-bold space-y-1.5 animate-fadeIn">
              <p>
                1. もし全員（{problem.totalHeads}匹）がツルなら：{' '}
                <span className="font-black text-amber-800">{problem.totalHeads} × 2 = {allCraneLegs} 本</span>
              </p>
              <p>
                2. 目標の足（{problem.totalLegs}本）より足りない本数は：{' '}
                <span className="font-black text-rose-700">{problem.totalLegs} - {allCraneLegs} = {shortage} 本</span>
              </p>
              <p>
                3. ツルを1匹カメに変えると、足は 4 - 2 ={' '}
                <span className="font-black text-emerald-700">2本 増える！</span>
              </p>
              <p>
                4. だからカメの数は：{' '}
                <span className="font-black text-emerald-800">{shortage} ÷ 2 = {problem.correctTurtles} 匹！</span>
              </p>
              <p>
                5. ツルの数は：{' '}
                <span className="font-black text-sky-800">{problem.totalHeads} - {problem.correctTurtles} = {problem.correctCranes} 羽！</span>
              </p>
            </div>
          )}
        </div>

        {/* Check / Submit Button */}
        <button
          onClick={handleCheck}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>🎯 足の合計を計算して判定する！</span>
        </button>
      </div>
    </GameModalWrapper>
  );
};
