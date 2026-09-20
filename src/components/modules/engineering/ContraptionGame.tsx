import React, { useState, useEffect, useMemo } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Play, RotateCcw, AlertTriangle, Zap, Wrench } from 'lucide-react';

export type ContraptionPieceType =
  | 'ramp_down_right' // ↘
  | 'ramp_down_left'  // ↙
  | 'spring'          // 🌀 Bouncer
  | 'domino'          // 🀄 Domino
  | 'seesaw'          // ⚖️ Seesaw / Lever
  | 'pulley';         // 🏗️ Pulley Gate

export interface ContraptionSlot {
  id: string;
  x: number; // 0-4
  y: number; // 0-3
  acceptedTypes?: ContraptionPieceType[];
  placedPiece?: ContraptionPieceType | null;
  fixedPiece?: ContraptionPieceType;
}

export interface ContraptionPuzzle {
  id: string;
  title: string;
  subtitle: string;
  question: string;
  puzzleType: 'contraption_run' | 'physics_quiz';
  startPos: { x: number; y: number };
  goalPos: { x: number; y: number };
  slots?: ContraptionSlot[];
  availableInventory?: ContraptionPieceType[];
  solutionSlots?: Record<string, ContraptionPieceType>; // slotId -> piece
  options?: { id: string; text: string; correct: boolean }[];
  hint: string;
  explanation: string;
  examTip: string;
}

// =============================================================================
// Grade 3-6 Contraption Curriculum (72 Problems)
// =============================================================================

