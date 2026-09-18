import React, { useState } from 'react';
import { X, Star, BookOpen, Award } from 'lucide-react';
import { UserProgress, ITEMS, CollectibleItem } from '../../services/storage';
import { sound } from '../../services/audio';

interface MuseumModalProps {
  progress: UserProgress;
  onClose: () => void;
}

export const MuseumModal: React.FC<MuseumModalProps> = ({ progress, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'S' | 'T' | 'E' | 'A' | 'M'>('ALL');
  const [activeItem, setActiveItem] = useState<CollectibleItem | null>(null);

  const filteredItems = selectedCategory === 'ALL'
    ? ITEMS
    : ITEMS.filter((item) => item.category === selectedCategory);

  const unlockedCount = progress.unlockedItems.length;
  const totalCount = ITEMS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-50 rounded-3xl border-4 border-amber-300 shadow-2xl max-w-2xl w-full p-4 sm:p-6 relative flex flex-col max-h-[90vh]">
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
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 text-xs font-black shrink-0">
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
                      sound.playClick();
                      setActiveItem(item);
                    }
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                    isUnlocked
                      ? 'bg-white border-amber-200 hover:border-amber-400 shadow-sm active:scale-95 cursor-pointer'
                      : 'bg-slate-100 border-dashed border-slate-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl my-1 filter drop-shadow">
                    {isUnlocked ? item.icon : '❓'}
                  </div>

                  <div className="flex gap-0.5 my-0.5">
                    {Array.from({ length: item.rarity }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          isUnlocked ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-black text-slate-800 line-clamp-1">
                    {isUnlocked ? item.name : '未発見の発明'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
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
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full border-4 border-amber-400 shadow-2xl relative text-center animate-bounce-slow">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveItem(null);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-5xl mb-2">{activeItem.icon}</div>
              <div className="flex justify-center gap-1 mb-1">
                {Array.from({ length: activeItem.rarity }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
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
