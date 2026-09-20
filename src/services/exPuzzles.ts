import { GameModuleType } from '../components/home/IslandMap';

export interface ExPuzzleDefinition {
  title: string;
  badge: string;
  puzzle: any;
}

export const EX_PUZZLES: Record<GameModuleType, Record<number, ExPuzzleDefinition>> = {
  lever: {
    1: {
      title: '多重モーメント・連鎖天秤パズル (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        targetPos: 4,
        initialWeights: [
          { pos: -4, weight: 30, locked: true },
          { pos: -2, weight: 20, locked: true }
        ],
        availableWeights: [15, 25, 35, 40],
        explanation: '左側のトルク合計は「4×30(120) + 2×20(40) = 160」！右側の距離4におもりを吊るすので、160 ÷ 4 = 40g が正解です！',
        examTip: '【多重モーメントの足し算】支点の左側に複数のおもりがある時は、それぞれの「距離×重さ」を足し算して合計モーメントを計算しよう！'
      }
    },
    2: {
      title: '多重モーメント・連鎖天秤パズル (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        targetPos: 2,
        initialWeights: [
          { pos: -3, weight: 30, locked: true },
          { pos: -4, weight: 10, locked: true }
        ],
        availableWeights: [45, 55, 60, 65],
        explanation: '左側のトルク合計は「3×30(90) + 4×10(40) = 130」！右側の距離2におもりを吊るすので、130 ÷ 2 = 65g が正解です！',
        examTip: '【逆比の極意】支点からの距離が近ければ近いほど、釣り合わせるためには大きなおもりが必要になります！'
      }
    },
    3: {
      title: '多重モーメント・連鎖天秤パズル (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        targetPos: 3,
        initialWeights: [
          { pos: -3, weight: 50, locked: true },
          { pos: -4, weight: 15, locked: true }
        ],
        availableWeights: [55, 60, 65, 70],
        explanation: '左側のトルク合計は「3×50(150) + 4×15(60) = 210」！右側の距離3におもりを吊るすので、210 ÷ 3 = 70g が正解です！',
        examTip: '【STEAM天秤マスター認定】左右のモーメント総和（Σ 距離×重さ）を瞬時に見抜く計算力は中学受験物理の強力な武器です！'
      }
    }
  },
  block: {
    1: {
      title: '超立体キューブ要塞・幻影積み木 (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        blocks: [
          { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
          { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 },
          { x: 2, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 },
          { x: 1, y: 1, z: 0 },
          { x: 0, y: 2, z: 0 }
        ],
        answer: 10,
        options: [8, 9, 10, 11],
        explanation: '1段目（底面）に6個、2段目に3個、3段目に1個あり、合計「10個」です！',
        examTip: '【段ごとのスライス計算法】下から1段目、2段目、3段目と水平にスライスして数えると、隠れた積み木も見逃しません！'
      }
    },
    2: {
      title: '超立体キューブ要塞・幻影積み木 (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        blocks: [
          { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
          { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: 2 },
          { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 },
          { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 },
          { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 },
          { x: 2, y: 1, z: 0 },
          { x: 0, y: 2, z: 0 }
        ],
        answer: 14,
        options: [12, 13, 14, 15],
        explanation: '1段目に7個、2段目に5個、3段目に2個あり、合計「14個」です！奥の柱の陰にあるブロックも正確にカウントしましょう。',
        examTip: '【上から見た図の数字書き込み】各マスのブロックの高さを書き込む「見取り図解法」は中学受験の超頻出テクニックです！'
      }
    },
    3: {
      title: '超立体キューブ要塞・幻影積み木 (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        blocks: [
          { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
          { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: 2 },
          { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 }, { x: 2, y: 0, z: 2 },
          { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 },
          { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 },
          { x: 2, y: 1, z: 0 }, { x: 2, y: 1, z: 1 },
          { x: 0, y: 2, z: 0 },
          { x: 1, y: 2, z: 0 },
          { x: 2, y: 2, z: 0 }
        ],
        answer: 18,
        options: [16, 17, 18, 19],
        explanation: '1段目に9個（全面）、2段目に6個、3段目に3個あり、合計「18個」です！立体要塞の空間構成を完璧に把握できました！',
        examTip: '【立体の三面図把握】上から・正面から・右横からの3つの視点を組み合わせることで、どんな複雑な立体も完全攻略できます！'
      }
    }
  },
  tsurukame: {
    1: {
      title: '究極のつるかめ算ビジュアルアリーナ (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        totalHeads: 50,
        totalLegs: 140,
        correctCranes: 30,
        correctTurtles: 20,
        explanation: 'もし全員ツルなら足は 50×2=100本。実際の140本より40本足りない。40÷(4-2) = 20匹のカメ！ツルは 50-20 = 30羽です！',
        examTip: '【もしも全員〜なら（仮定算）】全員が足の少ないツルだと仮定して、不足分をカメと入れ替えていくのがつるかめ算の神髄です！'
      }
    },
    2: {
      title: '究極のつるかめ算ビジュアルアリーナ (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        totalHeads: 60,
        totalLegs: 176,
        correctCranes: 32,
        correctTurtles: 28,
        explanation: 'もし全員ツルなら足は 60×2=120本。176-120=56本足りない。56÷2 = 28匹のカメ！ツルは 60-28 = 32羽です！',
        examTip: '【差集め算への応用】足の差「2本」に着目して、合計の差を1匹あたりの差で割る思考法を身につけよう！'
      }
    },
    3: {
      title: '究極のつるかめ算ビジュアルアリーナ (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        totalHeads: 100,
        totalLegs: 268,
        correctCranes: 66,
        correctTurtles: 34,
        explanation: 'もし全員カメなら 100×4=400本。400-268=132本多い。132÷2 = 66羽のツル！カメは 100-66 = 34匹です！',
        examTip: '【面積図マスター】頭数×足の数の長方形の差をイメージできるようになると、どんな大頭数のつるかめ算も秒速で解けます！'
      }
    }
  },
  gear: {
    1: {
      title: '超遊星からくり大歯車機構 (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        question: '動力ギアA（時計回り）から連動する5連ギア機構があるよ。5番目のギアEはどちら向きに回るかな？',
        targetDirection: 'CW',
        gears: [
          { label: 'A (時計)', teeth: 12, radius: 36, isCW: true, speedSec: 4, color: '#38bdf8' },
          { label: 'B', teeth: 12, radius: 36, isCW: false, speedSec: 4, color: '#f43f5e' },
          { label: 'C', teeth: 12, radius: 36, isCW: true, speedSec: 4, color: '#10b981' },
          { label: 'D', teeth: 12, radius: 36, isCW: false, speedSec: 4, color: '#f59e0b' },
          { label: 'E (?)', teeth: 12, radius: 36, isCW: true, speedSec: 4, color: '#8b5cf6' }
        ],
        explanation: '噛み合う歯車は回る向きが交互に反転します！A(時計) → B(反時計) → C(時計) → D(反時計) → E(時計回り) となります！',
        examTip: '【奇数番目の法則】1枚目(A)が時計回りなら、3枚目(C)や5枚目(E)など奇数番目のギアはすべて同じ時計回りに回転します！'
      }
    },
    2: {
      title: '超遊星からくり大歯車機構 (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        question: '歯数24のギアA（時計回り）が1回転するとき、噛み合っている歯数8のギアBは何回転するかな？',
        isRatioPuzzle: true,
        correctTurns: 3,
        options: [1, 2, 3, 4],
        gears: [
          { label: 'A (24枚)', teeth: 24, radius: 48, isCW: true, speedSec: 6, color: '#38bdf8' },
          { label: 'B (8枚)', teeth: 8, radius: 24, isCW: false, speedSec: 2, color: '#f43f5e' }
        ],
        explanation: '歯数の比が 24 : 8 = 3 : 1 なので、回転数の比は逆比の 1 : 3！ギアAが1回転するとギアBは「3回転」します！',
        examTip: '【歯数と回転数の反比例】歯数が 1/3 になると、回転数は 3倍 にスピードアップします！'
      }
    },
    3: {
      title: '超遊星からくり大歯車機構 (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        question: '歯数32のギアAが1回転するとき、アイドラギアB(16枚)を経て回るギアC(8枚)は何回転するかな？',
        isRatioPuzzle: true,
        correctTurns: 4,
        options: [2, 3, 4, 6],
        gears: [
          { label: 'A (32枚)', teeth: 32, radius: 48, isCW: true, speedSec: 8, color: '#38bdf8' },
          { label: 'B (16枚)', teeth: 16, radius: 32, isCW: false, speedSec: 4, color: '#10b981' },
          { label: 'C (8枚)', teeth: 8, radius: 20, isCW: true, speedSec: 2, color: '#f59e0b' }
        ],
        explanation: '中継ギアBの歯数は全体の回転比に影響しません！最初と最後の歯車比 32 ÷ 8 = 4回転 が正解です！',
        examTip: '【中継アイドラギアの性質】間にあるギアは回転方向を中継するだけで、全体の回転比は最初と最後のギアの歯数だけで決まります！'
      }
    }
  },
  cube_net: {
    1: {
      title: '立体超幾何・究極展開図マスター (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        question: '【EX裏 3-3型展開図】この正統な3-3型展開図で、面「A」と平行に向かい合う面はどれかな？',
        correctAnswer: '面C',
        options: ['面B', '面C', '面D', '面E'],
        explanation: '正解は「面C」！上段3枚並びの両端である「A」と「C」が、組み立てると平行に向かい合う対面になります！',
        examTip: '【3-3型の対面ペア】上段の両端(A-C)、下段の両端(D-F)、そして中央同士(B-E)の3組が向かい合います！',
        gridCols: 5,
        grid: [
          { label: 'A', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' },
          { label: 'B', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
          { label: 'C', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
          null,
          null,
          null,
          null,
          { label: 'D', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
          { label: 'E', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
          { label: 'F', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' }
        ]
      }
    },
    2: {
      title: '立体超幾何・究極展開図マスター (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        question: '【EX裏 2-2-2型ギザギザ階段】この展開図で、面「B」と平行に向かい合う面はどれかな？',
        correctAnswer: '面E',
        options: ['面A', '面C', '面D', '面E'],
        explanation: '正解は「面E」！上段右の「B」と下段左の「E」が、2段差を越えて平行に向かい合う対面になります！',
        examTip: '【2-2-2型の対面ペア】AとD、BとE、CとF！階段の段差を挟んで互い違いに向かい合う3組のペアになります！',
        gridCols: 4,
        grid: [
          { label: 'A', bg: 'bg-cyan-400', border: 'border-cyan-600', textClass: 'text-cyan-950' },
          { label: 'B', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' },
          null,
          null,
          null,
          { label: 'C', bg: 'bg-cyan-300', border: 'border-cyan-500', textClass: 'text-cyan-950' },
          { label: 'D', bg: 'bg-cyan-300', border: 'border-cyan-500', textClass: 'text-cyan-950' },
          null,
          null,
          null,
          { label: 'E', bg: 'bg-cyan-200', border: 'border-cyan-400', textClass: 'text-cyan-950' },
          { label: 'F', bg: 'bg-cyan-200', border: 'border-cyan-400', textClass: 'text-cyan-950' }
        ]
      }
    },
    3: {
      title: '立体超幾何・究極展開図マスター (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        question: '【EX裏 和が7のサイコロ】上の面が「2」のとき、底面になる「？」に入る数字は何かな？',
        correctAnswer: '5',
        options: ['3', '4', '5', '6'],
        explanation: '正解は「5」！向かい合う面の目の和が7になるので、7 - 2 = 5 になります！',
        examTip: '【サイコロの基本定理】向かい合う面の合計は必ず「7」！1と6、2と5、3と4 が対面ペアです！',
        gridCols: 4,
        grid: [
          null,
          { label: '2', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' },
          null,
          null,
          { label: '1', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
          { label: '3', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
          { label: '6', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
          { label: '4', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
          null,
          null,
          { label: '?', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' },
          null
        ]
      }
    }
  },
  algo_maze: {
    1: {
      title: '超難解AIアルゴリズム量子迷路 (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        gridSize: 5,
        start: { x: 0, y: 0, dir: 'RIGHT' },
        goal: { x: 4, y: 4 },
        walls: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 3, y: 3 }
        ],
        maxCommands: 14,
        explanation: '壁の位置を把握し、最少コマンドで右下のゴールへ到達せよ！',
        examTip: '【アルゴリズムの最短経路】壁の位置を把握し、回転回数を最小限に抑えるルートを組み立てましょう！'
      }
    },
    2: {
      title: '超難解AIアルゴリズム量子迷路 (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        gridSize: 5,
        start: { x: 0, y: 4, dir: 'UP' },
        goal: { x: 4, y: 0 },
        walls: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 0 },
          { x: 2, y: 4 }
        ],
        maxCommands: 16,
        explanation: '中央の遮断壁を迂回し、最少コマンドで右上の量子コアへ進め！',
        examTip: '【順次処理の精密化】「進む」と「向きを変える」の連続を頭の中でシミュレーションしてプログラミングしよう！'
      }
    },
    3: {
      title: '超難解AIアルゴリズム量子迷路 (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        gridSize: 5,
        start: { x: 0, y: 2, dir: 'RIGHT' },
        goal: { x: 4, y: 2 },
        walls: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 3, y: 2 },
          { x: 3, y: 3 },
          { x: 3, y: 4 }
        ],
        maxCommands: 18,
        explanation: 'S字型迷路を完全制覇し、ゴールへ到達せよ！',
        examTip: '【天才プログラマー認定】無駄な方向転換を省いた完璧なアルゴリズムの構築に成功しました！'
      }
    }
  },
  circuit: {
    1: {
      title: '超電導・量子電気回路パズル (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        id: 'ex_c1',
        title: 'ブリッジ回路と電位差ゼロの幻影電球',
        question: '中央の電球Cを流れる電流はどうなるでしょう？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'bat1', x: 20, y: 80, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 40, y: 35 },
          { id: 'B', label: '電球B', x: 70, y: 35 },
          { id: 'C', label: '電球C（中央）', x: 55, y: 55 },
          { id: 'D', label: '電球D', x: 40, y: 75 },
          { id: 'E', label: '電球E', x: 70, y: 75 }
        ],
        switches: [{ id: 'SW1', label: 'メインスイッチ', x: 30, y: 80, defaultOn: true }],
        options: [
          { id: 'opt1', text: '電球Cには電流が流れず、点灯しない（明るさ0）', correct: true },
          { id: 'opt2', text: '電球Cが一番明るく点灯する（明るさ2）', correct: false },
          { id: 'opt3', text: 'すべての電球が同じ明るさで点灯する', correct: false }
        ],
        explanation: '上側の枝（電球AとB）と下側の枝（電球DとE）の抵抗比が等しいため、電球Cの両端の電位（電気の高さ）が全く同じになります（ホイートストンブリッジ回路）。電位差がゼロなので電球Cには一切電流が流れず消灯します！',
        examTip: '【中学受験最難関のツボ】対称なブリッジ回路の中央の電球には電流が流れません！難関校（灘・開成）で出題される幻影電球の見破りテクニックです！'
      }
    },
    2: {
      title: '超電導・量子電気回路パズル (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        id: 'ex_c2',
        title: '乾電池3個直列＋3分岐混列回路の電流比',
        question: '乾電池3個を直列につなぎ、電球Aの直列に(電球Bと電球Cの並列)をつなぎました。電球Aの明るさはいくつ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'bat1', x: 20, y: 80, count: 3, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A（直列）', x: 45, y: 40 },
          { id: 'B', label: '電球B（並列上）', x: 70, y: 30 },
          { id: 'C', label: '電球C（並列下）', x: 70, y: 60 }
        ],
        options: [
          { id: 'opt1', text: '明るさ 2 （電流 2）', correct: true },
          { id: 'opt2', text: '明るさ 1 （電流 1）', correct: false },
          { id: 'opt3', text: '明るさ 3/2 （電流 1.5）', correct: false },
          { id: 'opt4', text: '明るさ 3 （電流 3）', correct: false }
        ],
        explanation: '全体の合成抵抗は、電球Aの抵抗1＋並列部分(BとC)の合成抵抗1/2 = 1.5（3/2）です。乾電池3個（電圧3）なので、回路全体に流れる電流は「3 ÷ 1.5 = 2」！したがって電球Aには電流2が流れ、電球BとCにはそれぞれ半分ずつの電流1が流れます！',
        examTip: '【混列回路の合成抵抗の極意】並列部分を1つの抵抗（1/2）に置き換えて直列と足し算（1 + 1/2 = 1.5）！全体の電圧 ÷ 全体の抵抗 で主幹電流を一発計算できます！'
      }
    },
    3: {
      title: '超電導・量子電気回路パズル (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        id: 'ex_c3',
        title: '【超難関EX裏】究極のショート・マトリクスパズル',
        question: 'スイッチSW1, SW2, SW3を操作して、【電球Aと電球Cだけを点灯】させ、電球Bをショート（短絡）させて消灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'bat1', x: 15, y: 80, count: 2, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 35, y: 40 },
          { id: 'B', label: '電球B', x: 60, y: 40 },
          { id: 'C', label: '電球C', x: 85, y: 40 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1（主電源）', x: 25, y: 80, defaultOn: false },
          { id: 'SW2', label: 'SW2（電球Bバイパス）', x: 60, y: 20, defaultOn: false },
          { id: 'SW3', label: 'SW3（電球C分岐）', x: 75, y: 60, defaultOn: false }
        ],
        targetCondition: {
          requiredOn: ['A', 'C'],
          requiredOff: ['B'],
          description: '電球AとCのみ点灯（Bは消灯）'
        },
        explanation: 'SW1を閉じて回路全体に通電し、SW2を閉じることで電球Bの両端が導線だけで直結されてショート（バイパス）し消灯します。SW3を閉じることで電球Cに電流が流れ、見事に「電球AとCのみ点灯」が成立します！',
        examTip: '【超電導マスター認定】ショート回路の原理（電流は抵抗のない導線を選んで一気に流れる）を完全制覇しました！これで中学受験の電気分野は向かうところ敵なしです！'
      }
    }
  },
  contraption: {
    1: {
      title: '時空連鎖・究極ピタゴラ力学要塞 (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        id: 'ex_ct1',
        title: '三重ニュートン振り子と弾性衝突の共鳴カタパルト',
        question: '同じ重さの金属球が3個静止している列に、左から金属球2個を同時にぶつけると、右側から何個の球が飛び出すかな？',
        puzzleType: 'physics_quiz',
        options: [
          { id: 'opt1', text: '右側から2個の球が同じ速さで飛び出す！', correct: true },
          { id: 'opt2', text: '右端の1個だけが2倍の速さで飛び出す！', correct: false },
          { id: 'opt3', text: '右側から3個すべての球がゆっくり飛び出す！', correct: false },
          { id: 'opt4', text: 'すべての球が衝突してその場で静止する！', correct: false }
        ],
        explanation: '正解は「2個」！完全弾性衝突（ニュートンのゆりかご）では「運動量（重さ×速さ）」と「運動エネルギー」の両方が保存されるため、左からぶつけた球の個数と同じ「2個」が右側からそっくりそのまま押し出されて飛び出します！',
        examTip: '【ニュートンのゆりかごの保存則】灘中・開成中などの難関理科で出題される弾性衝突の鉄則！「入った個数＝飛び出す個数」！球が2個入れば右からも2個飛び出し、カタパルトが作動します！'
      }
    },
    2: {
      title: '時空連鎖・究極ピタゴラ力学要塞 (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        id: 'ex_ct2',
        title: '動滑車3段＋複合シーソーの力学要塞',
        question: '重さ80gのメイン球を持ち上げるため、動滑車を3個連結したピタゴラ機構を作りました。引っ張るのに必要なおもり球の重さは何gかな？',
        puzzleType: 'physics_quiz',
        options: [
          { id: 'opt1', text: 'わずか 10g で持ち上がる！（1/8の力）', correct: true },
          { id: 'opt2', text: '40g 必要（1/2の力）', correct: false },
          { id: 'opt3', text: '20g 必要（1/4の力）', correct: false },
          { id: 'opt4', text: '同じ 80g 必要（力は変わらない）', correct: false }
        ],
        explanation: '正解は「10g」！動滑車を1個通すごとに必要な力は「半分（1/2）」になります。3段連結すると「1/2 × 1/2 × 1/2 = 1/8」になるため、80g ÷ 8 = 10g の小さな重り球で持ち上げることができます！その代わり、ひもを引っ張る距離は8倍長くなります（仕事の原理）。',
        examTip: '【動滑車の倍力法則】動滑車n個連結で力は「1/(2のn乗)」！3個なら1/8、4個なら1/16！力は小さくて済むけれど引く長さは2のn乗倍伸びる「仕事の原理」は中学入試の超重要定理です！'
      }
    },
    3: {
      title: '時空連鎖・究極ピタゴラ力学要塞 (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        id: 'ex_ct3',
        title: '【究極EX裏】5連続物理ギミックの時空完全同期連鎖',
        question: '斜面レール、バネ、ドミノ、シーソー、滑車ゲートを正しく配置して、球を落とし、すべてのギミックを連鎖させてゴールベル🔔を鳴らそう！',
        puzzleType: 'physics_quiz',
        options: [
          { id: 'opt1', text: '位置→運動→弾性→モーメント→仕事 とエネルギーが連鎖してベル鳴動！', correct: true },
          { id: 'opt2', text: '途中のバネで運動エネルギーがすべてゼロになって停止する', correct: false },
          { id: 'opt3', text: 'ドミノが倒れる向きが逆になり球を跳ね返してしまう', correct: false }
        ],
        explanation: '完璧な連鎖！斜面を滑り降りた球がバネで跳ねてドミノを倒し、その衝撃でシーソーが傾いて重り球が滑車カゴに落下、見事にゴールベルが鳴り響きました！',
        examTip: '【からくり工学の最高峰】エネルギーが「位置→運動→弾性→モーメント→仕事」へと姿を変えながら次々とバトンタッチしていく物理連鎖の真髄を完全制覇しました！'
      }
    }
  },
  cross_section: {
    1: {
      title: '多面体切断・極限断面幾何パズル (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        id: 'ex_sec1',
        title: '立方体の3方向直交中心切断と切断面',
        question: '1辺が6cmの立方体を、互いに直交する3つの中心平面（x=3, y=3, z=3）で同時に切断すると、何個の合同な小立方体に分割され、切断面の総面積は何cm²になるかな？',
        puzzleType: 'slice_exam_quiz',
        options: [
          { id: 'opt1', text: '8個の小立方体に分かれ、切断面の総面積は「108cm²」！', correct: true },
          { id: 'opt2', text: '6個の小立方体に分かれ、切断面の総面積は「72cm²」', correct: false },
          { id: 'opt3', text: '12個の直方体に分かれ、切断面の総面積は「216cm²」', correct: false },
          { id: 'opt4', text: '8個の小立方体に分かれ、切断面の総面積は「36cm²」', correct: false }
        ],
        explanation: '正解は「8個、108cm²」！3つの直交平面で切断すると、2×2×2 = 8個の合同な小立方体に分割されます。内部に現れる切断面は、1つの切断につき 6×6 = 36cm² の正方形断面が1つ。3回の切断で 36 × 3 = 108cm² となります！',
        examTip: '【空間の3分割定理】3次元空間を直交する3平面で切ると「2×2×2 = 8分割」！難関校の立体分割の超頻出思考です！'
      }
    },
    2: {
      title: '多面体切断・極限断面幾何パズル (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        id: 'ex_sec2',
        title: '立方体の向かい合う6辺の中点を通る奇跡の正六角形断面',
        question: '1辺が6cmの立方体において、ある頂点に集まらない向かい合う6本の辺の各中点を通る平面で切断したよ。この切り口の「正六角形」の1辺の長さは何cmかな？',
        puzzleType: 'slice_exam_quiz',
        options: [
          { id: 'opt1', text: '3√2 cm（直角二等辺三角形の斜辺の長さ）！', correct: true },
          { id: 'opt2', text: '3 cm（元の立方体の辺の半分）', correct: false },
          { id: 'opt3', text: '6 cm（元の立方体の1辺と同じ）', correct: false },
          { id: 'opt4', text: '6√2 cm（立方体の面の対角線と同じ）', correct: false }
        ],
        explanation: '正解は「3√2 cm」！各中点間を結ぶ線は、正方形の面のカドを切り落とす直角二等辺三角形（直角をはさむ2辺がそれぞれ3cm）の斜辺になります。三平方の定理より 3 : 3 : 3√2 となり、美しい正六角形の各辺は 3√2 cm となります！',
        examTip: '【正六角形断面の対称性】灘・開成・筑駒などで繰り返し問われる最重要断面！向かい合う辺の中点6個を結ぶと、中心対称かつ線対称な完璧な正六角形が現れます！'
      }
    },
    3: {
      title: '多面体切断・極限断面幾何パズル (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        id: 'ex_sec3',
        title: '【究極EX裏】断頭三角柱の体積公式と立体切断',
        question: '底面が直角二等辺三角形（底辺6cm、高さ6cm）の断頭三角柱があります。3本の立ち上がり辺の高さがそれぞれ 2cm, 5cm, 8cm のとき、この立体の体積は何cm³かな？',
        puzzleType: 'slice_exam_quiz',
        options: [
          { id: 'opt1', text: 'わずか「90cm³」（平均の高さ5cm × 底面積18cm²）！', correct: true },
          { id: 'opt2', text: '180cm³（底面積 × 最大の高さ8cm）', correct: false },
          { id: 'opt3', text: '108cm³（平均の高さ6cm × 底面積18cm²）', correct: false },
          { id: 'opt4', text: '45cm³（体積公式のさらに半分）', correct: false }
        ],
        explanation: '正解は「90cm³」！断頭三角柱の体積公式は「底面積 × (h1 + h2 + h3) ÷ 3」！底面積は 6 × 6 ÷ 2 = 18cm²。3本の高さの平均は (2 + 5 + 8) ÷ 3 = 5cm。したがって 18 × 5 = 90cm³ と一瞬で求まります！',
        examTip: '【断頭三角柱の体積公式】難関中学受験の算数で劇的な計算時短になる必殺公式！高さの平均（重心の高さ）× 底面積 でどんな切断柱体も秒速で解けます！'
      }
    }
  }
};

export const getExPuzzle = (type: GameModuleType, level: number): ExPuzzleDefinition | null => {
  return EX_PUZZLES[type]?.[level] || EX_PUZZLES[type]?.[1] || null;
};