const GRADE_CONTRAPTION_PUZZLES: Record<number, Record<number, ContraptionPuzzle[]>> = {
  // 🎒 Grade 3: Gravity, Slopes, Domino Basics
  3: {
    1: [
      {
        id: 'g3_l1_p1',
        title: 'まっすぐ転がる坂道レール',
        subtitle: '高いところから低いところへ！',
        question: '球は重力によって高いところから低いところへ転がります。空いているマスに「右下がりレール（↘）」を置いて、球をゴールベル🔔へ導こう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'ramp_down_left'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'ramp_down_right' },
        hint: 'スタート（左上）からゴール（右下）に向かって、右下がりのレールをつなげよう！',
        explanation: '見事ゴール！球は地球の重力に引かれて、高い場所から低い場所へ自然と加速しながら転がり落ちます！',
        examTip: '【重力と坂道の基本】坂道をつなげると、球は滑らかに位置エネルギーを使って転がり続けます！'
      },
      {
        id: 'g3_l1_p2',
        title: '坂道の傾きとスピード',
        subtitle: '急な坂とゆるやかな坂',
        question: '同じ高さから転がすとき、急な坂道とゆるやかな坂道では、球が地面に着いたときの速さはどうなるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 2 },
        options: [
          { id: 'opt1', text: '急な坂のほうが一気に加速して速い！', correct: true },
          { id: 'opt2', text: 'ゆるやかな坂のほうがじっくり加速して速い', correct: false },
          { id: 'opt3', text: 'どちらもまったく同じ速さになる', correct: false }
        ],
        hint: '滑り台を滑るとき、急な滑り台のほうが勢いがつくよね！',
        explanation: '正解！急な坂のほうが重力の引っ張る力が進行方向に大きく働くため、短い時間で一気にトップスピードまで加速します！',
        examTip: '【傾きと加速度】傾きが急なほど、進行方向にかかる重力の分力が大きくなり、急激に加速します！'
      },
      {
        id: 'g3_l1_p3',
        title: 'ジグザグレール大作戦',
        subtitle: '右へ左へ曲がりながら下降！',
        question: '空きスロットにレールを配置して、ジグザグに坂道を下ってゴールベル🔔に届けよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 1, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 1, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'ramp_down_left'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'ramp_down_left' },
        hint: 'まずは右下へ転がし、次は左下へ切り替えよう！',
        explanation: 'クリア！ジグザグに方向を変えることで、狭いスペースでも高さを稼ぎながらスムーズに下降できます！',
        examTip: '【ジグザグの工学】山道やピタゴラ装置では、ジグザグ（スイッチバック）構造でスピードを制御します！'
      }
    ],
    2: [
      {
        id: 'g3_l2_p1',
        title: 'ドミノ連鎖のバトンタッチ',
        subtitle: '球の力でドミノを倒そう！',
        question: '転がってきた球がドミノに衝突すると、ドミノがパタパタと倒れて次の球を押し出します。スロットに「ドミノ」をセットしよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 1 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['domino', 'ramp_down_right'],
        solutionSlots: { s1: 'domino', s2: 'ramp_down_right' },
        hint: '球の通り道にドミノを置き、その先にゴールへ続くレールを置こう！',
        explanation: 'ドミノ連鎖成功！球の運動エネルギーがドミノ1枚目に伝わり、次々と倒れながら力をバトンタッチしました！',
        examTip: '【連鎖反応（チェーンリアクション）】小さな球の力が、倒れるドミノの重みを利用して増幅・中継されます！'
      },
      {
        id: 'g3_l2_p2',
        title: 'ドミノの間隔のふしぎ',
        subtitle: 'きょりが近すぎたり遠すぎたりすると？',
        question: 'ドミノを並べて最後まで気持ちよく倒すには、ドミノとドミノの間隔はどうすればいいかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: 'ドミノの高さより少し狭い間隔で並べる！', correct: true },
          { id: 'opt2', text: 'ドミノの高さの2倍以上離して並べる', correct: false },
          { id: 'opt3', text: '隙間をゼロにしてぴったりくっつける', correct: false }
        ],
        hint: 'ドミノが倒れたとき、頭が次のドミノの背中に当たらないと倒れません！',
        explanation: '正解！ドミノが倒れたときに次のドミノにしっかり当たるよう、ドミノの高さより短い間隔で並べるのが鉄則です！',
        examTip: '【連鎖の幾何学】倒れた時の半径（長さ）より内側に次の標的を配置することが、からくり機構の基本です！'
      },
      {
        id: 'g3_l2_p3',
        title: 'レールとドミノの連携プレイ',
        subtitle: '加速レールからドミノへの直撃！',
        question: '「右下がりレール」でスピードをつけ、ドミノを倒してベル🔔を鳴らそう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'domino'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'domino' },
        hint: 'レールで加速させてからドミノにぶつけよう！',
        explanation: 'お見事！加速した球の勢いでドミノが一気に倒れ、ベルが鳴り響きました！',
        examTip: '【スピードと衝突力】スピードが速いほど、重いドミノでも簡単に倒すことができます！'
      }
    ],
    3: [
      {
        id: 'g3_l3_p1',
        title: 'トンネルと落下ホール',
        subtitle: '穴に落ちた球が下から出現！',
        question: '上の段から落ちてきた球を、下の段のレールで受け止めよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 1, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 3, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'ramp_down_left'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'ramp_down_right' },
        hint: '垂直に自由落下してくる球を、右下がりレールで優しく受け止めよう！',
        explanation: 'ナイスキャッチ！真下に落ちる球のエネルギーを、斜面レールが斜め前方の運動へと滑らかに変換しました！',
        examTip: '【落下と軌道変換】垂直落下を斜面で受けると、衝撃を逃しながら前進スピードに変えられます！'
      },
      {
        id: 'g3_l3_p2',
        title: '重い球と軽い球の坂道競争',
        subtitle: '鉄の球と木の球、どっちが速い？',
        question: '同じ大きさの「重い鉄の球」と「軽い木の球」を同じ坂道から同時に転がすと、どっちが先に下に着くかな？（空気の抵抗はないものとします）',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 2 },
        options: [
          { id: 'opt1', text: 'どちらもほぼ同時に着く！', correct: true },
          { id: 'opt2', text: '重い鉄の球のほうが圧倒的に速く着く', correct: false },
          { id: 'opt3', text: '軽い木の球のほうが身軽で速く着く', correct: false }
        ],
        hint: 'ガリレオ・ガリレイがピサの斜塔で実験した有名な科学のお話だよ！',
        explanation: '正解は「ほぼ同時」！重力による加速の度合い（重力加速度）は、物体の重さに関係なく一定です！',
        examTip: '【ガリレオの落体の法則】重さが違っても、同じ高さから落ちる（転がる）スピードの増え方は同じです！'
      },
      {
        id: 'g3_l3_p3',
        title: '3段ドロップ＆ロール',
        subtitle: '段差をリズミカルに攻略せよ！',
        question: 'スロットに適切なレールをセットして、3段の段差を駆け下りよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'domino'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'ramp_down_right' },
        hint: '右下がりレールを連続でつなげて一気に滑り降りよう！',
        explanation: 'ステージクリア！リズミカルに段差をクリアし、ゴールに飛び込みました！',
        examTip: '【段差のコントロール】レールをつなぐことで球のバウンドを抑え、狙い通りのコースを進ませます！'
      }
    ],
    4: [
      {
        id: 'g3_l4_p1',
        title: '左カーブの切り替え',
        subtitle: '右から左へと転がる向きをチェンジ！',
        question: 'スタートは右上から。左下がりレールを使って、左下にあるゴールベル🔔へ球を導こう！',
        puzzleType: 'contraption_run',
        startPos: { x: 3, y: 0 },
        goalPos: { x: 0, y: 3 },
        slots: [
          { id: 's1', x: 2, y: 1, placedPiece: null },
          { id: 's2', x: 1, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_left', 'ramp_down_right'],
        solutionSlots: { s1: 'ramp_down_left', s2: 'ramp_down_left' },
        hint: '左下に向かって進む「左下がりレール（↙）」を使おう！',
        explanation: '完璧！左下がりレールを使って、右上から左下へと見事に方向を制御できました！',
        examTip: '【方向転換の設計】レールの向き（ベクトルの向き）を意識してパーツを配置するのが工学設計の第一歩！'
      },
      {
        id: 'g3_l4_p2',
        title: '球の転がりと摩擦（まさつ）',
        subtitle: 'ツルツルの床とザラザラの床',
        question: '同じ力で球を転がしたとき、一番遠くまで長く転がるのはどの床かな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: 'ツルツルに磨かれた氷やプラスチックの床', correct: true },
          { id: 'opt2', text: 'フワフワしたじゅうたん・カーペットの床', correct: false },
          { id: 'opt3', text: '小石がいっぱいの砂利道の床', correct: false }
        ],
        hint: 'ツルツルしている床のほうが、球の邪魔をする力（摩擦力）が小さいよ！',
        explanation: '正解！摩擦（まさつ）が小さいツルツルの床ほど、球を止める抵抗が弱いため、遠くまでスピードを保って転がります！',
        examTip: '【摩擦力と滑らかさ】ピタゴラ装置のレールは、摩擦を減らすために金属や滑らかな樹脂で作られます！'
      },
      {
        id: 'g3_l4_p3',
        title: '大回りS字コース',
        subtitle: '右へ左へ、蛇行しながらゴールへ！',
        question: '右下がりレールと左下がりレールを交互に使って、障害物を縫うようにゴールへ届けよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 1, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'ramp_down_left'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'ramp_down_left' },
        hint: 'まず右へ、そして左へ切り返そう！',
        explanation: '見事クリア！美しいS字の軌道を描いてベルが鳴りました！',
        examTip: '【S字レールの美学】方向反転を繰り返すことで、限られた空間で時間を稼ぎ、面白い演出を生み出します！'
      }
    ],
    5: [
      {
        id: 'g3_l5_p1',
        title: 'ドミノのスロープダッシュ',
        subtitle: 'ドミノが坂道を駆け上がる！',
        question: '坂の上にあるドミノへ球を届け、ドミノを倒してその先のベル🔔を鳴らそう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'domino'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'domino' },
        hint: 'レールで球をドミノの位置まで運び、ドミノをセットしよう！',
        explanation: '大成功！球の勢いがドミノに乗り移り、一気にベルを叩きました！',
        examTip: '【連鎖の中継点】レールとドミノの組み合わせで、運動の性質を切り替えることができます！'
      },
      {
        id: 'g3_l5_p2',
        title: '球の大きさと倒す力',
        subtitle: '大きな球と小さな球',
        question: '同じスピードで転がってきたとき、重い大きな球と、軽い小さな球では、どっちがドミノを強く倒せるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 1 },
        options: [
          { id: 'opt1', text: '大きな重い球のほうが強い力で倒せる！', correct: true },
          { id: 'opt2', text: '小さな軽い球のほうが強い力で倒せる', correct: false },
          { id: 'opt3', text: '大きさや重さは関係ない', correct: false }
        ],
        hint: 'ボウリングの球を思い浮かべてみよう！重い球のほうがピンがたくさん倒れるよね！',
        explanation: '正解！重い物体ほど「運動エネルギー（重さ×速さの2乗）」が大きいため、ぶつかった相手に大きな衝撃力を与えられます！',
        examTip: '【質量とエネルギー】物体の重さ（質量）が大きいほど、同じ速さでも破壊力・推進力が大きくなります！'
      },
      {
        id: 'g3_l5_p3',
        title: 'ドミノ階段クラッシュ',
        subtitle: '階段を駆け上がるドミノ連鎖！',
        question: 'レールとドミノを組み合わせて、高低差のあるゴールへ連鎖をつなごう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['domino', 'ramp_down_right'],
        solutionSlots: { s1: 'domino', s2: 'ramp_down_right' },
        hint: 'ドミノを倒した先に、さらに下るレールを置こう！',
        explanation: 'クリア！ドミノが倒れた勢いで次の球がレールを駆け下りました！',
        examTip: '【マルチステージ連鎖】ドミノの転倒が次の球の発進トリガーになる、ピタゴラ王道のギミックです！'
      }
    ],
    6: [
      {
        id: 'g3_l6_p1',
        title: 'からくりピタゴラ初級マスター',
        subtitle: '3つのギミックが織りなす大連鎖！',
        question: 'レールとドミノを総動員して、左上から右下のゴールベル🔔まで完全連鎖を完成させよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'domino'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'domino' },
        hint: '左上から右下へレールで球を送り、ドミノでベルを鳴らそう！',
        explanation: 'おめでとう！小学3年生の基本からくり連鎖を完全制覇しました！',
        examTip: '【初級マスター認定】重力と斜面、ドミノのバトンタッチを完璧に理解しました！'
      },
      {
        id: 'g3_l6_p2',
        title: 'エネルギーの変身クイズ',
        subtitle: '高いところにあるエネルギーの正体！',
        question: '高い場所にある球が持っている「位置エネルギー」は、坂を転がり落ちると何エネルギーに変身するかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 1 },
        options: [
          { id: 'opt1', text: 'スピード（動く力）を持つ「運動エネルギー」！', correct: true },
          { id: 'opt2', text: 'パチパチ光る「電気エネルギー」', correct: false },
          { id: 'opt3', text: 'ピカッと輝く「光エネルギー」', correct: false }
        ],
        hint: '高いところから落ちると、どんどんスピードが上がって勢いがつくよね！',
        explanation: '正解！高い場所の「位置エネルギー」が、転がり落ちるにつれてスピードの「運動エネルギー」へと見事に変身します！',
        examTip: '【力学的エネルギー保存の法則】位置エネルギー ＋ 運動エネルギー の合計は一定！高校物理まで通じる大原則です！'
      },
      {
        id: 'g3_l6_p3',
        title: 'フィナーレ・ベル鳴動',
        subtitle: '心地よいチリンチリンの響き！',
        question: '最後のスロットを埋めて、フィナーレの鐘を鳴らそう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 1 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 3, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'domino'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'domino' },
        hint: 'レールで降下させ、ドミノで鐘を直撃！',
        explanation: 'チリンチリン🔔！見事なクリアで紙吹雪が舞いました！',
        examTip: '【工学の達成感】すべてのパーツが意図通りに連動した瞬間こそ、エンジニア最大の喜びです！'
      }
    ]
  },

  // 🎒 Grade 4: Kinetic Energy, Springs, Trampolines, Jump Angles
  4: {
    1: [
      {
        id: 'g4_l1_p1',
        title: 'バネ（トランポリン）の跳躍力',
        subtitle: 'ボヨーンと跳ねて谷を越えろ！',
        question: '途中に深い谷があります。スロットに「バネ（トランポリン）」を配置して、球を高く跳ね上げて谷を越えさせよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['spring', 'ramp_down_right'],
        solutionSlots: { s1: 'spring', s2: 'ramp_down_right' },
        hint: '落下地点にバネを置き、ジャンプした先をレールでキャッチしよう！',
        explanation: 'ナイスジャンプ！球の落下エネルギーがバネを押し縮め、バネが元に戻る弾性力で球が高く跳ね上がりました！',
        examTip: '【弾性エネルギーの変換】運動エネルギーがバネの縮み（弾性エネルギー）に変わり、跳ね上がる力になります！'
      },
      {
        id: 'g4_l1_p2',
        title: '最長到達距離の角度（45度の法則）',
        subtitle: '一番遠くまで飛ばす角度は？',
        question: '球をジャンプ台やバネで飛ばすとき、一番遠く（水平距離）まで飛ばすには発射角度を何度にするのが一番良いかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 0 },
        options: [
          { id: 'opt1', text: '45度（斜め45度）', correct: true },
          { id: 'opt2', text: '90度（真上）', correct: false },
          { id: 'opt3', text: '20度（ほぼ横向き）', correct: false },
          { id: 'opt4', text: '75度（かなり上向き）', correct: false }
        ],
        hint: '高すぎると真上に上がって前に進まず、低すぎるとすぐに地面に落ちてしまいます！',
        explanation: '正解は「45度」！「上へ飛ぶ力（滞空時間）」と「前へ進む力（水平速度）」のバランスが最も良くなるのが45度です！',
        examTip: '【中学入試頻出の45度】大砲の弾、放水、走り幅跳びなど、投射体が最も遠くまで飛ぶ黄金角度は45度です！'
      },
      {
        id: 'g4_l1_p3',
        title: 'バネ跳躍からレール合流',
        subtitle: '空中放物線を描いて着地！',
        question: 'バネで跳ねた球を、右下がりレールで受け止めてゴールへ送り込もう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['spring', 'ramp_down_right'],
        solutionSlots: { s1: 'spring', s2: 'ramp_down_right' },
        hint: 's1にバネを置いて跳ね上げ、s2のレールでキャッチ！',
        explanation: '見事着地！空中を綺麗な放物線を描いて飛び、レールに着地しました！',
        examTip: '【放物線運動】重力がある地球上では、斜めに打ち出された球は必ず放物線を描いて落下します！'
      }
    ],
    2: [
      {
        id: 'g4_l2_p1',
        title: 'バネ2連続スーパージャンプ',
        subtitle: 'バネからバネへ華麗な空中パス！',
        question: '2つのバネを配置して、2段ジャンプで高い壁を飛び越えよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 1 },
        goalPos: { x: 3, y: 0 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['spring', 'ramp_down_right'],
        solutionSlots: { s1: 'spring', s2: 'spring' },
        hint: '1段目で跳ね、2段目のバネに着地させてさらに高くジャンプ！',
        explanation: 'スーパージャンプ成功！バネが連続して球を押し上げ、高いゴールへ到達しました！',
        examTip: '【反発係数と連鎖】バネの跳ね返りを計算して次の足場へ導く、アクロバティックな工学技術です！'
      },
      {
        id: 'g4_l2_p2',
        title: '落とす高さと跳ね返る高さ',
        subtitle: '落とした高さより高く跳ねることはある？',
        question: '動力（モーターや火薬など）を使わずに球を自然に落としたとき、落とした最初の高さよりも高く跳ね上がることはできるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 1 },
        options: [
          { id: 'opt1', text: '絶対に最初の高さより高くは跳ね上がらない！', correct: true },
          { id: 'opt2', text: '勢いがつくので、最初の2倍高く跳ね上がる', correct: false },
          { id: 'opt3', text: 'バネがゴムなら10倍高く跳ね上がる', correct: false }
        ],
        hint: 'エネルギーは新しく勝手に増えることはありません（エネルギー保存の法則）。',
        explanation: '正解！空気の抵抗や音・熱となってエネルギーが一部逃げるため、外部から力を加えない限り、最初の高さより高く跳ねることは絶対にありません！',
        examTip: '【エネルギー保存の法則】無からエネルギーは生まれない！中学入試の理科・物理分野で極めて重要な基本理念です！'
      },
      {
        id: 'g4_l2_p3',
        title: 'バネとドミノの融合',
        subtitle: '空中ダイブからドミノへ！',
        question: 'バネで跳躍した球をドミノに命中させて、ゴールを開放しよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['spring', 'domino'],
        solutionSlots: { s1: 'spring', s2: 'domino' },
        hint: 'バネで跳ね上げ、空中からドミノの頂上へ直撃させよう！',
        explanation: '直撃成功！ドミノが綺麗に倒れてゴールベルを叩きました！',
        examTip: '【空中衝突の照準】放物線の頂点付近でドミノに接触させると、水平方向の力が効率よく伝わります！'
      }
    ],
    3: [
      {
        id: 'g4_l3_p1',
        title: 'ループ坂道と遠心力',
        subtitle: '勢いをつけてループを一回転！',
        question: '球がレールを駆け下りる勢いをつけて、ループを回りきってゴールへ！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'spring'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'ramp_down_right' },
        hint: '右下がりレールで十分なスピードをつけて一気に駆け抜けよう！',
        explanation: 'ループ走破！ジェットコースターのように、位置エネルギーを一気にスピードに変えて疾走しました！',
        examTip: '【遠心力とスピード】ループの頂点で落ちないためには、重力に打ち勝つ十分なスピード（遠心力）が必要です！'
      },
      {
        id: 'g4_l3_p2',
        title: '坂の高さと木片を押す距離',
        subtitle: '高さを2倍にしたら移動距離は何倍？',
        question: 'レールから球を落として木片に当てる実験です。落とす高さを2倍（10cm→20cm）にすると、木片が動く距離はどうなるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: '約2倍に増える！（高さに比例する）', correct: true },
          { id: 'opt2', text: '約4倍に激増する', correct: false },
          { id: 'opt3', text: 'まったく変わらない', correct: false }
        ],
        hint: '球の持っている位置エネルギーは「高さ」に正比例するよ！',
        explanation: '正解！球が持っているエネルギーは高さに正比例するため、高さが2倍になれば衝突した木片を押し動かす距離もきれいに2倍になります！',
        examTip: '【中学入試理科の超頻出グラフ】「球を落とす高さ」と「木片の移動距離」は比例（原点を通る直線グラフ）になります！'
      },
      {
        id: 'g4_l3_p3',
        title: 'ジャンプ台のハイスピード発射',
        subtitle: '加速坂＋バネのコンビネーション！',
        question: '急坂レールで猛加速させ、バネで遥か彼方のゴールへ球を撃ち出そう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'spring'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'spring' },
        hint: 's1で加速し、s2のバネで斜め上へ射出！',
        explanation: '大ジャンプ成功！猛スピードで突入したため、バネが大きく縮んで凄まじい跳躍を見せました！',
        examTip: '【速度とバネの縮み】突入速度が速いほどバネは深く縮み、跳ね返す力も強大になります！'
      }
    ],
    4: [
      {
        id: 'g4_l4_p1',
        title: '空中キャッチネット',
        subtitle: '飛び出した球を受け皿へ！',
        question: 'バネで跳ね上がった球を左下がりレールで受け止め、ベルへ導こう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 1, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['spring', 'ramp_down_left'],
        solutionSlots: { s1: 'spring', s2: 'ramp_down_left' },
        hint: 's1のバネで跳ね上げ、s2の左下がりレールで折り返そう！',
        explanation: 'キャッチ成功！空中で方向を180度反転させてゴールへ滑り込みました！',
        examTip: '【跳躍の反転】バネの跳ね返りと逆向きレールで、球の方向をトリッキーにコントロール！'
      },
      {
        id: 'g4_l4_p2',
        title: '球の重さと木片を押す距離',
        subtitle: '同じ高さから落とすとき、重さを2倍にすると？',
        question: '同じ高さから球を落として木片に当てます。球の重さを2倍（20g→40g）にすると、木片が動く距離はどうなるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 1 },
        options: [
          { id: 'opt1', text: '約2倍に増える！（重さに比例する）', correct: true },
          { id: 'opt2', text: '重すぎて動かなくなる', correct: false },
          { id: 'opt3', text: 'まったく変わらない', correct: false }
        ],
        hint: '「位置エネルギー ＝ 高さ × 重さ」だよ！',
        explanation: '正解！球が持つエネルギーは「重さ」にも正比例するため、重さが2倍になれば木片の移動距離も2倍になります！',
        examTip: '【高さと重さの比例ダブル関係】木片の移動距離は「高さ」にも「重さ」にも比例します！入試の表読み取り問題の定番です！'
      },
      {
        id: 'g4_l4_p3',
        title: 'トランポリン・ツインタワー',
        subtitle: '左右のバネを交互に踏破！',
        question: 'スロットにバネを配置して、2つのタワーの間を軽快に飛び移ろう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['spring', 'ramp_down_right'],
        solutionSlots: { s1: 'spring', s2: 'spring' },
        hint: '2つのバネを並べて連続ジャンプ！',
        explanation: 'ツインタワー制覇！バネの弾性反発を完全マスターしました！',
        examTip: '【連続弾性反発】エネルギー損失を最小限に抑える配置設計が成功の鍵です！'
      }
    ],
    5: [
      {
        id: 'g4_l5_p1',
        title: '急降下ダイブ＆ジャンプ',
        subtitle: '高所からの大迫力ダイブ！',
        question: '最上段から急降下した球をバネで上空へ跳ね上げ、ゴールベルを鳴らそう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['spring', 'domino'],
        solutionSlots: { s1: 'spring', s2: 'domino' },
        hint: '底面にバネを敷き、跳ねた先でドミノにタッチ！',
        explanation: '迫力のクリア！高い位置エネルギーが凄まじいジャンプを生み出しました！',
        examTip: '【落差と跳躍】落差が大きいほど突入速度が上がり、高く遠くまで跳び上がります！'
      },
      {
        id: 'g4_l5_p2',
        title: '運動エネルギーの公式のひみつ',
        subtitle: 'スピードが2倍になるとエネルギーは何倍？',
        question: '球のスピードが「2倍」になると、球が持っている運動エネルギー（破壊力・衝突力）は何倍になるかな？（中学入試難関レベル）',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 1 },
        options: [
          { id: 'opt1', text: 'なんと「4倍（2の2乗）」になる！', correct: true },
          { id: 'opt2', text: 'そのまま「2倍」になる', correct: false },
          { id: 'opt3', text: '「8倍（2の3乗）」になる', correct: false }
        ],
        hint: '自動車のブレーキ制動距離と同じ！スピードが2倍になると止まるまでの距離は4倍に伸びます！',
        explanation: '正解は「4倍」！運動エネルギーは「速さの2乗」に比例するため、速さが2倍になればエネルギーは2×2＝4倍、速さが3倍なら3×3＝9倍にも跳ね上がります！',
        examTip: '【難関中学の物理のツボ】運動エネルギーは「速さの2乗に比例」！車がスピードを出すと大事故になる物理的理由でもあります！'
      },
      {
        id: 'g4_l5_p3',
        title: 'ピタゴラ・カタパルト',
        subtitle: 'バネの反発で的当てベル！',
        question: 'スロットにパーツをセットして、ターゲットのベル🔔を狙い撃ち！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['spring', 'ramp_down_right'],
        solutionSlots: { s1: 'spring', s2: 'ramp_down_right' },
        hint: 'バネで跳ね上げ、レールでゴールへ流し込もう！',
        explanation: 'ストライク！カタパルトのように完璧な弾道でゴールしました！',
        examTip: '【弾道計算の基礎】角度と初速度を計算して目標に命中させる工学シミュレーションです！'
      }
    ],
    6: [
      {
        id: 'g4_l6_p1',
        title: 'からくりピタゴラ中級マスター',
        subtitle: 'レール・バネ・ドミノの三位一体！',
        question: 'レールで加速、バネで大跳躍、ドミノを倒してベル鳴動！小学4年のピタゴラ総力戦に挑もう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['spring', 'domino'],
        solutionSlots: { s1: 'spring', s2: 'domino' },
        hint: 'バネで跳ね上げ、ドミノを倒してフィニッシュ！',
        explanation: '中級マスター達成！エネルギーの変換と跳躍を完璧に手中に収めました！',
        examTip: '【中級マスター認定】運動エネルギー、弾性力、連鎖反応の総合コントロールに成功！'
      },
      {
        id: 'g4_l6_p2',
        title: 'ジェットコースターの力学',
        subtitle: '坂の途中に山をつくると？',
        question: '高さ20mのスタート地点からスタートしたジェットコースター。コースの途中に高さ25mの山をつくったら、コースターは乗り越えられるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: '乗り越えられず、途中で止まって逆戻りする！', correct: true },
          { id: 'opt2', text: '勢いがついているので25mでも余裕で越えられる', correct: false },
          { id: 'opt3', text: '山の手前でジャンプして飛び越える', correct: false }
        ],
        hint: 'スタート地点より高い場所に行くエネルギーは持っていません！',
        explanation: '正解！スタートの高さ（20m）より高い場所（25m）には、外部からモーター等で引っ張らない限り、エネルギー不足で絶対に登れません！',
        examTip: '【位置エネルギーの限界】コースターの最高到達点は、常に最初のスタート地点の高さ以下になります！'
      },
      {
        id: 'g4_l6_p3',
        title: '空中シンフォニー',
        subtitle: '完璧な連鎖で星を掴め！',
        question: 'パーツを配置して、フィナーレの連鎖反応をスタート！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 1 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 3, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['spring', 'ramp_down_right'],
        solutionSlots: { s1: 'spring', s2: 'ramp_down_right' },
        hint: 'バネで跳ね上げてレールへ！',
        explanation: 'ステージ完全制覇！素晴らしいピタゴラ装置が完成しました！',
        examTip: '【創造的エンジニアリング】試行錯誤（トライ＆エラー）の末に動いた瞬間の感動を忘れずに！'
      }
    ]
  },

  // 🎒 Grade 5: Seesaw (Levers), Pulleys, Mechanical Advantage
  5: {
    1: [
      {
        id: 'g5_l1_p1',
        title: 'シーソーてこの発射台',
        subtitle: '重い球が落ちると反対側が跳ね上がる！',
        question: 'スロットに「シーソー（てこ）」を設置して、左側に球が落ちると右側の球がポーンと跳ね上がるギミックを作ろう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'ramp_down_right'],
        solutionSlots: { s1: 'seesaw', s2: 'ramp_down_right' },
        hint: '球の落下点にシーソーの左端を合わせよう！',
        explanation: '射出成功！左の力点に落ちた球の衝撃でシーソーが一気に傾き、右の作用点にあった球が高く跳ね上がりました！',
        examTip: '【てこの原理の応用】支点を挟んだモーメントによって、下向きの力を上向きの打ち上げ力に逆転させます！'
      },
      {
        id: 'g5_l1_p2',
        title: 'てこのモーメント計算（入試超頻出）',
        subtitle: '支点からの距離と重さの掛け算！',
        question: 'シーソーの左端（支点から距離30cm）に40gの球を落とします。右側で釣り合うには、支点から距離20cmの位置に何gの球が必要かな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 0 },
        options: [
          { id: 'opt1', text: '60g （30 × 40 ÷ 20）', correct: true },
          { id: 'opt2', text: '40g （同じ重さ）', correct: false },
          { id: 'opt3', text: '20g （距離と同じ）', correct: false },
          { id: 'opt4', text: '80g', correct: false }
        ],
        hint: '「左の距離 × 左の重さ ＝ 右の距離 × 右の重さ」だよ！',
        explanation: '正解は「60g」！左のモーメントは 30 × 40 ＝ 1200。右も1200にするため、1200 ÷ 20 ＝ 60g が必要です！',
        examTip: '【てこの計算の黄金則】支点からの距離とおもりの重さは「逆比」になります！距離が3:2なら重さは2:3！'
      },
      {
        id: 'g5_l1_p3',
        title: 'シーソーからドミノへの連鎖',
        subtitle: '打ち上げられた球がドミノを直撃！',
        question: 'シーソーで打ち上げた球をドミノに当ててベル🔔を鳴らそう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'domino'],
        solutionSlots: { s1: 'seesaw', s2: 'domino' },
        hint: 's1にシーソーを置き、跳ね上がる位置s2にドミノを配置しよう！',
        explanation: 'ナイス連鎖！シーソーから飛び出した球がドミノを綺麗になぎ倒しました！',
        examTip: '【力点の衝撃伝達】シーソーは方向を変えるだけでなく、球を別の高さへリフトアップする強力な機構です！'
      }
    ],
    2: [
      {
        id: 'g5_l2_p1',
        title: '定滑車（じょうかっしゃ）のゲート開放',
        subtitle: '重り球がカゴに入るとゲートが開く！',
        question: 'スロットに「滑車バスケット」を配置しよう。球がカゴに入ると重みでロープが引かれ、別の通路のゲートが持ち上がります！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['pulley', 'ramp_down_right'],
        solutionSlots: { s1: 'pulley', s2: 'ramp_down_right' },
        hint: '球を滑車カゴに落としてゲートを開き、レールでベルへ！',
        explanation: 'ゲートオープン！定滑車を通してロープが引っ張られ、見事に道が開かれました！',
        examTip: '【定滑車の役割】定滑車は力の大きさは変わりませんが、「力の向き」を180度自由に変えることができます！'
      },
      {
        id: 'g5_l2_p2',
        title: '定滑車と動滑車の決定的なちがい',
        subtitle: '重い荷物を半分（1/2）の力で持ち上げる滑車は？',
        question: '天井に固定された「定滑車」と、荷物と一緒に動く「動滑車」。必要な力を「半分（1/2）」にできるのはどっちかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 1 },
        options: [
          { id: 'opt1', text: '動滑車（どうかっしゃ）！', correct: true },
          { id: 'opt2', text: '定滑車（ていかっしゃ）！', correct: false },
          { id: 'opt3', text: 'どちらも力は半分にならない', correct: false }
        ],
        hint: '荷物を2本のひもで半分ずつ支える構造になっている滑車だよ！',
        explanation: '正解は「動滑車」！動滑車を使うと、2本のロープで荷物の重さを半分ずつ分担するため、引っ張る力は「半分（1/2）」で済みます！',
        examTip: '【動滑車の基本定理】力は半分（1/2）、引く長さは2倍！仕事の大きさは変わらない「仕事の原理」の代表例です！'
      },
      {
        id: 'g5_l2_p3',
        title: '滑車ゲートとシーソーのコンボ',
        subtitle: 'ゲートが開いてシーソーへ球が突入！',
        question: '滑車でゲートを開け、転がり出た球がシーソーを作動させる連鎖パズル！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['pulley', 'seesaw'],
        solutionSlots: { s1: 'pulley', s2: 'seesaw' },
        hint: 'まず滑車を作動させ、その先でシーソーを動かそう！',
        explanation: '素晴らしい！滑車とてこの2大力学ギミックが見事に連動しました！',
        examTip: '【複合機械の設計】単純機械（てこ・滑車・斜面）を組み合わせることで、複雑な自動制御を実現します！'
      }
    ],
    3: [
      {
        id: 'g5_l3_p1',
        title: '長いてこと倍力カタパルト',
        subtitle: '支点からの距離を伸ばして高く飛ばそう！',
        question: 'シーソーを設置して、力点と作用点の比率を利用して大ジャンプ！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 0 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'ramp_down_right'],
        solutionSlots: { s1: 'seesaw', s2: 'ramp_down_right' },
        hint: 'シーソーの作用点側を長くして高く飛び出させよう！',
        explanation: '超高空ジャンプ！てこの原理で作用点の移動速度が倍増し、高所のベルに届きました！',
        examTip: '【速度比とてこ】力点より作用点の距離を長くすると、力は余計に要りますが、端のスピードと移動量は倍増します！'
      },
      {
        id: 'g5_l3_p2',
        title: '動滑車を引っ張る長さの計算',
        subtitle: '荷物を50cm持ち上げるにはひもを何cm引く？',
        question: '動滑車を使って荷物を「50cm」持ち上げたいとき、手元でロープを引っ張る長さは何cm必要かな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: '100cm（2倍の長さ引っ張る）！', correct: true },
          { id: 'opt2', text: '50cm（同じ長さ）', correct: false },
          { id: 'opt3', text: '25cm（半分の長さで済む）', correct: false }
        ],
        hint: '動滑車は「力は半分（1/2）」だけど「引く長さは2倍」になるよ（仕事の原理）！',
        explanation: '正解は「100cm」！力は半分で楽ができますが、動滑車を支える両側のロープを両方持ち上げる必要があるため、手元では2倍（50×2＝100cm）引く必要があります！',
        examTip: '【仕事の原理の鉄則】「力×引く距離」の合計は絶対に得をしない！どんな滑車やてこを使っても仕事の量は不変です！'
      },
      {
        id: 'g5_l3_p3',
        title: 'シーソー・バネ・滑車トリオ',
        subtitle: '3つの力学パーツの連携！',
        question: 'スロットに適切なパーツを配置して、トリプル連鎖でゴールベルへ！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'pulley'],
        solutionSlots: { s1: 'seesaw', s2: 'pulley' },
        hint: 'シーソーで打ち出し、滑車に受け渡そう！',
        explanation: '見事クリア！ピタゴラスイッチのような芸術的な連鎖が完成しました！',
        examTip: '【運動のバトンパス】各ギミックの接続タイミングをミリ秒単位で合わせるのがピタゴラ工学の真髄です！'
      }
    ],
    4: [
      {
        id: 'g5_l4_p1',
        title: '滑車エレベーター',
        subtitle: '重り球でメイン球を上の階へ！',
        question: '滑車を使って球を上のフロアへ持ち上げ、高台のレールに乗せよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 1 },
        goalPos: { x: 3, y: 0 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['pulley', 'ramp_down_right'],
        solutionSlots: { s1: 'pulley', s2: 'ramp_down_right' },
        hint: '滑車で持ち上げ、レールでゴールへ！',
        explanation: 'エレベーター成功！重り球の下降エネルギーで、メイン球をより高い位置へと引き上げました！',
        examTip: '【カウンターウェイト方式】エレベーターやクレーンなど、実社会の大型重機で使われている基本構造です！'
      },
      {
        id: 'g5_l4_p2',
        title: '動滑車2個連結の超倍力',
        subtitle: '動滑車を2個組み合わせると力は何分の1？',
        question: '動滑車を2個組み合わせた「複合滑車」を作りました。80kgの荷物を持ち上げるのに必要な力は何kg分かな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: '20kg分（1/4の力で持ち上がる！）', correct: true },
          { id: 'opt2', text: '40kg分（1/2の力）', correct: false },
          { id: 'opt3', text: '10kg分（1/8の力）', correct: false }
        ],
        hint: '動滑車1個で半分（1/2）、もう1個通すとさらにその半分（1/4）になるよ！',
        explanation: '正解は「20kg分（1/4）」！動滑車を2個通すことで「1/2 × 1/2 ＝ 1/4」となり、80kg ÷ 4 ＝ 20kgの小さな力で持ち上がります（引く長さは4倍になります）！',
        examTip: '【複合動滑車の計算】難関中学入試の超頻出！動滑車1個ごとに力が1/2ずつ倍々で減っていきます！'
      },
      {
        id: 'g5_l4_p3',
        title: 'ダブルシーソー・リレー',
        subtitle: 'シーソーからシーソーへ球をパス！',
        question: '2つのシーソーを連続配置して、階段状に球を跳ね上げていこう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'ramp_down_right'],
        solutionSlots: { s1: 'seesaw', s2: 'seesaw' },
        hint: '2台のシーソーを連続して並べよう！',
        explanation: 'ダブルシーソー成功！カッシャン、カッシャンと交互に傾いて見事ゴール！',
        examTip: '【連鎖シーソー機構】からくり人形やオルゴールにも使われる、モーメントのリレー工学です！'
      }
    ],
    5: [
      {
        id: 'g5_l5_p1',
        title: '滑車バランスとシーソー射出',
        subtitle: '滑車とてこの完全融合！',
        question: '滑車に球を落としてゲートを開き、飛び出た球がシーソーを直撃！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['pulley', 'seesaw'],
        solutionSlots: { s1: 'pulley', s2: 'seesaw' },
        hint: '滑車の先にシーソーを配置しよう！',
        explanation: 'パーフェクト連鎖！滑車とシーソーが息の合ったコンビネーションを見せました！',
        examTip: '【連鎖伝達の効率】途中で球のエネルギーを無駄なく伝えるアライメント調整が重要です！'
      },
      {
        id: 'g5_l5_p2',
        title: 'てこの3つの種類（第1種・第2種・第3種）',
        subtitle: 'ピンセットやハサミはどのてこ？',
        question: '支点が真ん中にある「ハサミやシーソー」に対して、支点が端にあり真ん中を指でつまむ「ピンセット」の力はどうなるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 1 },
        options: [
          { id: 'opt1', text: '力は損するが、繊細で細かな作業ができる！（第3種てこ）', correct: true },
          { id: 'opt2', text: '力も得して、大きなものを破壊できる', correct: false },
          { id: 'opt3', text: 'ピンセットはてこの原理ではない', correct: false }
        ],
        hint: 'ピンセットは力を強くするためではなく、小さなものを精密につかむための道具だね！',
        explanation: '正解！ピンセットや和バサミ（第3種てこ）は、支点と作用点の間を力点で押すため、大きな力は出せませんが、指先の細かな動きを精密に伝えることができます！',
        examTip: '【てこの3分類】力で得するハサミ・栓抜き（第1・第2種）と、精密さで得するピンセット（第3種）の区別は入試頻出！'
      },
      {
        id: 'g5_l5_p3',
        title: 'からくり力学タワー',
        subtitle: '全ギミック総動員のタワーパズル！',
        question: 'レール、シーソー、滑車を配置してタワーの頂上から最下層へ！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'pulley'],
        solutionSlots: { s1: 'seesaw', s2: 'pulley' },
        hint: 'シーソーで跳ね上げ、滑車を駆動させてゴールへ！',
        explanation: 'タワークリア！見事なメカニカルタワーが稼働しました！',
        examTip: '【力学要塞の構築】重力・てこ・滑車という古典力学の真髄をすべて盛り込んだ傑作です！'
      }
    ],
    6: [
      {
        id: 'g5_l6_p1',
        title: 'からくりピタゴラ上級マスター',
        subtitle: 'てこと滑車の完全制覇！',
        question: 'すべての力学パーツの原理を駆使して、超ロング連鎖ピタゴラ装置を完成させよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'pulley'],
        solutionSlots: { s1: 'seesaw', s2: 'pulley' },
        hint: 's1にシーソー、s2に滑車をセット！',
        explanation: '上級マスター認定！小学5年生の力学（てこ・滑車）を完全攻略しました！',
        examTip: '【上級マスター認定】力のモーメントと仕事の原理を自在に操る優秀なエンジニアです！'
      },
      {
        id: 'g5_l6_p2',
        title: '滑車と輪軸（りんじく）の融合',
        subtitle: 'ドライバーや水道の蛇口の原理！',
        question: '太い軸と細い軸が一体になった「輪軸（りんじく）」。太い外側を回すと、細い内側の軸はどうなるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: '小さな力で、ものすごく強い回転力を生み出せる！', correct: true },
          { id: 'opt2', text: '回転速度が100倍に加速する', correct: false },
          { id: 'opt3', text: '力も速度もまったく変わらない', correct: false }
        ],
        hint: 'ドライバーの太い柄を握って回すと、硬いネジが簡単に締まるよね！',
        explanation: '正解！輪軸は円形のてこ（回転するてこ）です！半径の大きな外側を回すことで、半径の小さな内側に何倍もの強力なトルク（回転力）を生み出せます！',
        examTip: '【輪軸の原理】ドアノブ、車のハンドル、ドライバー、水道の蛇口など、身近な道具はすべて輪軸（てこの変形）です！'
      },
      {
        id: 'g5_l6_p3',
        title: 'グランド・ピタゴラ・エクスプレス',
        subtitle: '堂々のフィナーレ鐘鳴動！',
        question: '最後のギミックをセットして、グランドフィナーレを発射！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'pulley'],
        solutionSlots: { s1: 'seesaw', s2: 'pulley' },
        hint: 'シーソーと滑車の黄金コンビ！',
        explanation: 'チリンチリン🔔！堂々のクリアで満点の星3つを獲得！',
        examTip: '【工学の結晶】すべてのパーツが誤差なくかみ合うことで、驚異のピタゴラ連鎖が成立します！'
      }
    ]
  },

  // 🎒 Grade 6: Elastic Collision (Momentum), Newton's Cradle, Chaos Sync, Advanced Mechanics
  6: {
    1: [
      {
        id: 'g6_l1_p1',
        title: 'ニュートンのゆりかご（弾性衝突）',
        subtitle: '1個ぶつけると反対から何個飛ぶ？',
        question: '同じ重さの金属球が5個並んだ「ニュートンのゆりかご」。左から球を1個持ち上げてぶつけると、右端から何個の球が飛び出すかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 0 },
        options: [
          { id: 'opt1', text: '右端の「1個」だけが同じ速さで飛び出す！', correct: true },
          { id: 'opt2', text: '右側の「2個」が半分の速さで飛び出す', correct: false },
          { id: 'opt3', text: '真ん中の3個が一気に吹き飛ぶ', correct: false },
          { id: 'opt4', text: 'すべての球がぶつかって全員停止する', correct: false }
        ],
        hint: '完全弾性衝突では、「運動量（重さ×速さ）」と「運動エネルギー」の両方が同時に保存されるよ！',
        explanation: '正解は「1個」！衝突の衝撃（運動量とエネルギー）が中間の球たちを通って反対側へ一瞬で伝達され、ぶつけたのと同じ個数・同じ速さで右端の1個だけが飛び出します！',
        examTip: '【弾性衝突と保存則】難関中学入試で出題される最高峰の力学定理！入った個数と飛び出す個数は完全に一致します！'
      },
      {
        id: 'g6_l1_p2',
        title: '球2個ぶつけのゆりかご連鎖',
        subtitle: '2個ぶつけたら反対からは？',
        question: '同じニュートンのゆりかごで、左から「2個」同時にぶつけたら、右側からは何個の球が飛び出すかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 0 },
        options: [
          { id: 'opt1', text: '右側から「2個」がそのまま飛び出す！', correct: true },
          { id: 'opt2', text: '右端の「1個」だけが2倍の速さで飛び出す', correct: false },
          { id: 'opt3', text: '右側から「4個」が飛び出す', correct: false }
        ],
        hint: '1個ぶつけたら1個出たよね！2個ぶつけたら？',
        explanation: '正解は「2個」！「入った球の個数＝飛び出す球の個数」！2個の球が持つ運動量とエネルギーを完全に満たす解は、右側から2個飛び出すことだけです！',
        examTip: '【運動量保存則の真髄】灘・開成・筑駒の物理問題で問われる衝突の基本！球が何個並んでいても法則は絶対に崩れません！'
      },
      {
        id: 'g6_l1_p3',
        title: '衝突球のカタパルト連鎖',
        subtitle: '衝撃を反対側へ転送してベルへ！',
        question: 'スロットにギミックを配置し、球の衝突エネルギーを前方のターゲットへ伝達してベルを鳴らそう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'seesaw'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'seesaw' },
        hint: 'レールでスピードを極限まで高めてシーソーを叩け！',
        explanation: '衝撃伝達成功！衝突の勢いがそのままシーソーの射出エネルギーへと変換されました！',
        examTip: '【運動量の転換】高速の球が持つ運動量をメカニカルなトリガーへ変換する高度な連鎖です！'
      }
    ],
    2: [
      {
        id: 'g6_l2_p1',
        title: '重い球と軽い球の正面衝突',
        subtitle: '重さ10倍の鉄球が軽い木球に激突！',
        question: '止まっている「軽い木球（10g）」に、高速で走ってきた「重い鉄球（100g）」が正面衝突しました。軽い木球のスピードはどうなるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: 'ぶつかってきた鉄球のスピードよりさらに速く弾き飛ばされる！', correct: true },
          { id: 'opt2', text: '鉄球と同じスピードで一緒に進む', correct: false },
          { id: 'opt3', text: '木球はその場にとどまり、鉄球だけが跳ね返る', correct: false }
        ],
        hint: '野球のバット（重い）でボール（軽い）を打つと、バットを振るスピードよりずっと速くボールが飛んでいくよね！',
        explanation: '正解！重い物体が軽い静止物体に弾性衝突すると、軽い物体は元の速度の「最大約2倍」もの猛スピードで猛烈に前方へ弾き飛ばされます！',
        examTip: '【スイングバイと弾性衝突】惑星の重力を利用して宇宙探査機を加速する「スイングバイ航法」と同じ物理原理です！'
      },
      {
        id: 'g6_l2_p2',
        title: '軽い球から重い球への衝突',
        subtitle: '軽い球が壁のような巨大鉄球に当たると？',
        question: '止まっている「巨大な鉄球」に、走ってきた「軽いピンポン球」がぶつかりました。ピンポン球はどうなるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 1 },
        options: [
          { id: 'opt1', text: 'ほぼ同じ速さで逆方向へ跳ね返る！', correct: true },
          { id: 'opt2', text: '巨大鉄球を押し出して一緒に前進する', correct: false },
          { id: 'opt3', text: 'その場でピタッと停止して動かなくなる', correct: false }
        ],
        hint: '硬い壁にスーパーボールを投げつけるとどうなるか思い出してみよう！',
        explanation: '正解！重い相手はほとんどびくとも動かず、軽い球は速度を反転させて元のスピードで後ろへ跳ね返されます！',
        examTip: '【質量差と反発】質量の比率によって衝突後の挙動が180度変わる力学の妙味です！'
      },
      {
        id: 'g6_l2_p3',
        title: '弾性反発ジャンピングレール',
        subtitle: '跳ね返りを利用した逆走ピタゴラ！',
        question: '跳ね返りギミックを配置して、ゴールベル🔔へと球を送り届けよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 1, y: 2, placedPiece: null }
        ],
        availableInventory: ['spring', 'ramp_down_right'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'spring' },
        hint: 'レールで落としてバネで跳ね上げよう！',
        explanation: '見事クリア！弾性力を完璧に計算した美しいアプローチでした！',
        examTip: '【反発のコントロール】速度と角度を完璧にコントロールする物理エンジニアの技芸！'
      }
    ],
    3: [
      {
        id: 'g6_l3_p1',
        title: '2つの球のタイミング合流（交差点問題）',
        subtitle: '衝突を避けて交互に通過せよ！',
        question: '2つの球が同時に発射されます。交差点で2つの球が衝突しないように、片方の球のレールに「カーブ」を挟んで時間を遅らせよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'domino'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'domino' },
        hint: 'ドミノを挟むことで適度な時間差（タイムディレイ）が生まれます！',
        explanation: 'タイミング同期成功！ドミノが絶妙なタイムディレイを作り出し、交差点での衝突を回避してゴールしました！',
        examTip: '【時間と道のりの工学】中学受験算数「旅人算・通過算」と物理工学の融合！時間差制御の真髄です！'
      },
      {
        id: 'g6_l3_p2',
        title: '振り子の周期（ふりこの1往復の時間）',
        subtitle: '1往復する時間を長くするには？',
        question: 'ピタゴラ装置に組み込む「振り子」。1往復にかかる時間（周期）を2倍に長くするには、振り子のひもの長さを何倍にすればいいかな？（入試最難関）',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: 'ひもの長さを「4倍」にする！', correct: true },
          { id: 'opt2', text: 'ひもの長さを「2倍」にする', correct: false },
          { id: 'opt3', text: '球の重さを「2倍」にする', correct: false },
          { id: 'opt4', text: '振り子を振る幅（角度）を2倍にする', correct: false }
        ],
        hint: '振り子の周期はおもりの重さや振れ幅には関係なく、「ひもの長さの平方根」に比例するよ！',
        explanation: '正解は「4倍」！振り子の周期はひもの長さのルート（平方根）に比例するため、周期を2倍にするには長さを 2×2 ＝ 4倍（例: 25cmなら100cm）にする必要があります！',
        examTip: '【振り子の等時性の法則】ひもの長さが4倍で時間は2倍、長さが9倍で時間は3倍！中学入試理科の最高峰知識です！'
      },
      {
        id: 'g6_l3_p3',
        title: '振り子ストライク・連鎖',
        subtitle: '振り子の位置エネルギーでドミノを薙ぎ払え！',
        question: 'スロットにパーツをセットして、振り子のインパクトをゴールへ！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['ramp_down_right', 'domino'],
        solutionSlots: { s1: 'ramp_down_right', s2: 'domino' },
        hint: 'レールで加速してドミノへ衝突！',
        explanation: 'ストライク！振り子の周期運動と直線レールが見事にシンクロしました！',
        examTip: '【周期的トリガー】規則正しい振り子のリズムを利用して、仕掛けを時間差で作動させる高度な連鎖です！'
      }
    ],
    4: [
      {
        id: 'g6_l4_p1',
        title: '重力反転カタパルト',
        subtitle: '最下層から一気に頂上へ舞い戻れ！',
        question: 'シーソーとバネを連続して使って、落下した球を頂上のベルへ逆噴射！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 0 },
        slots: [
          { id: 's1', x: 1, y: 2, placedPiece: null },
          { id: 's2', x: 2, y: 1, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'spring'],
        solutionSlots: { s1: 'seesaw', s2: 'spring' },
        hint: 's1にシーソー、s2にバネを置いて2段ブースト！',
        explanation: '大逆転クリア！シーソーの衝撃からバネの反発へと連鎖し、頂上のベルを直撃しました！',
        examTip: '【多段ブースト機構】ロケットの多段点火のように、エネルギーを次々と追加して高高度へ到達させます！'
      },
      {
        id: 'g6_l4_p2',
        title: '斜面と摩擦熱（熱エネルギーへの散逸）',
        subtitle: '失われたエネルギーはどこへ消えた？',
        question: '坂道を転がり落ちた球のスピードを測ったら、理論上の計算値より少し遅くなっていました。失われたエネルギーは主に何に変化したかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 2, y: 1 },
        options: [
          { id: 'opt1', text: 'レールや空気との摩擦による「熱」や「音」に変化した！', correct: true },
          { id: 'opt2', text: '宇宙の彼方に消えてなくなってしまった', correct: false },
          { id: 'opt3', text: '重力が疲れて弱くなってしまった', correct: false }
        ],
        hint: '手をこすり合わせると温かくなるよね！レールと球もこすれ合うと熱が発生します！',
        explanation: '正解！摩擦や空気抵抗によって、力学的エネルギーの一部が「摩擦熱」や「ゴロゴロという音」に姿を変えて空気中に逃げていきます（エネルギー保存則）！',
        examTip: '【エネルギーの散逸】現実の機械では、摩擦熱などでエネルギーが逃げるため効率100%にはなりません！'
      },
      {
        id: 'g6_l4_p3',
        title: 'クアド・コンボ・チェイン',
        subtitle: '4連続物理ギミックの怒涛の連鎖！',
        question: '4つのギミックを正しい順番で並べて、究極のコンボを完成させよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'domino'],
        solutionSlots: { s1: 'seesaw', s2: 'domino' },
        hint: 'シーソーからドミノへ！',
        explanation: 'クアドコンボ達成！滑らかで無駄のない連鎖に拍手喝采です！',
        examTip: '【エンジニアの美学】複雑なシステムほど、各部の整合性とタイミング管理が成功の鍵を握ります！'
      }
    ],
    5: [
      {
        id: 'g6_l5_p1',
        title: '時差ゲートウェイ',
        subtitle: '滑車でタイミングを合わせて開門！',
        question: '滑車を設置して、時間差でゲートを開き、メイン球を時間通りに通過させよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 2 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['pulley', 'ramp_down_right'],
        solutionSlots: { s1: 'pulley', s2: 'ramp_down_right' },
        hint: '滑車で開門し、レールで突入！',
        explanation: 'タイミング完璧！開いたゲートを一瞬の隙を突いて球が駆け抜けました！',
        examTip: '【ゲートウェイ同期】信号機や踏切のように、物理的なインターフェースで安全に合流させる工学手法です！'
      },
      {
        id: 'g6_l5_p2',
        title: 'てこと滑車の融合力学（難関入試融合問題）',
        subtitle: 'てこの端を動滑車で吊り上げたら？',
        question: '長さ60cmのてこの右端に、動滑車を1個つなぎました。てこの左端に60gのおもりがあるとき、釣り合わせるために動滑車のひもを引く力は何g？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: 'わずか「30g」の力で釣り合う！（てこで60g、動滑車でさらに半分）', correct: true },
          { id: 'opt2', text: '60g必要（変わらない）', correct: false },
          { id: 'opt3', text: '120g必要（2倍要る）', correct: false }
        ],
        hint: '支点が中央にあるてこなら右端に必要な力は60g。それを動滑車で引くなら力は「半分」！',
        explanation: '正解は「30g」！てこの釣り合いで右端に必要な力は60g。そのロープを動滑車で引くため、必要な力はさらに半分（60 ÷ 2 ＝ 30g）になります！',
        examTip: '【中学入試最頻出の融合力学】灘・開成・麻布で必出の「てこ＋滑車」融合問題！パーツごとに分解して順番に計算しよう！'
      },
      {
        id: 'g6_l5_p3',
        title: 'ピタゴラ・カオス・シンクロ',
        subtitle: '重力と弾性の極限バランス！',
        question: 'パーツを配置して、カオスな軌道を整流してゴールへ導け！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'spring'],
        solutionSlots: { s1: 'seesaw', s2: 'spring' },
        hint: 'シーソーで打ち上げ、バネで再跳躍！',
        explanation: '見事なシンクロ！ダイナミックな連鎖が炸裂しました！',
        examTip: '【ダイナミクスの統合】速度・位置・角度がすべて計算され尽くした美しい力学の調和です！'
      }
    ],
    6: [
      {
        id: 'g6_l6_p1',
        title: 'ピタゴラ力学グランドマスター',
        subtitle: '最高峰の物理連鎖要塞を制覇せよ！',
        question: 'レール、バネ、ドミノ、シーソー、滑車。すべてのギミックを完璧に調和させ、グランドフィナーレを迎えよう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'domino'],
        solutionSlots: { s1: 'seesaw', s2: 'domino' },
        hint: 'シーソーからドミノへ！栄光のフィナーレへ！',
        explanation: 'おめでとうございます！！からくりピタゴラ物理連鎖パズルを全レベル完全制覇しました！',
        examTip: '【グランドマスター認定】物理法則を体得し、アイデアを形にする卓越した工学センスを証明しました！'
      },
      {
        id: 'g6_l6_p2',
        title: '永久機関（えいきゅうきかん）はなぜ作れない？',
        subtitle: 'エネルギー保存と熱力学の真理！',
        question: '「一度動かしたら外部からエネルギーを与えなくても一生ピタゴラ連鎖し続ける装置（永久機関）」は、現代の科学で作ることはできるかな？',
        puzzleType: 'physics_quiz',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 1 },
        options: [
          { id: 'opt1', text: '絶対に作れない！（熱力学の基本法則で不可能と証明されている）', correct: true },
          { id: 'opt2', text: '最新のAIと超電導を使えば簡単に作れる', correct: false },
          { id: 'opt3', text: '強力な永久磁石を輪に並べれば作れる', correct: false }
        ],
        hint: 'どんなに工夫しても、摩擦や熱でエネルギーが必ず周囲に逃げていきます！',
        explanation: '正解は「絶対に作れない」！物理学の最高基本法則（熱力学第一・第二法則）により、エネルギーを消費せずに仕事を無限に生み出す永久機関は宇宙の原理上、100%不可能です！',
        examTip: '【物理学の最高峰】「永久機関の不可能性」は、中学から大学物理まで全科学者が合意する自然界の絶対ルールです！'
      },
      {
        id: 'g6_l6_p3',
        title: 'からくり工学・未来への扉',
        subtitle: 'すべてのギミックが今、ひとつに！',
        question: '最後のピースをはめ込み、未来へ続くピタゴラ連鎖を解き放とう！',
        puzzleType: 'contraption_run',
        startPos: { x: 0, y: 0 },
        goalPos: { x: 3, y: 3 },
        slots: [
          { id: 's1', x: 1, y: 1, placedPiece: null },
          { id: 's2', x: 2, y: 2, placedPiece: null }
        ],
        availableInventory: ['seesaw', 'pulley'],
        solutionSlots: { s1: 'seesaw', s2: 'pulley' },
        hint: '誇りを持って最後のスイッチを押そう！',
        explanation: 'チリンチリン🔔✨！歓声と紙吹雪が鳴り止みません！君こそ真のからくり工学マスターだ！',
        examTip: '【未来のイノベーターへ】今日学んだ物理と工学の知恵は、本物のロボットやロケットを作る大きな力になります！'
      }
    ]
  }
};

