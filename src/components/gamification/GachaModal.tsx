import React, { useState } from 'react';
import { X, Sparkles, Star } from 'lucide-react';
import { UserProgress, saveUserProgress, ITEMS, CollectibleItem } from '../../services/storage';
import { sound } from '../../services/audio';
import { fireConfetti } from '../../services/confetti';

interface GachaModalProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onClose: () => void;
}

const GACHA_COST = 100;

export const GachaModal: React.FC<GachaModalProps> = ({
  progress,
  onUpdateProgress,
  onClose
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [obtainedItem, setObtainedItem] = useState<CollectibleItem | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const canAfford = progress.coins >= GACHA_COST;

  const handleSpinGacha = async () => {
    if (!canAfford || isSpinning) return;
    setIsSpinning(true);
    setObtainedItem(null);
    sound.playGacha();

    // Deduct coins
    const newCoins = progress.coins - GACHA_COST;

    // Wait 1.2s for spin animation
    await new Promise((r) => setTimeout(r, 1200));

    // Random item selection (rarity weight: 1=50%, 2=35%, 3=15%)
    const roll = Math.random();
    let targetRarity: 1 | 2 | 3 = 1;
    if (roll > 0.85) targetRarity = 3;
    else if (roll > 0.5) targetRarity = 2;

    const candidatePool = ITEMS.filter((item) => item.rarity === targetRarity);
    const pool = candidatePool.length > 0 ? candidatePool : ITEMS;
    const item = pool[Math.floor(Math.random() * pool.length)];

    const alreadyOwned = progress.unlockedItems.includes(item.id);
    setIsDuplicate(alreadyOwned);

    let updatedItems = progress.unlockedItems;
    let newXp = progress.xp + 20; // base xp for rolling
    if (!alreadyOwned) {
      updatedItems = [...progress.unlockedItems, item.id];
      newXp += 30; // bonus for new discovery
    }

    const updated: UserProgress = {
      ...progress,
      coins: newCoins,
      xp: newXp,
      unlockedItems: updatedItems
    };

    saveUserProgress(updated);
    onUpdateProgress(updated);

    setObtainedItem(item);
    setIsSpinning(false);
    sound.playCoin();
    fireConfetti();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl border-4 border-amber-400 shadow-2xl max-w-md w-full p-5 sm:p-6 relative flex flex-col items-center">
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
          <div className="inline-flex items-center gap-1 px-3 py-0.5 bg-yellow-200 rounded-full text-xs font-black text-amber-900 mb-1 border border-yellow-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>STEAM発明カプセルトイ</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">🎁 STEAMガチャマシン</h2>
          <div className="flex items-center justify-center gap-1.5 mt-1 font-bold text-sm text-amber-800">
            <span>持っている星:</span>
            <span className="text-amber-600 font-black text-base">⭐ {progress.coins}</span>
          </div>
        </div>

        {/* Gacha Machine Animation / Result Display */}
        <div className="w-full bg-white rounded-3xl border-2 border-amber-300 p-5 mb-4 shadow-inner flex flex-col items-center min-h-[200px] justify-center relative">
          {isSpinning ? (
            <div className="flex flex-col items-center py-6">
              <div className="text-6xl animate-spin">🌀</div>
              <span className="mt-4 font-black text-amber-800 text-base animate-pulse">
                ガラガラ... ポンッ！
              </span>
            </div>
          ) : obtainedItem ? (
            <div className="flex flex-col items-center text-center animate-bounce-slow">
              {/* Rarity Stars */}
              <div className="flex gap-1 mb-1">
                {Array.from({ length: obtainedItem.rarity }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Item Icon */}
              <div className="text-5xl my-1 filter drop-shadow">{obtainedItem.icon}</div>

              {/* New or Duplicate Tag */}
              {isDuplicate ? (
                <span className="text-[10px] font-black bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mb-1">
                  重複ボーナス (+20 XP)
                </span>
              ) : (
                <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full mb-1 animate-pulse">
                  ✨ NEW! 新発見！
                </span>
              )}

              <h3 className="text-lg font-black text-slate-900">{obtainedItem.name}</h3>
              <p className="text-xs text-amber-800 font-extrabold italic mt-0.5">
                {obtainedItem.tagline}
              </p>
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-left">
                {obtainedItem.description}
              </p>
              <p className="text-xs text-emerald-800 mt-1.5 bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-left font-bold">
                {obtainedItem.examTrivia}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <div className="text-6xl mb-2">🎰</div>
              <p className="text-sm font-black text-slate-700">
                1回 {GACHA_COST}星で回せるよ！
              </p>
              <p className="text-xs text-slate-500 mt-1">
                歴史的な大発明品や実験器具を集めて図鑑を完成させよう！
              </p>
            </div>
          )}
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpinGacha}
          disabled={!canAfford || isSpinning}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
            !canAfford || isSpinning
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-300'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{isSpinning ? 'ガチャ回転中...' : `ガチャを回す！ (${GACHA_COST}星)`}</span>
        </button>
      </div>
    </div>
  );
};
