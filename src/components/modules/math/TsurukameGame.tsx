import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';

interface TsurukameGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
}

export const TsurukameGame: React.FC<TsurukameGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel
}) => {
  const getProblem = () => {
    if (level === 1) {
      return {
        totalHeads: 5,
        totalLegs: 14,
        correctCranes: 3,
        correctTurtles: 2,
        explanation: 'もし全員ツル（足2本）なら 5匹 × 2本 = 10本。足りない足は 14 - 10 = 4本。ツルをカメに変えると足が2本ずつ増えるので、4本 ÷ 2 = 2匹がカメ！ツルは 5 - 2 = 3羽です。',
        examTip: 'つるかめ算の鉄則：【もしも全員ツルだったら】と仮定し、足りない足を「カメとツルの足の差(2本)」で割るとカメの数が出ます！'
      };
    } else if (level === 2) {
      return {
        totalHeads: 8,
        totalLegs: 26,
        correctCranes: 3,
        correctTurtles: 5,
        explanation: '全員ツルなら 8 × 2 = 16本。不足は 26 - 16 = 10本。10本 ÷ 2本 = 5匹がカメ！ツルは 8 - 5 = 3羽です。',
        examTip: '面積図を描くときは、たてを「足の本数(2本と4本)」、横を「匹数」にして、欠けた長方形の面積に注目します！'
      };
    } else {
      return {
        totalHeads: 12,
        totalLegs: 38,
        correctCranes: 5,
        correctTurtles: 7,
        explanation: '全員ツルなら 12 × 2 = 24本。不足は 38 - 24 = 14本。14本 ÷ 2本 = 7匹がカメ！ツルは 12 - 7 = 5羽です。',
        examTip: '難関校では「カブトムシ(足6本)とクモ(足8本)」や「50円切手と80円切手」のように形を変えて出題されますが、考え方は全く同じです！'
      };
    }
  };

  const problem = getProblem();
  // State: slider controls how many turtles the user tests (0 to totalHeads)
  const [turtleCount, setTurtleCount] = useState<number>(0);
  const craneCount = problem.totalHeads - turtleCount;
  const currentLegs = craneCount * 2 + turtleCount * 4;

  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(
    `ツル（足2本）とカメ（足4本）が合わせて ${problem.totalHeads} 匹、足の合計が ${problem.totalLegs} 本になるようにスライダーを動かそう！`
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sound.playClick();
    const newTurtles = parseInt(e.target.value, 10);
    setTurtleCount(newTurtles);
  };

  const handleCheck = () => {
    if (turtleCount === problem.correctTurtles) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback(`大正解！ツル ${craneCount}羽、カメ ${turtleCount}匹 で足の合計がピッタリ ${problem.totalLegs}本 になりました！`);
      onComplete(3);
    } else {
      sound.playWrong();
      if (currentLegs < problem.totalLegs) {
        setFeedback(`足が ${problem.totalLegs - currentLegs}本 足りないよ！カメの数を増やしてみてね。`);
      } else {
        setFeedback(`足が ${currentLegs - problem.totalLegs}本 多いよ！ツルの数を増やしてみてね。`);
      }
    }
  };

  return (
    <GameModalWrapper
      title="つるかめ算ビジュアルアリーナ"
      badgeTag={`算数アリーナ Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={problem.explanation}
      examTip={problem.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      onRetry={() => {
        setTurtleCount(0);
        setIsCompleted(false);
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 font-extrabold text-emerald-900 text-sm sm:text-base">
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

        {/* Real-time Animal Visualizer */}
        <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 mb-5 shadow-inner">
          {/* Visual Animals Gallery */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 min-h-[70px]">
            {/* Cranes */}
            {Array.from({ length: craneCount }).map((_, i) => (
              <div
                key={`crane-${i}`}
                className="flex flex-col items-center bg-sky-100 border border-sky-300 rounded-2xl px-2 py-1 shadow-sm animate-bounce-slow"
              >
                <span className="text-2xl sm:text-3xl">🦩</span>
                <span className="text-[10px] font-black text-sky-800">ツル (2本)</span>
              </div>
            ))}
            {/* Turtles */}
            {Array.from({ length: turtleCount }).map((_, i) => (
              <div
                key={`turtle-${i}`}
                className="flex flex-col items-center bg-emerald-100 border border-emerald-300 rounded-2xl px-2 py-1 shadow-sm animate-bounce-slow"
              >
                <span className="text-2xl sm:text-3xl">🐢</span>
                <span className="text-[10px] font-black text-emerald-800">カメ (4本)</span>
              </div>
            ))}
          </div>

          {/* Current Calculation Live Display */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col sm:flex-row items-center justify-around gap-2 text-center text-xs sm:text-sm font-bold">
            <div>
              ツル: <span className="text-sky-600 font-black text-base">{craneCount}羽</span> × 2本 ={' '}
              <span className="text-slate-800">{craneCount * 2}本</span>
            </div>
            <div className="text-slate-400">+</div>
            <div>
              カメ: <span className="text-emerald-600 font-black text-base">{turtleCount}匹</span> × 4本 ={' '}
              <span className="text-slate-800">{turtleCount * 4}本</span>
            </div>
            <div className="text-slate-400">=</div>
            <div className="px-3 py-1 bg-amber-100 rounded-xl border border-amber-300">
              現在の足の合計:{' '}
              <span
                className={`text-lg font-black ${
                  currentLegs === problem.totalLegs ? 'text-emerald-600' : 'text-amber-700'
                }`}
              >
                {currentLegs} 本
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center text-xs font-black text-slate-600 mb-2">
            <span>カメの数を変更するスライダー</span>
            <span className="text-emerald-700 font-extrabold text-sm">{turtleCount} 匹</span>
          </div>
          <input
            type="range"
            min="0"
            max={problem.totalHeads}
            value={turtleCount}
            onChange={handleSliderChange}
            className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1">
            <span>0匹（全部ツル）</span>
            <span>{problem.totalHeads}匹（全部カメ）</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCheck}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>🎯 この数で決定する！</span>
        </button>
      </div>
    </GameModalWrapper>
  );
};