// =============================================================================
// Main Component
// =============================================================================

export interface ContraptionGameProps {
  level: number;
  grade?: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: any[];
  customTitle?: string;
  customBadge?: string;
  isEX?: boolean;
}

export const ContraptionGame: React.FC<ContraptionGameProps> = ({
  level,
  grade = 3,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge,
  isEX = false
}) => {
  const [problemIndex, setProblemIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [placedSlots, setPlacedSlots] = useState<Record<string, ContraptionPieceType>>({});
  const [selectedInventoryPiece, setSelectedInventoryPiece] = useState<ContraptionPieceType | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const currentGrade = Math.min(Math.max(grade, 3), 6);

  // Puzzles memoization
  const puzzleList: ContraptionPuzzle[] = useMemo(() => {
    return customPuzzles
      ? customPuzzles.map((cp, idx) => ({
          id: cp.id || `custom_ct_${idx}`,
          title: cp.title || '特別ピタゴラパズル',
          subtitle: cp.subtitle || '',
          question: cp.question || '',
          puzzleType: cp.puzzleType || 'physics_quiz',
          startPos: cp.startPos || { x: 0, y: 0 },
          goalPos: cp.goalPos || { x: 3, y: 3 },
          slots: cp.slots || [],
          availableInventory: cp.availableInventory || ['ramp_down_right', 'spring', 'domino'],
          solutionSlots: cp.solutionSlots || {},
          options: cp.options,
          hint: cp.hint || '物理法則をじっくり考えてみよう！',
          explanation: cp.explanation || '正解です！',
          examTip: cp.examTip || '【ツボ】からくりの連鎖反応をマスターしよう！'
        }))
      : GRADE_CONTRAPTION_PUZZLES[currentGrade]?.[level] || GRADE_CONTRAPTION_PUZZLES[3][1];
  }, [customPuzzles, currentGrade, level]);

  const currentPuzzle = puzzleList[problemIndex] || puzzleList[0];

  // Reset state on problem change
  useEffect(() => {
    setIsCompleted(false);
    setFeedbackError(null);
    setIsRunning(false);
    setSimStep(0);
    setSelectedOptionId(null);

    // Initial placed slots
    const initialSlots: Record<string, ContraptionPieceType> = {};
    currentPuzzle.slots?.forEach((s) => {
      if (s.fixedPiece) {
        initialSlots[s.id] = s.fixedPiece;
      }
    });
    setPlacedSlots(initialSlots);
    setSelectedInventoryPiece(currentPuzzle.availableInventory?.[0] || null);
  }, [problemIndex, level, currentGrade, currentPuzzle.id]);

  // Handle slot click
  const handleSlotClick = (slotId: string) => {
    if (isRunning || isCompleted) return;
    sound.playClick();
    setFeedbackError(null);

    if (placedSlots[slotId]) {
      // Toggle or remove
      setPlacedSlots((prev) => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
    } else if (selectedInventoryPiece) {
      // Place piece
      setPlacedSlots((prev) => ({
        ...prev,
        [slotId]: selectedInventoryPiece
      }));
    }
  };

  // Run simulation
  const handleRunSimulation = () => {
    if (isRunning || isCompleted) return;
    sound.playClick();
    setIsRunning(true);
    setFeedbackError(null);

    // Check if solution is met
    const sol = currentPuzzle.solutionSlots || {};
    const isCorrect = Object.keys(sol).every((slotId) => placedSlots[slotId] === sol[slotId]);

    // Animate steps
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setSimStep(currentStep);

      if (currentStep >= 5) {
        clearInterval(interval);
        setIsRunning(false);

        if (isCorrect) {
          sound.playCorrect();
          fireConfetti();
          setIsCompleted(true);
          onComplete(3);
        } else {
          sound.playWrong();
          setFeedbackError('惜しい！球が途中で止まってしまったよ。ギミックの配置を見直してみよう！');
        }
      }
    }, 400);
  };

  // Option select for physics_quiz
  const handleSelectOption = (optId: string) => {
    sound.playClick();
    setSelectedOptionId(optId);
    setFeedbackError(null);

    const opt = currentPuzzle.options?.find((o) => o.id === optId);
    if (opt?.correct) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedbackError('おしい！問題文と図の物理法則をもう一度じっくり見てみよう！');
    }
  };

  const handleNextProblem = () => {
    if (problemIndex < puzzleList.length - 1) {
      setProblemIndex((p) => p + 1);
    } else if (onNextLevel) {
      onNextLevel();
    }
  };

  const handleRetry = () => {
    setIsCompleted(false);
    setFeedbackError(null);
    setIsRunning(false);
    setSimStep(0);
    setSelectedOptionId(null);
    setPlacedSlots({});
  };

  // Helper piece labels
  const getPieceBadge = (type: ContraptionPieceType) => {
    switch (type) {
      case 'ramp_down_right':
        return { icon: '↘', label: '右下がりレール', color: 'bg-amber-500 text-white border-amber-600' };
      case 'ramp_down_left':
        return { icon: '↙', label: '左下がりレール', color: 'bg-emerald-500 text-white border-emerald-600' };
      case 'spring':
        return { icon: '🌀', label: 'バネ（トランポリン）', color: 'bg-cyan-500 text-white border-cyan-600' };
      case 'domino':
        return { icon: '🀄', label: 'ドミノ列', color: 'bg-rose-500 text-white border-rose-600' };
      case 'seesaw':
        return { icon: '⚖️', label: 'シーソー（てこ）', color: 'bg-purple-500 text-white border-purple-600' };
      case 'pulley':
        return { icon: '🏗️', label: '滑車ゲート', color: 'bg-indigo-500 text-white border-indigo-600' };
    }
  };

  const badgeTag = customBadge || (isEX ? `EX裏 Lv.${level}` : `エンジニア鉱山 ${currentGrade}年 Lv.${level}`);

  return (
    <GameModalWrapper
      title={customTitle || `からくりピタゴラ物理連鎖 - ${currentPuzzle.title}`}
      badgeTag={badgeTag}
      level={level}
      starsEarned={isCompleted ? 3 : 0}
      isCompleted={isCompleted}
      explanation={currentPuzzle.explanation}
      examTip={currentPuzzle.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      onRetry={handleRetry}
      onOpenHelp={() => setIsHelpOpen(true)}
      problemIndex={problemIndex}
      totalProblems={puzzleList.length}
      onSwitchProblem={(idx) => setProblemIndex(idx)}
      onNextProblem={handleNextProblem}
    >
      <div className="flex-1 flex flex-col items-center justify-between p-3 sm:p-5 max-w-5xl mx-auto w-full gap-4 overflow-y-auto">
        {/* Top Question Header */}
        <div className="w-full bg-slate-900/90 border-2 border-emerald-400/60 rounded-2xl p-3.5 sm:p-4 shadow-md text-center text-white backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-black tracking-wider text-emerald-300 uppercase">
              {currentPuzzle.title ? `${currentPuzzle.title}${currentPuzzle.subtitle ? ` : ${currentPuzzle.subtitle}` : ''}` : (currentPuzzle.subtitle || 'からくり物理連鎖シミュレーション')}
            </span>
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-black text-emerald-100">
            {currentPuzzle.question}
          </h3>
        </div>

        {/* Interactive Physics Simulation Board (SVG) */}
        <div className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-3 border-emerald-600/50 rounded-3xl p-4 shadow-2xl relative flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px] overflow-hidden">
          {/* Blueprint Grid Lines Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />

          {/* SVG Canvas Board */}
          <svg className="w-full h-64 sm:h-80 max-w-3xl select-none relative z-10" viewBox="0 0 600 360">
            <defs>
              <linearGradient id="ballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="30%" stopColor="#94a3b8" />
                <stop offset="70%" stopColor="#475569" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <filter id="ballShadow" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
              </filter>
              <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Start Chute (投下ポイント) */}
            <g transform={`translate(${currentPuzzle.startPos.x * 120 + 80}, ${currentPuzzle.startPos.y * 80 + 50})`}>
              <rect x="-25" y="-30" width="50" height="40" rx="6" fill="#334155" stroke="#64748b" strokeWidth="3" />
              <text x="0" y="-12" fill="#38bdf8" fontSize="12" fontWeight="black" textAnchor="middle">
                START
              </text>
              <circle cx="0" cy="15" r="14" fill="url(#ballGrad)" filter="url(#ballShadow)" />
            </g>

            {/* Goal Bell (ゴールベル) */}
            <g transform={`translate(${currentPuzzle.goalPos.x * 120 + 80}, ${currentPuzzle.goalPos.y * 80 + 50})`}>
              <circle
                cx="0"
                cy="0"
                r="30"
                fill="#f59e0b"
                fillOpacity={isCompleted ? '0.4' : '0.15'}
                stroke="#fbbf24"
                strokeWidth="3"
                strokeDasharray={isCompleted ? undefined : '4 4'}
                className={isCompleted ? 'animate-pulse' : ''}
              />
              <text x="0" y="8" fontSize="26" textAnchor="middle">
                🔔
              </text>
              <text x="0" y="38" fill="#fbbf24" fontSize="11" fontWeight="black" textAnchor="middle">
                GOAL!
              </text>
            </g>

            {/* Grid Slots (スロット) */}
            {currentPuzzle.slots?.map((slot) => {
              const sx = slot.x * 120 + 80;
              const sy = slot.y * 80 + 50;
              const piece = placedSlots[slot.id];
              const isSelected = selectedInventoryPiece && !piece;

              return (
                <g
                  key={slot.id}
                  transform={`translate(${sx}, ${sy})`}
                  onClick={() => handleSlotClick(slot.id)}
                  className="cursor-pointer group"
                >
                  {/* Slot Frame */}
                  <rect
                    x="-45"
                    y="-30"
                    width="90"
                    height="60"
                    rx="12"
                    fill={piece ? '#1e293b' : isSelected ? '#064e3b' : '#0f172a'}
                    stroke={piece ? '#10b981' : isSelected ? '#34d399' : '#334155'}
                    strokeWidth={piece ? '3' : '2'}
                    strokeDasharray={piece ? undefined : '4 4'}
                    className="transition-all duration-300 group-hover:stroke-emerald-400 group-hover:scale-105"
                  />

                  {/* Empty Slot prompt */}
                  {!piece && (
                    <text x="0" y="5" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">
                      ＋配置
                    </text>
                  )}

                  {/* Render Placed Piece */}
                  {piece === 'ramp_down_right' && (
                    <g>
                      <path d="M-35,-15 L35,20 L35,26 L-35,-9 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
                      <line x1="-35" y1="-15" x2="35" y2="20" stroke="#fef08a" strokeWidth="3" />
                      <text x="0" y="5" fill="#fef08a" fontSize="12" fontWeight="black" textAnchor="middle">
                        ↘ レール
                      </text>
                    </g>
                  )}

                  {piece === 'ramp_down_left' && (
                    <g>
                      <path d="M35,-15 L-35,20 L-35,26 L35,-9 Z" fill="#10b981" stroke="#047857" strokeWidth="2" />
                      <line x1="35" y1="-15" x2="-35" y2="20" stroke="#a7f3d0" strokeWidth="3" />
                      <text x="0" y="5" fill="#a7f3d0" fontSize="12" fontWeight="black" textAnchor="middle">
                        ↙ レール
                      </text>
                    </g>
                  )}

                  {piece === 'spring' && (
                    <g>
                      <rect x="-25" y="15" width="50" height="8" rx="3" fill="#0284c7" />
                      <path
                        d="M-20,15 Q-15,-5 -10,15 Q-5,-5 0,15 Q5,-5 10,15 Q15,-5 20,15"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="4"
                      />
                      <rect x="-30" y="-12" width="60" height="6" rx="3" fill="#38bdf8" />
                      <text x="0" y="-16" fill="#38bdf8" fontSize="10" fontWeight="black" textAnchor="middle">
                        🌀 バネ
                      </text>
                    </g>
                  )}

                  {piece === 'domino' && (
                    <g>
                      <rect x="-30" y="-15" width="10" height="35" rx="2" fill="#f43f5e" stroke="#9f1239" strokeWidth="2" transform="rotate(15)" />
                      <rect x="-10" y="-15" width="10" height="35" rx="2" fill="#f43f5e" stroke="#9f1239" strokeWidth="2" transform="rotate(25)" />
                      <rect x="10" y="-15" width="10" height="35" rx="2" fill="#f43f5e" stroke="#9f1239" strokeWidth="2" transform="rotate(35)" />
                      <text x="0" y="28" fill="#fda4af" fontSize="10" fontWeight="black" textAnchor="middle">
                        🀄 ドミノ
                      </text>
                    </g>
                  )}

                  {piece === 'seesaw' && (
                    <g>
                      <polygon points="0,15 -12,25 12,25" fill="#a855f7" stroke="#6b21a8" strokeWidth="2" />
                      <line x1="-35" y1="5" x2="35" y2="25" stroke="#c084fc" strokeWidth="5" strokeLinecap="round" />
                      <circle cx="-30" cy="0" r="6" fill="#f8fafc" />
                      <text x="0" y="-8" fill="#c084fc" fontSize="10" fontWeight="black" textAnchor="middle">
                        ⚖️ シーソー
                      </text>
                    </g>
                  )}

                  {piece === 'pulley' && (
                    <g>
                      <circle cx="0" cy="-15" r="10" fill="#6366f1" stroke="#4338ca" strokeWidth="2" />
                      <line x1="-8" y1="-15" x2="-8" y2="20" stroke="#cbd5e1" strokeWidth="2" />
                      <line x1="8" y1="-15" x2="8" y2="20" stroke="#cbd5e1" strokeWidth="2" />
                      <rect x="-18" y="10" width="18" height="15" rx="2" fill="#4f46e5" />
                      <text x="0" y="-22" fill="#818cf8" fontSize="10" fontWeight="black" textAnchor="middle">
                        🏗️ 滑車
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Rolling Ball during Simulation */}
            {isRunning && (
              <g transform={`translate(${simStep * 100 + 80}, ${Math.min(300, simStep * 60 + 70)})`}>
                <circle cx="0" cy="0" r="16" fill="url(#ballGrad)" filter="url(#ballShadow)" className="animate-bounce" />
                <circle cx="-5" cy="-5" r="5" fill="#ffffff" fillOpacity="0.8" />
              </g>
            )}

            {/* Goal Cleared Star Burst Effect */}
            {isCompleted && (
              <g
                transform={`translate(${currentPuzzle.goalPos.x * 120 + 80}, ${currentPuzzle.goalPos.y * 80 + 50})`}
                filter="url(#goldGlow)"
              >
                <text x="0" y="-35" fontSize="24" textAnchor="middle">
                  ✨🌟✨
                </text>
                <text x="0" y="-15" fill="#fef08a" fontSize="14" fontWeight="black" textAnchor="middle">
                  CHIME! 🔔
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Error Feedback Message */}
        {feedbackError && (
          <div className="w-full bg-rose-500/20 border-2 border-rose-500/60 rounded-2xl p-3 text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-shake shadow-md">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        {/* Mode A: Contraption Run Mode Controls */}
        {currentPuzzle.puzzleType === 'contraption_run' && (
          <div className="w-full bg-slate-900/80 border-2 border-slate-700 rounded-2xl p-3.5 sm:p-4 text-white flex flex-col gap-3 shadow-lg">
            {/* Inventory Palette */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  使えるギミックパーツ（タップして選択 → 空きマスに配置）
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  配置済みパーツをタップで撤去
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentPuzzle.availableInventory?.map((piece) => {
                  const badge = getPieceBadge(piece);
                  const isSelected = selectedInventoryPiece === piece;
                  return (
                    <button
                      key={piece}
                      onClick={() => {
                        sound.playClick();
                        setSelectedInventoryPiece(piece);
                      }}
                      className={`px-3 py-2 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow ${
                        isSelected
                          ? `${badge.color} ring-4 ring-emerald-400/40 scale-105`
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-base">{badge.icon}</span>
                      <span>{badge.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={handleRetry}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>リセット</span>
              </button>

              <button
                onClick={handleRunSimulation}
                disabled={isRunning || isCompleted}
                className={`flex-1 max-w-sm py-3 px-6 rounded-2xl font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600 text-white cursor-default'
                    : isRunning
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white active:scale-95'
                }`}
              >
                <Play className="w-5 h-5 fill-white" />
                <span>
                  {isCompleted ? '連鎖成功！クリア！' : isRunning ? '球が転がり中...' : '▶️ ピタゴラ発射！'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Mode B: Physics Quiz Mode */}
        {currentPuzzle.puzzleType === 'physics_quiz' && (
          <div className="w-full bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-4 text-white shadow-lg">
            <div className="text-xs font-black text-emerald-300 mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              正しい物理法則の選択肢をタップしよう！
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentPuzzle.options?.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={isCompleted}
                    className={`p-3.5 rounded-xl border-2 text-left font-black text-xs sm:text-sm transition-all active:scale-98 cursor-pointer flex items-center justify-between gap-2 shadow-sm ${
                      isSelected
                        ? opt.correct
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-100 hover:border-emerald-400'
                    }`}
                  >
                    <span>{opt.text}</span>
                    {isSelected && (
                      <span className="text-base shrink-0">
                        {opt.correct ? '⭕' : '❌'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-400 rounded-3xl max-w-md w-full p-6 text-white text-center shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-3xl mx-auto mb-3">
              💡
            </div>
            <h4 className="text-lg font-black text-emerald-300 mb-2">
              からくりピタゴラ研究ノート
            </h4>
            <p className="text-xs text-slate-300 font-bold mb-4 leading-relaxed">
              {currentPuzzle.hint}
            </p>
            <div className="bg-white/5 rounded-2xl p-3 text-left text-[11px] text-emerald-200 border border-white/10 mb-4">
              <span className="font-black block text-emerald-400 mb-1">
                【ギミックのヒント】
              </span>
              ・右下がりレール(↘)と左下がりレール(↙)で進行方向をコントロールしよう！<br />
              ・バネは球を高く遠くへ跳ね上げる！角度45度が最長ジャンプ！<br />
              ・シーソーは「距離×重さ」のモーメントで反対側の球を跳ね上げる！
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setIsHelpOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors cursor-pointer"
            >
              わかった！閉じる
            </button>
          </div>
        </div>
      )}
    </GameModalWrapper>
  );
};
