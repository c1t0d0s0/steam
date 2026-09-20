import React, { useState } from 'react';
import { X, Sparkles, Star, ChevronDown, ChevronUp, Info } from 'lucide-react';
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
  const [showRates, setShowRates] = useState(false);

  const canAfford = progress.coins >= GACHA_COST;

  const handleSpinGacha = async () => {
    if (!canAfford || isSpinning) return;
    setIsSpinning(true);
    setObtainedItem(null);
    sound.playGacha();

    // Deduct coins
    let newCoins = progress.coins - GACHA_COST;

    // Wait 1.2s for spin animation
    await new Promise((r) => setTimeout(r, 1200));

    // Authentic Gacha Probability Model:
    // ★5 (Legendary / LR): 1%
    // ★4 (Ultra Rare / UR): 5%
    // ★3 (Super Rare / SR): 14%
    // ★2 (Rare): 30%
    // ★1 (Normal): 50%
    const roll = Math.random();
    let targetRarity: 1 | 2 | 3 | 4 | 5 = 1;
    if (roll > 0.99) {
      targetRarity = 5; // 1%
    } else if (roll > 0.94) {
      targetRarity = 4; // 5% (0.94 - 0.99)
    } else if (roll > 0.80) {
      targetRarity = 3; // 14% (0.80 - 0.94)
    } else if (roll > 0.50) {
      targetRarity = 2; // 30% (0.50 - 0.80)
    } else {
      targetRarity = 1; // 50% (0.00 - 0.50)
    }

    const candidatePool = ITEMS.filter((item) => item.rarity === targetRarity);
    const pool = candidatePool.length > 0 ? candidatePool : ITEMS;
    const item = pool[Math.floor(Math.random() * pool.length)];

    const alreadyOwned = progress.unlockedItems.includes(item.id);
    setIsDuplicate(alreadyOwned);

    let updatedItems = progress.unlockedItems;
    let newXp = progress.xp + 20; // base xp for rolling

    if (alreadyOwned) {
      // Cashback compensation for duplicate
      newCoins += 25;
    } else {
      // Discovery bonus scaled by rarity
      const rarityXpBonus: Record<number, number> = {
        1: 20,
        2: 35,
        3: 50,
        4: 80,
        5: 150
      };
      updatedItems = [...progress.unlockedItems, item.id];
      newXp += rarityXpBonus[item.rarity] || 30;
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

    if (item.rarity === 5) {
      sound.playLegendary();
      fireConfetti();
      setTimeout(fireConfetti, 400);
    } else if (item.rarity === 4) {
      sound.playLevelUp();
      fireConfetti();
    } else {
      sound.playCoin();
      fireConfetti();
    }
  };

  const getRarityBadge = (rarity: number) => {
    switch (rarity) {
      case 5:
        return (
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 text-white font-black text-xs shadow-md animate-pulse">
            👑 LEGEND ★5 (超絶激レア！)
          </span>
        );
      case 4:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-sm">
            🌟 ULTRA RARE ★4 (超レア！)
          </span>
        );
      case 3:
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[11px]">
            ⭐ SUPER RARE ★3
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-black text-[11px]">
            🔷 RARE ★2
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-black text-[11px]">
            ⚪ NORMAL ★1
          </span>
        );
    }
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
        <div className="text-center mb-3">
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
        <div
          className={`w-full bg-white rounded-3xl border-2 p-5 mb-3 shadow-inner flex flex-col items-center min-h-[200px] justify-center relative transition-all ${
            obtainedItem?.rarity === 5
              ? 'border-amber-400 bg-gradient-to-b from-amber-50/90 via-purple-50/40 to-white ring-4 ring-amber-300/40'
              : obtainedItem?.rarity === 4
              ? 'border-purple-400 bg-gradient-to-b from-purple-50/50 to-white ring-2 ring-purple-300/40'
              : 'border-amber-300'
          }`}
        >
          {isSpinning ? (
            <div className="flex flex-col items-center py-6">
              <div className="text-6xl animate-spin">🌀</div>
              <span className="mt-4 font-black text-amber-800 text-base animate-pulse">
                ガラガラ... ポンッ！
              </span>
            </div>
          ) : obtainedItem ? (
            <div className="flex flex-col items-center text-center animate-bounce-slow">
              {/* Rarity Badge & Stars */}
              <div className="mb-1.5 flex flex-col items-center gap-1">
                {getRarityBadge(obtainedItem.rarity)}
                <div className="flex gap-1 mt-0.5">
                  {Array.from({ length: obtainedItem.rarity }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        obtainedItem.rarity >= 4
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-sm'
                          : 'text-amber-400 fill-amber-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Item Icon */}
              <div className="text-5xl my-1 filter drop-shadow">{obtainedItem.icon}</div>

              {/* New or Duplicate Tag */}
              {isDuplicate ? (
                <span className="text-[10px] font-black bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full mb-1">
                  重複ボーナス！星のかけら還元 (+25 ⭐ 星 ＆ +20 XP)
                </span>
              ) : (
                <span className="text-[10px] font-black bg-rose-500 text-white px-2.5 py-0.5 rounded-full mb-1 animate-pulse">
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
                最高レア度★5「レジェンド」の伝説的発明品を発掘しよう！
              </p>
            </div>
          )}
        </div>

        {/* Rarity Rates Info Dropdown */}
        <div className="w-full mb-3">
          <button
            onClick={() => {
              sound.playClick();
              setShowRates(!showRates);
            }}
            className="w-full text-center text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center justify-center gap-1 py-1 px-2 rounded-xl bg-amber-100/70 hover:bg-amber-100 border border-amber-200/80 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>ガチャ提供割合（レア度別確率）</span>
            {showRates ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRates && (
            <div className="mt-1.5 p-2.5 bg-white/95 rounded-2xl border border-amber-200 text-xs text-slate-700 space-y-1 animate-fade-in shadow-sm">
              <div className="flex items-center justify-between font-black text-purple-900 bg-purple-50 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1">👑 ★5 レジェンド</span>
                <span className="font-mono text-purple-700 font-black">1.0%</span>
              </div>
              <div className="flex items-center justify-between font-bold text-indigo-900 bg-indigo-50 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1">🌟 ★4 ウルトラレア</span>
                <span className="font-mono text-indigo-700 font-black">5.0%</span>
              </div>
              <div className="flex items-center justify-between font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1">⭐ ★3 スーパーレア</span>
                <span className="font-mono text-amber-700 font-bold">14.0%</span>
              </div>
              <div className="flex items-center justify-between font-bold text-sky-900 bg-sky-50 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1">🔷 ★2 レア</span>
                <span className="font-mono text-sky-700 font-bold">30.0%</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1">⚪ ★1 ノーマル</span>
                <span className="font-mono text-slate-600 font-bold">50.0%</span>
              </div>
              <p className="text-[10px] text-slate-400 text-right pt-0.5">※重複時は星のかけら還元（+25 ⭐ 星）</p>
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
