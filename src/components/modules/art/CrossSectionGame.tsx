import React, { useState, useMemo } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Scissors, Layers, Zap, Sparkles, HelpCircle, AlertTriangle } from 'lucide-react';

// =============================================================================
// Types & Interfaces
// =============================================================================

export interface CrossSectionPoint3D {
  id: string;
  label: string;
  x: number; // 0..1 in cube space
  y: number; // 0..1 in cube space
  z: number; // 0..1 in cube space
  description?: string;
}

export interface CrossSectionPuzzle {
  id: string;
  title: string;
  subtitle: string;
  question: string;
  puzzleType: 'slice_identify' | 'slice_exam_quiz';
  solidType?: 'cube' | 'prism' | 'pyramid';
  cutPoints: CrossSectionPoint3D[];
  polygonShape: string; // e.g. '正三角形', '等脚台形', '正六角形', '五角形'
  polygonVertices: { x: number; y: number; z: number }[];
  options: { id: string; text: string; correct: boolean }[];
  hint: string;
  explanation: string;
  examTip: string;
}

// =============================================================================
// Grade 3-6 Curriculum Puzzles (72 Problems)
// =============================================================================

const GRADE_CROSS_SECTION_PUZZLES: Record<number, Record<number, CrossSectionPuzzle[]>> = {
  // 🎒 Grade 3: Face/Edge Basics, Corner Slices (Triangles, Rectangles)
  3: {
    1: [
      {
        id: 'g3_l1_p1',
        title: '立方体のカド切り落とし（三角形）',
        subtitle: '頂点を斜めにスパッとスライス！',
        question: '立方体の1つの角（頂点）を斜めに切り落としました。現れる切り口の断面は何の図形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '正三角形',
        cutPoints: [
          { id: 'p1', label: 'P', x: 1, y: 0.5, z: 1, description: '上の辺' },
          { id: 'p2', label: 'Q', x: 0.5, y: 0, z: 1, description: '右の辺' },
          { id: 'p3', label: 'R', x: 1, y: 0, z: 0.5, description: '手前の縦辺' }
        ],
        polygonVertices: [
          { x: 1, y: 0.5, z: 1 },
          { x: 0.5, y: 0, z: 1 },
          { x: 1, y: 0, z: 0.5 }
        ],
        options: [
          { id: 'opt1', text: '3つの頂点を結ぶ「三角形」！', correct: true },
          { id: 'opt2', text: '四角い「正方形」', correct: false },
          { id: 'opt3', text: '丸い「円」', correct: false }
        ],
        hint: 'カド（頂点）のまわりにある3つの面をまっすぐ切り落とすよ！',
        explanation: '正解は「三角形」！立方体の1つの頂点に集まる3つの面を通る平面で切断すると、必ず3つの辺（切り口）ができて三角形が現れます！',
        examTip: '【切断の第一歩】立体のカドを斜めに落とすと、切り口は必ず「三角形」になります！'
      },
      {
        id: 'g3_l1_p2',
        title: '正三角形になる特別なカド切り',
        subtitle: '3辺の長さが全部同じ！',
        question: '立方体の1つの頂点から、同じ長さだけ離れた3点を結んで切断したよ。この切り口の三角形はどんな三角形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '正三角形',
        cutPoints: [
          { id: 'p1', label: 'P', x: 1, y: 0.5, z: 1 },
          { id: 'p2', label: 'Q', x: 0.5, y: 0, z: 1 },
          { id: 'p3', label: 'R', x: 1, y: 0, z: 0.5 }
        ],
        polygonVertices: [
          { x: 1, y: 0.5, z: 1 },
          { x: 0.5, y: 0, z: 1 },
          { x: 1, y: 0, z: 0.5 }
        ],
        options: [
          { id: 'opt1', text: '3つの辺の長さがすべて等しい「正三角形」', correct: true },
          { id: 'opt2', text: '1つの角が90度の「直角三角形」', correct: false },
          { id: 'opt3', text: 'すべての辺の長さが違う三角形', correct: false }
        ],
        hint: '立方体のどの面も同じ正方形だから、切り口の線の長さもぜんぶ同じだよ！',
        explanation: '正解は「正三角形」！立方体の3つの面は合同な正方形なので、等しい距離で切ると切り口の3辺の長さも完全に等しくなり、綺麗な正三角形ができます！',
        examTip: '【対称性と正三角形】立方体のカドを均等に切り落とすと、必ず「正三角形」の断面になります！'
      },
      {
        id: 'g3_l1_p3',
        title: '切り落としたカドの形',
        subtitle: '切り離された小さな立体は？',
        question: '立方体のカドを切り落としたときにポロッと取れる小さな立体は、何という形の立体かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '三角すい',
        cutPoints: [
          { id: 'p1', label: 'P', x: 1, y: 0.5, z: 1 },
          { id: 'p2', label: 'Q', x: 0.5, y: 0, z: 1 },
          { id: 'p3', label: 'R', x: 1, y: 0, z: 0.5 }
        ],
        polygonVertices: [
          { x: 1, y: 0.5, z: 1 },
          { x: 0.5, y: 0, z: 1 },
          { x: 1, y: 0, z: 0.5 }
        ],
        options: [
          { id: 'opt1', text: '底面が三角形で先がとがった「三角すい」', correct: true },
          { id: 'opt2', text: '直方体', correct: false },
          { id: 'opt3', text: '円すい', correct: false }
        ],
        hint: '底も側面も全部三角形で、てっぺんに1つの頂点があるよ！',
        explanation: '正解は「三角すい」！4つの面がすべて三角形でできた立体（三角すい／四面体）になります！',
        examTip: '【立体の分類】カドを切り落とすと、取れる破片は必ず「三角すい」になります！'
      }
    ],
    2: [
      {
        id: 'g3_l2_p1',
        title: '面と平行にまっすぐ切断',
        subtitle: '金太郎あめのようにスライス！',
        question: '立方体を、上の面と平行になるように真横に水平にスパッと切断しました。切り口は何の図形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '正方形',
        cutPoints: [
          { id: 'p1', label: 'P', x: 0, y: 0, z: 0.5 },
          { id: 'p2', label: 'Q', x: 1, y: 0, z: 0.5 },
          { id: 'p3', label: 'R', x: 1, y: 1, z: 0.5 },
          { id: 'p4', label: 'S', x: 0, y: 1, z: 0.5 }
        ],
        polygonVertices: [
          { x: 0, y: 0, z: 0.5 },
          { x: 1, y: 0, z: 0.5 },
          { x: 1, y: 1, z: 0.5 },
          { x: 0, y: 1, z: 0.5 }
        ],
        options: [
          { id: 'opt1', text: '上の面とまったく同じ「正方形」', correct: true },
          { id: 'opt2', text: '横長の「長方形」', correct: false },
          { id: 'opt3', text: '斜めの「ひし形」', correct: false }
        ],
        hint: '豆腐をまな板と平行にまっすぐ切る様子を想像してみよう！',
        explanation: '正解は「正方形」！面に平行な平面で切断すると、どの高さで切っても元の面とまったく同じ大きさ・形の正方形が現れます！',
        examTip: '【平行切断の法則】面と平行な切断では、切り口は必ずその面と合同な図形になります！'
      },
      {
        id: 'g3_l2_p2',
        title: '縦にまっすぐ切断',
        subtitle: '正面から奥へスライス！',
        question: '立方体を、正面の面と平行に縦にまっすぐ切断したとき、現れる切り口の形はどうなるかな？',
        puzzleType: 'slice_identify',
        polygonShape: '正方形',
        cutPoints: [
          { id: 'p1', label: 'P', x: 0, y: 0.5, z: 0 },
          { id: 'p2', label: 'Q', x: 1, y: 0.5, z: 0 },
          { id: 'p3', label: 'R', x: 1, y: 0.5, z: 1 },
          { id: 'p4', label: 'S', x: 0, y: 0.5, z: 1 }
        ],
        polygonVertices: [
          { x: 0, y: 0.5, z: 0 },
          { x: 1, y: 0.5, z: 0 },
          { x: 1, y: 0.5, z: 1 },
          { x: 0, y: 0.5, z: 1 }
        ],
        options: [
          { id: 'opt1', text: '縦も横も同じ長さの「正方形」', correct: true },
          { id: 'opt2', text: '三角形', correct: false },
          { id: 'opt3', text: '台形', correct: false }
        ],
        hint: '立方体は6つの面がすべて同じ正方形だよ！',
        explanation: '正解は「正方形」！立方体はどの面も1辺の長さが等しい正方形なので、どの面に平行に切っても切り口は正方形になります！',
        examTip: '【立方体の対称性】立方体は上下・左右・前後のどこから平行に切っても切り口はすべて正方形です！'
      },
      {
        id: 'g3_l2_p3',
        title: '切ったあとの立体の数',
        subtitle: '1回切ると何個になる？',
        question: '1つの立方体を、平面で1回まっぷたつに切断すると、立体は何個に分かれるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '分割数',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: 'ちょうど「2個」に分かれる！', correct: true },
          { id: 'opt2', text: '3個に分かれる', correct: false },
          { id: 'opt3', text: '4個に分かれる', correct: false }
        ],
        hint: 'りんごを包丁で1回スパッと切ったら何個になる？',
        explanation: '正解は「2個」！1つの立体を1枚の平面で通り抜けて切断すると、必ず2つの立体に分割されます！',
        examTip: '【切断回数と分割数】1回の切断で立体は2つに分かれます。2回切ると最大4つになります！'
      }
    ],
    3: [
      {
        id: 'g3_l3_p1',
        title: '対角線でまっぷたつ（長方形）',
        subtitle: '向かい合う稜線を通る斜め切断！',
        question: '上の面の対角線と、底面の対角線を通る平面で斜めに切断しました。切り口は何の図形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '長方形',
        cutPoints: [
          { id: 'p1', label: 'A', x: 0, y: 0, z: 1 },
          { id: 'p2', label: 'C', x: 1, y: 1, z: 1 },
          { id: 'p3', label: 'G', x: 1, y: 1, z: 0 },
          { id: 'p4', label: 'E', x: 0, y: 0, z: 0 }
        ],
        polygonVertices: [
          { x: 0, y: 0, z: 1 },
          { x: 1, y: 1, z: 1 },
          { x: 1, y: 1, z: 0 },
          { x: 0, y: 0, z: 0 }
        ],
        options: [
          { id: 'opt1', text: '横が対角線で縦より長い「長方形」！', correct: true },
          { id: 'opt2', text: '4辺が等しい「正方形」', correct: false },
          { id: 'opt3', text: '三角形', correct: false }
        ],
        hint: '正方形の対角線の長さは、1辺の長さより少し長くなるよね！',
        explanation: '正解は「長方形」！切り口の横の長さは正方形の対角線（約1.41倍）で、縦の長さは立方体の高さ（1辺）です。縦と横の長さが違うため長方形になります！',
        examTip: '【対角面切断】対角線を通る切断面は、横が長くて縦が短い「長方形」になります！'
      },
      {
        id: 'g3_l3_p2',
        title: '分かれた立体の形（三角柱）',
        subtitle: 'ケーキを斜めに半分こ！',
        question: '対角線で斜めに切断してできた2つの立体は、それぞれ何という立体かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '三角柱',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '底面が直角二等辺三角形の「三角柱」2個！', correct: true },
          { id: 'opt2', text: '三角すい 2個', correct: false },
          { id: 'opt3', text: '直方体 2個', correct: false }
        ],
        hint: '上も下も同じ三角形で、柱のようにまっすぐ伸びているよ！',
        explanation: '正解は「三角柱」！上と下の面が直角二等辺三角形で、側面が四角形の「直角三角柱」が合同に2個できます！',
        examTip: '【柱体の切断】立方体を対角線で切ると、体積が全く同じ2つの三角柱に分かれます！'
      },
      {
        id: 'g3_l3_p3',
        title: '断面の向かい合う辺の関係',
        subtitle: '平行な面にある線はどうなる？',
        question: '立方体の上の面と下の面は平行です。この2つの面に現れた切り口の線どうしは、どんな関係になっているかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '平行関係',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '必ず「平行（どこまで伸ばしても交わらない）」になる！', correct: true },
          { id: 'opt2', text: '必ず直角に交わる', correct: false },
          { id: 'opt3', text: '関係は決まっていない', correct: false }
        ],
        hint: '平行な天井と床を1枚の板で切ると、板が触れる線はどちらも同じ向きになるよ！',
        explanation: '正解は「平行」！平行な2つの面を1枚の平面で切ると、それぞれの面にできる切り口の線は必ず平行になります（切断の重要鉄則）！',
        examTip: '【中学受験の最重要定理】「平行な面に現れる切り口の線は必ず平行！」これは絶対に覚えておこう！'
      }
    ],
    4: [
      {
        id: 'g3_l4_p1',
        title: '三角柱を横にスライス',
        subtitle: '柱の途中を水平にカット！',
        question: '三角柱を、底面と平行に水平にスパッと切断したよ。現れる切り口の断面は何の図形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '三角形',
        solidType: 'prism',
        cutPoints: [
          { id: 'p1', label: 'P', x: 0, y: 0, z: 0.5 },
          { id: 'p2', label: 'Q', x: 1, y: 0, z: 0.5 },
          { id: 'p3', label: 'R', x: 0, y: 1, z: 0.5 }
        ],
        polygonVertices: [
          { x: 0, y: 0, z: 0.5 },
          { x: 1, y: 0, z: 0.5 },
          { x: 0, y: 1, z: 0.5 }
        ],
        options: [
          { id: 'opt1', text: '底面と同じ形の「三角形」！', correct: true },
          { id: 'opt2', text: '四角形', correct: false },
          { id: 'opt3', text: '五角形', correct: false }
        ],
        hint: 'バウムクーヘンや柱を横にスライスすると、底と同じ形が出てくるよ！',
        explanation: '正解は「三角形」！柱体（三角柱）を底面に平行に切断すると、底面と合同な三角形が現れます！',
        examTip: '【柱体の断面】底面に平行な断面は、すべて底面と全く同じ合同な図形になります！'
      },
      {
        id: 'g3_l4_p2',
        title: '四角すいの横スライス',
        subtitle: 'ピラミッドを途中で切ると？',
        question: '底面が正方形の四角すい（ピラミッド型）を、底面と平行に途中で水平切断したよ。切り口は何の図形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '正方形',
        solidType: 'pyramid',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '底面を一回り小さくした「正方形」！', correct: true },
          { id: 'opt2', text: '三角形', correct: false },
          { id: 'opt3', text: 'ひし形', correct: false }
        ],
        hint: '上に行くほど細くなるけれど、向きや形のバランスは底と同じ正方形だよ！',
        explanation: '正解は「正方形」！四角すいを底面に平行に切ると、底面をそのまま縮小した相似な正方形が現れます！',
        examTip: '【すい体の断面】すい体を底面に平行に切ると、底面と相似な図形（縮小版）が現れます！'
      },
      {
        id: 'g3_l4_p3',
        title: '四角すい台の誕生',
        subtitle: '切り落としたあとに残る立体',
        question: '四角すいのてっぺんを底面に平行に切り落としたとき、下に残る（てっぺんが平らな）立体は何と呼ぶかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '四角すい台',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '四角すいの頭を切った「四角すい台（だい）」', correct: true },
          { id: 'opt2', text: '立方体', correct: false },
          { id: 'opt3', text: '三角柱', correct: false }
        ],
        hint: '跳び箱やプリンのような、上が平らなすい体の形だよ！',
        explanation: '正解は「四角すい台」！すい体の頭を底面に平行に切り落として残る立体を「すい台（台体）」と呼びます！',
        examTip: '【すい台の基本】跳び箱のような形を「すい台」と呼び、中学入試の体積問題で頻出です！'
      }
    ],
    5: [
      {
        id: 'g3_l5_p1',
        title: '頂点・辺・面の数の変化',
        subtitle: 'カドを1つ切り落とすと面はどうなる？',
        question: '立方体（面が6つ）の角を1つ斜めに切り落としました。残った立体の「面の数」はいくつになったかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '面の数',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '切り口が新しい面になって「7つ」に増える！', correct: true },
          { id: 'opt2', text: 'カドが取れたので「5つ」に減る', correct: false },
          { id: 'opt3', text: '変わらず「6つ」のまま', correct: false }
        ],
        hint: '切り口という「新しい面」が1枚増えるよ！',
        explanation: '正解は「7つ」！元の立方体の6つの面に加えて、切り口の三角形が新しい1面になるので、6 + 1 = 7面になります！',
        examTip: '【切断と面の数】カドを切ると、切り口が新しい1つの面になります！'
      },
      {
        id: 'g3_l5_p2',
        title: '頂点の数の変化',
        subtitle: '元の頂点1つが切り落とされると？',
        question: '立方体（頂点が8つ）の角を1つ切り落としました。元の頂点1つが無くなり、切り口に新しい頂点ができると、頂点の数は全部でいくつになるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '頂点の数',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '元の8個から1個減って3個増えて「10個」！', correct: true },
          { id: 'opt2', text: '7個', correct: false },
          { id: 'opt3', text: '9個', correct: false }
        ],
        hint: '角が1つ無くなる代わりに、三角形の切り口に3つの頂点が生まれるよ！ (8 - 1 + 3)',
        explanation: '正解は「10個」！元の頂点が1つ失われますが、切り口の三角形の3頂点が新しくできるため、8 - 1 + 3 = 10個になります！',
        examTip: '【頂点の増減計算】カドを切ると「1つ減って3つ増える」ので、差し引き2つ増えます！'
      },
      {
        id: 'g3_l5_p3',
        title: '辺の数の変化',
        subtitle: '辺の数はどうなるかな？',
        question: '立方体（辺が12本）の角を1つ切り落としたとき、残った立体の辺の数は何本になるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '辺の数',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '切り口に3本の辺が増えて「15本」！', correct: true },
          { id: 'opt2', text: '12本', correct: false },
          { id: 'opt3', text: '11本', correct: false }
        ],
        hint: '切り口の三角形のまわりに、3本の新しい辺ができるよ！',
        explanation: '正解は「15本」！元の12本の辺は短くなりますが本数はそのまま残り、切り口の三角形の3辺が加わるため、12 + 3 = 15本になります！',
        examTip: '【辺の増加】角を切ると、断面の多角形の辺の数だけ全体の辺が増加します！'
      }
    ],
    6: [
      {
        id: 'g3_l6_p1',
        title: '【小3総まとめ】切断でできる図形の推理',
        subtitle: '立方体を切って作れない形は？',
        question: '立方体をまっすぐな平面で「1回だけ」切断したとき、切り口として【絶対にできない】ものはどれかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '推理クイズ',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '曲がった線の「円」！', correct: true },
          { id: 'opt2', text: 'まっすぐな線の「三角形」', correct: false },
          { id: 'opt3', text: 'まっすぐな線の「四角形」', correct: false }
        ],
        hint: '立方体の面はすべてまっ平らな平面。平面と平面が交わると必ず「直線」になるよ！',
        explanation: '正解は「円」！立方体は平らな面だけで囲まれているため、平面で切った切り口の線はすべて「直線」になります。曲線でできた円は絶対に作れません！',
        examTip: '【多面体の切り口】多面体を平面で切断すると、切り口は必ず「多角形」になり、曲線は現れません！'
      },
      {
        id: 'g3_l6_p2',
        title: '豆腐のさいの目切り',
        subtitle: '縦横高さで何個に分かれる？',
        question: '立方体の豆腐に、縦に1回、横に1回、水平に1回（合計3回）包丁を入れて切断しました。豆腐は何個の小立方体になったかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '分割推理',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '2 × 2 × 2 で「8個」！', correct: true },
          { id: 'opt2', text: '6個', correct: false },
          { id: 'opt3', text: '4個', correct: false }
        ],
        hint: '縦で2等分、横で2等分、高さで2等分！',
        explanation: '正解は「8個」！各方向で2分割されるため、2 × 2 × 2 = 8個の小さな立方体に分かれます！',
        examTip: '【3次元の分割】縦a分割・横b分割・高さc分割で「a×b×c個」のブロックができます！'
      },
      {
        id: 'g3_l6_p3',
        title: '小3マスタークリア！',
        subtitle: '空間把握の天才探検隊！',
        question: '立方体の切断をたくさん観察しました。立方体の角を4つ全部切り落とすと、どんな形に近づいていくかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '多面体観察',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '角が丸くなって面が増えた「サッカーボールのような多面体」！', correct: true },
          { id: 'opt2', text: '完全な直方体', correct: false },
          { id: 'opt3', text: '三角形', correct: false }
        ],
        hint: '宝石や彫刻のように、カドを削っていくと面がたくさん増えて丸みに近づくよ！',
        explanation: '正解！カドをたくさん切り落とす（面取りする）と、面がどんどん増えてサッカーボール（切頭多面体）や球体に近づいていきます！',
        examTip: '【立体幾何のアート】彫刻やダイヤモンドカットは、この立体の切断技術を応用しています！'
      }
    ]
  },

  // 🎒 Grade 4: Rule 1 (Connect points on same plane), Rule 2 (Parallel planes give parallel cuts)
  4: {
    1: [
      {
        id: 'g4_l1_p1',
        title: '【第1鉄則】同一平面上の2点は結ぶ！',
        subtitle: '同じ面にある2つの点は直線でつなぐ！',
        question: '立方体の上の面に点Pと点Qがあります。この2点を通る切り口の線はどう引くのが正しいかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '第1鉄則',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '同じ面（上の面）の上を「まっすぐな直線」で結ぶ！', correct: true },
          { id: 'opt2', text: '立体の内部を通る曲線を引く', correct: false },
          { id: 'opt3', text: '結ばずに点だけ残す', correct: false }
        ],
        hint: '紙の上に描いた2つの点を結ぶときと同じ！同じ面にあるなら一直線に結べるよ！',
        explanation: '正解！【切断の第1鉄則】同じ平面上にある2つの切断点は、その面の上で定規を当ててまっすぐ直線で結ぶことができます！',
        examTip: '【切断の第1鉄則】「同一平面上の2点は結ぶ！」切断作図問題のすべての基本です！'
      },
      {
        id: 'g4_l1_p2',
        title: '同一面上の2点結び実践（二等辺三角形）',
        subtitle: '辺の中点と頂点を結ぶ！',
        question: '上の面の頂点Aと、同じ面にある辺BCの中点Mを結びました。この線は切り口の1辺になるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '実践作図',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '同じ上の面にあるので、そのまま切り口の1辺になる！', correct: true },
          { id: 'opt2', text: '中点は結ぶことができない', correct: false },
          { id: 'opt3', text: '向かいの底面まで線を伸ばさないといけない', correct: false }
        ],
        hint: '頂点も中点も、同じ「上の面」にある点だよ！',
        explanation: '正解！頂点Aも中点Mも同じ上面にあるため、その2点を結んだ線分AMがそのまま切り口の1辺になります！',
        examTip: '【作図の第一歩】まず同じ面上にある2点ペアを探して、線を引くことから始めます！'
      },
      {
        id: 'g4_l1_p3',
        title: '違う面にある2点は結べる？',
        subtitle: '立体の空中は通れない！',
        question: '上の面にある点Pと、底面にある点R。この2点を「立体の表面に線を引く」とき、いきなり結んでもいいかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '注意点',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: 'ダメ！同じ面にない2点は直接結んではいけない！', correct: true },
          { id: 'opt2', text: 'いつでも自由に結んでよい', correct: false },
          { id: 'opt3', text: '対角線なら結んでよい', correct: false }
        ],
        hint: '面の上を走る線を描きたいのに、空中を突っ切ると面の線になりません！',
        explanation: '正解！異なる面にある2点を直接結ぶと立体の内部を通ってしまい、表面の切り口の線になりません。必ず同じ面にある点同士だけを結びます！',
        examTip: '【切断の禁止事項】「違う面にある2点を直接結んではいけない！」超重要な注意点です！'
      }
    ],
    2: [
      {
        id: 'g4_l2_p1',
        title: '【第2鉄則】平行な面の切り口は必ず平行！',
        subtitle: '向かい合う面にあらわれる切り口の秘密',
        question: '立方体の「上の面」と「下の面」に切り口の線が現れました。この2本の線の関係はどうなるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '第2鉄則',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '向かい合う面が平行なので、切り口の線も「必ず平行」になる！', correct: true },
          { id: 'opt2', text: '必ず直角に交わる', correct: false },
          { id: 'opt3', text: '長さが違えば平行にはならない', correct: false }
        ],
        hint: '1枚の平らな板を平行な2枚の壁に通すと、交わる線は同じ傾きになるよ！',
        explanation: '正解！【切断の第2鉄則】向かい合う平行な2面を1つの平面で切断すると、それぞれの面に現れる切り口の線は「必ず平行」になります！',
        examTip: '【切断の第2鉄則】中学入試で最も使う必殺技！「平行面の切り口は必ず平行！」'
      },
      {
        id: 'g4_l2_p2',
        title: '平行線の作図で四角形を完成！',
        subtitle: '上の線と平行に下の線を引く！',
        question: '上の面に右上がりの切り口の線（傾き1）が引けました。向かい合う下の面を通る切り口の線はどう引けばいいかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '平行作図',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '上の線と「同じ傾きの平行線」を引く！', correct: true },
          { id: 'opt2', text: '逆向きに交差する線を引く', correct: false },
          { id: 'opt3', text: '適当に真っ直ぐ引く', correct: false }
        ],
        hint: '第2鉄則を使うと、向かいの面の線の傾き（方向）が一瞬で決まるよ！',
        explanation: '正解！上の面の切り口の線と平行になるように、下の面の通る点から同じ傾きの直線を引くことで、切り口の線が確定します！',
        examTip: '【平行線の移動】向かい合う面に平行線をスライドして引くのが切断作図の奥義です！'
      },
      {
        id: 'g4_l2_p3',
        title: '平行面は何組ある？',
        subtitle: '立方体の向かい合う面のペア',
        question: '立方体には、互いに平行に向かい合っている面のペアは全部で何組あるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '平行ペア数',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '「上と下」「前と後ろ」「左と右」の【3組】！', correct: true },
          { id: 'opt2', text: '2組', correct: false },
          { id: 'opt3', text: '6組', correct: false }
        ],
        hint: 'サイコロの「1と6」「2と5」「3と4」のペアを思い出そう！',
        explanation: '正解は「3組」！立方体には「上下」「前後」「左右」の3組の平行な面があり、この3組それぞれで平行線のルールが使えます！',
        examTip: '【3組の平行面】3組の平行面ルールを使いこなすことで、複雑な切断線もパズルのように解けます！'
      }
    ],
    3: [
      {
        id: 'g4_l3_p1',
        title: '等脚台形の断面',
        subtitle: '平行な2辺を持つ四角形！',
        question: '上面の短い切り口と、底面の長い切り口。この2辺が平行で長さが異なる四角形断面は何の図形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '等脚台形',
        cutPoints: [
          { id: 'p1', label: 'P', x: 0.5, y: 0, z: 1 },
          { id: 'p2', label: 'Q', x: 0, y: 0.5, z: 1 },
          { id: 'p3', label: 'R', x: 0, y: 1, z: 0 },
          { id: 'p4', label: 'S', x: 1, y: 0, z: 0 }
        ],
        polygonVertices: [
          { x: 0.5, y: 0, z: 1 },
          { x: 0, y: 0.5, z: 1 },
          { x: 0, y: 1, z: 0 },
          { x: 1, y: 0, z: 0 }
        ],
        options: [
          { id: 'opt1', text: '上底と下底が平行で左右対称な「等脚台形」！', correct: true },
          { id: 'opt2', text: '長方形', correct: false },
          { id: 'opt3', text: 'ひし形', correct: false }
        ],
        hint: '向かい合う1組の辺だけが平行な四角形だよ！左右の斜めの辺の長さは等しいよ！',
        explanation: '正解は「等脚台形」！上面と底面の切り口が平行（長さが違う）で、左右の側面にできる斜めの辺の長さが等しいため、等脚台形になります！',
        examTip: '【台形断面】上面と底面を通る切断で最もよく登場するのが「台形（等脚台形）」です！'
      },
      {
        id: 'g4_l3_p2',
        title: '平行四辺形の断面',
        subtitle: '2組の向かい合う辺が平行！',
        question: '立方体の向かい合う2面をナナメに切断したとき、上と下、前と後ろの2組の辺がそれぞれ平行な四角形ができました。何の図形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '平行四辺形',
        cutPoints: [
          { id: 'p1', label: 'P', x: 0.3, y: 0, z: 1 },
          { id: 'p2', label: 'Q', x: 1, y: 0.7, z: 1 },
          { id: 'p3', label: 'R', x: 0.7, y: 1, z: 0 },
          { id: 'p4', label: 'S', x: 0, y: 0.3, z: 0 }
        ],
        polygonVertices: [
          { x: 0.3, y: 0, z: 1 },
          { x: 1, y: 0.7, z: 1 },
          { x: 0.7, y: 1, z: 0 },
          { x: 0, y: 0.3, z: 0 }
        ],
        options: [
          { id: 'opt1', text: '2組の対辺が平行な「平行四辺形」！', correct: true },
          { id: 'opt2', text: '正三角形', correct: false },
          { id: 'opt3', text: '五角形', correct: false }
        ],
        hint: '向かい合う2組の面（上下、左右）がそれぞれ平行線をつくるよ！',
        explanation: '正解は「平行四辺形」！立方体の平行な2組の面を通過するため、切り口の向かい合う2組の辺がそれぞれ平行になり、平行四辺形になります！',
        examTip: '【平行四辺形断面】2組の平行面を通る四角形断面は、必ず「平行四辺形」になります！'
      },
      {
        id: 'g4_l3_p3',
        title: 'ひし形の断面',
        subtitle: '4つの辺の長さが全部等しい！',
        question: '平行四辺形断面のうち、4つの辺の長さがすべて等しくなるように切断したよ。この特別な四角形は何かな？',
        puzzleType: 'slice_identify',
        polygonShape: 'ひし形',
        cutPoints: [
          { id: 'p1', label: 'A', x: 0.5, y: 0, z: 1 },
          { id: 'p2', label: 'B', x: 1, y: 0.5, z: 0.5 },
          { id: 'p3', label: 'C', x: 0.5, y: 1, z: 0 },
          { id: 'p4', label: 'D', x: 0, y: 0.5, z: 0.5 }
        ],
        polygonVertices: [
          { x: 0.5, y: 0, z: 1 },
          { x: 1, y: 0.5, z: 0.5 },
          { x: 0.5, y: 1, z: 0 },
          { x: 0, y: 0.5, z: 0.5 }
        ],
        options: [
          { id: 'opt1', text: '4辺がすべて等しい「ひし形」！', correct: true },
          { id: 'opt2', text: '正方形（角が90度）', correct: false },
          { id: 'opt3', text: '台形', correct: false }
        ],
        hint: '4本の辺の長さは等しいけれど、角は90度ではない斜めの形だよ！',
        explanation: '正解は「ひし形」！対辺が平行で、4辺の長さがすべて等しい（直角は含まない）ため、美しいひし形断面になります！',
        examTip: '【ひし形の切断】各辺の中点を対称に結ぶと、対角線が直交する「ひし形」が現れます！'
      }
    ],
    4: [
      {
        id: 'g4_l4_p1',
        title: '直方体の切断と平行線',
        subtitle: '縦・横・高さが違う箱を切る！',
        question: '直方体の上面と底面は平行です。直方体を斜めに切断したとき、上面の切り口と底面の切り口の線はどうなるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '直方体平行則',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '立方体と同じく「必ず平行」になる！', correct: true },
          { id: 'opt2', text: '直方体では平行にならない', correct: false },
          { id: 'opt3', text: '長さが違えばねじれの位置になる', correct: false }
        ],
        hint: '直方体でも、向かい合う上面と底面は平行だよね！',
        explanation: '正解！直方体であっても向かい合う面が平行であることに変わりはないため、切り口の線は必ず平行になります！',
        examTip: '【直方体でも有効】「平行面の切り口は平行」というルールは、直方体や平行六面体でも全く同じように使えます！'
      },
      {
        id: 'g4_l4_p2',
        title: '傾きの比率（ステップ数）',
        subtitle: '横にどれだけ進んで縦にどれだけ下がる？',
        question: '上の面で「右に2マス進んで奥に1マス進む」切り口の線が引けました。向かい合う底面の平行線はどう進むかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '傾き比率',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '全く同じ「右に2マス、奥に1マス」の傾きで進む！', correct: true },
          { id: 'opt2', text: '右に1マス、奥に2マス', correct: false },
          { id: 'opt3', text: '右に2マス、手前に1マス', correct: false }
        ],
        hint: '平行線は「傾き（縦横の比率）」が完全に同じ直線だよ！',
        explanation: '正解！平行であるということは傾き（ベクトルの比率）が一致するということなので、底面でも「右に2、奥に1」の比率で線を引きます！',
        examTip: '【マス目で解く切断】「横に○マス、縦に△マス」とグリッドの比率を数えるのが入試テクニックです！'
      },
      {
        id: 'g4_l4_p3',
        title: '平行四辺形ができる条件',
        subtitle: '向かい合う2組の平行面を通る',
        question: '立方体の切断面が「四角形」になるとき、その四角形の向かい合う辺が2組とも平行になるのはどんな切断のときかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '平行四辺形条件',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '「上と下」かつ「前と後」のように平行な面2組を通るとき！', correct: true },
          { id: 'opt2', text: '隣り合う面だけを通るとき', correct: false },
          { id: 'opt3', text: 'カドの頂点だけを通るとき', correct: false }
        ],
        hint: '四角形の4つの辺が、立方体のどの面の上に乗っているかを考えよう！',
        explanation: '正解！向かい合う面2組（例: 上下と前後）を通ると、それぞれの組で平行線ができるため、2組の対辺が平行な平行四辺形になります！',
        examTip: '【面と図形の関係】どの面を通っているかを整理すると、切り口の図形が何になるか瞬時に判定できます！'
      }
    ],
    5: [
      {
        id: 'g4_l5_p1',
        title: '長方形断面の対角線',
        subtitle: '正方形と長方形の見分け方',
        question: '立方体の上面の対角線と底面の対角線を通る切断面。この四角形の4つの角は直角（90度）かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '直角判定',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '高さの縦辺と底面の対角線が垂直なので「4つとも90度」！', correct: true },
          { id: 'opt2', text: '直角ではなく斜めになっている', correct: false },
          { id: 'opt3', text: '上の角だけ直角', correct: false }
        ],
        hint: '立方体の縦の柱は、底面に対してまっすぐ垂直（90度）に立っているよね！',
        explanation: '正解！立方体の高さ（縦辺）は底面に対して垂直なので、対角面で切断した切り口は角がすべて90度の長方形になります！',
        examTip: '【長方形の垂直性】底面に対して垂直に切り下ろした面は、角が90度になります！'
      },
      {
        id: 'g4_l5_p2',
        title: '台形の面積と切断',
        subtitle: '上底と下底の平均',
        question: '切り口が台形になりました。この台形の面積を求めるときに必要なのは、上底・下底とあと何かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '台形面積',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '上底と下底の間の垂直な「高さ」！', correct: true },
          { id: 'opt2', text: '斜めの辺の長さ', correct: false },
          { id: 'opt3', text: '立方体の体積', correct: false }
        ],
        hint: '台形の面積公式は「(上底 ＋ 下底) × 高さ ÷ 2」だね！',
        explanation: '正解は「高さ」！台形の面積は「(上底＋下底)×高さ÷2」で求めます！',
        examTip: '【公式の確認】断面の面積を求める入試問題では、台形公式が頻出です！'
      },
      {
        id: 'g4_l5_p3',
        title: '台形の左右対称性',
        subtitle: '等脚台形の性質',
        question: '立方体の左右対称な位置を通る切断でできた台形。左右の斜めの辺の長さはどうなっているかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '対称性',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '左右対称なので「左右の辺の長さは等しい」！', correct: true },
          { id: 'opt2', text: '左のほうが必ず長い', correct: false },
          { id: 'opt3', text: '右のほうが必ず長い', correct: false }
        ],
        hint: '左右対称な台形を「等脚（とうきゃく）台形」と呼ぶよ！',
        explanation: '正解！左右対称な切断では、左右の側面にできる切り口の長さが等しくなり「等脚台形」になります！',
        examTip: '【等脚台形】左右対称な台形は線対称な図形で、中学入試でよく問われます！'
      }
    ],
    6: [
      {
        id: 'g4_l6_p1',
        title: '【小4総まとめ】四角形断面の判定マスター',
        subtitle: '切断線から四角形を見抜く！',
        question: '上面の切り口と底面の切り口の長さが「同じ」で、前後の切り口の長さも「同じ」になりました。この四角形は何かな？',
        puzzleType: 'slice_identify',
        polygonShape: '平行四辺形',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '向かい合う辺がそれぞれ等しい「平行四辺形」！', correct: true },
          { id: 'opt2', text: '等脚台形', correct: false },
          { id: 'opt3', text: '三角形', correct: false }
        ],
        hint: '上底と下底の長さが同じなら、台形ではなく平行四辺形だね！',
        explanation: '正解は「平行四辺形」！向かい合う対辺の長さが等しく平行であるため、平行四辺形になります！',
        examTip: '【四角形の分類】対辺が1組だけ平行なら台形、2組とも平行なら平行四辺形です！'
      },
      {
        id: 'g4_l6_p2',
        title: '切断の2大鉄則の完成',
        subtitle: '作図の基礎を完全制覇！',
        question: '切断作図の2大鉄則「①同一平面上の2点は結ぶ」「②向かい合う平行面の切り口は平行」。この2つでどんな問題が解けるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '2大鉄則まとめ',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: 'ほとんどすべての四角形断面の作図を完成できる！', correct: true },
          { id: 'opt2', text: '三角形しか解けない', correct: false },
          { id: 'opt3', text: '公式を使わないと解けない', correct: false }
        ],
        hint: '同じ面を結んで、向かいの面に平行線を引く。この繰り返しで四角形が描けるよ！',
        explanation: '正解！この2大鉄則を組み合わせるだけで、中学入試で出題される四角形断面の作図はほぼ完璧に解くことができます！',
        examTip: '【合格への鉄則】「同一面は結ぶ」「平行面は平行」！この2行を唱えながら作図しよう！'
      },
      {
        id: 'g4_l6_p3',
        title: '小4空間幾何マスタークリア！',
        subtitle: '次のステージは五角形・六角形！',
        question: '四角形断面を完全マスターしました！次は面を5つ、6つ通る複雑な切断に挑戦します。立方体で切れる最大の多角形は何角形かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '予告クイズ',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '立方体の面が6つなので最大の「六角形」！', correct: true },
          { id: 'opt2', text: '八角形', correct: false },
          { id: 'opt3', text: '四角形までしかできない', correct: false }
        ],
        hint: '立方体には面が何個あるかな？',
        explanation: '正解は「六角形」！立方体には面が6つあるため、すべての面を通る切断をすると最大で「六角形」の断面ができます！',
        examTip: '【小5への架け橋】小5ステージでは、伝説の「正六角形断面」の作図に挑みます！'
      }
    ]
  },

  // 🎒 Grade 5: Pentagons, Regular Hexagons, Rule 3 (Extension lines & auxiliary points)
  5: {
    1: [
      {
        id: 'g5_l1_p1',
        title: '【五角形の断面】面を5つ通過する切断',
        subtitle: '台形の一角が切り落とされた形！',
        question: '立方体の「上面・底面・前面・後面・右面」の5つの面を通る平面で切断したよ。切り口の多角形は何角形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '五角形',
        cutPoints: [
          { id: 'p1', label: 'P', x: 0.5, y: 0, z: 1 },
          { id: 'p2', label: 'Q', x: 0, y: 0.5, z: 1 },
          { id: 'p3', label: 'R', x: 0, y: 1, z: 0.5 },
          { id: 'p4', label: 'S', x: 0.5, y: 1, z: 0 },
          { id: 'p5', label: 'T', x: 1, y: 0, z: 0.5 }
        ],
        polygonVertices: [
          { x: 0.5, y: 0, z: 1 },
          { x: 0, y: 0.5, z: 1 },
          { x: 0, y: 1, z: 0.5 },
          { x: 0.5, y: 1, z: 0 },
          { x: 1, y: 0, z: 0.5 }
        ],
        options: [
          { id: 'opt1', text: '5つの面に線ができて「五角形」！', correct: true },
          { id: 'opt2', text: '四角形', correct: false },
          { id: 'opt3', text: '六角形', correct: false }
        ],
        hint: '切断平面が通る面の数と、切り口の辺の数は同じだよ！',
        explanation: '正解は「五角形」！切断平面が立方体の5つの面と交差するため、切り口の辺が5本できて五角形になります！',
        examTip: '【交差面の数＝多角形の辺数】面を5つ通れば五角形、6つ通れば六角形になります！'
      },
      {
        id: 'g5_l1_p2',
        title: '五角形の平行な2辺',
        subtitle: '平行面の法則は五角形でも使える！',
        question: '五角形の断面において、上面と底面にできた2本の切り口の線はどうなっているかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '五角形の平行線',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '上面と底面は平行なので、切り口の2辺も「必ず平行」！', correct: true },
          { id: 'opt2', text: '五角形だから平行ではない', correct: false },
          { id: 'opt3', text: '直角に交わる', correct: false }
        ],
        hint: '何角形になっても、向かい合う平行な面にあらわれる切り口は平行だよ！',
        explanation: '正解！五角形であっても「上面と底面」は平行なので、その2面に現れる切り口の2辺は必ず平行になります！',
        examTip: '【五角形の性質】立方体の五角形断面には、必ず「少なくとも1組の平行な辺」が存在します！'
      },
      {
        id: 'g5_l1_p3',
        title: '五角形断面の作図手順',
        subtitle: '平行線を引いて次の面へ！',
        question: '五角形の作図で、1つの面（上面）の線が決まったとき、向かいの面（底面）の線はどう決めるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '五角形作図手順',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '底面にある通過点から「上面の線と平行な線」を引く！', correct: true },
          { id: 'opt2', text: '適当に底面の角と結ぶ', correct: false },
          { id: 'opt3', text: '延長して交点ができるまで引かない', correct: false }
        ],
        hint: '平行面の第2鉄則を使うと、底面の切り口の方向が一発で決まるよ！',
        explanation: '正解！底面にある既知の点から、上面の切り口の線と平行になるように直線を引くことで、底面の切り口の線が確定します！',
        examTip: '【作図のリレー】上面→側面→底面と、同一面結線と平行線ルールを交互に使って五角形を一周させます！'
      }
    ],
    2: [
      {
        id: 'g5_l2_p1',
        title: '【奇跡の正六角形】6辺の中点を通る切断',
        subtitle: '立方体の最高峰・美しい対称断面！',
        question: '立方体の向かい合わない6本の辺の各中点（ちょうど真ん中）を通る平面で切断したよ。現れる切り口は何の図形かな？',
        puzzleType: 'slice_identify',
        polygonShape: '正六角形',
        cutPoints: [
          { id: 'p1', label: 'A', x: 0.5, y: 0, z: 1 },
          { id: 'p2', label: 'B', x: 0, y: 0.5, z: 1 },
          { id: 'p3', label: 'C', x: 0, y: 1, z: 0.5 },
          { id: 'p4', label: 'D', x: 0.5, y: 1, z: 0 },
          { id: 'p5', label: 'E', x: 1, y: 0.5, z: 0 },
          { id: 'p6', label: 'F', x: 1, y: 0, z: 0.5 }
        ],
        polygonVertices: [
          { x: 0.5, y: 0, z: 1 },
          { x: 0, y: 0.5, z: 1 },
          { x: 0, y: 1, z: 0.5 },
          { x: 0.5, y: 1, z: 0 },
          { x: 1, y: 0.5, z: 0 },
          { x: 1, y: 0, z: 0.5 }
        ],
        options: [
          { id: 'opt1', text: '6つの辺と内角がすべて等しい「正六角形」！', correct: true },
          { id: 'opt2', text: '辺の長さが違う六角形', correct: false },
          { id: 'opt3', text: '正八角形', correct: false }
        ],
        hint: '6本の切り口はすべて直角二等辺三角形の斜辺で、長さが完全に等しいよ！内角も全部120度！',
        explanation: '正解は「正六角形」！各中点を結んだ6本の線はすべて長さが等しく、内角もすべて120度になるため、完全な正六角形が現れます！',
        examTip: '【中学入試の超重要断面】難関中の入試で最も愛される「正六角形断面」！向かい合う3組の辺がすべて平行です！'
      },
      {
        id: 'g5_l2_p2',
        title: '正六角形の平行な3組の辺',
        subtitle: '3組の平行面が3組の平行線をつくる！',
        question: '立方体の正六角形断面には、平行になっている辺のペアは何組あるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '正六角形平行ペア',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '上下・前後・左右の面に対応して「3組」！', correct: true },
          { id: 'opt2', text: '2組', correct: false },
          { id: 'opt3', text: '1組', correct: false }
        ],
        hint: '正六角形の向かい合う辺は、立方体の向かい合う平行な面に乗っているよ！',
        explanation: '正解は「3組」！立方体の「上下」「前後」「左右」の3組の平行な面をすべて通過するため、向かい合う辺3組がすべて平行になります！',
        examTip: '【正六角形の対称性】向かい合う辺が3組とも平行で長さが等しいのが、立方体の正六角形断面の最大の特徴です！'
      },
      {
        id: 'g5_l2_p3',
        title: '正六角形の1辺の長さ',
        subtitle: '三平方の定理・直角二等辺三角形',
        question: '1辺が6cmの立方体において、各辺の中点（3cmのところ）を結んでできた正六角形の1辺の長さはどうなっているかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '正六角形辺長',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '3cmと3cmをはさむ直角二等辺三角形の斜辺（3√2 ≒ 4.24cm）！', correct: true },
          { id: 'opt2', text: 'ちょうど3cm', correct: false },
          { id: 'opt3', text: '元の1辺と同じ6cm', correct: false }
        ],
        hint: '正方形のカドにある直角二等辺三角形の斜辺の長さだよ！',
        explanation: '正解！直角をはさむ2辺が3cmの直角二等辺三角形の斜辺になるため、3cmより少し長い 3√2 cm（約4.24cm）になります！',
        examTip: '【斜辺の比率】直角二等辺三角形の比「1 : 1 : √2」！中点同士を結ぶと斜辺の長さになります！'
      }
    ],
    3: [
      {
        id: 'g5_l3_p1',
        title: '【限界定理】なぜ七角形はできない？',
        subtitle: '立方体の切断面の最大角数',
        question: '立方体を「1枚の平面」で切断したとき、切り口として【七角形】を作ることはできるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '限界定理',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '絶対にできない！立方体には面が「6つ」しかないから！', correct: true },
          { id: 'opt2', text: '上手に曲げて切ればできる', correct: false },
          { id: 'opt3', text: '大きな立方体ならできる', correct: false }
        ],
        hint: '1つの平面と1つの面が交わってできる切り口の線は、最大1本。面は何個ある？',
        explanation: '正解は「絶対にできない」！平面が立方体の面と交わってできる切り口の線は、1つの面につき最大1本です。立方体には面が6つしかないので、切り口の辺は最大でも6本（六角形）までです！',
        examTip: '【オイラー幾何と切断限界】立体の面数が切り口の最大角数！立方体（6面体）では六角形が限界です！'
      },
      {
        id: 'g5_l3_p2',
        title: '立方体でできる多角形の全リスト',
        subtitle: '作れる多角形は何種類？',
        question: '立方体を平面で切断して作ることができる多角形は、次のうちどれかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '全図形リスト',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '「三角形・四角形・五角形・六角形」の4種類すべて作れる！', correct: true },
          { id: 'opt2', text: '三角形と四角形しか作れない', correct: false },
          { id: 'opt3', text: '偶数角形（四角形・六角形）しか作れない', correct: false }
        ],
        hint: '面を3つ通れば三角形、4つなら四角形、5つなら五角形、6つなら六角形！',
        explanation: '正解！通る面の数（3〜6個）を調節することで、三角形、四角形、五角形、六角形をすべて作ることができます！',
        examTip: '【切断面のバリエーション】立方体からは「3角形〜6角形」のすべての多角形を作り出せます！'
      },
      {
        id: 'g5_l3_p3',
        title: '八面体の切断限界',
        subtitle: '正八面体なら何角形まで切れる？',
        question: '面が8つある「正八面体」を1つの平面で切断したとき、切り口の多角形は最大で何角形まで作れるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '八面体限界',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '面が8つあるので最大「八角形」まで作れる！', correct: true },
          { id: 'opt2', text: '六角形まで', correct: false },
          { id: 'opt3', text: '四角形まで', correct: false }
        ],
        hint: '面がn個ある凸多面体の断面は、最大でn角形になります！',
        explanation: '正解は「八角形」！面が8つある多面体では、8つの面すべてを通過する切断をすることで最大「八角形」の断面を作ることができます！',
        examTip: '【多面体定理】一般に「n面体を平面で切断した切り口は最大n角形」になります！'
      }
    ],
    4: [
      {
        id: 'g5_l4_p1',
        title: '【第3鉄則】立体の外へ線を延長して交点を探す！',
        subtitle: '同一平面にない点を攻略する究極奥義！',
        question: '同一平面上にない点があり切断線が引けないとき、どうすれば新しい通過点を見つけられるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '第3鉄則',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '切り口の線と立体の辺を「外側へ延長」して交点を見つける！', correct: true },
          { id: 'opt2', text: 'あきらめて適当に結ぶ', correct: false },
          { id: 'opt3', text: '立体の真ん中に点を打つ', correct: false }
        ],
        hint: '立方体の外側まで線をスーッと伸ばすと、同じ平面上で辺の延長線とぶつかるよ！',
        explanation: '正解！【切断の第3鉄則】同一平面上の切り口の線と立体の辺を外側へ延長すると交点（補助点）が生まれます。その交点と同じ面にある別の点を結ぶことで、隠れた切断線が作図できます！',
        examTip: '【切断の第3鉄則】難関私立中学の切断問題で差がつく最重要技法「延長線と補助交点」！'
      },
      {
        id: 'g5_l4_p2',
        title: '補助交点を使った作図の流れ',
        subtitle: '外の点から中へ線を戻す！',
        question: '立体の外側にできた交点Xから、同じ平面上にある別の通過点Yへ直線を引きました。立体の中に現れた線はどうなる？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '補助点作図',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: 'その面を通る「本当の切り口の線」になる！', correct: true },
          { id: 'opt2', text: '補助線なので切り口にはならない', correct: false },
          { id: 'opt3', text: '消さなければならない', correct: false }
        ],
        hint: '外側の交点XとYを結ぶ直線が、立体の面を横切る部分が切り口になるよ！',
        explanation: '正解！外側の補助点と内側の点を結んだ直線が、立体の面を横切る部分がまさに求めていた切り口の線になります！',
        examTip: '【外から中へ】外側の交点を通る直線が、立体の表面に切り口の線を刻みます！'
      },
      {
        id: 'g5_l4_p3',
        title: '延長線が生み出す相似比',
        subtitle: 'ピラミッド型相似・クロス型相似',
        question: '立体の辺と切り口の延長線が交わるとき、外側に現れる三角形の形はどうなっているかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '延長相似比',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '立体内部の三角形と「相似（形が同じで拡大された形）」になる！', correct: true },
          { id: 'opt2', text: 'まったく無関係な形', correct: false },
          { id: 'opt3', text: '必ず直角二等辺三角形になる', correct: false }
        ],
        hint: '平行線があるところに「ピラミッド型（または砂時計型）の相似」が生まれるよ！',
        explanation: '正解！平行線の性質により、外側にできる三角形は内側の三角形と相似（比率が等しい）になり、長さの比を使って正確な交点位置が求まります！',
        examTip: '【相似と切断の融合】中学受験算数の最高峰！相似比（1:2や2:3）を使って交点の位置を計算します！'
      }
    ],
    5: [
      {
        id: 'g5_l5_p1',
        title: '切断面の対称性（点対称と線対称）',
        subtitle: '正六角形の美しい対称性！',
        question: '立方体の中心を通る正六角形断面。この図形は点対称かな？線対称かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '対称性判定',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '中心で180度回しても重なり、対称軸もある「点対称かつ線対称」！', correct: true },
          { id: 'opt2', text: '線対称のみ', correct: false },
          { id: 'opt3', text: '点対称のみ', correct: false }
        ],
        hint: '正六角形は、中心を中心として180度回転しても、折り紙のように折ってもぴったり重なるよ！',
        explanation: '正解！正六角形は中心に対する点対称であり、かつ6本の対称軸を持つ線対称な図形でもあります！',
        examTip: '【対称図形マスター】正多角形の対称性は中学入試算数で頻出の知識です！'
      },
      {
        id: 'g5_l5_p2',
        title: '切断面の面積比べ',
        subtitle: 'まっすぐ切る vs ななめに切る',
        question: '立方体を面と平行に切った「正方形断面」と、対角線で斜めに切った「長方形断面」。面積が広いのはどっちかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '面積比較',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '横の長さが長くなっている「長方形断面」のほうが広い！', correct: true },
          { id: 'opt2', text: '正方形断面のほうが広い', correct: false },
          { id: 'opt3', text: 'どちらも全く同じ面積', correct: false }
        ],
        hint: '縦の長さ（高さ）はどちらも同じ。横の長さは対角線のほうが長いよね！',
        explanation: '正解は「長方形断面」！高さは同じですが、対角線は1辺よりも約1.41倍長いため、斜めに切った長方形断面のほうが面積が広くなります！',
        examTip: '【傾きと面積】斜めに切断するほど、切り口の面積は広がっていきます！'
      },
      {
        id: 'g5_l5_p3',
        title: '正六角形断面の面積公式',
        subtitle: '正三角形6個分の広さ！',
        question: '正六角形の面積は、中心から各頂点へ線を引いたとき、合同な何の図形が「6個集まったもの」として計算できるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '六角形面積',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '小さな「正三角形」が6個集まったもの！', correct: true },
          { id: 'opt2', text: '直角二等辺三角形 6個', correct: false },
          { id: 'opt3', text: '正方形 6個', correct: false }
        ],
        hint: '中心から6つの頂点に線を引くと、真ん中に360度÷6＝60度の角ができるよ！',
        explanation: '正解は「正三角形 6個」！正六角形は中心で分割すると合同な6個の正三角形に分かれます！',
        examTip: '【正六角形の6分割】正六角形を見たら「正三角形6個」に分割するのが幾何問題の鉄則です！'
      }
    ],
    6: [
      {
        id: 'g5_l6_p1',
        title: '【小5総まとめ】難関中入試切断パズル',
        subtitle: 'すべての鉄則を総動員せよ！',
        question: '同一平面結線、平行面ルール、延長線の交点。この3大鉄則をマスターした君に解けない切断はあるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '総まとめクリア',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '3大鉄則を使いこなせば、難関校のどんな複雑な切断も攻略できる！', correct: true },
          { id: 'opt2', text: '六角形は解けない', correct: false },
          { id: 'opt3', text: '公式を100個暗記しないと解けない', correct: false }
        ],
        hint: '3つの鉄則があれば、どんな面にある点でも順序よく線を繋げられます！',
        explanation: '正解！「①同一面を結ぶ」「②平行面は平行」「③延長して交点を見つける」の3大鉄則さえあれば、開成・麻布・桜蔭などの難関中切断作図もすべて解き明かせます！',
        examTip: '【幾何学の自信】小5でこの3大鉄則を身につけたことは、中学受験算数最大の武器になります！'
      },
      {
        id: 'g5_l6_p2',
        title: '五角形断面の実践判定',
        subtitle: '面を5つ通る切断の切り口',
        question: '立方体の1つのカドを避けて、残りの面を斜めにぐるりと通る切断をしました。切り口の辺の数はいくつ？',
        puzzleType: 'slice_identify',
        polygonShape: '五角形',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '5つの面を通るので「5辺（五角形）」！', correct: true },
          { id: 'opt2', text: '4辺（四角形）', correct: false },
          { id: 'opt3', text: '6辺（六角形）', correct: false }
        ],
        hint: '通過した面の数だけ切り口の辺ができるよ！',
        explanation: '正解！5つの面を通過しているため、切り口は5本の辺からなる五角形になります！',
        examTip: '【辺数の直感】切断平面が交差する面の数を数えるのが一番確実な解法です！'
      },
      {
        id: 'g5_l6_p3',
        title: '小5空間幾何マスタークリア！',
        subtitle: 'いよいよ最高峰・小6体積計算へ！',
        question: '小5の切断作図を完全制覇しました！小6では切断された立体の「体積の比」を計算します。体積計算の準備はできたかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '小6進級クイズ',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: 'バッチリ！断頭三角柱や体積比の最高峰へ進む！', correct: true },
          { id: 'opt2', text: 'もう一回小4に戻る', correct: false },
          { id: 'opt3', text: '面積だけで十分', correct: false }
        ],
        hint: '形が分かれば、次は立体の体積を計算できるようになります！',
        explanation: '素晴らしい！小5カリキュラムを完全修了しました。小6では開成や灘で出題される「断頭三角柱の体積公式」や「中心切断の体積二等分定理」へと進みます！',
        examTip: '【小6への扉】作図ができるようになった次は、切断立体の体積計算が入試の決め手になります！'
      }
    ]
  },

  // 🎒 Grade 6: Truncated Prisms, Volume Ratios, Center-Cut Bisection, Double Slices
  6: {
    1: [
      {
        id: 'g6_l1_p1',
        title: '切断によって生じる三角すいの体積',
        subtitle: 'カドの三角すいの体積計算！',
        question: '1辺が6cmの立方体の角を、頂点から3cm, 3cm, 3cmのところで斜めに切り落としました。切り落とした三角すいの体積は何cm³かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '三角すい体積',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '底面積(3×3÷2) × 高さ3 ÷ 3 ＝「4.5 cm³」！', correct: true },
          { id: 'opt2', text: '9 cm³', correct: false },
          { id: 'opt3', text: '13.5 cm³', correct: false },
          { id: 'opt4', text: '27 cm³', correct: false }
        ],
        hint: 'すい体の体積公式は「底面積 × 高さ ÷ 3」！底面は直角二等辺三角形（3×3÷2＝4.5cm²）だよ！',
        explanation: '正解は「4.5cm³」！底面は直角二等辺三角形なので面積は 3 × 3 ÷ 2 = 4.5cm²。高さは3cmなので、すい体の体積公式より 4.5 × 3 ÷ 3 = 4.5cm³ となります！',
        examTip: '【三角すいの体積公式】「底面積 × 高さ ÷ 3」！カドを切り落とした三角すいの体積計算は中学受験の超頻出計算です！'
      },
      {
        id: 'g6_l1_p2',
        title: '立方体全体の体積との比率',
        subtitle: 'どれくらいの割合を切り落とした？',
        question: '1辺6cmの立方体（体積216cm³）から、4.5cm³の三角すいを1つ切り落としたよ。体積比（三角すい : 立方体）はどうなるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '体積比率',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '4.5 : 216 ＝「1 : 48」（全体の48分の1）！', correct: true },
          { id: 'opt2', text: '1 : 24', correct: false },
          { id: 'opt3', text: '1 : 16', correct: false },
          { id: 'opt4', text: '1 : 8', correct: false }
        ],
        hint: '216 ÷ 4.5 を計算してみよう！ (216 × 2 ÷ 9 = 48)',
        explanation: '正解は「1 : 48」！辺の長さが半分の三角すいは、立方体全体の体積の「1/48」というごくわずかな体積になります！',
        examTip: '【比率の感覚】カドの小さな三角すいは、立方体全体の1/48。8つのカド全部を切っても 8/48 = 1/6 しか減りません！'
      },
      {
        id: 'g6_l1_p3',
        title: '残った立体の体積',
        subtitle: '全体から引いて求める引き算の美学',
        question: '体積216cm³の立方体から、4.5cm³の角の三角すいを1つ切り落としたあとに残る大きな立体の体積は何cm³かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '残余体積',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '216 − 4.5 ＝「211.5 cm³」！', correct: true },
          { id: 'opt2', text: '200 cm³', correct: false },
          { id: 'opt3', text: '207 cm³', correct: false }
        ],
        hint: '複雑な立体は「全体から切り落とした破片を引く」のが鉄則！',
        explanation: '正解は「211.5cm³」！直接求めるのが難しい複雑な立体は、元の立方体の体積（216cm³）から切り落とした三角すい（4.5cm³）を引くことで簡単に求まります！',
        examTip: '【引き算の技法】「残りの体積＝全体−くり抜いた部分」！算数・数学で最も重宝する解法テクニックです！'
      }
    ],
    2: [
      {
        id: 'g6_l2_p1',
        title: '【断頭三角柱】の体積公式の真髄',
        subtitle: '底面積 × 高さの平均！',
        question: '底面が直角三角形で、3本の立ち上がり辺の高さがそれぞれ a, b, c と異なる断頭三角柱の体積公式はどれかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '断頭三角柱公式',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '底面積 × (a ＋ b ＋ c) ÷ 3（平均の高さ×底面積）！', correct: true },
          { id: 'opt2', text: '底面積 × 最大の高さ', correct: false },
          { id: 'opt3', text: '底面積 × (a × b × c) ÷ 3', correct: false }
        ],
        hint: '3本の高さの「平均値」を柱の高さとみなして底面積をかければ一発で求まるよ！',
        explanation: '正解！断頭三角柱の体積は「底面積 × (a + b + c) ÷ 3」で求められます！3本の高さの平均を掛けるだけで、どんな斜め切り柱体も瞬時に計算できます！',
        examTip: '【入試の必殺技・断頭三角柱】灘中・開成中・筑駒中など超難関校受験生必修の最強時短公式です！'
      },
      {
        id: 'g6_l2_p2',
        title: '断頭三角柱の計算実践',
        subtitle: '公式を使って秒速で体積を出す！',
        question: '底面積が12cm²で、3本の高さが 2cm, 4cm, 6cm の断頭三角柱があります。体積は何cm³かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '断頭計算',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '12 × (2＋4＋6) ÷ 3 ＝ 12 × 4 ＝「48 cm³」！', correct: true },
          { id: 'opt2', text: '24 cm³', correct: false },
          { id: 'opt3', text: '72 cm³', correct: false },
          { id: 'opt4', text: '96 cm³', correct: false }
        ],
        hint: '3本の高さの平均は (2 + 4 + 6) ÷ 3 = 4cm！底面積12に4をかけるだけ！',
        explanation: '正解は「48cm³」！3本の高さの平均は (2 + 4 + 6) ÷ 3 = 4cm。底面積 12cm² × 4cm = 48cm³ と暗算レベルで計算できます！',
        examTip: '【計算の簡略化】高さを足して3で割ってから底面積をかけると、計算ミスを大幅に減らせます！'
      },
      {
        id: 'g6_l2_p3',
        title: '断頭四角柱への応用',
        subtitle: '四角柱は2つの三角柱に分けて解く！',
        question: '底面が台形や長方形の断頭四角柱の体積を求めたいとき、どうやって計算するのが最も賢いかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '四角柱分割',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '対角線で「2つの断頭三角柱」に分けてそれぞれ公式を使う！', correct: true },
          { id: 'opt2', text: '4本の高さを足して4で割る（常に成り立つとは限らない）', correct: false },
          { id: 'opt3', text: '計算できない', correct: false }
        ],
        hint: '四角形は対角線を1本引けば、必ず2つの三角形に分けられるよね！',
        explanation: '正解！四角柱は底面の対角線で2つの断頭三角柱に分割し、それぞれの三角柱に公式を適用して足し合わせるのが最も安全で正確な解法です！',
        examTip: '【分割思考の極意】四角柱を切断したら「2つの断頭三角柱に分ける」！これが難関校入試の王道です！'
      }
    ],
    3: [
      {
        id: 'g6_l3_p1',
        title: '【中心切断定理】体積が常に2等分される秘密',
        subtitle: '立方体の中心を通る切断平面！',
        question: '立方体の中心（対角線の交点）を通る平面で切断しました。どのような角度で切っても、分けられた2つの立体の体積はどうなるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '中心切断定理',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: 'どんな斜め向きで切っても「体積は必ず1:1の半分（2等分）」！', correct: true },
          { id: 'opt2', text: '切り口が三角形のときだけ体積が変わる', correct: false },
          { id: 'opt3', text: '中心を通っても体積はバラバラになる', correct: false }
        ],
        hint: '立方体は中心に対して点対称！中心を通る平面で切ると、2つの立体は点対称で合同（体積が等しい）になるよ！',
        explanation: '正解！立方体は中心に対して点対称な立体です。中心を通る平面で切断すると、分けられた2つの立体は点対称になり、体積は必ず完全に「1:1（半分）」になります！',
        examTip: '【難問を一瞬で解く定理】「立方体の中心を通る平面は体積を2等分する！」灘中や開成中で長大な計算を省略できる超重要定理です！'
      },
      {
        id: 'g6_l3_p2',
        title: '正六角形切断の体積',
        subtitle: '6辺の中点を通る切断の体積比',
        question: '6辺の中点を通る「正六角形断面」は、立方体の中心を通っています。この切断で分けられた2つの立体の体積比はどうなるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '六角形体積比',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '中心を通っているので「1 : 1（ちょうど半分）」！', correct: true },
          { id: 'opt2', text: '1 : 2', correct: false },
          { id: 'opt3', text: '1 : 3', correct: false }
        ],
        hint: '向かい合う辺の中点を結ぶ平面は、立方体のど真ん中（中心）を貫通しているよ！',
        explanation: '正解は「1 : 1」！正六角形切断面は立方体の中心を通るため、体積はきれいに二等分（1:1）されます！',
        examTip: '【正六角形の体積二等分】正六角形断面で切ると、2つの立体は形も合同で体積も等しく半分になります！'
      },
      {
        id: 'g6_l3_p3',
        title: '中心を通る切断の切り口の対称点',
        subtitle: '点対称な点のペア',
        question: '中心を通る切断面上の点P。中心を挟んで反対側にある点Qも必ず切断面上にあるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '点対称ペア',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '中心を通る平面なので、中心に関して点対称な点Qも「必ず切断面上にある」！', correct: true },
          { id: 'opt2', text: '点Qは切断面の外に出てしまう', correct: false },
          { id: 'opt3', text: '関係ない', correct: false }
        ],
        hint: '中心を通る直線は、平面の上にすっぽり乗っているよね！',
        explanation: '正解！中心を通る平面上の任意の点Pについて、中心Oに関して点対称な点Qも必ずその平面上に存在します！',
        examTip: '【点対称ペアの利用】一方の切り口の点が分かれば、中心の反対側の点も自動的に確定します！'
      }
    ],
    4: [
      {
        id: 'g6_l4_p1',
        title: '【ダブル切断】2つの平面による切断',
        subtitle: '包丁を2回入れると何個になる？',
        question: '1つの立方体を、交わる2つの平面で2回切断しました。立体は最大で何個に分かれるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '2回切断',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '1回目で2個、2回目でそれぞれ2分されて「最大4個」！', correct: true },
          { id: 'opt2', text: '最大3個', correct: false },
          { id: 'opt3', text: '最大6個', correct: false }
        ],
        hint: 'ケーキに十文字に2回ナイフを入れたら何ピースになるかな？',
        explanation: '正解は「最大4個」！1回目の切断で2個になり、2回目の切断がその両方を通過すれば 2 × 2 = 4個に分割されます！',
        examTip: '【複数回切断の分割数】n回の切断で立体が最大何個に分かれるかは、難関校の規則性・場合の数で頻出です！'
      },
      {
        id: 'g6_l4_p2',
        title: '直交する2回切断と共通部分',
        subtitle: '十字切断で残る立体',
        question: '縦の対角面と、もう1つの縦の対角面（直交する2平面）で2回切断しました。できた4つの立体はどんな立体かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '十字切断立体',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '底面が直角二等辺三角形の「合同な三角柱 4個」！', correct: true },
          { id: 'opt2', text: '直方体 4個', correct: false },
          { id: 'opt3', text: '三角すい 4個', correct: false }
        ],
        hint: '上面の対角線が×印（直交）に交わり、4つの等しい直角二等辺三角形ができるよ！',
        explanation: '正解！2本の対角線で底面が4等分され、それぞれを底面とする合同な三角柱が4個できます！',
        examTip: '【対称切断の合同性】対称軸に沿って切断すると、合同な小立体が綺麗に生成されます！'
      },
      {
        id: 'g6_l4_p3',
        title: '2回切断された立体の面の数',
        subtitle: '切断面が2面増える！',
        question: '分割された小立体には、元の立方体の外側の面と、2回の切断によってできた「新しい切断面」は何面あるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '切断面数',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '2回切断されたので、内部に「2面の切断面」がある！', correct: true },
          { id: 'opt2', text: '1面だけ', correct: false },
          { id: 'opt3', text: '4面ある', correct: false }
        ],
        hint: '各小立体は、1回目の切り口と2回目の切り口の両方に触れているよ！',
        explanation: '正解！2回の切断線の交わりによって、それぞれの小立体には新しく2面の切断面（側面）が生まれます！',
        examTip: '【色塗り問題への発展】「外側が赤く塗られた立方体を切断したとき、赤く塗られていない面は？」という名問の基礎です！'
      }
    ],
    5: [
      {
        id: 'g6_l5_p1',
        title: '正四面体の切断と体積相似比',
        subtitle: '相似比と体積比の3乗関係！',
        question: '正四面体のてっぺんから、辺の長さをちょうど「半分（1/2）」の高さで底面に平行に切断しました。上の小さな正四面体の体積は、元の全体の何分の1かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '相似体積比',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '相似比が 1:2 なので、体積比は 1³:2³ ＝「8分の1」！', correct: true },
          { id: 'opt2', text: '2分の1', correct: false },
          { id: 'opt3', text: '4分の1', correct: false },
          { id: 'opt4', text: '16分の1', correct: false }
        ],
        hint: '相似な立体では「体積の比は相似比の3乗（1×1×1 : 2×2×2）」になるよ！',
        explanation: '正解は「8分の1」！相似比が 1 : 2 の立体は、体積比が 1³ : 2³ = 1 : 8 になるため、切り落とした小さな正四面体は全体の 1/8 になります！',
        examTip: '【相似比と体積比の黄金定理】長さ比が A:B なら、面積比は A²:B²、体積比は A³:B³！中学入試の超重要定理です！'
      },
      {
        id: 'g6_l5_p2',
        title: '下の台体部分の体積',
        subtitle: '全体から上を引いた残り！',
        question: '全体が「8」で、上が「1」のとき、下に残った台体部分の体積は全体のどれだけの割合かな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '台体比率',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '8 − 1 ＝「8分の7」！', correct: true },
          { id: 'opt2', text: '8分の6（3/4）', correct: false },
          { id: 'opt3', text: '8分の3', correct: false }
        ],
        hint: '全体（1）から上の破片（1/8）を引くよ！ 1 - 1/8 = ?',
        explanation: '正解は「8分の7」！全体が8で上が1なので、下に残った部分は 8 - 1 = 7 となり、全体の「7/8」になります！',
        examTip: '【すい台の体積比】「上 : 下 ＝ 1 : 7」！すい体を中点で切断したときの定番比率です！'
      },
      {
        id: 'g6_l5_p3',
        title: '3等分点での切断（3段重ね）',
        subtitle: '1:2:3 の相似ピラミッド',
        question: '高さを上から「1 : 1 : 1」と3等分する2枚の平行面で切断しました。上段・中段・下段の3つのパーツの体積比はどうなるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '3段体積比',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '1 : (8−1) : (27−8) ＝「1 : 7 : 19」！', correct: true },
          { id: 'opt2', text: '1 : 2 : 3', correct: false },
          { id: 'opt3', text: '1 : 4 : 9', correct: false },
          { id: 'opt4', text: '1 : 8 : 27', correct: false }
        ],
        hint: 'てっぺんからの体積比は 1³ : 2³ : 3³ ＝ 1 : 8 : 27 だね！それぞれの段の体積を引き算しよう！',
        explanation: '正解は「1 : 7 : 19」！上から順に全体の体積比は 1, 8, 27。各段は上段=1、中段=8-1=7、下段=27-8=19 となり、「1 : 7 : 19」になります！',
        examTip: '【難関中頻出の1:7:19】灘・開成・駒場東邦などで頻出の多段切断体積比！この数列は即答できるようにしよう！'
      }
    ],
    6: [
      {
        id: 'g6_l6_p1',
        title: '【開成・灘・筑駒レベル】3頂点と辺の内分点切断',
        subtitle: '立体切断の最高峰問題！',
        question: '立方体の上面の頂点A、底面の辺FGを 1:2 に内分する点P、辺GHを 2:1 に内分する点Qを通る平面で切断しました。断面は何角形？',
        puzzleType: 'slice_identify',
        polygonShape: '五角形',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '延長線と平行面の法則を駆使すると現れる「五角形」！', correct: true },
          { id: 'opt2', text: '三角形', correct: false },
          { id: 'opt3', text: '四角形', correct: false },
          { id: 'opt4', text: '六角形', correct: false }
        ],
        hint: '底面のPQを結んで延長し、上面のAから平行線を伸ばすと、側面の2箇所に交点が生まれて面を5つ通るよ！',
        explanation: '正解は「五角形」！底面のPQの線分を延長し、上面の頂点Aから平行面ルールを適用すると、左右の側面に交点ができて計5つの面を通過し、五角形断面が現れます！',
        examTip: '【超難関校の切断】内分点と延長線を組み合わせた五角形断面の決定は、中学入試算数の最高峰問題です！'
      },
      {
        id: 'g6_l6_p2',
        title: '2つの切断平面が交差する線',
        subtitle: '空間での2平面の交わり',
        question: '立方体を切断する2つの平面αとβが交わるとき、その交わりはどのような図形になるかな？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '交線定理',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '空間で2つの平面が交わると、必ず「1本の直線（交線）」になる！', correct: true },
          { id: 'opt2', text: '1つの交点になる', correct: false },
          { id: 'opt3', text: '曲がった線になる', correct: false }
        ],
        hint: '開いた本の2枚のページが根元で合わさる部分を見てみよう！',
        explanation: '正解！空間において平行でない2つの平面が交わると、その交わりは必ず「1本の直線（交線）」になります！',
        examTip: '【立体幾何学の基本公理】2平面の交わりは「交線」！大学入試の空間ベクトルでも使われる大原則です！'
      },
      {
        id: 'g6_l6_p3',
        title: '【小6最高峰制覇】立体切断マスター',
        subtitle: '空間幾何の頂点を極めた証！',
        question: '立体の切断、断面の形状判定、3大鉄則、断頭三角柱公式、中心二等分定理、相似比の3乗法則をすべてマスターしました。君の空間把握力はどうなった？',
        puzzleType: 'slice_exam_quiz',
        polygonShape: '完全制覇',
        cutPoints: [],
        polygonVertices: [],
        options: [
          { id: 'opt1', text: '中学受験・算数オリンピックの立体幾何を完璧に解く「神の目」を手に入れた！', correct: true },
          { id: 'opt2', text: '普通', correct: false },
          { id: 'opt3', text: 'まだまだ足りない', correct: false }
        ],
        hint: '君はもう、頭の中で立方体をあらゆる角度から自在にスライスして体積まで計算できます！',
        explanation: 'おめでとうございます！小学校〜最難関中学受験の空間幾何・立体切断カリキュラムをすべて完全制覇しました！',
        examTip: '【立体切断マスター獲得】おめでとう！空間把握能力の最高峰バッジ「立体切断マスター 💎」を獲得しました！'
      }
    ]
  }
};

