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
  customPuzzles?: GearPuzzle[];
  customTitle?: string;
  customBadge?: string;
}
interface GearDef {
  label: string;
  teeth: number;
  radius: number;
  isCW: boolean;
  speedSec: number;
  color: string;
}

interface GearPuzzle {
  question: string;
  targetDirection?: 'CW' | 'CCW';
  isRatioPuzzle?: boolean;
  correctTurns?: number;
  options?: number[];
  gears: GearDef[];
  explanation: string;
  examTip: string;
}

export const GearChainGame: React.FC<GearChainGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const getLevelPuzzles = (lvl: number): GearPuzzle[] => {
    switch (lvl) {
      case 1:
        return [
          {
            question: '動力ギアA（時計回り）の力を伝えて、ゴールギアCを「時計回り」に回したい！真ん中のギアBをはめ込んでみよう。',
            targetDirection: 'CW',
            gears: [
              { label: 'A (動力・時計)', teeth: 12, radius: 36, isCW: true, speedSec: 4, color: '#38bdf8' },
              { label: 'B (反時計)', teeth: 12, radius: 36, isCW: false, speedSec: 4, color: '#fbbf24' },
              { label: 'C (ゴール)', teeth: 12, radius: 36, isCW: true, speedSec: 4, color: '#4ade80' }
            ],
            explanation: '噛み合っている歯車の数が奇数個（3個）のとき、最初と最後のギアは「同じ向き（時計回り）」に回ります！Aが時計回り → Bが反時計回り → Cが時計回り。',
            examTip: '【受験の重要法則】噛み合う歯車は1つ挟むごとに「時計回り ⇄ 反時計回り」と交互に入れ替わります！'
          },
          {
            question: '動力ギアAが「反時計回り」で回っています。真ん中Bを通って、最後のギアCはどちら向きに回るかな？',
            targetDirection: 'CCW',
            gears: [
              { label: 'A (反時計)', teeth: 12, radius: 36, isCW: false, speedSec: 4, color: '#38bdf8' },
              { label: 'B (時計)', teeth: 12, radius: 36, isCW: true, speedSec: 4, color: '#fbbf24' },
              { label: 'C (?)', teeth: 12, radius: 36, isCW: false, speedSec: 4, color: '#f43f5e' }
            ],
            explanation: '3個のギアなので最初と最後は同じ向き！Aが反時計回り → Bが時計回り → Cは「反時計回り」です！',
            examTip: '奇数個の歯車伝達では、最初と最後が必ず同じ向きになります。'
          },
          {
            question: '3つの歯車がつながっています。ギアAが「時計回り」のとき、一番右のギアCの向きは？',
            targetDirection: 'CW',
            gears: [
              { label: 'A (時計)', teeth: 10, radius: 32, isCW: true, speedSec: 3.5, color: '#38bdf8' },
              { label: 'B', teeth: 14, radius: 40, isCW: false, speedSec: 4.9, color: '#fbbf24' },
              { label: 'C (?)', teeth: 10, radius: 32, isCW: true, speedSec: 3.5, color: '#4ade80' }
            ],
            explanation: '歯車の大きさが違っても、隣り合うギアは逆向きに回ります。3個目なので時計回りです！',
            examTip: '歯車の大きさが違っても回転の向きの法則（交互に反転）は変わりません！'
          }
        ];
      case 2:
        return [
          {
            question: '4つの歯車がつながっているよ！最初のギアAが「時計回り」に回っているとき、一番最後のギアDはどちらの向きに回るかな？',
            targetDirection: 'CCW',
            gears: [
              { label: 'A (時計)', teeth: 10, radius: 30, isCW: true, speedSec: 3, color: '#38bdf8' },
              { label: 'B', teeth: 10, radius: 30, isCW: false, speedSec: 3, color: '#fbbf24' },
              { label: 'C', teeth: 10, radius: 30, isCW: true, speedSec: 3, color: '#a78bfa' },
              { label: 'D (?)', teeth: 10, radius: 30, isCW: false, speedSec: 3, color: '#f43f5e' }
            ],
            explanation: '4つのギア（偶数個）が直接噛み合うとき、最後のギアは「逆向き（反時計回り）」になります！A(時計) → B(反時計) → C(時計) → D(反時計)。',
            examTip: '【偶数と奇数の技】噛み合う歯車の個数が「偶数個なら逆向き」「奇数個なら同じ向き」になります！'
          },
          {
            question: '4つの歯車で、最初のギアAが「反時計回り」のとき、最後のギアDはどちら向きに回るかな？',
            targetDirection: 'CW',
            gears: [
              { label: 'A (反時計)', teeth: 10, radius: 30, isCW: false, speedSec: 3, color: '#38bdf8' },
              { label: 'B', teeth: 10, radius: 30, isCW: true, speedSec: 3, color: '#fbbf24' },
              { label: 'C', teeth: 10, radius: 30, isCW: false, speedSec: 3, color: '#a78bfa' },
              { label: 'D (?)', teeth: 10, radius: 30, isCW: true, speedSec: 3, color: '#4ade80' }
            ],
            explanation: '偶数個（4個）のギアなので、最初と最後は逆向きになります。反時計回りの逆なので「時計回り」です！',
            examTip: 'A(反時計) → B(時計) → C(反時計) → D(時計) と頭の中で指さし確認しましょう！'
          },
          {
            question: '歯数が異なる4つの歯車がつながっています。ギアAが「時計回り」のとき、ギアDは？',
            targetDirection: 'CCW',
            gears: [
              { label: 'A (時計)', teeth: 8, radius: 26, isCW: true, speedSec: 2.5, color: '#38bdf8' },
              { label: 'B', teeth: 12, radius: 34, isCW: false, speedSec: 3.75, color: '#fbbf24' },
              { label: 'C', teeth: 10, radius: 30, isCW: true, speedSec: 3.1, color: '#a78bfa' },
              { label: 'D (?)', teeth: 14, radius: 38, isCW: false, speedSec: 4.4, color: '#f43f5e' }
            ],
            explanation: '歯数に関係なく、偶数個（4個）の歯車列では最初と最後の向きは逆（反時計回り）になります！',
            examTip: '歯数に惑わされず、まずは「回転方向のルール」と「回転数のルール」を分けて考えましょう！'
          }
        ];
      case 3:
        return [
          {
            question: '歯車A（歯数 12枚）が 4回転 すると、噛み合っている大きな歯車B（歯数 24枚）は何回転するかな？',
            isRatioPuzzle: true,
            correctTurns: 2,
            options: [1, 2, 4, 8],
            gears: [
              { label: 'A (12枚・4回転)', teeth: 12, radius: 32, isCW: true, speedSec: 2, color: '#38bdf8' },
              { label: 'B (24枚・?回転)', teeth: 24, radius: 46, isCW: false, speedSec: 4, color: '#f59e0b' }
            ],
            explanation: 'かみ合った歯車の歯数の積は等しくなります！ 歯数12 × 4回転 = 48枚分の歯が進みます。歯数24のギアは「48 ÷ 24 = 2回転」します！',
            examTip: '【中学受験の反比例】「歯数 × 回転数 ＝ 一定」！歯数が2倍になると、回転数は「半分の1/2」になります！'
          },
          {
            question: '歯車A（歯数 10枚）が 6回転 すると、噛み合っている歯車B（歯数 20枚）は何回転するかな？',
            isRatioPuzzle: true,
            correctTurns: 3,
            options: [2, 3, 4, 6],
            gears: [
              { label: 'A (10枚・6回転)', teeth: 10, radius: 30, isCW: true, speedSec: 2, color: '#38bdf8' },
              { label: 'B (20枚・?回転)', teeth: 20, radius: 44, isCW: false, speedSec: 4, color: '#f59e0b' }
            ],
            explanation: '10枚 × 6回転 = 60枚分の歯が噛み合います。歯数20の歯車Bは 60 ÷ 20 = 3回転します！',
            examTip: '歯数比 10:20 = 1:2 なので、回転数の比は逆比の 2:1 になります（6回転 × 1/2 = 3回転）。'
          },
          {
            question: '歯車A（歯数 16枚）が 3回転 すると、噛み合っている歯車B（歯数 24枚）は何回転するかな？',
            isRatioPuzzle: true,
            correctTurns: 2,
            options: [1, 2, 3, 4],
            gears: [
              { label: 'A (16枚・3回転)', teeth: 16, radius: 34, isCW: true, speedSec: 2.5, color: '#38bdf8' },
              { label: 'B (24枚・?回転)', teeth: 24, radius: 44, isCW: false, speedSec: 3.75, color: '#f59e0b' }
            ],
            explanation: '16枚 × 3回転 = 48枚。歯車Bは 48 ÷ 24 = 2回転します！',
            examTip: '歯数比 16:24 = 2:3 → 回転数比は 3:2 と逆比を使えば一瞬で解けます！'
          }
        ];
      case 4:
        return [
          {
            question: '5つの歯車がつながっているよ！最初のギアAが「時計回り」に回っているとき、最後のギアEはどちらの向きに回るかな？',
            targetDirection: 'CW',
            gears: [
              { label: 'A (時計)', teeth: 8, radius: 26, isCW: true, speedSec: 3, color: '#38bdf8' },
              { label: 'B', teeth: 8, radius: 26, isCW: false, speedSec: 3, color: '#fbbf24' },
              { label: 'C', teeth: 8, radius: 26, isCW: true, speedSec: 3, color: '#a78bfa' },
              { label: 'D', teeth: 8, radius: 26, isCW: false, speedSec: 3, color: '#f43f5e' },
              { label: 'E (?)', teeth: 8, radius: 26, isCW: true, speedSec: 3, color: '#4ade80' }
            ],
            explanation: '噛み合う歯車が5個（奇数個）のとき、最初と最後は「同じ向き（時計回り）」になります！',
            examTip: '【一瞬で見抜く奇偶判定】どんなにギアの数が多くても「奇数個なら同じ向き、偶数個なら逆向き」です！'
          },
          {
            question: '5つの歯車で、最初のギアAが「反時計回り」のとき、一番右のギアEの回転方向は？',
            targetDirection: 'CCW',
            gears: [
              { label: 'A (反時計)', teeth: 8, radius: 26, isCW: false, speedSec: 3, color: '#38bdf8' },
              { label: 'B', teeth: 8, radius: 26, isCW: true, speedSec: 3, color: '#fbbf24' },
              { label: 'C', teeth: 8, radius: 26, isCW: false, speedSec: 3, color: '#a78bfa' },
              { label: 'D', teeth: 8, radius: 26, isCW: true, speedSec: 3, color: '#f43f5e' },
              { label: 'E (?)', teeth: 8, radius: 26, isCW: false, speedSec: 3, color: '#4ade80' }
            ],
            explanation: '5個（奇数個）なのでAと同じ向き（反時計回り）になります！',
            examTip: '長いギア列の入試問題も、個数を数えるだけで1秒で解けます！'
          },
          {
            question: '6つの歯車がつながっています！最初のギアAが「時計回り」のとき、最後のギアFはどちら向き？',
            targetDirection: 'CCW',
            gears: [
              { label: 'A (時計)', teeth: 8, radius: 24, isCW: true, speedSec: 3, color: '#38bdf8' },
              { label: 'B', teeth: 8, radius: 24, isCW: false, speedSec: 3, color: '#fbbf24' },
              { label: 'C', teeth: 8, radius: 24, isCW: true, speedSec: 3, color: '#a78bfa' },
              { label: 'D', teeth: 8, radius: 24, isCW: false, speedSec: 3, color: '#f43f5e' },
              { label: 'E', teeth: 8, radius: 24, isCW: true, speedSec: 3, color: '#34d399' },
              { label: 'F (?)', teeth: 8, radius: 24, isCW: false, speedSec: 3, color: '#f59e0b' }
            ],
            explanation: '6個（偶数個）の歯車列なので、最後は最初と逆向きの「反時計回り」になります！',
            examTip: '時計 ⇄ 反時計 が6回入れ替わるので、奇数番目が時計、偶数番目が反時計です！'
          }
        ];
      case 5:
        return [
          {
            question: '歯車A（歯数 8枚）が 6回転 すると、噛み合っている大きな歯車B（歯数 24枚）は何回転するかな？',
            isRatioPuzzle: true,
            correctTurns: 2,
            options: [1, 2, 3, 4],
            gears: [
              { label: 'A (8枚・6回転)', teeth: 8, radius: 28, isCW: true, speedSec: 2, color: '#38bdf8' },
              { label: 'B (24枚・?回転)', teeth: 24, radius: 48, isCW: false, speedSec: 6, color: '#f59e0b' }
            ],
            explanation: '歯数 8 × 6回転 = 48枚。歯数24の歯車Bは 48 ÷ 24 = 2回転！歯数比が 8:24 = 1:3 なので、回転数は逆比の 3:1 になります。',
            examTip: '【逆比の極意】歯数が3倍になると、回転数は「1/3」になります！反比例のグラフとも直結します。'
          },
          {
            question: '歯車A（歯数 6枚）が 8回転 すると、噛み合っている歯車B（歯数 24枚）は何回転するかな？',
            isRatioPuzzle: true,
            correctTurns: 2,
            options: [1, 2, 4, 6],
            gears: [
              { label: 'A (6枚・8回転)', teeth: 6, radius: 26, isCW: true, speedSec: 1.8, color: '#38bdf8' },
              { label: 'B (24枚・?回転)', teeth: 24, radius: 48, isCW: false, speedSec: 7.2, color: '#f59e0b' }
            ],
            explanation: '6枚 × 8回転 = 48枚。48 ÷ 24 = 2回転します！歯数が4倍（6:24=1:4）なので回転数は1/4（8×1/4=2）です。',
            examTip: '自転車の変速ギアもこの原理！ペダル側のギアとタイヤ側のギアの歯数比でスピードが変わります。'
          },
          {
            question: '歯車A（歯数 9枚）が 4回転 すると、噛み合っている歯車B（歯数 18枚）は何回転するかな？',
            isRatioPuzzle: true,
            correctTurns: 2,
            options: [1, 2, 3, 4],
            gears: [
              { label: 'A (9枚・4回転)', teeth: 9, radius: 28, isCW: true, speedSec: 2, color: '#38bdf8' },
              { label: 'B (18枚・?回転)', teeth: 18, radius: 42, isCW: false, speedSec: 4, color: '#f59e0b' }
            ],
            explanation: '9枚 × 4回転 = 36枚。36 ÷ 18 = 2回転！歯数が2倍なので回転数は半分です。',
            examTip: '歯数比と回転数比の逆比の関係を完璧に使いこなせるようになりました！'
          }
        ];
      case 6:
      default:
        return [
          {
            question: '歯車A（10枚）が 6回転 するとき、中間の歯車B（15枚）を経由してつながる歯車C（30枚）は何回転するかな？',
            isRatioPuzzle: true,
            correctTurns: 2,
            options: [1, 2, 3, 5],
            gears: [
              { label: 'A (10枚・6回転)', teeth: 10, radius: 28, isCW: true, speedSec: 2, color: '#38bdf8' },
              { label: 'B (15枚・中間)', teeth: 15, radius: 36, isCW: false, speedSec: 3, color: '#94a3b8' },
              { label: 'C (30枚・?回転)', teeth: 30, radius: 48, isCW: true, speedSec: 6, color: '#f59e0b' }
            ],
            explanation: '間の歯車Bの歯数に関わらず、最初と最後の関係だけで決まります！10 × 6 = 60枚分の歯が送られるので、歯車Cは 60 ÷ 30 = 2回転します！',
            examTip: '【アイドラギアの法則】途中に挟まれた歯車は「回転の向きを変えるだけ」で、最初と最後の回転比には影響しません！入試の頻出ひっかけです。'
          },
          {
            question: '歯車A（12枚）が 5回転 するとき、中間ギアB（18枚）を通る歯車C（20枚）は何回転するかな？',
            isRatioPuzzle: true,
            correctTurns: 3,
            options: [2, 3, 4, 5],
            gears: [
              { label: 'A (12枚・5回転)', teeth: 12, radius: 30, isCW: true, speedSec: 2.4, color: '#38bdf8' },
              { label: 'B (18枚・中間)', teeth: 18, radius: 38, isCW: false, speedSec: 3.6, color: '#94a3b8' },
              { label: 'C (20枚・?回転)', teeth: 20, radius: 42, isCW: true, speedSec: 4, color: '#f59e0b' }
            ],
            explanation: '送られる歯数は 12 × 5 = 60枚。歯車Cは 60 ÷ 20 = 3回転します！中間ギアBの歯数は計算に使わなくてOK！',
            examTip: '難関校の引っかけ問題でも、中間ギアを無視して「Aの歯数×回転数 ÷ Cの歯数」で即答しましょう！'
          },
          {
            question: '歯車A（8枚）が 9回転 するとき、中間ギアB（16枚）を通る歯車C（24枚）は何回転するかな？',
            isRatioPuzzle: true,
            correctTurns: 3,
            options: [2, 3, 4, 6],
            gears: [
              { label: 'A (8枚・9回転)', teeth: 8, radius: 26, isCW: true, speedSec: 2, color: '#38bdf8' },
              { label: 'B (16枚・中間)', teeth: 16, radius: 36, isCW: false, speedSec: 4, color: '#94a3b8' },
              { label: 'C (24枚・?回転)', teeth: 24, radius: 46, isCW: true, speedSec: 6, color: '#f59e0b' }
            ],
            explanation: '8 × 9 = 72枚。歯車Cは 72 ÷ 24 = 3回転します！工学機械のギアトレインの計算をマスターしました！',
            examTip: '【達人級の物理工学】時計のムーブメントや車のトランスミッションも、すべてこの歯車比の計算で設計されています！'
          }
        ];
    }
  };

  const puzzles = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level);
  const [problemIndex, setProblemIndex] = useState(0);
  const puzzle = puzzles[problemIndex % puzzles.length];

  const [selectedDirection, setSelectedDirection] = useState<'CW' | 'CCW' | null>(null);
  const [selectedTurns, setSelectedTurns] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(puzzle.question);

  const switchProblem = (idx: number) => {
    const nextIdx = idx % puzzles.length;
    const nextP = puzzles[nextIdx];
    setProblemIndex(nextIdx);
    setSelectedDirection(null);
    setSelectedTurns(null);
    setIsCompleted(false);
    setFeedback(nextP.question);
  };

  // SVG Gear Component with rotating animation
  const renderGear = (
    teeth: number,
    radius: number,
    isCW: boolean,
    speedSec = 4,
    color = '#f59e0b',
    label = 'A',
    isSpinning = true,
    isTarget = false,
    isDriver = false
  ) => {
    return (
      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="-60 -60 120 120"
            className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md"
            style={{
              animation: isSpinning
                ? `${isCW ? 'spin' : 'spin-reverse'} ${speedSec}s linear infinite`
                : 'none'
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
            <circle cx="0" cy="0" r="12" fill="#475569" stroke="#1e293b" strokeWidth="2" />
            <circle cx="0" cy="0" r="4" fill="#fbbf24" />
          </svg>

          {/* Overlaid Question mark for target gear when not completed */}
          {isTarget && !isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-black text-lg flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                ?
              </div>
            </div>
          )}

          {/* Driver indicator for source gear */}
          {isDriver && (
            <div className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-400 border border-amber-500 text-[10px] font-black text-amber-950 shadow-sm flex items-center gap-0.5">
              <span>⚡</span>
              <span>{isCW ? '時計回り' : '反時計回り'}</span>
            </div>
          )}
        </div>

        <span className="mt-2 font-black text-xs px-2.5 py-0.5 bg-white border border-slate-300 rounded-full shadow-sm text-slate-800 flex items-center gap-1">
          <span>ギア {label}</span>
          <span className="text-[10px] text-slate-500 font-bold">({teeth}歯)</span>
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
      setFeedback('大正解！歯車の回転方向を正確に読み解きました！すべてのギアが連動して回ります！');
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('おしい！隣り合う歯車は必ず「逆向き」に噛み合います。1つずつたどってみよう！');
    }
  };

  const handleTurnsAnswer = (turns: number) => {
    setSelectedTurns(turns);
    if (turns === puzzle.correctTurns) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback(`大正解！正解は「${turns}回転」です！連動して回る様子を確認しよう！`);
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('おしい！「歯数 × 回転数」が同じになる関係を計算してみよう！');
    }
  };

  return (
    <GameModalWrapper
      title={customTitle || "歯車（ギア）伝達パズル"}
      badgeTag={customBadge || `エンジニア工場 Lv.${level}`}
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
        <div className="w-full min-h-[175px] bg-slate-900 rounded-3xl p-4 sm:p-5 mb-5 flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto shadow-inner border-2 border-slate-700">
          {puzzle.gears.map((g, idx) => {
            const isDriver = idx === 0;
            const isTarget = idx === puzzle.gears.length - 1;
            // Only driver spins initially for direction puzzles; all spin once completed
            const isSpinning = isCompleted || (isDriver && !puzzle.isRatioPuzzle);

            return (
              <React.Fragment key={idx}>
                {idx > 0 && <div className="text-amber-400 font-black text-xl">⇄</div>}
                {renderGear(
                  g.teeth,
                  g.radius,
                  g.isCW,
                  g.speedSec,
                  g.color,
                  g.label,
                  isSpinning,
                  isTarget,
                  isDriver
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* User Interaction Controls */}
        {!puzzle.isRatioPuzzle ? (
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
              歯車の回転数を選んでね！
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {(puzzle.options || [1, 2, 3, 4]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleTurnsAnswer(opt)}
                  className={`py-3 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-md border-2 ${
                    selectedTurns === opt
                      ? opt === puzzle.correctTurns
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
