import React from 'react';
import { X, Sparkles, Award } from 'lucide-react';
import { UserProgress, saveUserProgress } from '../../services/storage';
import { sound } from '../../services/audio';
import { fireConfetti } from '../../services/confetti';

interface StampBookModalProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onClose: () => void;
}

export const StampBookModal: React.FC<StampBookModalProps> = ({
  progress,
  onUpdateProgress,
  onClose
}) => {
  const today = new Date().toISOString().split('T')[0];
  const hasStampedToday = progress.lastStampDate === today;

  const handleStampToday = () => {
    if (hasStampedToday) return;
    sound.playStamp();
    fireConfetti();

    const updatedStamps = [...progress.stamps, today];
    const newCoins = progress.coins + 30; // Daily stamp bonus
    const newXp = progress.xp + 20;

    const updated: UserProgress = {
      ...progress,
      stamps: updatedStamps,
      lastStampDate: today,
      coins: newCoins,
      xp: newXp
    };

    saveUserProgress(updated);
    onUpdateProgress(updated);
  };

  const totalSlots = 14;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-amber-50 rounded-3xl border-4 border-amber-400 shadow-2xl max-w-lg w-full p-5 sm:p-6 relative flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-amber-200 hover:bg-amber-300 active:scale-95 flex items-center justify-center text-amber-900 transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/80 rounded-full text-xs font-black text-amber-900 mb-1 border border-amber-300">
            <Award className="w-4 h-4 text-amber-700" />
            <span>まいにち継続チャレンジ</span>
          </div>
          <h2 className="text-2xl font-black text-amber-950">💮 ひらめきスタンプ帳</h2>
          <p className="text-xs text-amber-800 font-bold mt-0.5">
            毎日ログインしてスタンプを押そう！スターコインがもらえるよ！
          </p>
        </div>

        {/* Radio Calisthenics Style Grid Card */}
        <div className="w-full bg-white rounded-2xl border-2 border-amber-200 p-4 shadow-inner mb-5">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: totalSlots }).map((_, idx) => {
              const isStamped = idx < progress.stamps.length;
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${
                    isStamped
                      ? 'bg-rose-50 border-rose-300 shadow-sm'
                      : 'bg-slate-50 border-dashed border-slate-300 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-black text-slate-400 absolute top-1 left-1.5">
                    {idx + 1}
                  </span>
                  {isStamped ? (
                    <div className="w-8 h-8 rounded-full border-2 border-rose-600 flex items-center justify-center text-rose-600 font-black text-[9px] leading-tight rotate-[-10deg] shadow-sm bg-rose-100/50">
                      たいへん
                      <br />
                      よくできました
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-300">未</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-amber-900">
            <span>あつめたスタンプ: <strong className="text-rose-600 text-sm">{progress.stamps.length}</strong> / {totalSlots} 個</span>
            <span>スタンプ報酬: +30 ⭐ コイン</span>
          </div>
        </div>

        {/* Daily Stamp Action Button */}
        <button
          onClick={handleStampToday}
          disabled={hasStampedToday}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
            hasStampedToday
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-rose-200'
          }`}
        >
          {hasStampedToday ? (
            <span>✅ 今日のスタンプは押したよ！また明日ね！</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>今日のがんばりスタンプを押す！（+30コイン）</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
