import React, { useState } from 'react';
import { X, Sparkles, Award, Check, Lock, User } from 'lucide-react';
import {
  UserProgress,
  saveUserProgress,
  STAMP_MILESTONES,
  isExIslandUnlocked
} from '../../services/storage';
import { sound } from '../../services/audio';
import { fireConfetti } from '../../services/confetti';

interface StampBookModalProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onClose: () => void;
  onOpenProfile?: () => void;
}

export const StampBookModal: React.FC<StampBookModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
  onOpenProfile
}) => {
  const today = new Date().toISOString().split('T')[0];
  const hasStampedToday = progress.stamps.includes(today) || progress.lastStampDate === today;
  const [justEarnedReward, setJustEarnedReward] = useState<string | null>(null);

  const handleStampToday = () => {
    if (hasStampedToday) return;
    sound.playStamp();
    fireConfetti();

    const prevCount = progress.stamps.length;
    const updatedStamps = [...progress.stamps, today];
    const newCount = updatedStamps.length;

    let newCoins = progress.coins + 30; // Daily stamp bonus
    let newXp = progress.xp + 20;

    // Check if new milestone reached
    let rewardMsg: string | null = null;
    let selectedAvatar = progress.selectedAvatar;
    let selectedTitle = progress.selectedTitle;

    for (const milestone of STAMP_MILESTONES) {
      if (newCount >= milestone.stampsRequired && prevCount < milestone.stampsRequired) {
        newCoins += milestone.bonusCoins;
        newXp += milestone.bonusXp;
        sound.playLevelUp();
        rewardMsg = `🎉 スタンプ${milestone.stampsRequired}個達成！${milestone.titleName}（${milestone.avatarIcon}）を獲得！`;
        if (milestone.unlockExIsland) {
          rewardMsg = `🌌 スタンプ7個達成！裏ステージ【EX島】＆${milestone.titleName}が解放されました！`;
        }
        // Auto equip if using default
        if (!selectedAvatar || selectedAvatar === 'a_rocket') {
          selectedAvatar = milestone.avatarId;
        }
        if (!selectedTitle) {
          selectedTitle = milestone.titleName;
        }
      }
    }

    if (rewardMsg) {
      setJustEarnedReward(rewardMsg);
    }

    const updated: UserProgress = {
      ...progress,
      stamps: updatedStamps,
      lastStampDate: today,
      coins: newCoins,
      xp: newXp,
      selectedAvatar,
      selectedTitle
    };

    saveUserProgress(updated);
    onUpdateProgress(updated);
  };

  const totalSlots = 14;
  const currentStamps = progress.stamps.length;
  const isExUnlocked = isExIslandUnlocked(currentStamps);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-amber-50 rounded-3xl border-4 border-amber-400 shadow-2xl max-w-lg w-full p-4 sm:p-6 relative flex flex-col items-center max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-amber-200 hover:bg-amber-300 active:scale-95 flex items-center justify-center text-amber-900 transition-all shadow-sm z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-3 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/80 rounded-full text-xs font-black text-amber-900 mb-1 border border-amber-300">
            <Award className="w-4 h-4 text-amber-700" />
            <span>まいにち継続チャレンジ</span>
          </div>
          <h2 className="text-2xl font-black text-amber-950">💮 ひらめきスタンプ帳</h2>
          <p className="text-xs text-amber-800 font-bold mt-0.5">
            毎日ログインしてスタンプを押そう！累計数で<strong>裏ステージ（EX島）</strong>や<strong>限定アバター・称号</strong>が解放！
          </p>
        </div>

        {/* Congratulations Banner on Milestone Unlock */}
        {justEarnedReward && (
          <div className="w-full mb-3 p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white font-black text-xs sm:text-sm text-center shadow-md animate-bounce">
            {justEarnedReward}
          </div>
        )}

        {/* Radio Calisthenics Style Grid Card */}
        <div className="w-full bg-white rounded-2xl border-2 border-amber-200 p-3.5 sm:p-4 shadow-inner mb-3.5">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: totalSlots }).map((_, idx) => {
              const isStamped = idx < currentStamps;
              const slotNumber = idx + 1;
              const isExMilestoneSlot = slotNumber === 7;
              const isFinalSlot = slotNumber === 14;

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all ${
                    isStamped
                      ? 'bg-rose-50 border-rose-300 shadow-sm'
                      : isExMilestoneSlot
                      ? 'bg-purple-50 border-purple-300 text-purple-400'
                      : isFinalSlot
                      ? 'bg-amber-50 border-amber-300 text-amber-400'
                      : 'bg-slate-50 border-dashed border-slate-300 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-black text-slate-400 absolute top-1 left-1.5 z-10 select-none">
                    {slotNumber}
                  </span>

                  {/* Special Milestone Badge Indicator */}
                  {!isStamped && isExMilestoneSlot && (
                    <span className="absolute bottom-1 text-[9px] font-black text-purple-700 bg-purple-100 px-1 rounded">
                      EX島
                    </span>
                  )}
                  {!isStamped && isFinalSlot && (
                    <span className="absolute bottom-1 text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded">
                      大覇者
                    </span>
                  )}

                  {isStamped ? (
                    <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rotate-[-8deg] hover:rotate-0 transition-transform select-none">
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                        <circle cx="50" cy="50" r="46" fill="#fff1f2" stroke="#e11d48" strokeWidth="3" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e11d48" strokeWidth="1.2" strokeDasharray="4 2" />
                        <text x="50" y="38" textAnchor="middle" fill="#e11d48" fontSize="15" fontWeight="900" fontFamily="sans-serif">
                          たいへん
                        </text>
                        <circle cx="50" cy="47" r="2.5" fill="#e11d48" />
                        <circle cx="41" cy="47" r="1.5" fill="#e11d48" />
                        <circle cx="59" cy="47" r="1.5" fill="#e11d48" />
                        <text x="50" y="65" textAnchor="middle" fill="#e11d48" fontSize="10.5" fontWeight="900" letterSpacing="-0.2" fontFamily="sans-serif">
                          よくできました
                        </text>
                        <path d="M42 75 Q50 78 58 75" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-300 select-none">未</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100 text-xs font-bold text-amber-900">
            <span>あつめたスタンプ: <strong className="text-rose-600 text-sm">{currentStamps}</strong> / {totalSlots} 個</span>
            <span>スタンプ押印報酬: +30 ⭐ 星</span>
          </div>
        </div>

        {/* Milestone Rewards Roadmap Section */}
        <div className="w-full bg-white rounded-2xl border-2 border-amber-200 p-3.5 sm:p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>🎁 累計スタンプ解放ロードマップ</span>
            </h3>

            {onOpenProfile && (
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenProfile();
                }}
                className="text-[11px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95"
              >
                <User className="w-3 h-3" />
                <span>アバター・称号設定</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STAMP_MILESTONES.map((m) => {
              const isReached = currentStamps >= m.stampsRequired;
              const isEx = m.unlockExIsland;

              return (
                <div
                  key={m.stampsRequired}
                  className={`p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isReached
                      ? isEx
                        ? 'bg-purple-50/80 border-purple-300 shadow-sm'
                        : 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black flex items-center justify-center">
                        {m.stampsRequired}
                      </span>
                      <span className="text-xs font-black text-slate-900 truncate">
                        {m.titleName}
                      </span>
                    </div>

                    {isReached ? (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        <span>解放！</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" />
                        <span>あと{m.stampsRequired - currentStamps}個</span>
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <span>{m.avatarIcon} アバター</span>
                    <span>•</span>
                    <span>⭐ +{m.bonusCoins}</span>
                    {isEx && (
                      <span className="ml-auto font-black text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded text-[10px]">
                        🌌 EX島
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* EX Island Status Banner */}
          <div className="mt-2.5 p-2 rounded-xl text-center text-xs font-black border">
            {isExUnlocked ? (
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-300 text-purple-900 flex items-center justify-center gap-1.5 py-1 rounded-lg">
                <span>🌌</span>
                <span>【裏ステージ：EX島】解放中！島マップの最下部から挑戦できるよ！</span>
              </div>
            ) : (
              <div className="bg-slate-100 border-slate-200 text-slate-600 flex items-center justify-center gap-1.5 py-1 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-purple-600" />
                <span>裏ステージ【EX島】はスタンプ7個（あと<strong>{Math.max(0, 7 - currentStamps)}個</strong>）で解放！</span>
              </div>
            )}
          </div>
        </div>

        {/* Daily Stamp Action Button */}
        <button
          onClick={handleStampToday}
          disabled={hasStampedToday}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-base sm:text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
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
              <span>今日のがんばりスタンプを押す！（+30星）</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
