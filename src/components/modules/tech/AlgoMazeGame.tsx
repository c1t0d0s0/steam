import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Play, ArrowUp, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

interface AlgoMazeGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
}

type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';
type Command = 'FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT';

export const AlgoMazeGame: React.FC<AlgoMazeGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel
}) => {
  const getMaze = () => {
    if (level === 1) {
      // 4x4 Grid
      // S: (0,0), Facing East
      // Move Forward 2, Turn Right, Move Forward 2 -> Goal (2,2)
      return {
        gridSize: 4,
        start: { x: 0, y: 0, dir: 'RIGHT' as Direction },
        goal: { x: 2, y: 2 },
        walls: [{ x: 1, y: 1 }, { x: 0, y: 2 }],
        maxCommands: 6,
        explanation: 'コンピュータは指示された命令を1行ずつ順番に実行します（順次処理）。前に2歩進み、右を向いて、また2歩進むことでゴールできました！',
        examTip: '【プログラミング思考の基本】複雑な目標も、「小さな命令（順次・分岐・反復）」に細かく分解すると必ず実現できます！'
      };
    } else if (level === 2) {
      // 4x4 Grid
      // S: (0,3), Facing North (UP)
      // Goal: (3,0)
      return {
        gridSize: 4,
        start: { x: 0, y: 3, dir: 'UP' as Direction },
        goal: { x: 3, y: 0 },
        walls: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }],
        maxCommands: 8,
        explanation: '目の前の岩を避けるため、「右を向く」「進む」「左を向く」と的確に方向転換の命令を組み立てられました！',
        examTip: '【アルゴリズムの最短経路】迷路を解くときは「ロボットの視点（主観）」になって左右を判断するのがポイントです！'
      };
    } else {
      // Level 3: 5x5 Grid
      return {
        gridSize: 5,
        start: { x: 0, y: 4, dir: 'UP' as Direction },
        goal: { x: 4, y: 0 },
        walls: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 2, y: 2 },
          { x: 3, y: 1 },
          { x: 4, y: 3 }
        ],
        maxCommands: 10,
        explanation: '入り組んだ障害物迷路を見事に突破！条件に合わせて最適な手順を計画する「論理的思考力」がしっかり身についています。',
        examTip: '思考力入試・適性検査頻出！「指示されたルール通りに状態がどう変化するか」を丁寧に追跡（トレース）する練習になります！'
      };
    }
  };

  const maze = getMaze();
  const [commands, setCommands] = useState<Command[]>([]);
  const [botState, setBotState] = useState({
    x: maze.start.x,
    y: maze.start.y,
    dir: maze.start.dir
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>('命令カードを並べてロボットを星まで導こう！');

  const addCommand = (cmd: Command) => {
    if (commands.length >= maze.maxCommands || isRunning) return;
    sound.playClick();
    setCommands([...commands, cmd]);
  };

  const clearCommands = () => {
    if (isRunning) return;
    sound.playClick();
    setCommands([]);
    resetBot();
  };

  const resetBot = () => {
    setBotState({
      x: maze.start.x,
      y: maze.start.y,
      dir: maze.start.dir
    });
  };

  const turnDir = (current: Direction, turn: 'LEFT' | 'RIGHT'): Direction => {
    const dirs: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    const idx = dirs.indexOf(current);
    if (turn === 'RIGHT') {
      return dirs[(idx + 1) % 4];
    } else {
      return dirs[(idx + 3) % 4];
    }
  };

  const runProgram = async () => {
    if (commands.length === 0 || isRunning) return;
    setIsRunning(true);
    setFeedback('プログラム実行中...');
    let curX = maze.start.x;
    let curY = maze.start.y;
    let curDir = maze.start.dir;

    setBotState({ x: curX, y: curY, dir: curDir });

    for (let i = 0; i < commands.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      const cmd = commands[i];

      if (cmd === 'TURN_LEFT') {
        sound.playClick();
        curDir = turnDir(curDir, 'LEFT');
      } else if (cmd === 'TURN_RIGHT') {
        sound.playClick();
        curDir = turnDir(curDir, 'RIGHT');
      } else if (cmd === 'FORWARD') {
        sound.playClick();
        let nextX = curX;
        let nextY = curY;
        if (curDir === 'UP') nextY -= 1;
        if (curDir === 'RIGHT') nextX += 1;
        if (curDir === 'DOWN') nextY += 1;
        if (curDir === 'LEFT') nextX -= 1;

        // Check boundary
        if (nextX < 0 || nextX >= maze.gridSize || nextY < 0 || nextY >= maze.gridSize) {
          sound.playWrong();
          setFeedback('コースの外に飛び出してしまった！プログラムを直そう。');
          setIsRunning(false);
          return;
        }

        // Check wall
        if (maze.walls.some((w) => w.x === nextX && w.y === nextY)) {
          sound.playWrong();
          setFeedback('岩にぶつかってしまった！別のルートを考えてみよう。');
          setIsRunning(false);
          return;
        }

        curX = nextX;
        curY = nextY;
      }

      setBotState({ x: curX, y: curY, dir: curDir });
    }

    await new Promise((r) => setTimeout(r, 300));

    if (curX === maze.goal.x && curY === maze.goal.y) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback('ゴール達成！見事なプログラムです！');
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('ゴールに届かなかったよ！命令を追加するか直してみてね。');
    }
    setIsRunning(false);
  };

  const getDirIcon = (dir: Direction) => {
    switch (dir) {
      case 'UP':
        return '▲';
      case 'RIGHT':
        return '▶';
      case 'DOWN':
        return '▼';
      case 'LEFT':
        return '◀';
    }
  };

  return (
    <GameModalWrapper
      title="プログラミング迷路"
      badgeTag={`テック研究所 Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={maze.explanation}
      examTip={maze.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      onRetry={() => {
        setCommands([]);
        resetBot();
        setIsCompleted(false);
        setFeedback('命令カードを並べてロボットを星まで導こう！');
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-sky-50 border border-sky-200 rounded-2xl mb-3 font-extrabold text-sky-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* Maze Grid Stage */}
        <div
          className="grid gap-1.5 p-3 bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-xl mb-4"
          style={{
            gridTemplateColumns: `repeat(${maze.gridSize}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: maze.gridSize }).map((_, y) => (
            <React.Fragment key={y}>
              {Array.from({ length: maze.gridSize }).map((_, x) => {
                const isBot = botState.x === x && botState.y === y;
                const isGoal = maze.goal.x === x && maze.goal.y === y;
                const isWall = maze.walls.some((w) => w.x === x && w.y === y);

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-black relative transition-all duration-300 ${
                      isWall
                        ? 'bg-slate-700 border-2 border-slate-600 shadow-inner'
                        : 'bg-slate-900/80 border border-slate-700/50'
                    }`}
                  >
                    {isWall && <span className="text-xl">🪨</span>}
                    {isGoal && (
                      <span className="text-2xl sm:text-3xl animate-pulse-subtle filter drop-shadow">
                        ⭐
                      </span>
                    )}
                    {isBot && (
                      <div className="relative flex flex-col items-center animate-bounce-slow">
                        <span className="text-2xl sm:text-3xl">🤖</span>
                        <span className="text-[10px] text-amber-300 font-black -mt-1 drop-shadow">
                          {getDirIcon(botState.dir)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Command Queue Box */}
        <div className="w-full max-w-md bg-slate-100 border-2 border-slate-300 rounded-2xl p-2.5 sm:p-3 mb-3">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <span className="text-xs font-black text-slate-600">
              命令キュー ({commands.length}/{maze.maxCommands})
            </span>
            <button
              onClick={clearCommands}
              disabled={isRunning || commands.length === 0}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>クリア</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[44px] bg-white p-2 rounded-xl border border-slate-200">
            {commands.map((cmd, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm bg-sky-500 text-white border border-sky-600 animate-pulse-subtle"
              >
                <span>{idx + 1}.</span>
                {cmd === 'FORWARD' && <span>⬆️ すすむ</span>}
                {cmd === 'TURN_LEFT' && <span>↩️ ひだり</span>}
                {cmd === 'TURN_RIGHT' && <span>↪️ みぎ</span>}
              </div>
            ))}
            {commands.length === 0 && (
              <span className="text-xs text-slate-400 font-bold self-center">
                下のカードを押して命令を追加してね！
              </span>
            )}
          </div>
        </div>

        {/* Available Action Cards Bar */}
        <div className="w-full max-w-md grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => addCommand('FORWARD')}
            disabled={isRunning || commands.length >= maze.maxCommands}
            className="py-2.5 px-2 bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-800 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center gap-1 shadow-sm active:scale-95 transition-all disabled:opacity-40"
          >
            <ArrowUp className="w-5 h-5 text-sky-600" />
            <span>前にすすむ</span>
          </button>
          <button
            onClick={() => addCommand('TURN_LEFT')}
            disabled={isRunning || commands.length >= maze.maxCommands}
            className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center gap-1 shadow-sm active:scale-95 transition-all disabled:opacity-40"
          >
            <ArrowLeft className="w-5 h-5 text-amber-600" />
            <span>左を向く</span>
          </button>
          <button
            onClick={() => addCommand('TURN_RIGHT')}
            disabled={isRunning || commands.length >= maze.maxCommands}
            className="py-2.5 px-2 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-800 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center gap-1 shadow-sm active:scale-95 transition-all disabled:opacity-40"
          >
            <ArrowRight className="w-5 h-5 text-indigo-600" />
            <span>右を向く</span>
          </button>
        </div>

        {/* Execute Button */}
        <button
          onClick={runProgram}
          disabled={isRunning || commands.length === 0}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>プログラムを実行する！</span>
        </button>
      </div>
    </GameModalWrapper>
  );
};
