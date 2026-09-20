import React, { useState } from 'react';
import { X, Star, BookOpen, Award, Sparkles } from 'lucide-react';
import { UserProgress, ITEMS, CollectibleItem } from '../../services/storage';
import { sound } from '../../services/audio';

interface MuseumModalProps {
  progress: UserProgress;
  onClose: () => void;
}

export const MuseumModal: React.FC<MuseumModalProps> = ({ progress, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'S' | 'T' | 'E' | 'A' | 'M'>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<'ALL' | 1 | 2 | 3 | 4 | 5>('ALL');
  const [activeItem, setActiveItem] = useState<CollectibleItem | null>(null);

  const filteredItems = ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesRarity = selectedRarity === 'ALL' || item.rarity === selectedRarity;
    return matchesCat && matchesRarity;
  });

  const unlockedCount = progress.unlockedItems.length;
  const totalCount = ITEMS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const legendUnlocked = ITEMS.filter((item) => item.rarity === 5 && progress.unlockedItems.includes(item.id)).length;
  const urUnlocked = ITEMS.filter((item) => item.rarity === 4 && progress.unlockedItems.includes(item.id)).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-50 rounded-3xl border-4 border-amber-300 shadow-2xl max-w-3xl w-full p-4 sm:p-6 relative flex flex-col max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 active:scale-95 flex items-center justify-center text-slate-700 transition-all shadow-sm z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pr-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 rounded-full text-xs font-black text-amber-800 border border-amber-300 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>STEAM大博物館</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">🏛️ 発明品・科学図鑑</h2>
          </div>

          {/* Collection Progress pill */}
          <div className="bg-amber-100 border border-amber-300 rounded-2xl px-3 py-1.5 flex flex-col items-center">
            <span className="text-[10px] font-black text-amber-800">コレクション収集率</span>
            <div className="flex items-center gap-2">
              <div className="w-20 sm:w-28 h-2.5 bg-white rounded-full overflow-hidden border border-amber-200">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-xs font-black text-amber-950">
                {unlockedCount}/{totalCount} ({progressPercent}%)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-amber-900/80 mt-0.5">
              <span>👑 伝説: {legendUnlocked}/5</span>
              <span>•</span>
              <span>🌟 秘宝: {urUnlocked}/5</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-1.5 text-xs font-black shrink-0">
          {(
            [
              { id: 'ALL', label: 'すべて' },
              { id: 'S', label: '🔬 科学 (S)' },
              { id: 'T', label: '💻 情報 (T)' },
              { id: 'E', label: '⚙️ 工学 (E)' },
              { id: 'A', label: '🎨 幾何 (A)' },
              { id: 'M', label: '📐 算数 (M)' }
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rarity Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 text-xs font-black shrink-0 border-b border-slate-200">
          {(
            [
              { id: 'ALL', label: '全レア度' },
              { id: 5, label: '👑 伝説 (★5)' },
              { id: 4, label: '🌟 秘宝 (★4)' },
              { id: 3, label: '⭐ ★3' },
              { id: 2, label: '🔷 ★2' },
              { id: 1, label: '⚪ ★1' }
            ] as const
          ).map((r) => (
            <button
              key={r.id}
              onClick={() => {
                sound.playClick();
                setSelectedRarity(r.id);
              }}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all text-[11px] ${
                selectedRarity === r.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filteredItems.map((item) => {
              const isUnlocked = progress.unlockedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isUnlocked) {
                      if (item.rarity === 5) sound.playLegendary();
                      else sound.playClick();
                      setActiveItem(item);
                    }
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center text-center justify-between min-h-[155px] sm:min-h-[170px] transition-all relative ${
                    isUnlocked
                      ? item.rarity === 5
                        ? 'bg-gradient-to-b from-amber-50/90 via-purple-50/40 to-white border-amber-400 ring-2 ring-amber-300/40 hover:border-amber-500 shadow-sm active:scale-95 cursor-pointer'
                        : item.rarity === 4
                        ? 'bg-gradient-to-b from-purple-50/50 to-white border-purple-300 ring-1 ring-purple-300/30 hover:border-purple-400 shadow-sm active:scale-95 cursor-pointer'
                        : item.rarity === 3
                        ? 'bg-white border-amber-200 hover:border-amber-400 shadow-sm active:scale-95 cursor-pointer'
                        : item.rarity === 2
                        ? 'bg-white border-sky-200 hover:border-sky-400 shadow-sm active:scale-95 cursor-pointer'
                        : 'bg-white border-slate-200 hover:border-slate-400 shadow-sm active:scale-95 cursor-pointer'
                      : item.rarity === 5
                      ? 'bg-gradient-to-b from-amber-50/40 to-slate-100 border-dashed border-amber-300/70 opacity-75 cursor-not-allowed'
                      : item.rarity === 4
                      ? 'bg-gradient-to-b from-purple-50/40 to-slate-100 border-dashed border-purple-300/70 opacity-75 cursor-not-allowed'
                      : 'bg-slate-100 border-dashed border-slate-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Top Rarity Badge */}
                  <div className="w-full flex justify-center mb-0.5">
                    {isUnlocked ? (
                      item.rarity === 5 ? (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 text-white font-black text-[9px] shadow-sm">
                          👑 LEGEND
                        </span>
                      ) : item.rarity === 4 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-[9px] shadow-sm">
                          🌟 UR
                        </span>
                      ) : item.rarity === 3 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[9px]">
                          ⭐ SR
                        </span>
                      ) : item.rarity === 2 ? (
                        <span className="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-black text-[9px]">
                          🔷 RARE
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-black text-[9px]">
                          ⚪ NORMAL
                        </span>
                      )
                    ) : item.rarity === 5 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-300/60 font-black text-[9px]">
                        👑 ★5 伝説
                      </span>
                    ) : item.rarity === 4 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-100/80 text-purple-800 border border-purple-300/60 font-black text-[9px]">
                        🌟 ★4 秘宝
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-bold">
                        ★{item.rarity}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center w-full">
                    <div className="text-3xl sm:text-4xl my-1 filter drop-shadow">
                      {isUnlocked ? item.icon : '❓'}
                    </div>

                    <div className="flex gap-0.5 my-0.5">
                      {Array.from({ length: item.rarity }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            isUnlocked
                              ? item.rarity >= 4
                                ? 'text-amber-400 fill-amber-400 filter drop-shadow-sm'
                                : 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-xs font-black text-slate-800 leading-snug break-words px-1 mt-1 text-center">
                      {isUnlocked
                        ? item.name
                        : item.rarity === 5
                        ? '未発見の伝説'
                        : item.rarity === 4
                        ? '未発見の秘宝'
                        : '未発見の発明'}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold mt-1">
                    {isUnlocked ? item.category : '???'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Item Detail Sub-Modal */}
        {activeItem && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className={`rounded-3xl p-5 max-w-sm w-full border-4 shadow-2xl relative text-center animate-bounce-slow ${
                activeItem.rarity === 5
                  ? 'border-amber-400 ring-4 ring-amber-300/40 bg-gradient-to-b from-amber-50/90 via-white to-purple-50/30'
                  : activeItem.rarity === 4
                  ? 'border-purple-400 ring-2 ring-purple-300/40 bg-gradient-to-b from-purple-50/60 to-white'
                  : activeItem.rarity === 3
                  ? 'border-amber-400 bg-white'
                  : activeItem.rarity === 2
                  ? 'border-sky-400 bg-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveItem(null);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Top Rarity Ribbon */}
              <div className="mb-2 flex justify-center">
                {activeItem.rarity === 5 ? (
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 text-white font-black text-xs shadow-md animate-pulse flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>👑 LEGEND ★5 (超絶激レア・伝説的発明)</span>
                  </span>
                ) : activeItem.rarity === 4 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>🌟 ULTRA RARE ★4 (超レア・歴史的偉業)</span>
                  </span>
                ) : activeItem.rarity === 3 ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs">
                    ⭐ SUPER RARE ★3
                  </span>
                ) : activeItem.rarity === 2 ? (
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-black text-xs">
                    🔷 RARE ★2
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-black text-xs">
                    ⚪ NORMAL ★1
                  </span>
                )}
              </div>

              <div className="text-5xl mb-2 filter drop-shadow">{activeItem.icon}</div>
              <div className="flex justify-center gap-1 mb-1">
                {Array.from({ length: activeItem.rarity }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400 filter drop-shadow-sm" />
                ))}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">{activeItem.name}</h3>
              <p className="text-xs text-amber-800 font-extrabold italic mt-0.5 mb-2">
                {activeItem.tagline}
              </p>

              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left mb-2 leading-relaxed">
                {activeItem.description}
              </p>

              <div className="text-xs text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-left leading-relaxed">
                <div className="font-black text-emerald-800 mb-0.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>中学受験のツボ</span>
                </div>
                {activeItem.examTrivia}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

