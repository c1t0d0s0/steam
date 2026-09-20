import React, { useState, useMemo, useEffect } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import {
  Zap,
  Key,
  Cpu,
  HelpCircle,
  AlertTriangle,
  ShieldCheck,
  Binary,
  Sparkles,
  Lightbulb
} from 'lucide-react';

// =============================================================================
// Types & Interfaces
// =============================================================================

export interface BinaryCipherPuzzle {
  id: string;
  title: string;
  subtitle: string;
  question: string;
  puzzleType: 'binary_bits' | 'logic_gates' | 'cipher_wheel' | 'half_adder' | 'logic_quiz';
  // Gate mode configurations
  gateType?: 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'HALF_ADDER';
  defaultInputs?: { a: number; b?: number; c?: number };
  targetOutput?: { out: number; carry?: number };
  // Bit mode configurations
  numBits?: number; // 3, 4, 8
  targetDecimal?: number;
  // Cipher mode configurations
  cipherText?: string;
  plainText?: string;
  shift?: number;
  // Question options
  options?: { id: string; text: string; correct: boolean }[];
  hint: string;
  explanation: string;
  examTip: string;
}

interface BinaryCipherGameProps {
  level: number;
  grade?: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: BinaryCipherPuzzle[];
  customTitle?: string;
  customBadge?: string;
  isEX?: boolean;
}

// =============================================================================
// Grade 3-6 Curriculum Puzzles (72 Problems)
// =============================================================================

