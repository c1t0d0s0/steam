import React from 'react';
import { X, Award, CheckCircle2 } from 'lucide-react';
import { UserProgress, BADGES } from '../../services/storage';
import { sound } from '../../services/audio';

interface BadgeListModalProps {
  progress: UserProgress;
  onClose: () => void;
}

export const BadgeListModal: React.FC<BadgeListModalProps> = ({ progress, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-amber-50 rounded-3xl border-4 border-amber-400 shadow-2xl max-w-lg w-full p-4 sm:p-6 relative flex flex-col max-h-[85vh]">
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
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-200 rounded-full text-xs font-black text-amber-900 mb-1 border border-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>実績・トロフィー</span>
          </div>
          <h2 className="text-2xl font-black text-amber-950">🏆 名誉のSTEAMバッジ</h2>
          <p className="text-xs text-amber-800 font-bold mt-0.5">
            獲得バッジ: <strong className="text-rose-600 text-sm">{progress.unlockedBadges.length}</strong> / {BADGES.length} 個
          </p>
        </div>

        {/* Badges List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {BADGES.map((badge) => {
            const isUnlocked = progress.unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-white border-amber-300 shadow-sm'
                    : 'bg-slate-100 border-dashed border-slate-300 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    isUnlocked ? 'bg-amber-100 border border-amber-300' : 'bg-slate-200'
                  }`}
                >
                  {isUnlocked ? badge.icon : '🔒'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black text-slate-800 truncate">{badge.title}</h4>
                    {isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
