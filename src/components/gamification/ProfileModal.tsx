import React, { useState } from 'react';
import { X, Sparkles, Check, Lock, Award, User, ArrowRight } from 'lucide-react';
import {
  UserProgress,
  saveUserProgress,
  calculateLevel,
  AVATARS,
  TITLES,
  STAMP_MILESTONES
} from '../../services/storage';
import { sound } from '../../services/audio';

interface ProfileModalProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onClose: () => void;
  onOpenStamps?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
  onOpenStamps
}) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'title' | 'milestones'>('avatar');

  const { level, title: defaultTitle } = calculateLevel(progress.xp);
  const currentAvatarId = progress.selectedAvatar || 'a_rocket';
  const currentAvatar = AVATARS.find((a) => a.id === currentAvatarId) || AVATARS[0];
  const currentTitle = progress.selectedTitle || defaultTitle;
  const stampsCount = progress.stamps.length;

  const handleSelectAvatar = (avatarId: string) => {
    sound.playClick();
    const updated: UserProgress = {
      ...progress,
      selectedAvatar: avatarId
    };
    saveUserProgress(updated);
    onUpdateProgress(updated);
  };

  const handleSelectTitle = (titleStr: string) => {
    sound.playClick();
    const updated: UserProgress = {
      ...progress,
      selectedTitle: titleStr
    };
    saveUserProgress(updated);
    onUpdateProgress(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-50 rounded-3xl border-4 border-amber-300 shadow-2xl max-w-lg w-full p-4 sm:p-6 relative flex flex-col max-h-[92vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 active:scale-95 flex items-center justify-center text-slate-700 transition-all shadow-sm z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <span className="text-2xl">👤</span>
          <h2 className="text-base sm:text-lg font-black text-slate-800">
            探検隊プロフィール設定
          </h2>
        </div>

        {/* Current Profile Card */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-md mb-4 shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            {/* Avatar Circle */}
            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr ${currentAvatar.bgGradient} border-3 border-white shadow-lg flex items-center justify-center text-3xl sm:text-4xl shrink-0`}
            >
              {currentAvatar.icon}
            </div>

            {/* Profile Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-black tracking-wide">
                  Lv.{level}
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-black/25 text-amber-100 whitespace-nowrap">
                  {currentTitle}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black truncate">{progress.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs font-bold text-amber-100">
                <span>💮 累計スタンプ: <strong className="text-white">{stampsCount}個</strong></span>
                <span>⭐ 星: <strong className="text-white">{progress.coins}</strong></span>
              </div>
            </div>
          </div>

          {/* Decorative cosmic circle */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-2xl mb-4 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('avatar');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
              activeTab === 'avatar'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>アバター</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('title');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
              activeTab === 'title'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>限定称号</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('milestones');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
              activeTab === 'milestones'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>スタンプ特典</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* TAB 1: AVATARS */}
          {activeTab === 'avatar' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVATARS.map((av) => {
                const isUnlocked = stampsCount >= av.requiredStamps;
                const isEquipped = currentAvatarId === av.id;

                return (
                  <div
                    key={av.id}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 relative ${
                      isEquipped
                        ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                        : isUnlocked
                        ? 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-slate-100/70 border-dashed border-slate-300 opacity-70'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${av.bgGradient} flex items-center justify-center text-2xl shrink-0 shadow-inner`}
                    >
                      {av.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-800 truncate">
                          {av.name}
                        </span>
                        {isEquipped && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-900 font-black text-[9px]">
                            装備中
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {av.description}
                      </p>

                      {isUnlocked ? (
                        !isEquipped && (
                          <button
                            onClick={() => handleSelectAvatar(av.id)}
                            className="mt-1.5 text-[11px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-all active:scale-95"
                          >
                            装備する
                          </button>
                        )
                      ) : (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>スタンプ{av.requiredStamps}個で解放</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TITLES */}
          {activeTab === 'title' && (
            <div className="space-y-2">
              {TITLES.map((t) => {
                const isUnlocked = stampsCount >= t.requiredStamps;
                const isEquipped = currentTitle === t.title;

                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                      isEquipped
                        ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                        : isUnlocked
                        ? 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-slate-100/70 border-dashed border-slate-300 opacity-70'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-800">{t.title}</span>
                        {isEquipped && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-[10px]">
                            設定中
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                    </div>

                    <div className="shrink-0">
                      {isUnlocked ? (
                        !isEquipped && (
                          <button
                            onClick={() => handleSelectTitle(t.title)}
                            className="text-xs font-black text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                          >
                            設定する
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>スタンプ{t.requiredStamps}個</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: MILESTONES / EX ISLAND ROADMAP */}
          {activeTab === 'milestones' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-3 text-xs text-purple-900 font-bold">
                毎日ログインしてスタンプを集めると、限定アバター・称号や、幻の裏ステージ<strong>「EX島」</strong>が解放されます！
              </div>

              {STAMP_MILESTONES.map((m) => {
                const isReached = stampsCount >= m.stampsRequired;

                return (
                  <div
                    key={m.stampsRequired}
                    className={`p-3.5 rounded-2xl border-2 transition-all ${
                      isReached
                        ? 'bg-white border-amber-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                          {m.stampsRequired}
                        </span>
                        <h4 className="font-black text-sm text-slate-900">{m.title}</h4>
                      </div>

                      {isReached ? (
                        <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                          <span>解放完了！</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          あと {m.stampsRequired - stampsCount} 個
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium mb-2.5">
                      {m.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50/70 p-2 rounded-xl">
                      <span>👤 {m.avatarIcon} {m.titleName}</span>
                      <span>•</span>
                      <span>⭐ +{m.bonusCoins}星</span>
                      {m.unlockExIsland && (
                        <>
                          <span>•</span>
                          <span className="text-purple-700 font-black">🌌 EX島 解放！</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {onOpenStamps && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                    onOpenStamps();
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>💮 スタンプ帳を見に行く</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