const GRADE_BINARY_CIPHER_PUZZLES: Record<number, Record<number, BinaryCipherPuzzle[]>> = {
  // 🎒 Grade 3: 2進数ビットの初歩＆数字暗号 (0と1, 8 4 2 1 の重み, A=1文字暗号, モールス)
  3: {
    1: [
      {
        id: 'g3_l1_p1',
        title: '0と1のスイッチ（1ビットの世界）',
        subtitle: '電気がつく(1)と消える(0)',
        question: 'コンピュータは電気の「ON（1）」と「OFF（0）」の2つの状態だけで情報をやりとりします。この情報の最小単位を何と呼ぶかな？',
        puzzleType: 'binary_bits',
        numBits: 1,
        targetDecimal: 1,
        options: [
          { id: 'opt1', text: '「ビット（bit）」', correct: true },
          { id: 'opt2', text: '「バイト（byte）」', correct: false },
          { id: 'opt3', text: '「グラム（gram）」', correct: false }
        ],
        hint: 'Binary Digit（2進法の数字）を縮めて「ビット」と呼ぶよ！',
        explanation: '正解は「ビット（bit）」！コンピュータの頭脳の中では、電気が通っている状態を「1」、通っていない状態を「0」として、すべての文字や計算をビットの組み合わせで表しています！',
        examTip: '【情報の単位】1ビットは「0か1のどちらか1つ」。8ビット集まると「1バイト（Byte）」になります！'
      },
      {
        id: 'g3_l1_p2',
        title: '2つの電球で何通りの合図ができる？',
        subtitle: '2ビットの組み合わせ',
        question: '2つの電球（左・右）があります。それぞれ「点灯(1)」か「消灯(0)」にできるとき、全部で何通りの合図が送れるかな？',
        puzzleType: 'binary_bits',
        numBits: 2,
        targetDecimal: 3,
        options: [
          { id: 'opt1', text: '「4通り」（00, 01, 10, 11）！', correct: true },
          { id: 'opt2', text: '2通り', correct: false },
          { id: 'opt3', text: '3通り', correct: false }
        ],
        hint: '左が2通り（0か1）、右が2通り（0か1）なので、2×2を計算しよう！',
        explanation: '正解は「4通り」！【00（両方消灯）】【01（右だけ）】【10（左だけ）】【11（両方点灯）】の4通りのパターンを作ることができます！',
        examTip: '【2の累乗】ビットが1つ増えるごとに、表せるパターンの数は「2倍」になります！（1ビット=2通り、2ビット=4通り）'
      },
      {
        id: 'g3_l1_p3',
        title: '2ビットで「3」を表そう！',
        subtitle: '位取りの秘密（2の位と1の位）',
        question: '2進数では、右の位が「1」、左の位が「2」の重みを持ちます。2進数「11₂」は、普段の十進数でいくつになるかな？',
        puzzleType: 'binary_bits',
        numBits: 2,
        targetDecimal: 3,
        options: [
          { id: 'opt1', text: '2×1 ＋ 1×1 ＝「3」！', correct: true },
          { id: 'opt2', text: '11', correct: false },
          { id: 'opt3', text: '2', correct: false }
        ],
        hint: '左の電球がつくと+2点、右の電球がつくと+1点だよ！',
        explanation: '正解は「3」！十進数の位が「1の位、10の位、100の位...」と10倍ずつ増えるのに対し、2進数は「1の位、2の位、4の位...」と2倍ずつ増えます！',
        examTip: '【2進数の仕組み】2進数「11₂」は「じゅういち」ではなく「いち・いち」と読み、値は3です！'
      }
    ],
    2: [
      {
        id: 'g3_l2_p1',
        title: '3ビットの重み（4、2、1）',
        subtitle: '4のランプ、2のランプ、1のランプ',
        question: '3つの電球（重み: 4, 2, 1）があります。十進数の「5」を表すには、どの電球を点灯（1）させればいいかな？',
        puzzleType: 'binary_bits',
        numBits: 3,
        targetDecimal: 5,
        options: [
          { id: 'opt1', text: '「4」と「1」を点灯（2進数: 101₂）！', correct: true },
          { id: 'opt2', text: '「4」と「2」を点灯（2進数: 110₂）', correct: false },
          { id: 'opt3', text: '「2」と「1」を点灯（2進数: 011₂）', correct: false }
        ],
        hint: '4 + 1 = 5 だね！真ん中の「2」は消灯（0）にするよ！',
        explanation: '正解は「101₂（4と1を点灯）」！4×1 + 2×0 + 1×1 = 5 となります！',
        examTip: '【足し算で作る2進数】作りたい数から一番大きい重みを引いていくと、簡単に2進数へ変換できます！'
      },
      {
        id: 'g3_l2_p2',
        title: '3ビットで表せる最大の数',
        subtitle: '全部の電球をつけたら？',
        question: '3ビットの電球（4, 2, 1）をぜんぶ点灯（111₂）にしました。十進数でいくつになるかな？',
        puzzleType: 'binary_bits',
        numBits: 3,
        targetDecimal: 7,
        options: [
          { id: 'opt1', text: '4 ＋ 2 ＋ 1 ＝「7」！', correct: true },
          { id: 'opt2', text: '8', correct: false },
          { id: 'opt3', text: '6', correct: false }
        ],
        hint: '4+2+1を足し算してみよう！',
        explanation: '正解は「7」！3ビットですべての桁を1にすると 4 + 2 + 1 = 7 になります。0から7までの全部で8通りの数を表現できます！',
        examTip: '【最大の数と2の累乗】nビットの最大数は必ず「2^n − 1」になります！（3ビットなら 8 − 1 = 7）'
      },
      {
        id: 'g3_l2_p3',
        title: '電球が全部消えたら？',
        subtitle: 'ゼロの表現',
        question: '3ビットの電球がすべて消灯（000₂）しています。このとき表している数はいくつかな？',
        puzzleType: 'binary_bits',
        numBits: 3,
        targetDecimal: 0,
        options: [
          { id: 'opt1', text: 'もちろん「0」！', correct: true },
          { id: 'opt2', text: '1', correct: false },
          { id: 'opt3', text: '数えられない', correct: false }
        ],
        hint: 'どのランプもついていないので、合計点数は0点！',
        explanation: '正解は「0」！すべてのビットが0のときは「0」を表します。コンピュータは0から数を数え始めるのが特徴です！',
        examTip: '【0から始まる世界】3ビットで表せる範囲は「0〜7」の計8通りです！'
      }
    ],
    3: [
      {
        id: 'g3_l3_p1',
        title: '4ビットの魔法（8, 4, 2, 1）',
        subtitle: '8の位が新登場！',
        question: '4ビット（重み: 8, 4, 2, 1）を使って、十進数の「9」を作りたい！どの電球をつければいいかな？',
        puzzleType: 'binary_bits',
        numBits: 4,
        targetDecimal: 9,
        options: [
          { id: 'opt1', text: '「8」と「1」をつける（1001₂）！', correct: true },
          { id: 'opt2', text: '「8」と「2」をつける（1010₂）', correct: false },
          { id: 'opt3', text: '「4」と「2」と「1」をつける（0111₂）', correct: false }
        ],
        hint: '8 + 1 = 9 だね！',
        explanation: '正解は「1001₂」！8の位を1、4の位を0、2の位を0、1の位を1にすることで、8 + 1 = 9 を作ることができます！',
        examTip: '【4ビット＝ニブル】4ビットは「ニブル（nibble）」とも呼ばれ、16進数1桁とぴったり対応します！'
      },
      {
        id: 'g3_l3_p2',
        title: '十進数「12」を2進数に変換！',
        subtitle: '8と4を組み合わせよう',
        question: '十進数の「12」を4ビットの2進数（8, 4, 2, 1）で表すとどうなるかな？',
        puzzleType: 'binary_bits',
        numBits: 4,
        targetDecimal: 12,
        options: [
          { id: 'opt1', text: '8＋4＝12 なので「1100₂」！', correct: true },
          { id: 'opt2', text: '1010₂', correct: false },
          { id: 'opt3', text: '1110₂', correct: false }
        ],
        hint: '8 + 4 = 12！あとの2と1はゼロにするよ！',
        explanation: '正解は「1100₂」！8の位(1) ＋ 4の位(1) ＝ 12 となります！',
        examTip: '【2進数表記】末尾に「₂」をつけることで、十進数の1100（千百）と区別して「2進数の一・一・ゼロ・ゼロ」と示します！'
      },
      {
        id: 'g3_l3_p3',
        title: '4ビットの限界値（1111₂）',
        subtitle: '4ビットで表せる最大の数',
        question: '4ビットすべてを点灯（1111₂）させました。十進数でいくつになるかな？',
        puzzleType: 'binary_bits',
        numBits: 4,
        targetDecimal: 15,
        options: [
          { id: 'opt1', text: '8 ＋ 4 ＋ 2 ＋ 1 ＝「15」！', correct: true },
          { id: 'opt2', text: '16', correct: false },
          { id: 'opt3', text: '14', correct: false }
        ],
        hint: '8 + 4 + 2 + 1 を計算しよう！次の「16」より1小さい数だよ！',
        explanation: '正解は「15」！8+4+2+1 = 15 です。4ビットでは「0〜15」の計16通りの数を表すことができます！',
        examTip: '【16進数への架け橋】0〜15の16個の数字は、16進数では「0〜9, A, B, C, D, E, F」として1文字で表せます！'
      }
    ],
    4: [
      {
        id: 'g3_l4_p1',
        title: 'アルファベット数字暗号（A=1, B=2...）',
        subtitle: '文字を数字の暗号に変身！',
        question: 'A=1, B=2, C=3, D=4... と番号をつけた秘密暗号があります。「3 - 1 - 20」は何という単語かな？',
        puzzleType: 'cipher_wheel',
        options: [
          { id: 'opt1', text: 'C - A - T（CAT: ネコ）！', correct: true },
          { id: 'opt2', text: 'D - O - G（DOG: イヌ）', correct: false },
          { id: 'opt3', text: 'B - A - T（BAT: コウモリ）', correct: false }
        ],
        hint: '3番目はC、1番目はA、20番目はTだよ！',
        explanation: '正解は「CAT（ネコ）」！文字を番号に置き換えるのは、暗号やコンピュータ文字コード（ASCIIコード）のすべての基本です！',
        examTip: '【文字コードの考え方】コンピュータは文字そのものを理解できないため、すべての文字に番号を割り当てて記憶しています！'
      },
      {
        id: 'g3_l4_p2',
        title: '秘密のメッセージを解読せよ！',
        subtitle: '19 - 21 - 14',
        question: '暗号「19 - 21 - 14」が届きました。アルファベット番号表（S=19, U=21, N=14）で解読すると何かな？',
        puzzleType: 'cipher_wheel',
        options: [
          { id: 'opt1', text: 'S - U - N（SUN: 太陽）！', correct: true },
          { id: 'opt2', text: 'S - T - A - R（星）', correct: false },
          { id: 'opt3', text: 'M - O - O - N（月）', correct: false }
        ],
        hint: '19番目はS、21番目はU、14番目はN！空に輝くもの！',
        explanation: '正解は「SUN（太陽）」！番号と文字の対応ルール（換字表）があれば、誰でも暗号を読めるようになります！',
        examTip: '【換字式暗号】文字を別の文字や数字に置き換える暗号を「換字式（かえじしき）暗号」と呼びます！'
      },
      {
        id: 'g3_l4_p3',
        title: '暗号を作る側になってみよう！',
        subtitle: 'DOG を数字暗号に変換！',
        question: '「D - O - G（イヌ）」を番号暗号（A=1〜Z=26）に変換するとどうなるかな？（D=4, O=15, G=7）',
        puzzleType: 'cipher_wheel',
        options: [
          { id: 'opt1', text: '「4 - 15 - 7」！', correct: true },
          { id: 'opt2', text: '3 - 14 - 6', correct: false },
          { id: 'opt3', text: '4 - 16 - 8', correct: false }
        ],
        hint: 'Dは4番目、Oは15番目、Gは7番目！',
        explanation: '正解は「4 - 15 - 7」！元のメッセージを暗号に変えることを「暗号化（Encryption）」、元に戻すことを「復号（Decryption）」と言います！',
        examTip: '【暗号化と復号】暗号化のルール（鍵）を知っている人だけが、元に戻す（復号する）ことができます！'
      }
    ],
    5: [
      {
        id: 'g3_l5_p1',
        title: 'モールス符号の「トン・ツー」',
        subtitle: '短い音と長い音の2値通信',
        question: 'モールス信号は、短い音「・（トン）」と長い音「ー（ツー）」の2種類だけで文字を伝えます。これも0と1の2進法と同じだと言えるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '言える！「・」を0、「ー」を1とみなせば全く同じ2進通信！', correct: true },
          { id: 'opt2', text: '言えない！音と電気は全然違う', correct: false },
          { id: 'opt3', text: 'アルファベットしか送れないので違う', correct: false }
        ],
        hint: 'どちらも「2つの状態（短い/長い、OFF/ON）」だけで情報を届けているよ！',
        explanation: '正解！「・」と「ー」の2種類で伝えるモールス符号は、まさに0と1のデジタル通信そのものです！電報や遭難信号で大活躍しました！',
        examTip: '【最古のデジタル通信】1840年代にサミュエル・モールスが発明したモールス電信は、現代のインターネット通信の直系の先祖です！'
      },
      {
        id: 'g3_l5_p2',
        title: '世界で一番有名なSOS信号',
        subtitle: 'トン・トン・トン、ツー・ツー・ツー、トン・トン・トン',
        question: '遭難したときに送る緊急SOS信号のモールス符号は「・・・ ーーー ・・・」です。「S」を表すモールス符号はどれかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「・・・」（トントン・トン）！', correct: true },
          { id: 'opt2', text: '「ーーー」（ツーツー・ツー）', correct: false },
          { id: 'opt3', text: '「・ー・」', correct: false }
        ],
        hint: '最初と最後の文字がSだよ！',
        explanation: '正解は「・・・」！Sが「・・・」、Oが「ーーー」なので、つなげると「・・・ ーーー ・・・（SOS）」となります。誰でも打ちやすく聞き取りやすいように選ばれました！',
        examTip: '【SOSの由来】SOSは単語の略ではなく、「・・・ ーーー ・・・」という一番分かりやすい音の組み合わせとして制定されました！'
      },
      {
        id: 'g3_l5_p3',
        title: '光の点滅でメッセージ！',
        subtitle: '船と船の間のライト通信',
        question: '遠くの船同士が、サーチライトを「ピカッ（短）」「ピカーッ（長）」と光らせてモールス信号で会話しています。これは何通信と呼べるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「光デジタル通信（可視光通信）」！', correct: true },
          { id: 'opt2', text: '電波通信', correct: false },
          { id: 'opt3', text: '海底ケーブル通信', correct: false }
        ],
        hint: '目に見える光の点滅で0と1を送っているね！',
        explanation: '正解！目に見える光を使って0と1（短と長）を伝達する立派なデジタル通信です。現代の光ファイバーも、目に見えない超高速な光の点滅でギガバイトのデータを送っています！',
        examTip: '【光ファイバーの原理】現代のインターネットも、光ファイバーの中で光を1秒間に何億回も点滅させてデータを送っています！'
      }
    ],
    6: [
      {
        id: 'g3_l6_p1',
        title: 'ビット数と表現できるパターン数',
        subtitle: '1ビット増えるごとに2倍！',
        question: '1ビットで2通り、2ビットで4通り、3ビットで8通り、4ビットで16通り...。では「5ビット」あると何通りのパターンが表せるかな？',
        puzzleType: 'binary_bits',
        numBits: 4,
        targetDecimal: 15,
        options: [
          { id: 'opt1', text: '16 × 2 ＝「32通り」！', correct: true },
          { id: 'opt2', text: '20通り', correct: false },
          { id: 'opt3', text: '64通り', correct: false }
        ],
        hint: '16の2倍を計算しよう！ (2の5乗)',
        explanation: '正解は「32通り」！ビットが1つ増えるたびに表現できる数は2倍になります。2 × 2 × 2 × 2 × 2 = 32通りです！',
        examTip: '【指数関数的増加】2, 4, 8, 16, 32, 64, 128, 256, 512, 1024...！この数列はIT・コンピュータで最も頻出する魔法の数列です！'
      },
      {
        id: 'g3_l6_p2',
        title: '8ビット＝1バイト（Byte）の力！',
        subtitle: '256通りの大宇宙',
        question: '8ビット（1バイト）集まると、何通りの数字を表せるかな？（2×2×...を8回掛ける）',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「256通り」（0〜255）！', correct: true },
          { id: 'opt2', text: '128通り', correct: false },
          { id: 'opt3', text: '1000通り', correct: false }
        ],
        hint: '32の次が64、次が128、そしてその次は？',
        explanation: '正解は「256通り」！8ビット（1バイト）あれば「0〜255」までの256通りの数を表現でき、英数字1文字（ASCII）や色（赤・緑・青の各256段階）を表すのに最適です！',
        examTip: '【1バイト＝8ビット＝256通り】プログラミングの超基本！カラーコード（#FFFFFFなど）も256段階（8ビット）×3色で表現されています！'
      },
      {
        id: 'g3_l6_p3',
        title: '小3デジタル探検マスタークリア！',
        subtitle: '次は論理回路（ゲート）の世界へ！',
        question: '0と1のビットと暗号の基礎を完全制覇しました！コンピュータはこの0と1をどのように計算（加工）しているのかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: 'ANDやORなどの「論理回路（ゲート）」で瞬時に判定・計算している！', correct: true },
          { id: 'opt2', text: '中に小さな人が入ってそろばんを弾いている', correct: false },
          { id: 'opt3', text: '電卓のボタンを物理的にロボットが押している', correct: false }
        ],
        hint: '次の学年で登場する「論理回路（ゲート）」が頭脳の秘密！',
        explanation: '大正解！小4ステージでは、この0と1を組み合わせて判断を下す「AND」「OR」「NOT」という論理ゲートの世界へ進みます！',
        examTip: '【次へのステップ】小4では中学入試でも頻出の「論理（AND/OR/NOT）」のスイッチ回路を解き明かします！'
      }
    ]
  },

  // 🎒 Grade 4: 基本の論理ゲート (AND, OR, NOT) 直列・並列・反転
  4: {
    1: [
      {
        id: 'g4_l1_p1',
        title: '【ANDゲート】両方ONで初めて動く！',
        subtitle: '論理積（直列スイッチ回路）',
        question: '金庫の扉を開けるには、隊長キー（A）と副隊長キー（B）の「両方」をONにする必要があります。この回路を何ゲートと呼ぶかな？',
        puzzleType: 'logic_gates',
        gateType: 'AND',
        defaultInputs: { a: 0, b: 0 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: '「AND（アンド）ゲート」！', correct: true },
          { id: 'opt2', text: '「OR（オア）ゲート」', correct: false },
          { id: 'opt3', text: '「NOT（ノット）ゲート」', correct: false }
        ],
        hint: '「A かつ B（A AND B）」が揃ったときだけ出力が1になるよ！',
        explanation: '正解は「ANDゲート」！理科の電気回路でいう「直列つなぎの2つのスイッチ」と同じ働きをします。両方が閉じた（1になった）ときだけ電流が流れます！',
        examTip: '【ANDゲート記号と真理値】入力が (0,0)→0, (0,1)→0, (1,0)→0, (1,1)→1 となり、かけ算（論理積: A × B）と同じ結果になります！'
      },
      {
        id: 'g4_l1_p2',
        title: 'ANDゲートを動かしてロック解除！',
        subtitle: 'スイッチAとBを操作しよう',
        question: 'ANDゲートの入力AとBがあります。出力を「1（解錠）」にするには、スイッチをどうすればいいかな？',
        puzzleType: 'logic_gates',
        gateType: 'AND',
        defaultInputs: { a: 1, b: 0 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: 'スイッチAもBも「両方とも1（ON）」にする！', correct: true },
          { id: 'opt2', text: 'スイッチAだけ1にする', correct: false },
          { id: 'opt3', text: 'スイッチAもBも両方0にする', correct: false }
        ],
        hint: 'ANDは厳しい！片方だけでは通さないよ！',
        explanation: '正解！ANDゲートはすべての入力が「1」のときだけ出力が「1」になります。片方でも0があると出力は0になります！',
        examTip: '【安全装置のAND】ミサイル発射や工場の大型プレス機など、両手で同時に押さないと作動しない安全装置にAND回路が使われます！'
      },
      {
        id: 'g4_l1_p3',
        title: 'ANDゲートの真理値表クイズ',
        subtitle: '入力 (1, 0) のときの出力は？',
        question: 'ANDゲートの入力が A=1, B=0 のとき、出力はどうなるかな？',
        puzzleType: 'logic_gates',
        gateType: 'AND',
        defaultInputs: { a: 1, b: 0 },
        targetOutput: { out: 0 },
        options: [
          { id: 'opt1', text: 'Bが0なので出力は「0（OFF）」！', correct: true },
          { id: 'opt2', text: 'Aが1なので出力は「1（ON）」', correct: false },
          { id: 'opt3', text: '不確定で決まらない', correct: false }
        ],
        hint: '1 × 0 ＝ 0 だね！',
        explanation: '正解は「0」！A×B = 1×0 = 0。両方が1でない限り、出力は絶対に0のままです！',
        examTip: '【真理値表（Truth Table）】入力と出力の対応関係を一覧表にしたものを「真理値表」と呼び、論理回路の基本ツールです！'
      }
    ],
    2: [
      {
        id: 'g4_l2_p1',
        title: '【ORゲート】どちらか一方でもONなら動く！',
        subtitle: '論理和（並列スイッチ回路）',
        question: 'お家の玄関ドアベルは、表のボタン（A）または裏口のボタン（B）の「どちらか一方でも」押せば鳴ります。この回路は何ゲートかな？',
        puzzleType: 'logic_gates',
        gateType: 'OR',
        defaultInputs: { a: 0, b: 0 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: '「OR（オア）ゲート」！', correct: true },
          { id: 'opt2', text: '「ANDゲート」', correct: false },
          { id: 'opt3', text: '「NOTゲート」', correct: false }
        ],
        hint: '「A または B（A OR B）」のときに動くよ！',
        explanation: '正解は「ORゲート」！理科の電気回路でいう「並列つなぎの2つのスイッチ」と同じです。どちらか片方でも閉じれば、電気が迂回して流れます！',
        examTip: '【ORゲート記号と真理値】入力が (0,0)→0, (0,1)→1, (1,0)→1, (1,1)→1 となり、足し算（論理和: A ＋ B、ただし1+1=1）に対応します！'
      },
      {
        id: 'g4_l2_p2',
        title: 'ORゲートの出力が0になる唯一の条件',
        subtitle: '消灯するのはどんなとき？',
        question: 'ORゲートの出力が「0（消灯）」になるのは、どんな入力のときだけかな？',
        puzzleType: 'logic_gates',
        gateType: 'OR',
        defaultInputs: { a: 0, b: 0 },
        targetOutput: { out: 0 },
        options: [
          { id: 'opt1', text: 'AもBも「両方とも0（OFF）」のときだけ！', correct: true },
          { id: 'opt2', text: 'Aが1でBが0のとき', correct: false },
          { id: 'opt3', text: 'AもBも両方1のとき', correct: false }
        ],
        hint: 'どちらか1つでも1があれば1になっちゃうよ！0になるには？',
        explanation: '正解！ORゲートは、入力がすべて0のときだけ出力が0になり、それ以外のときはすべて1を出力します！',
        examTip: '【警報システムのOR】火災報知器では、熱センサー(A)または煙センサー(B)のどちらか一方が反応すれば警報を鳴らすOR回路が使われます！'
      },
      {
        id: 'g4_l2_p3',
        title: 'ORゲートで両方ON（1, 1）のとき',
        subtitle: '1 ＋ 1 ＝ 1 ？',
        question: 'ORゲートの入力が A=1, B=1 と両方ONのとき、出力はどうなるかな？',
        puzzleType: 'logic_gates',
        gateType: 'OR',
        defaultInputs: { a: 1, b: 1 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: 'もちろん「1（ON）」！', correct: true },
          { id: 'opt2', text: '2になる', correct: false },
          { id: 'opt3', text: 'ショートして0になる', correct: false }
        ],
        hint: '論理の世界の最大値は「1」だよ！',
        explanation: '正解は「1」！ブール論理では 1 OR 1 = 1 となります。両方のスイッチが閉じていても電球は元気に点灯します！',
        examTip: '【論理加算の性質】算数では 1+1=2 ですが、論理回路では 1 OR 1 = 1 です！「電気が流れている」状態はどこまで行っても1です！'
      }
    ],
    3: [
      {
        id: 'g4_l3_p1',
        title: '【NOTゲート】あまのじゃくインバータ',
        subtitle: '0を1に、1を0に反転！',
        question: '入力が0なら1を出力し、入力が1なら0を出力する、信号を真逆にひっくり返す回路は何ゲートかな？',
        puzzleType: 'logic_gates',
        gateType: 'NOT',
        defaultInputs: { a: 0 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: '「NOT（ノット）ゲート（インバータ）」！', correct: true },
          { id: 'opt2', text: '「ANDゲート」', correct: false },
          { id: 'opt3', text: '「ORゲート」', correct: false }
        ],
        hint: '否定（ひっくり返す）のNOTだよ！三角の先に丸◯がついた記号！',
        explanation: '正解は「NOTゲート」！別名「インバータ（反転器）」とも呼ばれ、入力が1つのゲートです。三角の先端にある小さな丸（◯）が「反転」の印です！',
        examTip: '【NOTの記号とバー記号】NOT A は数式で「Aの上に横棒（Ā）」を描いて表します！Ā̄（2回反転）すると元のAに戻ります！'
      },
      {
        id: 'g4_l3_p2',
        title: '街灯の自動点灯センサーとNOT',
        subtitle: '暗くなったら（0）点灯（1）！',
        question: '太陽の光センサーは、明るい昼間に「1」、暗い夜に「0」を出力します。夜（0）になったら街灯を自動点灯（1）させるにはどのゲートをつなぐ？',
        puzzleType: 'logic_gates',
        gateType: 'NOT',
        defaultInputs: { a: 0 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: '「NOTゲート」をつなぐ！', correct: true },
          { id: 'opt2', text: '「ANDゲート」をつなぐ', correct: false },
          { id: 'opt3', text: '「ORゲート」をつなぐ', correct: false }
        ],
        hint: '明るい(1)→消灯(0)、暗い(0)→点灯(1) に反転させたいね！',
        explanation: '正解！光センサーの出力をNOTゲートに入力すれば、夜になってセンサーが0になった瞬間にNOTが1を出力し、街灯が自動でパッと点灯します！',
        examTip: '【センサーとNOT回路】防犯センサー（赤外線ビームが遮断されて0になったら警報1）など、自動制御の至る所でNOTが活躍しています！'
      },
      {
        id: 'g4_l3_p3',
        title: 'NOTゲートを2個直列につなぐと？',
        subtitle: '反転の反転！',
        question: '信号Aを、NOTゲートに通し、その出力をさらに別のNOTゲートに通しました（NOT(NOT A)）。出力はどうなるかな？',
        puzzleType: 'logic_gates',
        gateType: 'NOT',
        defaultInputs: { a: 1 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: '2回ひっくり返って「元のAと同じ」になる！', correct: true },
          { id: 'opt2', text: '必ず0になる', correct: false },
          { id: 'opt3', text: '必ず1になる', correct: false }
        ],
        hint: '「否定の否定は肯定」！日本語でも「好きじゃないわけじゃない＝好き」だね！',
        explanation: '正解！1を反転すると0、0をもう一度反転すると1。2回反転すると完全に元の信号に戻ります！これを「二重否定の法則」と呼びます！',
        examTip: '【バッファ回路】実務では、信号を遅らせたり信号の強さを回復させるために、NOTを2個つないだバッファ回路が使われます！'
      }
    ],
    4: [
      {
        id: 'g4_l4_p1',
        title: '【NANDゲート】ANDの出力をNOT反転！',
        subtitle: 'Not AND ＝ NAND（ナンド）',
        question: 'ANDゲートの後ろにNOTゲートをつなげた回路を「NAND（ナンド）ゲート」と呼びます。両方の入力が1のときの出力はどうなるかな？',
        puzzleType: 'logic_gates',
        gateType: 'NAND',
        defaultInputs: { a: 1, b: 1 },
        targetOutput: { out: 0 },
        options: [
          { id: 'opt1', text: 'ANDが1なので、NOTで反転して「0」！', correct: true },
          { id: 'opt2', text: '1になる', correct: false },
          { id: 'opt3', text: '両方とも通らない', correct: false }
        ],
        hint: 'まずANDを計算（1 AND 1 = 1）、それをひっくり返すよ！',
        explanation: '正解は「0」！ANDの出力を真逆にひっくり返すのがNANDです。両方1のときだけ0になり、それ以外のときはすべて1を出力します！',
        examTip: '【NANDフラッシュメモリ】SSDやUSBメモリ、スマホの記憶素子に使われる「NAND型フラッシュメモリ」の語源はこのNANDゲートです！'
      },
      {
        id: 'g4_l4_p2',
        title: '【NORゲート】ORの出力をNOT反転！',
        subtitle: 'Not OR ＝ NOR（ノア）',
        question: 'ORゲートの後ろにNOTゲートをつなげた「NOR（ノア）ゲート」。入力が A=0, B=0 のとき出力はどうなるかな？',
        puzzleType: 'logic_gates',
        gateType: 'NOR',
        defaultInputs: { a: 0, b: 0 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: 'ORが0なので、反転して「1」！', correct: true },
          { id: 'opt2', text: '0になる', correct: false },
          { id: 'opt3', text: '反転しない', correct: false }
        ],
        hint: '0 OR 0 = 0、それをNOTでひっくり返そう！',
        explanation: '正解は「1」！両方とも0のときだけ1を出力し、片方でも1があれば0を出力するのがNORゲートです！',
        examTip: '【万能ゲートの双璧】NANDゲートとNORゲートは、どちらもそれ単体だけで他のすべての論理ゲートを構築できる「万能ゲート」です！'
      },
      {
        id: 'g4_l4_p3',
        title: '自動ドアの論理回路',
        subtitle: '内側センサー OR 外側センサー',
        question: 'スーパーの自動ドアは、外側センサー（A）または内側センサー（B）のどちらかに人が立つと開きます。安全停止スイッチ（C: 押すと0）も組み合わせる場合、どんな回路？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「(A OR B) AND C」（人がいて、かつ安全スイッチ有効のとき開く）！', correct: true },
          { id: 'opt2', text: 'A AND B AND C（両側に人がいないと開かない）', correct: false },
          { id: 'opt3', text: 'A OR B OR C', correct: false }
        ],
        hint: '外か内のどちらかに人がいればよく（OR）、安全装置がON（AND）である必要があります！',
        explanation: '正解！外と内は「OR」、安全確認は「AND」で直列に組み合わせることで、安全で便利な自動ドアの制御回路が完成します！',
        examTip: '【複合論理回路】身の回りの電化製品は、このようにANDとORを組み合わせた条件判断回路で動いています！'
      }
    ],
    5: [
      {
        id: 'g4_l5_p1',
        title: '真理値表から回路を当てよう！',
        subtitle: '暗号化されたゲートを特定せよ',
        question: 'ある謎のゲートがあります。(0,0)→0, (0,1)→1, (1,0)→1, (1,1)→1 という出力が出ました。このゲートの正体は何かな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '片方でも1なら1になる「ORゲート」！', correct: true },
          { id: 'opt2', text: 'ANDゲート', correct: false },
          { id: 'opt3', text: 'NOTゲート', correct: false }
        ],
        hint: '両方0のときだけ0になっているね！',
        explanation: '正解は「ORゲート」！真理値表を見るだけで、その回路がどのような論理判断をしているかが一目瞭然で分かります！',
        examTip: '【真理値表の読み解き】中学入試の論理クイズでも、条件を表に整理して解く真理値表の思考法が極めて有効です！'
      },
      {
        id: 'g4_l5_p2',
        title: '真理値表から回路を当てるパート2！',
        subtitle: '(1, 1) のときだけ1',
        question: '別の謎のゲートがあります。(0,0)→0, (0,1)→0, (1,0)→0, (1,1)→1 という出力でした。このゲートは何かな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '両方1のときだけ1になる「ANDゲート」！', correct: true },
          { id: 'opt2', text: 'ORゲート', correct: false },
          { id: 'opt3', text: 'NANDゲート', correct: false }
        ],
        hint: '両方揃ったときだけ1になる厳格なゲート！',
        explanation: '正解は「ANDゲート」！すべての条件を満たしたときだけ作動する論理積の働きです！',
        examTip: '【ANDとORの対比】ANDは「1が1個だけ（条件が厳しい）」、ORは「0が1個だけ（条件が緩い）」と対比して覚えましょう！'
      },
      {
        id: 'g4_l5_p3',
        title: '3入力のANDゲート（A and B and C）',
        subtitle: '3つの鍵がすべて必要！',
        question: '3つの入力（A, B, C）を持つANDゲートがあります。出力が1になるのは全部で8通りの入力のうち何通りあるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: 'A=1, B=1, C=1 の「1通り」だけ！', correct: true },
          { id: 'opt2', text: '3通り', correct: false },
          { id: 'opt3', text: '7通り', correct: false }
        ],
        hint: 'ANDは何個入力があっても「全部1」のときだけだよ！',
        explanation: '正解は「1通り」！何入力のANDゲートであっても、出力が1になるのは「すべての入力が1」のたった1通りだけです！',
        examTip: '【多入力論理ゲート】3入力、4入力、8入力のANDゲートも、コンピュータ内部で命令コードを解読するために多用されます！'
      }
    ],
    6: [
      {
        id: 'g4_l6_p1',
        title: '排他的な扉の前で',
        subtitle: '同じなら0、違えば1？',
        question: '「2つの入力が異なるときだけ1（ON）」になり、「両方とも同じ（両方0、または両方1）なら0（OFF）」になる不思議なゲートがあります。このゲートの名前は何かな？',
        puzzleType: 'logic_gates',
        gateType: 'XOR',
        defaultInputs: { a: 1, b: 0 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: '「XOR（排他的論理和: エックスオア）ゲート」！', correct: true },
          { id: 'opt2', text: 'ANDゲート', correct: false },
          { id: 'opt3', text: 'NOTゲート', correct: false }
        ],
        hint: 'Exclusive OR（排他的なOR）を略してXORと呼ぶよ！',
        explanation: '正解は「XORゲート（排他的論理和）」！小5・小6ステージの主人公となる超重要ゲートです！',
        examTip: '【XORの予告】XORは「足し算の和（Sum）」を計算し、さらに「暗号化」もこなすスーパースターゲートです！'
      },
      {
        id: 'g4_l6_p2',
        title: '階段のスイッチ（3路スイッチの秘密）',
        subtitle: '1階でも2階でも照明をカチッと切り替え！',
        question: '階段の照明は、1階のスイッチを押しても、2階のスイッチを押してもON/OFFが切り替わります。この仕組みはどのゲートの働きかな？',
        puzzleType: 'logic_gates',
        gateType: 'XOR',
        defaultInputs: { a: 1, b: 1 },
        targetOutput: { out: 0 },
        options: [
          { id: 'opt1', text: 'どちらか片方を切り替えると状態が反転する「XORゲート」！', correct: true },
          { id: 'opt2', text: 'ANDゲート', correct: false },
          { id: 'opt3', text: 'NOTゲート', correct: false }
        ],
        hint: 'どちらか一方だけ動かすと、状態が0から1へ、1から0へ変わるよ！',
        explanation: '正解！お家の階段にある「3路スイッチ」は、まさにXORゲート（またはXNORゲート）と同じ動作をしています。どちらのスイッチをカチッと倒しても電灯の状態が反転します！',
        examTip: '【3路スイッチと中学理科】理科の電気回路問題でも頻出！XORの論理が身近な建築電気設備にそのまま使われています！'
      },
      {
        id: 'g4_l6_p3',
        title: '小4論理ゲートマスタークリア！',
        subtitle: '次のステージは暗号とXORの世界！',
        question: '基本ゲート（AND, OR, NOT）を完全制覇しました！このゲートたちを使って、小5では何に挑戦するかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: 'XORを使った暗号解読や、データの誤り検出通信！', correct: true },
          { id: 'opt2', text: '電球のガラスを割る実験', correct: false },
          { id: 'opt3', text: '電卓の電池を抜く実験', correct: false }
        ],
        hint: '小5では「情報セキュリティ」と「暗号」の本格的な世界へ飛び込むよ！',
        explanation: '大正解！小5ステージでは、歴史上の名暗号「シーザー暗号」や、現代の暗号通信で不可欠な「XOR暗号」「パリティビット」の謎を解き明かします！',
        examTip: '【小5への架け橋】論理ゲートの知識が、暗号解読とセキュリティという実践的ITスキルへと進化します！'
      }
    ]
  },

  // 🎒 Grade 5: 排他的論理和(XOR)＆暗号セキュリティ (シーザー暗号, パリティビット, XOR可逆性)
  5: {
    1: [
      {
        id: 'g5_l1_p1',
        title: '【XORゲートの真髄】違いを検出する目印！',
        subtitle: '0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0',
        question: 'XOR（排他的論理和）ゲートは、2つの入力が「異なるときだけ1」「同じときは0」を出力します。入力が A=1, B=1 のときの出力は？',
        puzzleType: 'logic_gates',
        gateType: 'XOR',
        defaultInputs: { a: 1, b: 1 },
        targetOutput: { out: 0 },
        options: [
          { id: 'opt1', text: '両方とも1で同じなので「0」！', correct: true },
          { id: 'opt2', text: '両方1なので「1」', correct: false },
          { id: 'opt3', text: 'エラーになって動かない', correct: false }
        ],
        hint: '「違いがあるときだけ1」！同じなら0だよ！',
        explanation: '正解は「0」！1⊕1 = 0 です。普通のORゲートなら 1 OR 1 = 1 ですが、XORは「両方とも1」のケースを排斥（仲間はずれに）するため、排他的（Exclusive）ORと呼ばれます！',
        examTip: '【XOR記号 ⊕】数学や情報処理では、XORを「丸の中にプラス記号（⊕）」で表します！'
      },
      {
        id: 'g5_l1_p2',
        title: 'XORで「1ビットの足し算」？',
        subtitle: '1 ＋ 1 ＝ 10 の 1の位！',
        question: '1 + 1 を計算すると二進数で「10₂」になります。このとき、1の位の数字「0」を出力しているのはどのゲートかな？',
        puzzleType: 'logic_gates',
        gateType: 'XOR',
        defaultInputs: { a: 1, b: 1 },
        targetOutput: { out: 0 },
        options: [
          { id: 'opt1', text: '1⊕1=0 を出力する「XORゲート」！', correct: true },
          { id: 'opt2', text: 'ANDゲート', correct: false },
          { id: 'opt3', text: 'ORゲート', correct: false }
        ],
        hint: '0+0=0, 0+1=1, 1+0=1, 1+1=0（繰り上がり無視）...これってXORの真理値表そのもの！',
        explanation: '正解！XORの真理値表は、繰り上がりを無視した「足し算の1の位（和: Sum）」と完全に一致します！',
        examTip: '【足し算の心臓部】コンピュータが足し算をできるのは、XORゲートが和を計算してくれるからです！'
      },
      {
        id: 'g5_l1_p3',
        title: 'XORでビット反転スイッチ！',
        subtitle: 'コントロールキーとしてのXOR',
        question: '入力Aに対して、コントロール入力B=1 をXORすると（A ⊕ 1）、出力はどうなるかな？',
        puzzleType: 'logic_gates',
        gateType: 'XOR',
        defaultInputs: { a: 0, b: 1 },
        targetOutput: { out: 1 },
        options: [
          { id: 'opt1', text: 'Aが0なら1、1なら0と「必ず反転」する！', correct: true },
          { id: 'opt2', text: '必ず0のままになる', correct: false },
          { id: 'opt3', text: '変化しない', correct: false }
        ],
        hint: '0⊕1=1, 1⊕1=0 だね！Aがひっくり返っている！',
        explanation: '正解！B=0のときはAがそのまま通過し（A⊕0=A）、B=1のときはAが反転します（A⊕1=NOT A）。XORは「切り替え可能なNOTゲート」としても機能します！',
        examTip: '【制御可能インバータ】この性質が、後述するXOR暗号（鍵をXORすると暗号化・復号できる）の根幹になります！'
      }
    ],
    2: [
      {
        id: 'g5_l2_p1',
        title: 'シーザー暗号の解読（+3文字シフト）',
        subtitle: 'ジュリアス・シーザーが使った秘密の手法',
        question: '文字をアルファベット順に3つ後ろにずらす暗号（+3シフト）があります。暗号文【K H O O R】を元に戻す（-3する）と何という単語かな？',
        puzzleType: 'cipher_wheel',
        shift: 3,
        options: [
          { id: 'opt1', text: '「H E L L O」（ハロー）！', correct: true },
          { id: 'opt2', text: '「A P P L E」（リンゴ）', correct: false },
          { id: 'opt3', text: '「W O R L D」（世界）', correct: false }
        ],
        hint: 'Kの3つ前はH、Hの3つ前はE、Oの3つ前はL！',
        explanation: '正解は「HELLO」！K(-3)→H, H(-3)→E, O(-3)→L, O(-3)→L, R(-3)→O となります！古代ローマの英雄カエサルが軍事連絡に愛用した暗号です！',
        examTip: '【シーザー暗号の解読】シフト数（鍵）がわかっていれば簡単に元に戻せます。鍵の候補が25通りしかないため、総当たり（ブルートフォース）でも解読可能です！'
      },
      {
        id: 'g5_l2_p2',
        title: '暗号化ミッション（+2文字シフト）',
        subtitle: 'STEAM を暗号化せよ！',
        question: '「S - T - E - A - M」の各文字を2つ後ろにずらす（+2シフト）と、どんな暗号文になるかな？',
        puzzleType: 'cipher_wheel',
        shift: 2,
        options: [
          { id: 'opt1', text: '「U - V - G - C - O」！', correct: true },
          { id: 'opt2', text: 'T - U - F - B - N', correct: false },
          { id: 'opt3', text: 'Q - R - C - Y - K', correct: false }
        ],
        hint: 'Sの次はT、その次はU！Tの次はU、その次はV！',
        explanation: '正解！S→U, T→V, E→G, A→C, M→O とスライドして「UVGCO」という暗号文になります！',
        examTip: '【換字表と周期性】Zの次をAに戻すことで、文字盤をぐるぐる回す「暗号円盤（サイファー・ディスク）」が作られました！'
      },
      {
        id: 'g5_l2_p3',
        title: 'ROT13（13文字シフトの不思議）',
        subtitle: '暗号化と復号が全く同じ！',
        question: 'アルファベット全26文字の半分である「13文字」ずらす暗号（ROT13）があります。暗号化した文を、もう一度同じROT13にかけるとどうなる？',
        puzzleType: 'cipher_wheel',
        shift: 13,
        options: [
          { id: 'opt1', text: '13+13=26文字でちょうど1周して「元の文に戻る」！', correct: true },
          { id: 'opt2', text: '二重に暗号化されて絶対読めなくなる', correct: false },
          { id: 'opt3', text: '全部逆順のスペルになる', correct: false }
        ],
        hint: '時計の針を半周（6時間）進めて、もう半周進めたらどうなるかな？',
        explanation: '正解！13+13=26 でアルファベットがちょうど1周するため、「暗号化する関数」と「復号する関数」が完全に同一になるという非常に美しい性質を持ちます！',
        examTip: '【可逆性と対称鍵暗号】暗号化と同じ操作で元に戻せる仕組みは、プログラムをシンプルにする上で大変重宝されます！'
      }
    ],
    3: [
      {
        id: 'g5_l3_p1',
        title: 'ひらがな五十音暗号',
        subtitle: '1つ前の文字で書かれた手紙',
        question: '五十音表で「1つ前（上）の文字」にずらして書かれた暗号【す・い・か】。元のメッセージは何かな？',
        puzzleType: 'cipher_wheel',
        options: [
          { id: 'opt1', text: '【せ・う・き】', correct: false },
          { id: 'opt2', text: '各行で1つ後ろの文字に戻して【せ・え・き】', correct: false },
          { id: 'opt3', text: '五十音順（あいうえお、かきくけこ...）で1つ後ろに戻して【せ・け・き】...ではなく【せ・え・き】？', correct: false }
        ],
        hint: '「あかさたな...」ではなく「あいうえお」の段で考えるか、行で考えるかルールを確認！',
        explanation: '五十音暗号では「あいうえお（段）」ずらしや「あかさたな（行）」ずらしなど、ルール（共通鍵）をあらかじめ決めておく必要があります！',
        examTip: '【共通鍵暗号方式】暗号を送る人と受け取る人が、あらかじめ同じ秘密のルール（鍵）を共有しておく暗号方式を「共通鍵暗号」と呼びます！'
      },
      {
        id: 'g5_l3_p2',
        title: '頻度分析（暗号破りのテクニック）',
        subtitle: '一番よく使われる文字を探せ！',
        question: '英語の長い暗号文を解読するとき、一番たくさん登場する文字は、英語の文章で最もよく使われるアルファベット「何」だと推理できるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '英語で圧倒的に使用頻度が高い「E」！', correct: true },
          { id: 'opt2', text: '「Z」', correct: false },
          { id: 'opt3', text: '「Q」', correct: false }
        ],
        hint: 'THE, HE, SHE, BE など至る所に出てくる母音だよ！',
        explanation: '正解は「E」！どんなに文字をずらしても、最も多く使われる文字の統計的偏り（文字の頻度）は隠せません。これを「頻度分析」と呼び、名探偵シャーロック・ホームズも暗号解読に使用しました！',
        examTip: '【暗号解読の歴史】9世紀のアラブの数学者アル・キンディーが頻度分析を発明し、単純なシーザー暗号はすべて解読できるようになりました！'
      },
      {
        id: 'g5_l3_p3',
        title: '換字暗号の限界と進化',
        subtitle: '文字をずらすだけでは破られる！',
        question: '文字を一定数ずらすシーザー暗号の最大の弱点はどれかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: 'ずらし方のパターンが25通りしかなく、総当たりで破られる！', correct: true },
          { id: 'opt2', text: '暗号化にパソコンが10台必要になること', correct: false },
          { id: 'opt3', text: '文字数が10倍に増えてしまうこと', correct: false }
        ],
        hint: 'たった25回試せば誰でも必ず解けちゃうね！',
        explanation: '正解！鍵の数がたった25通りしかないため、コンピュータはもちろん人間でも数分で全パターンを試せてしまいます。ここからより複雑な暗号へと進化しました！',
        examTip: '【キードメイン（鍵空間）】安全な暗号にするには、総当たりで試せないほど鍵のパターン数（鍵空間）を巨大にする必要があります！'
      }
    ],
    4: [
      {
        id: 'g5_l4_p1',
        title: '【パリティビット】データのエラーを見つける！',
        subtitle: '通信でノイズが入って数字が変わったら？',
        question: 'インターネット通信で「1011」を送るとき、ノイズで途中の1ビットが「1001」に化けてしまいました。このエラーを見つける仕組みを何と呼ぶかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「パリティビット（偶数・奇数パリティ）」！', correct: true },
          { id: 'opt2', text: '「シーソー回路」', correct: false },
          { id: 'opt3', text: '「リセットボタン」', correct: false }
        ],
        hint: '1の個数が偶数か奇数かを末尾に1ビット添えてチェックするよ！',
        explanation: '正解は「パリティビット」！データの末尾に「1の個数が偶数になるように検査ビット」を1つ付け足すことで、受信側でデータが壊れていないか一瞬で検出できます！',
        examTip: '【誤り検出符号】宇宙探査機との通信やQRコード、バーコードの最後の数字（チェックディジット）もこの誤り検出の仕組みです！'
      },
      {
        id: 'g5_l4_p2',
        title: '偶数パリティの計算実践！',
        subtitle: '1の個数を偶数に揃えよう',
        question: 'データ「1 1 0 1」があります（1の個数は3個＝奇数）。全体の1の個数を「偶数」にするためのパリティビットは何をつければいいかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '1を1個足して4個にするので「1」！', correct: true },
          { id: 'opt2', text: '「0」', correct: false },
          { id: 'opt3', text: 'どちらでもよい', correct: false }
        ],
        hint: 'いま1が3個あるから、偶数（4個）にするには？',
        explanation: '正解は「1」！データ「1101」にパリティビット「1」を付けると「1101 1」となり、1が合計4個（偶数）になります。受信側で数えて奇数ならエラーと分かります！',
        examTip: '【パリティとXOR】実は全ビットをXOR（排他的論理和）すると、奇数なら1、偶数なら0が自動で計算できます！XORは大活躍です！'
      },
      {
        id: 'g5_l4_p3',
        title: 'エラーを検出する瞬間！',
        subtitle: 'パリティチェック発動！',
        question: '偶数パリティ付きデータ「1 0 1 1 1」が届きました。1の個数を数えると全部で4個（偶数）です。このデータは壊れているかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '1の個数が4個（偶数）で一致しているので「壊れていない（正常）」！', correct: true },
          { id: 'opt2', text: '壊れている', correct: false },
          { id: 'opt3', text: 'パリティビットからは分からない', correct: false }
        ],
        hint: 'ルール通り偶数になっているか確認！',
        explanation: '正解！1の数が4個で偶数ルールが保たれているため、通信エラーが起きていないと判定できます！',
        examTip: '【パリティの限界】同時に2ビットが化けると偶数のままになり見逃してしまいます。そのため現代はハミング符号やCRCなどさらに進んだ方式を使います！'
      }
    ],
    5: [
      {
        id: 'g5_l5_p1',
        title: '【XOR暗号】絶対に解読できない究極の暗号？',
        subtitle: 'ワンタイムパッド（バーナム暗号）',
        question: 'データに秘密の鍵ビットを「XOR」して暗号化しました。受け取った人が元のデータに戻すには何をすればいいかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '暗号文にもう一度「同じ秘密鍵をXOR」するだけ！', correct: true },
          { id: 'opt2', text: '秘密鍵を引き算する', correct: false },
          { id: 'opt3', text: '秘密鍵をNOT反転する', correct: false }
        ],
        hint: '(A ⊕ Key) ⊕ Key = A！同じ鍵を2回XORすると元通り！',
        explanation: '正解！(A ⊕ Key) ⊕ Key = A というXORの魔法の性質により、暗号化も復号も「同じ鍵をXORするだけ」で完璧に元通りに戻ります！',
        examTip: '【バーナム暗号と不可読性証明】完全にランダムな使い捨て鍵（ワンタイムパッド）を使ったXOR暗号は、数学的に「絶対に解読できない」ことが証明されています！'
      },
      {
        id: 'g5_l5_p2',
        title: 'XOR暗号の計算をやってみよう！',
        subtitle: 'データ 1010 と 鍵 1100',
        question: 'データ「1010」と秘密鍵「1100」を各桁ごとにXOR（異なるなら1、同じなら0）して暗号化するとどうなるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「0110」！', correct: true },
          { id: 'opt2', text: '1110', correct: false },
          { id: 'opt3', text: '0000', correct: false }
        ],
        hint: '1⊕1=0, 0⊕1=1, 1⊕0=1, 0⊕0=0！桁ごとに比べよう！',
        explanation: '正解は「0110」！1桁目(1⊕1=0)、2桁目(0⊕1=1)、3桁目(1⊕0=1)、4桁目(0⊕0=0) となります！',
        examTip: '【ビット毎の排他的論理和】現代のAES暗号などの暗号アルゴリズム内部でも、このXOR演算が毎秒何十億回も実行されています！'
      },
      {
        id: 'g5_l5_p3',
        title: '暗号化された「0110」を復号しよう！',
        subtitle: '秘密鍵 1100 をもう一度XOR！',
        question: '先ほどの暗号文「0110」に、秘密鍵「1100」をもう一度XORすると、元のデータ「何」に戻るかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '元の「1010」に完璧に戻る！', correct: true },
          { id: 'opt2', text: '1111 になる', correct: false },
          { id: 'opt3', text: '0000 になる', correct: false }
        ],
        hint: '0⊕1=1, 1⊕1=0, 1⊕0=1, 0⊕0=0！元のデータと見比べよう！',
        explanation: '正解は「1010」！見事に元のデータが復元されました！暗号化と復号で同じ回路（XOR）をそのまま使い回せるため、ハードウェア回路を最小にできます！',
        examTip: '【対称暗号の美学】暗号化器と復号器が同一の回路になるXORの性質は、コンピュータ工学における最高傑作の一つです！'
      }
    ],
    6: [
      {
        id: 'g5_l6_p1',
        title: '情報セキュリティの3大要素（CIA）',
        subtitle: '機密性・完全性・可用性',
        question: '情報セキュリティの3本柱（CIA）のうち、「許可された人だけがデータを見られるようにすること（暗号化など）」を何と呼ぶかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「機密性（Confidentiality）」！', correct: true },
          { id: 'opt2', text: '「完全性（Integrity）」', correct: false },
          { id: 'opt3', text: '「可用性（Availability）」', correct: false }
        ],
        hint: '秘密（機密）を守ることだよ！',
        explanation: '正解は「機密性（Confidentiality）」！機密性（見られないこと）、完全性（改ざんされないこと）、可用性（使いたい時にいつでも使えること）の3つを合わせて「セキュリティのCIA」と呼びます！',
        examTip: '【中学入試・情報教育の頻出語】情報社会のルール・マナー・セキュリティ問題として、中学入試でも出題が増えています！'
      },
      {
        id: 'g5_l6_p2',
        title: '改ざんを防ぐ「完全性（Integrity）」',
        subtitle: '途中で書き換えられていないこと',
        question: 'テストの点数や銀行の送金額が途中で勝手に書き換えられていないことを保証する性質はどれかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「完全性（Integrity）」！', correct: true },
          { id: 'opt2', text: '「機密性（Confidentiality）」', correct: false },
          { id: 'opt3', text: '「匿名性（Anonymity）」', correct: false }
        ],
        hint: 'パリティビットやデジタル署名で「完全であること」を確かめるよ！',
        explanation: '正解は「完全性（Integrity）」！データが正確で改ざんされていない完全な状態であることを意味します！',
        examTip: '【デジタル署名と完全性】ブロックチェーンや電子契約では、ハッシュ関数と暗号技術を使ってこの完全性を保証しています！'
      },
      {
        id: 'g5_l6_p3',
        title: '小5暗号＆セキュリティマスタークリア！',
        subtitle: 'いよいよコンピュータのCPU演算回路へ！',
        question: '小5のXORゲートと暗号解読を完全制覇しました！小6では、論理ゲートを組み合わせて「コンピュータの電卓（加算器）」を作ります。足し算回路の名前は何かな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「半加算器（Half Adder）」と「全加算器（Full Adder）」！', correct: true },
          { id: 'opt2', text: 'シーソー天秤', correct: false },
          { id: 'opt3', text: 'ピタゴラドミノ', correct: false }
        ],
        hint: '英語で足し算器のことを「Adder（アダー）」と呼ぶよ！',
        explanation: '大正解！小6ステージでは、これまで学んだANDとXORを結合し、コンピュータが算数の計算を行う心臓部「半加算器・全加算器」の謎に迫ります！',
        examTip: '【小6への架け橋】論理ゲートがいかにして算数の四則演算を行う「CPU」へと昇華するのか、その全貌が明かされます！'
      }
    ]
  },

  // 🎒 Grade 6: 半加算器・全加算器・コンピュータの頭脳 (CPUの計算原理)
  6: {
    1: [
      {
        id: 'g6_l1_p1',
        title: '【半加算器（Half Adder）】計算回路の誕生！',
        subtitle: 'XORで和（Sum）、ANDで繰り上がり（Carry）',
        question: '1ビットの足し算 A + B を行う半加算器。入力が A=1, B=1 のとき、和（Sum）と繰り上がり（Carry）はどうなるかな？',
        puzzleType: 'half_adder',
        gateType: 'HALF_ADDER',
        defaultInputs: { a: 1, b: 1 },
        targetOutput: { out: 0, carry: 1 },
        options: [
          { id: 'opt1', text: '和 Sum＝0、繰り上がり Carry＝1（二進数で 10₂ ＝ 十進数2）！', correct: true },
          { id: 'opt2', text: '和 Sum＝1、繰り上がり Carry＝0', correct: false },
          { id: 'opt3', text: '和 Sum＝1、繰り上がり Carry＝1', correct: false },
          { id: 'opt4', text: '和 Sum＝0、繰り上がり Carry＝0', correct: false }
        ],
        hint: '1 + 1 = 2（二進数で 10₂）！1の位（Sum）は0、2の位（Carry）は1！',
        explanation: '正解！1+1=2（二進数で 10₂）です。XORゲートから「1の位（Sum=0）」が出力され、ANDゲートから「繰り上がり（Carry=1）」が出力されます！',
        examTip: '【半加算器の構成】Sum = A ⊕ B（XORゲート）、Carry = A · B（ANDゲート）！この2つのゲートだけで算数の足し算が完全に実現します！'
      },
      {
        id: 'g6_l1_p2',
        title: '半加算器の入力が A=1, B=0 のとき',
        subtitle: '1 ＋ 0 ＝ 1',
        question: '半加算器に A=1, B=0 を入力しました。和 Sum と繰り上がり Carry はどうなる？',
        puzzleType: 'half_adder',
        gateType: 'HALF_ADDER',
        defaultInputs: { a: 1, b: 0 },
        targetOutput: { out: 1, carry: 0 },
        options: [
          { id: 'opt1', text: '和 Sum＝1、繰り上がり Carry＝0（二進数で 01₂ ＝ 十進数1）！', correct: true },
          { id: 'opt2', text: '和 Sum＝0、繰り上がり Carry＝1', correct: false },
          { id: 'opt3', text: '和 Sum＝1、繰り上がり Carry＝1', correct: false }
        ],
        hint: '1+0=1！繰り上がりはないね！',
        explanation: '正解！1+0=1 なので、和 Sum は 1、繰り上がり Carry は 0 になります！XOR(1,0)=1、AND(1,0)=0 と完全に一致します！',
        examTip: '【真理値の一致】電子回路のゲートの組み合わせが、算数の四則演算と1対1に完全一致することにコンピュータ工学の美しさがあります！'
      },
      {
        id: 'g6_l1_p3',
        title: 'なぜ「半（Half）」加算器と呼ぶの？',
        subtitle: '何が足りないのかな？',
        question: 'この回路が「全」加算器ではなく「半（Half）」加算器と呼ばれる理由はどれかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '下位の桁からの「繰り上がり入力（Cin）」を受け取る機能がないから！', correct: true },
          { id: 'opt2', text: '引き算しかできないから', correct: false },
          { id: 'opt3', text: '半分壊れているから', correct: false }
        ],
        hint: '2桁目以上の足し算をするとき、1桁目から上がってきた「繰り上がり」も足したいよね！',
        explanation: '正解！半加算器はAとBの2つしか入力できません。前の桁から繰り上がってきた「Cin（キャリーイン）」を含む3つのビットを同時に足せる回路が「全加算器（Full Adder）」です！',
        examTip: '【全加算器への道】全加算器は、半加算器2個とORゲート1個を組み合わせることで作ることができます！'
      }
    ],
    2: [
      {
        id: 'g6_l2_p1',
        title: '【全加算器（Full Adder）】3ビットの加算！',
        subtitle: 'A ＋ B ＋ Cin（前からの繰り上がり）',
        question: '全加算器に A=1, B=0, Cin=1（前からの繰り上がりあり）を入力しました。今回の和 Sum と次の桁への繰り上がり Cout はどうなるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '1 ＋ 0 ＋ 1 ＝ 2 なので、和 Sum＝0、繰り上がり Cout＝1！', correct: true },
          { id: 'opt2', text: '和 Sum＝1、繰り上がり Cout＝0', correct: false },
          { id: 'opt3', text: '和 Sum＝1、繰り上がり Cout＝1', correct: false }
        ],
        hint: '1+0+1 = 2（二進数で 10₂）だね！',
        explanation: '正解！1+0+1 = 2（二進数で 10₂）。したがって和 Sum は「0」、次の桁への繰り上がり Cout は「1」となります！',
        examTip: '【全加算器の演算】3つのビットを足すと、結果は「0 (00₂), 1 (01₂), 2 (10₂), 3 (11₂)」の4通りのいずれかになります！'
      },
      {
        id: 'g6_l2_p2',
        title: '全加算器で全員が「1」のとき！',
        subtitle: 'A=1, B=1, Cin=1 の超クライマックス',
        question: '全加算器に A=1, B=1, Cin=1（全員1）を入力しました。出力（Sum と Cout）はどうなるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '1 ＋ 1 ＋ 1 ＝ 3 なので、和 Sum＝1、繰り上がり Cout＝1！', correct: true },
          { id: 'opt2', text: '和 Sum＝0、繰り上がり Cout＝1', correct: false },
          { id: 'opt3', text: '和 Sum＝1、繰り上がり Cout＝0', correct: false }
        ],
        hint: '1+1+1 = 3（二進数で 11₂）！1の位も繰り上がりも両方1！',
        explanation: '正解！1+1+1 = 3（二進数で 11₂）です。したがって和 Sum も「1」、繰り上がり Cout も「1」となります！',
        examTip: '【全加算器の真理値】全加算器の8つの入力パターンのうち、SumとCoutが両方1になるのはこの(1,1,1)の1通りだけです！'
      },
      {
        id: 'g6_l2_p3',
        title: '全加算器をつなげて多桁の足し算！',
        subtitle: 'リップルキャリーアダー（波状加算器）',
        question: '全加算器を4個横につなげると、何ビット同士の足し算ができる電卓になるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「4ビット（0〜15の数）」同士の足し算器！', correct: true },
          { id: 'opt2', text: '1ビットの足し算しかできない', correct: false },
          { id: 'opt3', text: '掛け算しかできない', correct: false }
        ],
        hint: '1桁に1個の全加算器を使うから、4個つなげれば4桁！',
        explanation: '正解！全加算器を4個並べて繰り上がり（Carry）を数珠つなぎにすれば、4ビットの加算器になります。64個並べれば、現代の64ビットCPUの加算回路になります！',
        examTip: '【リップルキャリー加算器】繰り上がりが水面の波（Ripple）のように右から左へ伝わっていくため、リップルキャリー加算器と呼ばれます！'
      }
    ],
    3: [
      {
        id: 'g6_l3_p1',
        title: '2進数の筆算足し算に挑戦！',
        subtitle: '1011₂ ＋ 0101₂',
        question: '2進数「1011₂（十進数11）」と「0101₂（十進数5）」を足すと、二進数でいくつになるかな？（11 + 5 = 16）',
        puzzleType: 'binary_bits',
        numBits: 4,
        targetDecimal: 16,
        options: [
          { id: 'opt1', text: '繰り上がって「10000₂」（十進数の16）！', correct: true },
          { id: 'opt2', text: '1110₂', correct: false },
          { id: 'opt3', text: '1111₂', correct: false }
        ],
        hint: '11 + 5 = 16 だね！16は2の4乗なので、5桁目の「16の位」に繰り上がるよ！',
        explanation: '正解は「10000₂（十六）」！最下位の1+1で繰り上がりが発生し、次々とドミノ倒しのように繰り上がって「10000₂」になります！',
        examTip: '【2進数の筆算】1+1=10₂、1+1+1=11₂。十進数の筆算と同じように、繰り上がりを上の桁に足していけば必ず計算できます！'
      },
      {
        id: 'g6_l3_p2',
        title: '桁あふれ（オーバーフロー）の恐怖',
        subtitle: '4ビットの箱に16が入らない！',
        question: '4ビットのレジスタ（記憶箱）は最大「15（1111₂）」までしか入りません。ここに15+1=16を足すと何が起きる？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: 'あふれた最上位が消えて「0000（0）」に戻ってしまう（オーバーフロー）！', correct: true },
          { id: 'opt2', text: '自動で箱が大きくなって16になる', correct: false },
          { id: 'opt3', text: 'コンピュータが爆発する', correct: false }
        ],
        hint: 'ゲームでスコアが999999を超えると0になっちゃうバグと同じ！',
        explanation: '正解！桁あふれ（オーバーフロー）が起きると、5桁目の1が捨てられて「0000（0）」になってしまいます！古今東西のゲームやロケット打ち上げで有名なバグの原因です！',
        examTip: '【オーバーフローと2038年問題】ビット数の上限を超えて数字が巻き戻るバグは、情報セキュリティやシステム開発の最重要注意点です！'
      },
      {
        id: 'g6_l3_p3',
        title: '引き算も「足し算」でできちゃう？',
        subtitle: '【2の補数】という大発明！',
        question: 'コンピュータは引き算専用の回路を持たず、ある工夫をして「足し算回路（加算器）だけ」で引き算を行っています。この手法を何と呼ぶかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「2の補数（ビット反転＋1）」を使った加算！', correct: true },
          { id: 'opt2', text: 'そろばんの引き算', correct: false },
          { id: 'opt3', text: '逆再生回路', correct: false }
        ],
        hint: '負の数を「ビットを全部ひっくり返して+1した数」として定義するよ！',
        explanation: '正解は「2の補数」！すべてのビットを反転して1を足すと「マイナスの数」になり、A − B を「A ＋ (−Bの補数)」として足し算器だけで計算できます！',
        examTip: '【CPUの省スペース化】引き算回路を別で作る必要がなくなるため、CPUの回路面積を大幅に小さくすることに成功しました！'
      }
    ],
    4: [
      {
        id: 'g6_l4_p1',
        title: 'コンピュータの心臓部「ALU」',
        subtitle: '算術論理演算装置（Arithmetic Logic Unit）',
        question: 'CPUの中で、足し算や引き算、ANDやORなどの論理演算を一手に引き受ける計算ユニットを英語3文字で何と呼ぶかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「ALU（エー・エル・ユー）」！', correct: true },
          { id: 'opt2', text: '「GPU」', correct: false },
          { id: 'opt3', text: '「USB」', correct: false }
        ],
        hint: 'Arithmetic（算術）Logic（論理）Unit（装置）の略！',
        explanation: '正解は「ALU」！CPUのど真ん中にあり、今日学んだ加算器や論理ゲートがぎっしり詰まった、人類史上最も高速な計算エンジンです！',
        examTip: '【コンピュータの5大装置】演算装置（ALU）、制御装置、記憶装置（メモリ）、入力装置、出力装置。中学入試情報分野の必修知識です！'
      },
      {
        id: 'g6_l4_p2',
        title: 'クロック周波数と計算スピード',
        subtitle: '1秒間に何十億回も計算！',
        question: '「3.0 GHz（ギガヘルツ）」のCPUがあります。このCPUのALUは、1秒間に約何回論理ゲートのスイッチを切り替えて計算できるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '1秒間に「約30億回」！', correct: true },
          { id: 'opt2', text: '約3000回', correct: false },
          { id: 'opt3', text: '約3万回', correct: false }
        ],
        hint: 'ギガ（G）は10億（10の9乗）を表す単位だよ！',
        explanation: '正解は「約30億回」！1秒間に30億回もゲートがON/OFFして計算しています。光の速さですら1回あたり10cmしか進めない超絶的なスピードです！',
        examTip: '【単位の接頭辞】キロ（K:千）、メガ（M:百万）、ギガ（G:十億）、テラ（T:一兆）。理科・算数・情報すべてで共通する重要単位です！'
      },
      {
        id: 'g6_l4_p3',
        title: 'トランジスタという微小スイッチ',
        subtitle: '爪の先ほどのチップに数百億個！',
        question: '現代のスマホやPCのCPUチップには、今日学んだ論理ゲートを作るための超微小な電子スイッチが約何個詰め込まれているかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「数百億個」のトランジスタ！', correct: true },
          { id: 'opt2', text: '約100個', correct: false },
          { id: 'opt3', text: '約1万個', correct: false }
        ],
        hint: 'ナノメートル（原子数個分）という驚異的な超微細加工技術で作られています！',
        explanation: '正解は「数百億個」！最新の半導体チップには1個あたり100億個〜200億個以上のトランジスタが集積され、複雑なAIや3Dゲームを動かしています！',
        examTip: '【ムーアの法則】インテル創業者のゴードン・ムーアが提唱した「半導体の集積率は約2年で2倍になる」という法則はIT文明の羅針盤となりました！'
      }
    ],
    5: [
      {
        id: 'g6_l5_p1',
        title: '掛け算回路の秘密',
        subtitle: '掛け算は「シフト」と「足し算」！',
        question: 'コンピュータは掛け算（乗算）をどうやって計算しているかな？例えば 5 × 3 は？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '2進数を「左にシフト（桁上げ）」して「加算器で足し合わせる」！', correct: true },
          { id: 'opt2', text: '九九の表を全部丸暗記した辞書を引いているだけ', correct: false },
          { id: 'opt3', text: '掛け算はできないので割り算に直している', correct: false }
        ],
        hint: '十進数の筆算でも、位をずらしながら足し算していくよね！',
        explanation: '正解！2進数を左に1ビットずらすと「×2倍」になります。筆算と同じように、シフトと足し算（加算器）を組み合わせるだけで巨大な掛け算も瞬時に解けます！',
        examTip: '【ビットシフトと乗除算】左シフトは2倍（掛け算）、右シフトは1/2倍（割り算）。プログラミングでも高速演算テクニックとして有名です！'
      },
      {
        id: 'g6_l5_p2',
        title: '画像も音声もすべて0と1',
        subtitle: 'マルチメディアのデジタル化',
        question: 'きれいな写真（RGBカラー）や音楽、YouTube動画も、コンピュータの中では本当にすべて「0と1」のビット列かな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '本当！文字も色も音も動画も、すべて0と1の数字に変換されている！', correct: true },
          { id: 'opt2', text: 'ウソ！絵の具の粉がパソコンの中で混ざっている', correct: false },
          { id: 'opt3', text: '文字だけ0と1で、画像は別の特別な物質', correct: false }
        ],
        hint: '音の波の高さも、色の光の強さも、ぜんぶ数字で測れるね！',
        explanation: '正解！赤・緑・青の光の強さ（各0〜255）を並べたものが画像データであり、空気の振動（音波）の高さを1秒間に44100回数値化したものが音楽（CD音質）です！',
        examTip: '【A/D変換（アナログ・デジタル変換）】現実世界の連続的な量（アナログ）を0と1の数値（デジタル）に置き換える技術が現代社会の土台です！'
      },
      {
        id: 'g6_l5_p3',
        title: '量子コンピュータへのいざない',
        subtitle: '0であり1でもある「重ね合わせ」',
        question: '未来の超高速コンピュータ「量子コンピュータ」の基本単位「量子ビット（Qubit）」が持つ驚異的な性質はどれかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「0」と「1」の両方の状態を同時に併せ持つ（量子重ね合わせ）！', correct: true },
          { id: 'opt2', text: '0と1ではなく、2と3だけで計算する', correct: false },
          { id: 'opt3', text: '電気をまったく使わずに蒸気で動く', correct: false }
        ],
        hint: 'コインを指で激しく回転させると、表でもあり裏でもある状態になるね！',
        explanation: '正解！通常のビットが0か1のどちらか一方しか取れないのに対し、量子ビットは「0と1が同時に重なり合った状態」を保てるため、何億通りもの可能性を一瞬で並列計算できます！',
        examTip: '【次世代テクノロジー】最先端の科学・入試問題でも注目される量子コンピュータの思考実験です！EX島でその深淵に挑戦します！'
      }
    ],
    6: [
      {
        id: 'g6_l6_p1',
        title: 'ブール代数と現代社会',
        subtitle: '1854年のジョージ・ブールの大発見',
        question: '今日学んだAND・OR・NOT・XORという「論理数学（ブール代数）」を体系化したイギリスの数学者は誰かな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「ジョージ・ブール（George Boole）」！', correct: true },
          { id: 'opt2', text: 'アイザック・ニュートン', correct: false },
          { id: 'opt3', text: 'トーマス・エジソン', correct: false }
        ],
        hint: '真偽値のことを英語で「Boolean（ブーリアン）」と呼ぶよ！',
        explanation: '正解は「ジョージ・ブール」！彼が19世紀に「人間の思考や論理は、0と1の代数方程式で計算できる」と証明したことが、約100年後のコンピュータ誕生に直結しました！',
        examTip: '【純粋数学から工学へ】一見役に立たないと思われた抽象数学が、1世紀を経て世界中のコンピュータの基本言語になった偉大な歴史です！'
      },
      {
        id: 'g6_l6_p2',
        title: 'STEAM探検隊の全知覚統合',
        subtitle: '理科・算数・工学・幾何・情報の完全共鳴',
        question: '理科の電気回路、算数の2進数・つるかめ算、工学の歯車とピタゴラ力学、美術幾何の立方体切断、そして情報の論理暗号。これらSTEAMが共通して育む力は何かな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: '「論理的思考力・空間認識力・問題解決力（ひらめき力）」！', correct: true },
          { id: 'opt2', text: '丸暗記してテスト用紙を埋めるだけの記憶力', correct: false },
          { id: 'opt3', text: 'ゲームのコントローラーを連打する反射神経', correct: false }
        ],
        hint: 'STEAM探検隊が冒険を通じてずっと鍛えてきた探検スピリット！',
        explanation: '大正解！物事の本質を見抜き、規則性を発見し、自分の手で組み立てて検証する力こそが、STEAM教育が目指す真の「生きる力」です！',
        examTip: '【中学入試最難関校のメッセージ】難関中学校が入試問題で問うているのは知識の量ではなく、「未知の問題に対して筋道を立てて論理的に考える力」です！'
      },
      {
        id: 'g6_l6_p3',
        title: '全モジュール完全制覇おめでとう！',
        subtitle: '全5島10大モジュール完走記念！',
        question: 'STEAM探検隊の全10大モジュールを完全制覇しました！残る伝説の究極ステージはどこにあるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt1', text: 'スタンプ7個で解放される最難関「EXアイランド（裏ステージ）」！', correct: true },
          { id: 'opt2', text: 'もうどこにもない', correct: false },
          { id: 'opt3', text: '最初からやり直すだけ', correct: false }
        ],
        hint: '夜空に光る時空の超空間ラボ「EXアイランド」へ飛び込もう！',
        explanation: '全問完全制覇、本当におめでとうございます！！あなたの論理的思考力と空間認識力は最高峰の達人レベルに到達しました！次はEX島の超難関パズルに挑みましょう！',
        examTip: '【伝説の探検マスターへ】EX島裏ステージの全制覇を目指して、最後の挑戦へ出発してください！'
      }
    ]
  }
};

