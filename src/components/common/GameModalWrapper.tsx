import { ArrowLeft, HelpCircle, Star, Sparkles, Award, LayoutGrid, RotateCcw, ChevronRight } from 'lucide-react';
import { sound } from '../../services/audio';

interface GameModalWrapperProps {
  title: string;
  badgeTag: string; // e.g. "理科ラボ Lv.1"
  level: number;
  starsEarned?: number;
  isCompleted?: boolean;
  explanation?: string;
  examTip?: string;
  onBack: () => void;
  onNextLevel?: () => void;
  onRetry?: () => void;
  onOpenHelp?: () => void;
  problemIndex?: number;
  totalProblems?: number;
  onSwitchProblem?: (index: number) => void;
  onNextProblem?: () => void;
  children: React.ReactNode;
}

export const GameModalWrapper: React.FC<GameModalWrapperProps> = ({
  title,
  badgeTag,
  level,
  starsEarned,
  isCompleted,
  explanation,
  examTip,
  onBack,
  onNextLevel,
  onRetry,
  onOpenHelp,
  problemIndex,
  totalProblems,
  onSwitchProblem,
  onNextProblem,
  children
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-md">
      {/* Top Header bar */}
      <header className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 bg-white/95 border-b-2 border-amber-200 shadow-sm shrink-0">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-sm sm:text-base font-bold transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>ステージ選択</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
              {badgeTag}
            </span>
            <span className="text-xs text-slate-500 font-bold">難易度 ★{level}</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
        </div>

        <div>
          {onOpenHelp && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenHelp();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-700 text-sm font-bold active:scale-95 transition-all"
            >
              <HelpCircle className="w-5 h-5 text-sky-600" />
              <span className="hidden sm:inline">ヒント</span>
            </button>
          )}
        </div>
      </header>

      {/* Problem Variation Selector */}
      {totalProblems && totalProblems > 1 && onSwitchProblem && (
        <div className="bg-amber-50/90 border-b border-amber-200 px-3 py-1.5 flex items-center justify-center gap-2 shrink-0">
          <span className="text-xs font-black text-amber-900">
            もんだい選たく:
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalProblems }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sound.playClick();
                  onSwitchProblem(idx);
                }}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition-all ${
                  problemIndex === idx
                    ? 'bg-amber-500 text-white shadow-sm scale-105'
                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                第{idx + 1}問
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Game Screen Canvas */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border-4 border-amber-300 p-4 sm:p-6 relative">
          {children}
        </div>
      </main>

      {/* Completion / Victory Modal Overlay */}
      {isCompleted && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full text-center border-4 border-amber-400 shadow-2xl animate-bounce-slow relative max-h-[92vh] overflow-y-auto">
            <div className="w-20 h-20 mx-auto -mt-14 mb-3 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white shadow-lg flex items-center justify-center text-4xl">
              🎉
            </div>

            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-black text-sm mb-2">
              クリアおめでとう！
            </span>
            <h3 className="text-2xl font-black text-slate-800 mb-3">ステージ制覇！</h3>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((starNum) => (
                <Star
                  key={starNum}
                  className={`w-10 h-10 transition-all ${
                    (starsEarned || 3) >= starNum
                      ? 'text-amber-400 fill-amber-400 drop-shadow'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Rewards */}
            <div className="flex justify-around items-center bg-amber-50 rounded-2xl p-3 border-2 border-amber-200 mb-4">
              <div className="flex items-center gap-1.5 font-bold text-amber-700">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>+50 XP</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-amber-700">
                <span className="text-lg">⭐</span>
                <span>+30 コイン</span>
              </div>
            </div>

            {/* Explanation / Entrance Exam Tip */}
            {explanation && (
              <div className="text-left bg-sky-50 rounded-2xl p-3 border border-sky-200 mb-3 text-xs sm:text-sm text-slate-700">
                <div className="font-extrabold text-sky-800 mb-1 flex items-center gap-1">
                  <Award className="w-4 h-4 text-sky-600" />
                  <span>なぜそうなるの？（解説）</span>
                </div>
                <p className="leading-relaxed">{explanation}</p>
              </div>
            )}

            {examTip && (
              <div className="text-left bg-emerald-50 rounded-2xl p-3 border border-emerald-200 mb-5 text-xs sm:text-sm text-emerald-900">
                <div className="font-black text-emerald-800 mb-0.5">💡 中学受験のポイント</div>
                <p>{examTip}</p>
              </div>
            )}

            {/* Action buttons: structured to never wrap text vertically on PC or mobile */}
            {(() => {
              const hasNextProblem =
                problemIndex !== undefined &&
                totalProblems !== undefined &&
                problemIndex < totalProblems - 1 &&
                !!onNextProblem;

              return (
                <div className="flex flex-col gap-2.5 w-full mt-3">
                  {/* Primary Forward Action: Next Problem OR Next Level */}
                  {hasNextProblem ? (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onNextProblem!();
                      }}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-black shadow-md active:scale-95 transition-all text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <span>第{problemIndex! + 2}問へ進む</span>
                      <ChevronRight className="w-5 h-5 shrink-0" />
                    </button>
                  ) : onNextLevel ? (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onNextLevel();
                      }}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black shadow-md active:scale-95 transition-all text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <span>次のレベルへ進む！</span>
                      <ChevronRight className="w-5 h-5 shrink-0" />
                    </button>
                  ) : null}

                  {/* Secondary Action Grid */}
                  <div
                    className={`grid gap-2 w-full ${
                      hasNextProblem && onNextLevel
                        ? 'grid-cols-2 sm:grid-cols-3'
                        : 'grid-cols-2'
                    }`}
                  >
                    <button
                      onClick={() => {
                        sound.playClick();
                        onBack();
                      }}
                      className="py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-1 border border-slate-300 shadow-sm whitespace-nowrap"
                    >
                      <LayoutGrid className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>ステージ選択へ</span>
                    </button>

                    {onRetry && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onRetry();
                        }}
                        className="py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-1 border border-amber-300 shadow-sm whitespace-nowrap"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>もう一度</span>
                      </button>
                    )}

                    {hasNextProblem && onNextLevel && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onNextLevel();
                        }}
                        className="col-span-2 sm:col-span-1 py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-1 border border-emerald-300 shadow-sm whitespace-nowrap"
                      >
                        <span>次のレベルへ</span>
                        <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