// =============================================================================
// Main Component
// =============================================================================

export interface CrossSectionGameProps {
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

export const CrossSectionGame: React.FC<CrossSectionGameProps> = ({
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

  // 3D Visualizer States
  const [isSliced, setIsSliced] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const [viewMode, setViewMode] = useState<'iso' | 'top' | 'front'>('iso');

  const currentGrade = Math.min(Math.max(grade, 3), 6);

  // Puzzle List
  const puzzleList = useMemo(() => {
    if (customPuzzles && customPuzzles.length > 0) {
      return customPuzzles;
    }
    const gradeMap = GRADE_CROSS_SECTION_PUZZLES[currentGrade] || GRADE_CROSS_SECTION_PUZZLES[3];
    return gradeMap[level] || gradeMap[1] || [];
  }, [customPuzzles, currentGrade, level]);

  const currentPuzzle: CrossSectionPuzzle = puzzleList[problemIndex] || puzzleList[0];

  // Reset state on problem switch
  const handleProblemChange = (idx: number) => {
    setProblemIndex(idx);
    setIsCompleted(false);
    setSelectedOptionId(null);
    setFeedbackError(null);
    setIsSliced(true);
    setIsExploded(false);
  };

  const handleSelectOption = (optId: string) => {
    sound.playClick();
    setSelectedOptionId(optId);
    setFeedbackError(null);

    const opt = currentPuzzle.options.find((o) => o.id === optId);
    if (opt?.correct) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setIsSliced(true);
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedbackError('おしい！立体の図と面の位置関係をもう一度よく見てみよう！');
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
    setIsSliced(true);
    setIsExploded(false);
  };

  // 3D Isometric Projection Helper
  // Cube space: [0, 1]^3
  // Top face: z = 1 (A=(0,1,1), B=(1,1,1), C=(1,0,1), D=(0,0,1))
  // Bottom face: z = 0 (E=(0,1,0), F=(1,1,0), G=(1,0,0), H=(0,0,0))
  const projectPoint = (x: number, y: number, z: number, explodeOffset: number = 0) => {
    const cx = 230;
    const cy = 200;
    const size = 110;

    // Explode separation along z-vector if exploded
    const effectiveZ = z + explodeOffset;

    if (viewMode === 'top') {
      // 2D Top View: X right, Y down
      return {
        px: cx + (x - 0.5) * size * 1.8,
        py: cy + (y - 0.5) * size * 1.8
      };
    } else if (viewMode === 'front') {
      // 2D Front View: X right, Z up
      return {
        px: cx + (x - 0.5) * size * 1.8,
        py: cy - (effectiveZ - 0.5) * size * 1.8
      };
    }

    // Default: 3D Isometric View
    // X goes down-right (+30 deg)
    // Y goes down-left (-30 deg, 150 deg)
    // Z goes straight up (90 deg)
    const cos30 = 0.866;
    const sin30 = 0.5;

    const px = cx + (x - y) * cos30 * size;
    const py = cy + (x + y) * sin30 * size - effectiveZ * size;
    return { px, py };
  };

  // Cube Vertices
  // Standard labeling:
  // A=(0,0,1), B=(1,0,1), C=(1,1,1), D=(0,1,1) [Top]
  // E=(0,0,0), F=(1,0,0), G=(1,1,0), H=(0,1,0) [Bottom]
  const vA = projectPoint(0, 0, 1);
  const vB = projectPoint(1, 0, 1);
  const vC = projectPoint(1, 1, 1);
  const vD = projectPoint(0, 1, 1);

  const vE = projectPoint(0, 0, 0);
  const vF = projectPoint(1, 0, 0);
  const vG = projectPoint(1, 1, 0);
  const vH = projectPoint(0, 1, 0);

  // Cross section polygon projection
  const sliceVertices2D = useMemo(() => {
    const verts = currentPuzzle.polygonVertices || [];
    const offset = isExploded ? 0.35 : 0;
    return verts.map((pt) => projectPoint(pt.x, pt.y, pt.z, offset));
  }, [currentPuzzle, isExploded, viewMode]);

  const slicePolygonPointsString = useMemo(() => {
    return sliceVertices2D.map((p) => `${p.px.toFixed(1)},${p.py.toFixed(1)}`).join(' ');
  }, [sliceVertices2D]);

  const badgeTag = customBadge || (isEX ? `EX裏 Lv.${level}` : `デザイン神殿 ${currentGrade}年 Lv.${level}`);

  return (
    <GameModalWrapper
      title={customTitle || `立体の切断・断面幾何 - ${currentPuzzle.title}`}
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
        <div className="w-full bg-slate-900/90 border-2 border-purple-400/60 rounded-2xl p-3 sm:p-4 shadow-md text-center text-white backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 border border-purple-400 text-purple-300 text-xs font-black">
              {currentPuzzle.subtitle || '空間幾何・切断シミュレーター'}
            </span>
            {currentPuzzle.polygonShape && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-xs font-black flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                断面: {currentPuzzle.polygonShape}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-black text-amber-300 tracking-wide mb-1">
            {currentPuzzle.title}
          </h3>
          <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed max-w-2xl mx-auto">
            {currentPuzzle.question}
          </p>
        </div>

        {/* 3D Isometric Canvas View */}
        <div className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-2 border-purple-500/40 rounded-3xl p-3 sm:p-4 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden min-h-[310px] sm:min-h-[350px]">
          {/* Controls Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
            {/* View Angle Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/90 border border-purple-400/40 rounded-xl p-1 shadow">
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('iso');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all ${
                  viewMode === 'iso' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                斜め3D
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('top');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all ${
                  viewMode === 'top' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                真上 (上面)
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('front');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all ${
                  viewMode === 'front' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                正面
              </button>
            </div>

            {/* Animation / View Toggles */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsSliced((prev) => !prev);
                }}
                className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1 shadow transition-all ${
                  isSliced
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{isSliced ? '切断中' : '切断する'}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsExploded((prev) => !prev);
                }}
                className={`px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1 shadow transition-all ${
                  isExploded
                    ? 'bg-amber-600 border-amber-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isExploded ? '合体' : '分離'}</span>
              </button>
            </div>
          </div>

          {/* SVG 3D Renderer */}
          <svg viewBox="0 0 460 330" className="w-full h-64 sm:h-72 max-w-lg select-none">
            <defs>
              {/* Glowing Gradient for Cross Section Plane */}
              <linearGradient id="sliceGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>

              {/* Exploded Slice Glow */}
              <linearGradient id="sliceExplodeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.85" />
              </linearGradient>

              {/* Cube Faces Gradients */}
              <linearGradient id="topFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#334155" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="frontFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="rightFaceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#334155" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* 1. Hidden / Back Edges (Dashed Lines) */}
            <g stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4">
              <line x1={vE.px} y1={vE.py} x2={vF.px} y2={vF.py} />
              <line x1={vE.px} y1={vE.py} x2={vH.px} y2={vH.py} />
              <line x1={vE.px} y1={vE.py} x2={vA.px} y2={vA.py} />
            </g>

            {/* 2. Cube Faces (Translucent Glass Effect) */}
            {/* Top Face: A - B - C - D */}
            <polygon
              points={`${vA.px},${vA.py} ${vB.px},${vB.py} ${vC.px},${vC.py} ${vD.px},${vD.py}`}
              fill="url(#topFaceGrad)"
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* Front-Left Face: D - C - G - H */}
            <polygon
              points={`${vD.px},${vD.py} ${vC.px},${vC.py} ${vG.px},${vG.py} ${vH.px},${vH.py}`}
              fill="url(#frontFaceGrad)"
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* Front-Right Face: B - C - G - F */}
            <polygon
              points={`${vB.px},${vB.py} ${vC.px},${vC.py} ${vG.px},${vG.py} ${vF.px},${vF.py}`}
              fill="url(#rightFaceGrad)"
              stroke="#94a3b8"
              strokeWidth="2"
            />

            {/* 3. Main Outer Edges of Cube */}
            <g stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1={vA.px} y1={vA.py} x2={vB.px} y2={vB.py} />
              <line x1={vB.px} y1={vB.py} x2={vC.px} y2={vC.py} />
              <line x1={vC.px} y1={vC.py} x2={vD.px} y2={vD.py} />
              <line x1={vD.px} y1={vD.py} x2={vA.px} y2={vA.py} />

              <line x1={vB.px} y1={vB.py} x2={vF.px} y2={vF.py} />
              <line x1={vC.px} y1={vC.py} x2={vG.px} y2={vG.py} />
              <line x1={vD.px} y1={vD.py} x2={vH.px} y2={vH.py} />

              <line x1={vF.px} y1={vF.py} x2={vG.px} y2={vG.py} />
              <line x1={vG.px} y1={vG.py} x2={vH.px} y2={vH.py} />
            </g>

            {/* 4. Cross Section Polygon (Slice Plane) */}
            {isSliced && sliceVertices2D.length >= 3 && (
              <g className="transition-all duration-500 animate-fade-in">
                <polygon
                  points={slicePolygonPointsString}
                  fill={isExploded ? 'url(#sliceExplodeGlow)' : 'url(#sliceGlow)'}
                  stroke={isExploded ? '#f43f5e' : '#34d399'}
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  className="shadow-lg"
                />

                {/* Animated Outline / Pulsing effect */}
                <polygon
                  points={slicePolygonPointsString}
                  fill="none"
                  stroke="#fef08a"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* 5. Cut Points Pins */}
            {currentPuzzle.cutPoints?.map((pt) => {
              const p = projectPoint(pt.x, pt.y, pt.z, isExploded ? 0.35 : 0);
              return (
                <g key={pt.id} transform={`translate(${p.px}, ${p.py})`} className="cursor-pointer group">
                  <circle r="9" fill="#f43f5e" opacity="0.3" className="animate-ping" />
                  <circle r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x="0"
                    y="-11"
                    fill="#fef08a"
                    fontSize="11"
                    fontWeight="black"
                    textAnchor="middle"
                    className="drop-shadow-md"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}

            {/* Exploded Separation Arrow Indicator */}
            {isExploded && (
              <g transform="translate(390, 160)" className="animate-bounce">
                <path d="M0,20 L0,-20 M-6,-12 L0,-20 L6,-12" stroke="#f59e0b" strokeWidth="3" fill="none" />
                <text x="12" y="4" fill="#fef08a" fontSize="11" fontWeight="bold">
                  断面オープン！
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Error Feedback Banner */}
        {feedbackError && (
          <div className="w-full bg-rose-500/20 border-2 border-rose-500/60 rounded-2xl p-3 text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 animate-shake shadow-md">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        {/* Question Options Grid */}
        <div className="w-full bg-slate-900/90 border-2 border-purple-500/40 rounded-2xl p-3.5 sm:p-4 text-white shadow-xl">
          <div className="text-xs font-black text-purple-300 mb-3 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>正しい断面の形や幾何法則を選んでタップしよう！</span>
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
                      : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-100 hover:border-purple-400'
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

      {/* Hint / Strategy Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-purple-400 rounded-3xl max-w-md w-full p-6 text-white text-center shadow-2xl relative animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-3xl mx-auto mb-3">
              <HelpCircle className="w-7 h-7 text-purple-400" />
            </div>
            <h4 className="text-lg font-black text-purple-300 mb-2">
              立体切断・空間幾何ノート
            </h4>
            <p className="text-xs text-slate-300 font-bold mb-4 leading-relaxed">
              {currentPuzzle.hint}
            </p>
            <div className="bg-white/5 rounded-2xl p-3 text-left text-[11px] text-purple-200 border border-white/10 mb-4 space-y-1">
              <span className="font-black block text-purple-400 mb-1">
                【切断の3大鉄則】
              </span>
              <p>① <strong>同一平面上の2点</strong>は定規でまっすぐ結ぶ！</p>
              <p>② <strong>向かい合う平行な面</strong>にあらわれる切り口は必ず平行！</p>
              <p>③ 同一平面にない点は、立体の外へ線を<strong>延長して交点</strong>を探す！</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setIsHelpOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-colors cursor-pointer"
            >
              わかった！閉じる
            </button>
          </div>
        </div>
      )}
    </GameModalWrapper>
  );
};