// =============================================================================
// Component Implementation
// =============================================================================

export const BinaryCipherGame: React.FC<BinaryCipherGameProps> = ({
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
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Interactive state
  const [inputA, setInputA] = useState<number>(0);
  const [inputB, setInputB] = useState<number>(0);
  const [bitSwitches, setBitSwitches] = useState<number[]>([0, 0, 0, 0]); // 4-bit default [b3, b2, b1, b0]

  const currentGrade = Math.min(Math.max(grade, 3), 6);

  // Puzzle List
  const puzzleList = useMemo(() => {
    if (customPuzzles && customPuzzles.length > 0) {
      return customPuzzles;
    }
    const gradeMap = GRADE_BINARY_CIPHER_PUZZLES[currentGrade] || GRADE_BINARY_CIPHER_PUZZLES[3];
    return gradeMap[level] || gradeMap[1] || [];
  }, [customPuzzles, currentGrade, level]);

  const currentPuzzle: BinaryCipherPuzzle = puzzleList[problemIndex] || puzzleList[0];

  // Initialize or reset inputs when problem changes
  useEffect(() => {
    setIsCompleted(false);
    setSelectedOptionId(null);
    setFeedbackError(null);

    if (currentPuzzle.defaultInputs) {
      setInputA(currentPuzzle.defaultInputs.a ?? 0);
      setInputB(currentPuzzle.defaultInputs.b ?? 0);
    } else {
      setInputA(0);
      setInputB(0);
    }

    if (currentPuzzle.targetDecimal !== undefined) {
      setBitSwitches([0, 0, 0, 0]);
    }
  }, [currentPuzzle]);

  // Logic Gate computation
  const gateOutput = useMemo(() => {
    const a = inputA;
    const b = inputB;

    switch (currentPuzzle.gateType) {
      case 'AND':
        return a === 1 && b === 1 ? 1 : 0;
      case 'OR':
        return a === 1 || b === 1 ? 1 : 0;
      case 'NOT':
        return a === 1 ? 0 : 1;
      case 'XOR':
        return a !== b ? 1 : 0;
      case 'NAND':
        return a === 1 && b === 1 ? 0 : 1;
      case 'NOR':
        return a === 0 && b === 0 ? 1 : 0;
      case 'HALF_ADDER':
        return {
          sum: a !== b ? 1 : 0,
          carry: a === 1 && b === 1 ? 1 : 0
        };
      default:
        // Default check
        return a === 1 && b === 1 ? 1 : 0;
    }
  }, [currentPuzzle.gateType, inputA, inputB]);

  // Current Decimal Value from Bit Switches [8, 4, 2, 1]
  const currentDecimalFromBits = useMemo(() => {
    return (bitSwitches[0] * 8) + (bitSwitches[1] * 4) + (bitSwitches[2] * 2) + (bitSwitches[3] * 1);
  }, [bitSwitches]);

  const handleToggleBit = (index: number) => {
    sound.playClick();
    setBitSwitches((prev) => {
      const next = [...prev];
      next[index] = next[index] === 1 ? 0 : 1;
      return next;
    });
  };

  const handleToggleInputA = () => {
    sound.playClick();
    setInputA((prev) => (prev === 1 ? 0 : 1));
  };

  const handleToggleInputB = () => {
    sound.playClick();
    setInputB((prev) => (prev === 1 ? 0 : 1));
  };

  const handleProblemChange = (idx: number) => {
    setProblemIndex(idx);
    setIsCompleted(false);
    setSelectedOptionId(null);
    setFeedbackError(null);
  };

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
      setFeedbackError('おしい！論理ゲートの真理値や2進数の重み付けをもう一度確認してみよう！');
    }
  };

  const handleNextProblem = () => {
    if (problemIndex < puzzleList.length - 1) {
      handleProblemChange(problemIndex + 1);
    } else if (onNextLevel) {
      onNextLevel();
    }
  };

  const handleRetry = () => {
    setIsCompleted(false);
    setSelectedOptionId(null);
    setFeedbackError(null);
  };

  const badgeTag = customBadge || (isEX ? `EX裏 Lv.${level}` : `テックラボ ${currentGrade}年 Lv.${level}`);

  return (
    <GameModalWrapper
      title={customTitle || `論理回路＆2進数・暗号 - ${currentPuzzle.title}`}
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
      onSwitchProblem={handleProblemChange}
      onNextProblem={handleNextProblem}
    >
      <div className="flex-1 flex flex-col items-center justify-between p-2 sm:p-4 max-w-5xl mx-auto w-full gap-3 overflow-y-auto">
        {/* Top Header Card */}
        <div className="w-full bg-slate-900/90 border-2 border-cyan-400/60 rounded-2xl p-3 sm:p-4 shadow-md text-center text-white backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-black flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              {currentPuzzle.subtitle || '論理演算・デジタル回路'}
            </span>
            {currentPuzzle.gateType && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-xs font-black flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                ゲート: {currentPuzzle.gateType}
              </span>
            )}
            {currentPuzzle.targetDecimal !== undefined && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-black flex items-center gap-1">
                <Binary className="w-3 h-3 text-amber-400" />
                目標数: {currentPuzzle.targetDecimal}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-black text-cyan-300 tracking-wide mb-1">
            {currentPuzzle.title}
          </h3>
          <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed max-w-2xl mx-auto">
            {currentPuzzle.question}
          </p>
        </div>

        {/* Interactive Schematic / Bit Matrix Canvas */}
        <div className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950 border-2 border-cyan-500/40 rounded-3xl p-4 shadow-2xl relative flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
          {/* Background Matrix Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none rounded-3xl"
            style={{
              backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Mode 1: Bit Switches Matrix (for Grade 3 & Binary puzzles) */}
          {(currentPuzzle.puzzleType === 'binary_bits' || currentPuzzle.targetDecimal !== undefined) && (
            <div className="flex flex-col items-center gap-4 z-10 w-full max-w-lg">
              <div className="flex items-center justify-center gap-2 sm:gap-4 w-full">
                {[
                  { weight: 8, label: '8の位 (2³)', index: 0 },
                  { weight: 4, label: '4の位 (2²)', index: 1 },
                  { weight: 2, label: '2の位 (2¹)', index: 2 },
                  { weight: 1, label: '1の位 (2⁰)', index: 3 }
                ].map(({ weight, label, index }) => {
                  const isOn = bitSwitches[index] === 1;
                  return (
                    <button
                      key={weight}
                      onClick={() => handleToggleBit(index)}
                      className={`flex-1 flex flex-col items-center p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer active:scale-95 shadow-lg ${
                        isOn
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-cyan-500/30'
                          : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">
                        {label}
                      </span>
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black mb-2 transition-all ${
                          isOn
                            ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-400/40 shadow-md'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isOn ? '1' : '0'}
                      </div>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          isOn ? 'bg-cyan-400/30 text-cyan-300' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isOn ? `+${weight}` : 'OFF'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Decimal Sum Display */}
              <div className="flex items-center gap-3 bg-slate-900/90 border border-cyan-400/50 rounded-2xl px-5 py-2.5 shadow-md">
                <span className="text-xs text-slate-400 font-bold">現在の計算値:</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-300 tracking-wider">
                  {currentDecimalFromBits}
                </span>
                <span className="text-xs text-slate-500">
                  ({bitSwitches[0]}×8 + {bitSwitches[1]}×4 + {bitSwitches[2]}×2 + {bitSwitches[3]}×1)
                </span>
                {currentPuzzle.targetDecimal !== undefined && (
                  <span
                    className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                      currentDecimalFromBits === currentPuzzle.targetDecimal
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400'
                    }`}
                  >
                    {currentDecimalFromBits === currentPuzzle.targetDecimal ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> 目標一致！
                      </>
                    ) : (
                      `目標: ${currentPuzzle.targetDecimal}`
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Interactive Logic Gate Schematic (SVG) */}
          {(currentPuzzle.puzzleType === 'logic_gates' || currentPuzzle.puzzleType === 'half_adder') && (
            <div className="flex flex-col items-center gap-3 z-10 w-full max-w-xl">
              <svg viewBox="0 0 500 200" className="w-full h-40 sm:h-48 overflow-visible select-none">
                <defs>
                  <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="gateBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* Input Wire A */}
                <path
                  d="M 50 65 L 200 65"
                  stroke={inputA === 1 ? '#06b6d4' : '#475569'}
                  strokeWidth="4"
                  fill="none"
                  filter={inputA === 1 ? 'url(#cyanGlow)' : undefined}
                />
                {inputA === 1 && (
                  <circle cx="120" cy="65" r="4" fill="#67e8f9" className="animate-ping" />
                )}

                {/* Input Wire B (if not NOT gate) */}
                {currentPuzzle.gateType !== 'NOT' && (
                  <>
                    <path
                      d="M 50 135 L 200 135"
                      stroke={inputB === 1 ? '#06b6d4' : '#475569'}
                      strokeWidth="4"
                      fill="none"
                      filter={inputB === 1 ? 'url(#cyanGlow)' : undefined}
                    />
                    {inputB === 1 && (
                      <circle cx="120" cy="135" r="4" fill="#67e8f9" className="animate-ping" />
                    )}
                  </>
                )}

                {/* Output Wire */}
                <path
                  d={
                    currentPuzzle.gateType === 'HALF_ADDER'
                      ? 'M 300 70 L 400 70 M 300 130 L 400 130'
                      : 'M 300 100 L 410 100'
                  }
                  stroke={
                    currentPuzzle.gateType === 'HALF_ADDER'
                      ? typeof gateOutput === 'object' && gateOutput.sum === 1
                        ? '#10b981'
                        : '#475569'
                      : gateOutput === 1
                      ? '#10b981'
                      : '#475569'
                  }
                  strokeWidth="4"
                  fill="none"
                  filter="url(#cyanGlow)"
                />

                {/* Gate Body Schematic Symbol */}
                {currentPuzzle.gateType === 'NOT' ? (
                  // NOT Triangle with Circle
                  <g transform="translate(190, 60)">
                    <polygon
                      points="10,10 10,70 70,40"
                      fill="url(#gateBodyGrad)"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    <circle cx="78" cy="40" r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                    <text x="32" y="44" fill="#bae6fd" fontSize="11" fontWeight="black">
                      1
                    </text>
                  </g>
                ) : currentPuzzle.gateType === 'AND' || currentPuzzle.gateType === 'NAND' ? (
                  // AND Shape
                  <g transform="translate(190, 50)">
                    <path
                      d="M 10 10 L 55 10 A 40 40 0 0 1 55 90 L 10 90 Z"
                      fill="url(#gateBodyGrad)"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    {currentPuzzle.gateType === 'NAND' && (
                      <circle cx="102" cy="50" r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                    )}
                    <text x="45" y="55" fill="#bae6fd" fontSize="16" fontWeight="black" textAnchor="middle">
                      &amp;
                    </text>
                  </g>
                ) : currentPuzzle.gateType === 'OR' || currentPuzzle.gateType === 'NOR' ? (
                  // OR Shape
                  <g transform="translate(190, 50)">
                    <path
                      d="M 10 10 Q 35 50 10 90 Q 60 90 95 50 Q 60 10 10 10 Z"
                      fill="url(#gateBodyGrad)"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    {currentPuzzle.gateType === 'NOR' && (
                      <circle cx="102" cy="50" r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                    )}
                    <text x="45" y="55" fill="#bae6fd" fontSize="14" fontWeight="black" textAnchor="middle">
                      ≥1
                    </text>
                  </g>
                ) : currentPuzzle.gateType === 'XOR' ? (
                  // XOR Shape
                  <g transform="translate(180, 50)">
                    <path d="M 10 10 Q 30 50 10 90" stroke="#38bdf8" strokeWidth="3" fill="none" />
                    <path
                      d="M 20 10 Q 40 50 20 90 Q 70 90 105 50 Q 70 10 20 10 Z"
                      fill="url(#gateBodyGrad)"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    <text x="55" y="55" fill="#bae6fd" fontSize="14" fontWeight="black" textAnchor="middle">
                      =1
                    </text>
                  </g>
                ) : (
                  // HALF ADDER composite block
                  <g transform="translate(180, 40)">
                    <rect
                      x="10"
                      y="10"
                      width="100"
                      height="100"
                      rx="16"
                      fill="url(#gateBodyGrad)"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    <text x="60" y="50" fill="#38bdf8" fontSize="12" fontWeight="black" textAnchor="middle">
                      HALF ADDER
                    </text>
                    <text x="60" y="75" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      XOR(和) + AND(桁)
                    </text>
                  </g>
                )}

                {/* Output indicator Bulb / Lock */}
                {currentPuzzle.gateType === 'HALF_ADDER' ? (
                  <g transform="translate(410, 45)">
                    {/* Sum */}
                    <circle
                      cx="25"
                      cy="25"
                      r="16"
                      fill={typeof gateOutput === 'object' && gateOutput.sum === 1 ? '#10b981' : '#1e293b'}
                      stroke="#34d399"
                      strokeWidth="2"
                    />
                    <text x="25" y="29" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle">
                      S:{typeof gateOutput === 'object' ? gateOutput.sum : 0}
                    </text>
                    {/* Carry */}
                    <circle
                      cx="25"
                      cy="85"
                      r="16"
                      fill={typeof gateOutput === 'object' && gateOutput.carry === 1 ? '#3b82f6' : '#1e293b'}
                      stroke="#60a5fa"
                      strokeWidth="2"
                    />
                    <text x="25" y="89" fill="#ffffff" fontSize="11" fontWeight="black" textAnchor="middle">
                      C:{typeof gateOutput === 'object' ? gateOutput.carry : 0}
                    </text>
                  </g>
                ) : (
                  <g transform="translate(420, 80)">
                    <circle
                      cx="20"
                      cy="20"
                      r="22"
                      fill={gateOutput === 1 ? '#10b981' : '#1e293b'}
                      stroke={gateOutput === 1 ? '#34d399' : '#64748b'}
                      strokeWidth="3"
                      filter={gateOutput === 1 ? 'url(#cyanGlow)' : undefined}
                    />
                    <text
                      x="20"
                      y="26"
                      fill={gateOutput === 1 ? '#ffffff' : '#64748b'}
                      fontSize="16"
                      fontWeight="black"
                      textAnchor="middle"
                    >
                      {typeof gateOutput === 'number' ? gateOutput : gateOutput.sum}
                    </text>
                  </g>
                )}
              </svg>

              {/* Interactive Input Switch Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleToggleInputA}
                  className={`px-3.5 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow ${
                    inputA === 1
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-cyan-500/40'
                      : 'bg-slate-800 border-slate-600 text-slate-300'
                  }`}
                >
                  <span>スイッチ A:</span>
                  <span className="text-base font-black px-1.5 rounded bg-black/30">
                    {inputA}
                  </span>
                </button>

                {currentPuzzle.gateType !== 'NOT' && (
                  <button
                    onClick={handleToggleInputB}
                    className={`px-3.5 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow ${
                      inputB === 1
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-cyan-500/40'
                        : 'bg-slate-800 border-slate-600 text-slate-300'
                    }`}
                  >
                    <span>スイッチ B:</span>
                    <span className="text-base font-black px-1.5 rounded bg-black/30">
                      {inputB}
                    </span>
                  </button>
                )}

                {/* Output indicator banner */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-emerald-400/40 rounded-xl text-emerald-300 text-xs font-black shadow">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  <span>
                    出力:{' '}
                    {currentPuzzle.gateType === 'HALF_ADDER'
                      ? `Sum=${typeof gateOutput === 'object' ? gateOutput.sum : 0}, Carry=${
                          typeof gateOutput === 'object' ? gateOutput.carry : 0
                        }`
                      : typeof gateOutput === 'number'
                      ? gateOutput
                      : gateOutput.sum}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Cipher Wheel / Code Display */}
          {currentPuzzle.puzzleType === 'cipher_wheel' && (
            <div className="flex flex-col items-center gap-3 z-10 w-full max-w-md">
              <div className="flex items-center justify-center gap-3 bg-slate-900/90 border-2 border-cyan-400/50 rounded-2xl p-4 shadow-xl w-full text-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl">
                  <Key className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold mb-0.5">
                    暗号解読ホイール（Caesar Cipher）
                  </div>
                  <div className="text-sm sm:text-base font-black text-cyan-300 tracking-wider">
                    {currentPuzzle.shift ? `鍵: +${currentPuzzle.shift} 文字シフト` : '暗号換字キー照合'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Feedback Banner */}
        {feedbackError && (
          <div className="w-full bg-rose-500/20 border-2 border-rose-500/60 rounded-2xl p-3 text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-shake shadow-md">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        {/* Question Options Grid */}
        <div className="w-full bg-slate-900/90 border-2 border-cyan-500/40 rounded-2xl p-3.5 sm:p-4 text-white shadow-xl">
          <div className="text-xs font-black text-cyan-300 mb-3 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>正しい答えを選んでタップしよう！</span>
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
                        ? 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-400/30'
                        : 'bg-rose-600 border-rose-400 text-white'
                      : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-100 hover:border-cyan-400'
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
      </div>

      {/* Hint / Truth Table Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-400 rounded-3xl max-w-md w-full p-6 text-white text-center shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-3xl mx-auto mb-3">
              <HelpCircle className="w-7 h-7 text-cyan-400" />
            </div>
            <h4 className="text-lg font-black text-cyan-300 mb-2">
              論理回路・2進数・暗号解読ノート
            </h4>
            <p className="text-xs text-slate-300 font-bold mb-4 leading-relaxed">
              {currentPuzzle.hint}
            </p>

            {/* Quick Reference Tables */}
            <div className="bg-white/5 rounded-2xl p-3 text-left text-[11px] text-cyan-200 border border-white/10 mb-4 space-y-2">
              <div>
                <span className="font-black text-cyan-400 block mb-1">
                  【2進数の重み早見表】
                </span>
                <p>・8の位(2³)、4の位(2²)、2の位(2¹)、1の位(2⁰)</p>
                <p>・例: 1011₂ ＝ 8×1 + 4×0 + 2×1 + 1×1 ＝ 11</p>
              </div>
              <div className="border-t border-white/10 pt-1.5">
                <span className="font-black text-cyan-400 block mb-1">
                  【基本論理ゲート真理値】
                </span>
                <p>・<strong>AND</strong>: 両方1の時だけ1（掛け算）</p>
                <p>・<strong>OR</strong>: どちらか1なら1（足し算）</p>
                <p>・<strong>NOT</strong>: 0なら1、1なら0に反転</p>
                <p>・<strong>XOR</strong>: 2つが異なる時だけ1、同じなら0</p>
              </div>
              <div className="border-t border-white/10 pt-1.5">
                <span className="font-black text-cyan-400 block mb-1">
                  【半加算器（Half Adder）】
                </span>
                <p>・和 Sum ＝ A ⊕ B（XORゲート）</p>
                <p>・繰り上がり Carry ＝ A · B（ANDゲート）</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setIsHelpOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-colors cursor-pointer"
            >
              わかった！閉じる
            </button>
          </div>
        </div>
      )}
    </GameModalWrapper>
  );
};
