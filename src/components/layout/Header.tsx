import React from 'react';
import { Volume2, VolumeX, Award, BookOpen, Gift } from 'lucide-react';
import { UserProgress, calculateLevel } from '../../services/storage';
import { sound } from '../../services/audio';

interface HeaderProps {
  progress: UserProgress;
  onOpenStamps: () => void;
  onOpenGacha: () => void;
  onOpenMuseum: () => void;
  onOpenBadges: () => void;
  onToggleSound: () => void;
  onChangeGrade: (grade: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onOpenStamps,
  onOpenGacha,
  onOpenMuseum,
  onOpenBadges,
  onToggleSound,
  onChangeGrade
}) => {
  const { level, currentXp, nextLevelXp, title } = calculateLevel(progress.xp);
  const xpPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-sm px-3 py-2 sm:px-6 sm:py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left: App Brand & User Level */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-amber-500 shadow flex items-center justify-center text-2xl">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
                STEAM探検隊
              </span>
              <select
                value={progress.grade}
                onChange={(e) => {
                  sound.playClick();
                  onChangeGrade(parseInt(e.target.value, 10));
                }}
                className="text-[11px] font-black bg-amber-100 border border-amber-300 rounded-lg px-1.5 py-0.5 text-amber-900 cursor-pointer"
              >
                <option value={3}>小学3年</option>
                <option value={4}>小学4年</option>
                <option value={5}>小学5年</option>
                <option value={6}>小学6年</option>
              </select>
            </div>

            {/* Level & XP bar */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-md text-[10px] font-black">
                Lv.{level} {title}
              </span>
              <div className="w-16 sm:w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Coins & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Star Coins */}
          <div className="flex items-center gap-1 bg-amber-100 border-2 border-amber-300 rounded-2xl px-2.5 py-1 text-amber-900 font-black text-xs sm:text-sm shadow-sm">
            <span className="text-amber-500 text-base">⭐</span>
            <span>{progress.coins}</span>
          </div>

          {/* Stamp book button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenStamps();
            }}
            title="スタンプ帳"
            className="flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-800 font-extrabold text-xs shadow-sm active:scale-95 transition-all"
          >
            <span>💮</span>
            <span className="hidden sm:inline">スタンプ</span>
          </button>

          {/* Gacha button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenGacha();
            }}
            title="ガチャマシン"
            className="flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-800 font-extrabold text-xs shadow-sm active:scale-95 transition-all"
          >
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">ガチャ</span>
          </button>

          {/* Museum button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenMuseum();
            }}
            title="STEAM図鑑"
            className="flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-800 font-extrabold text-xs shadow-sm active:scale-95 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">図鑑</span>
          </button>

          {/* Badges button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            title="バッジ・トロフィー"
            className="p-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all"
          >
            <Award className="w-4 h-4 text-amber-600" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            title={progress.soundEnabled ? '音を消す' : '音を鳴らす'}
            className="p-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 active:scale-95 transition-all"
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
