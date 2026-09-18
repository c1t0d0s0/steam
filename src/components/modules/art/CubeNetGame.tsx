import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';


interface CubeNetGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
}

export const CubeNetGame: React.FC<CubeNetGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel
}) => {
  const getPuzzle = () => {
    if (level === 1) {
      // Classic T-shape net
      // Row 0: . B . .
      // Row 1: A C D E
      // Row 2: . F . .
      // Faces:
      // In row 1: A-C-D-E -> A is opposite D, C is opposite E
      // Top B is opposite Bottom F!
      return {
        type: 'opposite' as const,
        targetFace: 'B',
        question: '展開図を組み立てたとき、黄色い面「B」と向かい合う（平行になる）面はどれ？',
        correctAnswer: 'F',
        options: ['A', 'C', 'D', 'F'],
        explanation: '十字型の展開図では、上下に飛び出た「B」と「F」が向かい合う面（対面）になります！また、1行に4枚並んだ面は1つ飛ばしで向かい合います（AとD、CとE）。',
        examTip: '【展開図の超基本技】1列に3枚以上並んでいる面は「1マス飛ばし」が必ず向かい合う面になります！'
      };
    } else if (level === 2) {
      // Dice sum = 7
      // Net has numbers:
      // Row 0: . 1 . .
      // Row 1: 2 3 5 4
      // Row 2: . ? . .
      // Question: Opposite to face '1' is the bottom face. For a standard die, opposite faces sum to 7!
      // So bottom face must be 7 - 1 = 6.
      return {
        type: 'dice' as const,
        question: '向かい合う面の合計が「7」になるサイコロを作りたい！「？」に入る数字は何かな？',
        correctAnswer: '6',
        options: ['4', '5', '6', '7'],
        explanation: '上の面が「1」で、向かい合う底の面が「？」です。サイコロは向かい合う面の合計が「7」になるので、7 - 1 = 6 が正解です！',
        examTip: '【サイコロの原則】サイコロは【1と6】【2と5】【3と4】がそれぞれ向かい合います（和が7）。入試頻出です！'
      };
    } else {
      // Level 3: Can this net form a cube?
      // Net 1: U-shape where 2 squares overlap -> cannot form a cube!
      // Net 2: 1-4-1 or 2-3-1 or 3-3 or 2-2-2 (the 11 valid nets)
      return {
        type: 'validity' as const,
        question: 'この展開図は、正しく組み立てて立方体（サイコロ）にできるかな？',
        isValidCube: false,
        correctAnswer: 'できない',
        options: ['できる！', 'できない'],
        explanation: 'この展開図は組み立てると右の2つの面が重なってしまい、底の面が足りなくなります！立方体の展開図は全部で「11種類」しかありません。',
        examTip: '【展開図の11種類】「1-4-1型(6種)」「2-3-1型(3種)」「2-2-2型(1種)」「3-3型(1種)」を覚えておくと瞬時に見抜けます！'
      };
    }
  };

  const puzzle = getPuzzle();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(puzzle.question);

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
    if (opt === puzzle.correctAnswer) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback('大正解！展開図の空間構成を見事にマスターしました！');
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('おしい！頭の中で紙を折って組み立てるイメージをしてみよう！');
    }
  };

  return (
    <GameModalWrapper
      title="立方体の展開図マスター"
      badgeTag={`デザイン工房 Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={puzzle.explanation}
      examTip={puzzle.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      onRetry={() => {
        setSelectedOption(null);
        setIsCompleted(false);
        setFeedback(puzzle.question);
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-purple-50 border border-purple-200 rounded-2xl mb-4 font-extrabold text-purple-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* 2D Net Display Canvas */}
        <div className="w-full max-w-sm bg-gradient-to-b from-indigo-50 to-purple-50 border-2 border-purple-200 rounded-3xl p-4 sm:p-6 mb-5 flex flex-col items-center justify-center shadow-inner relative">
          {/* Net Grid */}
          {level === 1 && (
            <div className="grid grid-cols-4 gap-1 sm:gap-2">
              <div className="w-12 h-12"></div>
              <div className="w-12 h-12 bg-amber-400 border-2 border-amber-600 rounded-xl flex items-center justify-center font-black text-amber-950 text-xl shadow">
                B
              </div>
              <div className="w-12 h-12"></div>
              <div className="w-12 h-12"></div>

              <div className="w-12 h-12 bg-sky-400 border-2 border-sky-600 rounded-xl flex items-center justify-center font-black text-sky-950 text-xl shadow">
                A
              </div>
              <div className="w-12 h-12 bg-sky-300 border-2 border-sky-500 rounded-xl flex items-center justify-center font-black text-sky-950 text-xl shadow">
                C
              </div>
              <div className="w-12 h-12 bg-sky-400 border-2 border-sky-600 rounded-xl flex items-center justify-center font-black text-sky-950 text-xl shadow">
                D
              </div>
              <div className="w-12 h-12 bg-sky-300 border-2 border-sky-500 rounded-xl flex items-center justify-center font-black text-sky-950 text-xl shadow">
                E
              </div>

              <div className="w-12 h-12"></div>
              <div className="w-12 h-12 bg-emerald-400 border-2 border-emerald-600 rounded-xl flex items-center justify-center font-black text-emerald-950 text-xl shadow">
                F
              </div>
              <div className="w-12 h-12"></div>
              <div className="w-12 h-12"></div>
            </div>
          )}

          {level === 2 && (
            <div className="grid grid-cols-4 gap-1 sm:gap-2">
              <div className="w-12 h-12"></div>
              <div className="w-12 h-12 bg-amber-400 border-2 border-amber-600 rounded-xl flex items-center justify-center font-black text-amber-950 text-xl shadow">
                1
              </div>
              <div className="w-12 h-12"></div>
              <div className="w-12 h-12"></div>

              <div className="w-12 h-12 bg-sky-400 border-2 border-sky-600 rounded-xl flex items-center justify-center font-black text-sky-950 text-xl shadow">
                2
              </div>
              <div className="w-12 h-12 bg-sky-300 border-2 border-sky-500 rounded-xl flex items-center justify-center font-black text-sky-950 text-xl shadow">
                3
              </div>
              <div className="w-12 h-12 bg-sky-400 border-2 border-sky-600 rounded-xl flex items-center justify-center font-black text-sky-950 text-xl shadow">
                5
              </div>
              <div className="w-12 h-12 bg-sky-300 border-2 border-sky-500 rounded-xl flex items-center justify-center font-black text-sky-950 text-xl shadow">
                4
              </div>

              <div className="w-12 h-12"></div>
              <div className="w-12 h-12 bg-rose-400 border-2 border-rose-600 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow animate-pulse-subtle">
                ?
              </div>
              <div className="w-12 h-12"></div>
              <div className="w-12 h-12"></div>
            </div>
          )}

          {level === 3 && (
            // Invalid net: 4 in row, with 2 adjacent faces on the same side
            <div className="grid grid-cols-4 gap-1 sm:gap-2">
              <div className="w-12 h-12"></div>
              <div className="w-12 h-12 bg-purple-400 border-2 border-purple-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow">
                1
              </div>
              <div className="w-12 h-12 bg-purple-400 border-2 border-purple-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow">
                2
              </div>
              <div className="w-12 h-12"></div>

              <div className="w-12 h-12 bg-purple-300 border-2 border-purple-500 rounded-xl flex items-center justify-center font-black text-purple-950 text-xl shadow">
                3
              </div>
              <div className="w-12 h-12 bg-purple-300 border-2 border-purple-500 rounded-xl flex items-center justify-center font-black text-purple-950 text-xl shadow">
                4
              </div>
              <div className="w-12 h-12 bg-purple-300 border-2 border-purple-500 rounded-xl flex items-center justify-center font-black text-purple-950 text-xl shadow">
                5
              </div>
              <div className="w-12 h-12 bg-purple-300 border-2 border-purple-500 rounded-xl flex items-center justify-center font-black text-purple-950 text-xl shadow">
                6
              </div>

              <div className="w-12 h-12"></div>
              <div className="w-12 h-12"></div>
              <div className="w-12 h-12"></div>
              <div className="w-12 h-12"></div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="w-full max-w-md">
          <span className="text-xs font-black text-slate-600 block text-center mb-3">
            選択肢から選んでね！
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {puzzle.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelectOption(opt)}
                className={`py-3.5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-md border-2 ${
                  selectedOption === opt
                    ? opt === puzzle.correctAnswer
                      ? 'bg-emerald-500 text-white border-emerald-300'
                      : 'bg-rose-500 text-white border-rose-300'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameModalWrapper>
  );
};
