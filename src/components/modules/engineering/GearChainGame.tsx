import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { RotateCw, RotateCcw } from 'lucide-react';

interface GearChainGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
}

export const GearChainGame: React.FC<GearChainGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel
}) => {
  const getPuzzle = () => {
    if (level === 1) {
      return {
        question: '動力ギアA（時計回り）の力を伝えて、ゴールギアCを「時計回り」に回したい！真ん中のギアBをはめ込んでみよう。',
        targetDirection: 'CW' as const, // Clockwise
        gearCount: 3,
        explanation: '噛み合っている歯車の数が奇数個（3個）のとき、最初と最後のギアは「同じ向き（時計回り）」に回ります！Aが時計回り → Bが反時計回り → Cが時計回り。',
        examTip: '【受験の重要法則】噛み合う歯車は1つ挟むごとに「時計回り ⇄ 反時計回り」と交互に入れ替わります！'
      };
    } else if (level === 2) {
      return {
        question: '4つの歯車がつながっているよ！最初のギアAが「時計回り」に回っているとき、一番最後のギアDはどちらの向きに回るかな？',
        targetDirection: 'CCW' as const, // Counter-Clockwise
        gearCount: 4,
        explanation: '4つのギア（偶数個）が直接噛み合うとき、最後のギアは「逆向き（反時計回り）」になります！A(時計) → B(反時計) → C(時計) → D(反時計)。',
        examTip: '【偶数と奇数の技】噛み合う歯車の個数が「偶数個なら逆向き」「奇数個なら同じ向き」になります！'
      };
    } else {
      return {
        question: '歯車A（歯数 12枚）が 4回転 すると、噛み合っている大きな歯車B（歯数 24枚）は何回転するかな？',
        targetDirection: 'CCW' as const,
        gearCount: 2,
        isRatioPuzzle: true,
        teethA: 12,
        turnsA: 4,
        teethB: 24,
        correctTurns: 2,
        explanation: 'かみ合った歯車の歯数の積は等しくなります！ 歯数12 × 4回転 = 48枚分の歯が進みます。歯数24のギアは「48 ÷ 24 = 2回転」します！',
        examTip: '【中学受験の反比例】「歯数 × 回転数 ＝ 一定」！歯数が2倍になると、回転数は「半分の1/2」になります！'
      };
    }
  };

  const puzzle = getPuzzle();
  const [selectedDirection, setSelectedDirection] = useState<'CW' | 'CCW' | null>(null);
  const [selectedTurns, setSelectedTurns] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(puzzle.question);

  // SVG Gear Component with rotating animation
  const renderGear = (teeth: number, radius: number, isCW: boolean, speedSec = 4, color = '#f59e0b', label = 'A') => {
    return (
      <div className="flex flex-col items-center">
        <svg
          viewBox="-60 -60 120 120"
          className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md"
          style={{
            animation: `${isCW ? 'spin' : 'spin-reverse'} ${speedSec}s linear infinite`
          }}
        >
          <style>{`
            @keyframes spin-reverse {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }
          `}</style>
          {/* Teeth */}
          {Array.from({ length: teeth }).map((_, i) => {
            const angle = (i * 360) / teeth;
            return (
              <rect
                key={i}
                x="-5"
                y={-radius - 8}
                width="10"
                height="12"
                rx="2"
                fill={color}
                transform={`rotate(${angle})`}
              />
            );
          })}
          {/* Main Body */}
          <circle cx="0" cy="0" r={radius} fill={color} stroke="#78350f" strokeWidth="2" />
          {/* Inner cutout holes */}
          {[0, 90, 180, 270].map((deg) => (
            <circle
              key={deg}
              cx={Math.cos((deg * Math.PI) / 180) * (radius * 0.5)}
              cy={Math.sin((deg * Math.PI) / 180) * (radius * 0.5)}
              r={radius * 0.2}
              fill="#ffffff"
              stroke="#78350f"
              strokeWidth="1.5"
            />
          ))}
          {/* Center Axle */}
          <circle cx="0" cy="0" r="10" fill="#475569" stroke="#1e293b" strokeWidth="2" />
          <circle cx="0" cy="0" r="4" fill="#fbbf24" />
        </svg>
        <span className="mt-1 font-black text-xs px-2 py-0.5 bg-white border border-slate-300 rounded-full shadow-sm text-slate-800">
          ギア {label}
        </span>
      </div>
    );
  };

  const handleDirectionAnswer = (dir: 'CW' | 'CCW') => {
    setSelectedDirection(dir);
    if (dir === puzzle.targetDirection) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback('大正解！歯車の回転方向を正確に読み解きました！');
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('おしい！もう一度、隣り合う歯車が逆向きに回ることをたどってみよう！');
    }
  };

  const handleTurnsAnswer = (turns: number) => {
    setSelectedTurns(turns);
    if (turns === (puzzle as any).correctTurns) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback(`大正解！歯数比 12:24 = 1:2 なので、回転数は逆比の 2:1 で「${turns}回転」です！`);
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('おしい！「歯数 × 回転数」が同じになる関係を計算してみよう！');
    }
  };

  return (
    <GameModalWrapper
      title="歯車（ギア）伝達パズル"
      badgeTag={`エンジニア工場 Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={puzzle.explanation}
      examTip={puzzle.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      onRetry={() => {
        setSelectedDirection(null);
        setSelectedTurns(null);
        setIsCompleted(false);
        setFeedback(puzzle.question);
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 font-extrabold text-amber-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* Gear Train Simulation Stage */}
        <div className="w-full min-h-[160px] bg-slate-900 rounded-3xl p-4 mb-5 flex items-center justify-center gap-1 sm:gap-4 overflow-x-auto shadow-inner border-2 border-slate-700">
          {level === 1 && (
            <>
              {renderGear(12, 38, true, 4, '#38bdf8', 'A (動力・時計回り)')}
              <div className="text-amber-400 font-black text-xl">⇄</div>
              {renderGear(12, 38, false, 4, '#fbbf24', 'B (反時計回り)')}
              <div className="text-amber-400 font-black text-xl">⇄</div>
              {renderGear(12, 38, true, 4, '#4ade80', 'C (ゴール)')}
            </>
          )}

          {level === 2 && (
            <>
              {renderGear(10, 32, true, 3, '#38bdf8', 'A (時計)')}
              {renderGear(10, 32, false, 3, '#fbbf24', 'B')}
              {renderGear(10, 32, true, 3, '#a78bfa', 'C')}
              {renderGear(10, 32, false, 3, '#f43f5e', 'D (?)')}
            </>
          )}

          {level === 3 && (
            <>
              {renderGear(12, 32, true, 2, '#38bdf8', 'A (12枚・4回転)')}
              <div className="text-amber-400 font-black text-2xl">⇄</div>
              {renderGear(24, 46, false, 4, '#f59e0b', 'B (24枚・?回転)')}
            </>
          )}
        </div>

        {/* User Interaction Controls */}
        {level <= 2 ? (
          <div className="w-full max-w-md">
            <span className="text-xs font-black text-slate-600 block text-center mb-3">
              最後のギアはどっち向きに回る？
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDirectionAnswer('CW')}
                className={`py-3.5 px-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 border-2 transition-all active:scale-95 shadow-md ${
                  selectedDirection === 'CW'
                    ? puzzle.targetDirection === 'CW'
                      ? 'bg-emerald-500 text-white border-emerald-300'
                      : 'bg-rose-500 text-white border-rose-300'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                <RotateCw className="w-5 h-5 text-amber-500" />
                <span>時計回り (右まわり)</span>
              </button>

              <button
                onClick={() => handleDirectionAnswer('CCW')}
                className={`py-3.5 px-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 border-2 transition-all active:scale-95 shadow-md ${
                  selectedDirection === 'CCW'
                    ? puzzle.targetDirection === 'CCW'
                      ? 'bg-emerald-500 text-white border-emerald-300'
                      : 'bg-rose-500 text-white border-rose-300'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                <RotateCcw className="w-5 h-5 text-indigo-500" />
                <span>反時計回り (左まわり)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <span className="text-xs font-black text-slate-600 block text-center mb-2">
              歯車Bの回転数を選んでね！
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {[1, 2, 4, 8].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleTurnsAnswer(opt)}
                  className={`py-3 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-md border-2 ${
                    selectedTurns === opt
                      ? opt === (puzzle as any).correctTurns
                        ? 'bg-emerald-500 text-white border-emerald-300'
                        : 'bg-rose-500 text-white border-rose-300'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  {opt} 回転
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameModalWrapper>
  );
};
