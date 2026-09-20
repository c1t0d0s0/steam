import React, { useState, useEffect, useMemo } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Zap, AlertTriangle, HelpCircle, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export interface BulbState {
  id: string;
  label: string;
  x: number; // percentage or SVG coordinate
  y: number;
}

export interface SwitchState {
  id: string;
  label: string;
  x: number;
  y: number;
  isOn: boolean;
}

export interface BatteryState {
  id: string;
  label: string;
  x: number;
  y: number;
  count: number;
  connection: 'series' | 'parallel';
}

export type CircuitPuzzleType = 'switch_target' | 'brightness_quiz' | 'short_detect';

export interface CircuitPuzzle {
  id: string;
  title: string;
  subtitle: string;
  question: string;
  puzzleType: CircuitPuzzleType;
  batteries: BatteryState[];
  bulbs: BulbState[];
  switches?: { id: string; label: string; x: number; y: number; defaultOn: boolean }[];
  // Wires definition for SVG rendering
  wireSegments: { x1: number; y1: number; x2: number; y2: number }[];
  // Logic function or static mapping to compute bulb brightness (0, 0.33, 0.5, 0.67, 1, 2, etc.)
  // We can evaluate based on switch states
  calculateState: (switchStates: Record<string, boolean>) => {
    bulbBrightness: Record<string, number>; // id -> brightness ratio
    isShortCircuit?: boolean; // battery short
    shortedBulbs?: string[]; // bypassed bulbs
    activeWires?: number[]; // indices of active wire segments
  };
  targetCondition?: {
    requiredOn: string[];
    requiredOff: string[];
    description: string;
  };
  options?: { id: string; text: string; correct: boolean }[];
  hint: string;
  explanation: string;
  examTip: string;
}

interface CircuitGameProps {
  level: number;
  grade?: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: any[];
  customTitle?: string;
  customBadge?: string;
}

// -----------------------------------------------------------------------------
// Grade-based Puzzles (4 grades x 6 levels x 3 variations = 72 puzzles)
// -----------------------------------------------------------------------------

const GRADE_CIRCUIT_PUZZLES: Record<number, Record<number, CircuitPuzzle[]>> = {
  // 🎒 Grade 3: あかりがつく回路とスイッチの基礎
  3: {
    1: [
      {
        id: 'g3_l1_p1',
        title: 'あかりがつく回路の基本',
        subtitle: '乾電池と豆電球をひとつの「輪」にしよう！',
        question: 'スイッチSW1を入れて、回路をひとつの「輪」にして電球Aを光らせよう！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 150, y: 220, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 80 }],
        switches: [{ id: 'SW1', label: 'スイッチ', x: 350, y: 220, defaultOn: false }],
        wireSegments: [
          { x1: 150, y1: 220, x2: 100, y2: 220 },
          { x1: 100, y1: 220, x2: 100, y2: 80 },
          { x1: 100, y1: 80, x2: 250, y2: 80 },
          { x1: 250, y1: 80, x2: 400, y2: 80 },
          { x1: 400, y1: 80, x2: 400, y2: 220 },
          { x1: 400, y1: 220, x2: 350, y2: 220 },
          { x1: 350, y1: 220, x2: 150, y2: 220 }
        ],
        calculateState: (sw) => {
          const on = Boolean(sw['SW1']);
          return {
            bulbBrightness: { A: on ? 1 : 0 },
            activeWires: on ? [0, 1, 2, 3, 4, 5, 6] : []
          };
        },
        targetCondition: { requiredOn: ['A'], requiredOff: [], description: '豆電球Aを点灯させる' },
        hint: 'スイッチをクリックして【ON（入れる）】にすると、電気の通り道が輪になってつながります！',
        explanation: '電気は乾電池の＋極から出て、豆電球を通ってー極へと戻るひとつの「輪（回路）」ができると流れます！スイッチを入れると回路がつながり点灯します。',
        examTip: '【理科のツボ】電気が流れるひとつの輪のことを「回路」と呼びます！途中で途切れていると電気は流れません。'
      },
      {
        id: 'g3_l1_p2',
        title: '回路を開いて消灯（スイッチを切る）',
        subtitle: 'スイッチを切ると電気はどうなる？',
        question: '部屋が明るくなりました！スイッチSW1を切って（OFFにして）、回路を開いて豆電球Aを【消灯】させよう！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 150, y: 220, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 80 }],
        switches: [{ id: 'SW1', label: 'スイッチSW1', x: 350, y: 220, defaultOn: true }],
        wireSegments: [
          { x1: 150, y1: 220, x2: 100, y2: 220 },
          { x1: 100, y1: 220, x2: 100, y2: 80 },
          { x1: 100, y1: 80, x2: 250, y2: 80 },
          { x1: 250, y1: 80, x2: 400, y2: 80 },
          { x1: 400, y1: 80, x2: 400, y2: 220 },
          { x1: 400, y1: 220, x2: 350, y2: 220 },
          { x1: 350, y1: 220, x2: 150, y2: 220 }
        ],
        calculateState: (sw) => {
          const on = Boolean(sw['SW1']);
          return {
            bulbBrightness: { A: on ? 1 : 0 },
            activeWires: on ? [0, 1, 2, 3, 4, 5, 6] : []
          };
        },
        targetCondition: { requiredOn: [], requiredOff: ['A'], description: 'スイッチSW1を切って豆電球Aを消灯させる' },
        hint: 'スイッチをクリックして【OFF（開く）】にすると、電気の通り道が途切れて消灯します！',
        explanation: '正解！スイッチを切る（回路を開く）と、電気の通り道が途切れて電流が止まり、豆電球が消灯します。「つける」だけでなく「安全に消す」のもスイッチの大切な役割です！',
        examTip: '【回路の開閉】スイッチを入れることを「回路を閉じる（閉回路）」、スイッチを切ることを「回路を開く（開回路）」と呼びます！'
      },
      {
        id: 'g3_l1_p3',
        title: '直列2重スイッチ（安全装置）',
        subtitle: '2つのスイッチを両方入れよう！',
        question: '安全のためスイッチが直列に2つついています。SW1（主電源）とSW2（点灯スイッチ）の両方を入れて、豆電球Aを光らせよう！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 220, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 80 }],
        switches: [
          { id: 'SW1', label: '主電源SW1', x: 250, y: 220, defaultOn: false },
          { id: 'SW2', label: '点灯SW2', x: 370, y: 220, defaultOn: false }
        ],
        wireSegments: [
          { x1: 120, y1: 220, x2: 70, y2: 220 },
          { x1: 70, y1: 220, x2: 70, y2: 80 },
          { x1: 70, y1: 80, x2: 250, y2: 80 },
          { x1: 250, y1: 80, x2: 430, y2: 80 },
          { x1: 430, y1: 80, x2: 430, y2: 220 },
          { x1: 430, y1: 220, x2: 370, y2: 220 },
          { x1: 370, y1: 220, x2: 250, y2: 220 },
          { x1: 250, y1: 220, x2: 120, y2: 220 }
        ],
        calculateState: (sw) => {
          const on = Boolean(sw['SW1']) && Boolean(sw['SW2']);
          return {
            bulbBrightness: { A: on ? 1 : 0 },
            activeWires: on ? [0, 1, 2, 3, 4, 5, 6, 7] : []
          };
        },
        targetCondition: { requiredOn: ['A'], requiredOff: [], description: 'SW1とSW2の両方を入れて豆電球Aを点灯させる' },
        hint: 'どちらか一方だけONにしても、もう片方が開いていたら電気は流れません！両方をONにしましょう。',
        explanation: '正解！2つのスイッチが直列に並んでいるときは、両方のスイッチをONにしないと回路が完成しません。電子レンジや洗濯機などで誤作動を防ぐ「二重安全スイッチ（インターロック）」と同じ仕組みです！',
        examTip: '【直列スイッチの論理】2つの条件が両方揃ったときだけ動く回路は、後の学年や情報科学で学ぶ「AND（論理積）回路」の基礎になります！'
      }
    ],
    2: [
      {
        id: 'g3_l2_p1',
        title: '2つのスイッチと点灯',
        subtitle: '電球Aだけを狙って光らせよう！',
        question: 'スイッチSW1とSW2を操作して、【電球Aだけを点灯】させ、電球Bは消灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 240, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '豆電球A', x: 250, y: 70 },
          { id: 'B', label: '豆電球B', x: 250, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1（電球A用）', x: 380, y: 70, defaultOn: false },
          { id: 'SW2', label: 'SW2（電球B用）', x: 380, y: 150, defaultOn: false }
        ],
        wireSegments: [
          { x1: 120, y1: 240, x2: 80, y2: 240 },
          { x1: 80, y1: 240, x2: 80, y2: 70 },
          { x1: 80, y1: 70, x2: 250, y2: 70 },
          { x1: 80, y1: 150, x2: 250, y2: 150 },
          { x1: 250, y1: 70, x2: 380, y2: 70 },
          { x1: 250, y1: 150, x2: 380, y2: 150 },
          { x1: 380, y1: 70, x2: 440, y2: 70 },
          { x1: 380, y1: 150, x2: 440, y2: 150 },
          { x1: 440, y1: 70, x2: 440, y2: 240 },
          { x1: 440, y1: 240, x2: 120, y2: 240 }
        ],
        calculateState: (sw) => {
          return {
            bulbBrightness: {
              A: sw['SW1'] ? 1 : 0,
              B: sw['SW2'] ? 1 : 0
            }
          };
        },
        targetCondition: { requiredOn: ['A'], requiredOff: ['B'], description: '電球Aのみ点灯（Bは消灯）' },
        hint: '電球AにつながるSW1をON、電球BにつながるSW2をOFFにしましょう！',
        explanation: '並列に分岐した回路では、それぞれの枝にあるスイッチで電球を別々にON/OFFできます！',
        examTip: '【生活の中の理科】家の部屋の電気も並列につながっているため、一部屋だけ電気を消すことができます！'
      },
      {
        id: 'g3_l2_p2',
        title: '電球Bだけを点灯！',
        subtitle: 'スイッチの役割を使い分けよう！',
        question: 'スイッチを操作して、【電球Bだけを点灯】させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 240, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '豆電球A', x: 250, y: 70 },
          { id: 'B', label: '豆電球B', x: 250, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1（電球A用）', x: 380, y: 70, defaultOn: true },
          { id: 'SW2', label: 'SW2（電球B用）', x: 380, y: 150, defaultOn: false }
        ],
        wireSegments: [
          { x1: 120, y1: 240, x2: 80, y2: 240 },
          { x1: 80, y1: 240, x2: 80, y2: 70 },
          { x1: 80, y1: 70, x2: 250, y2: 70 },
          { x1: 80, y1: 150, x2: 250, y2: 150 },
          { x1: 250, y1: 70, x2: 380, y2: 70 },
          { x1: 250, y1: 150, x2: 380, y2: 150 },
          { x1: 380, y1: 70, x2: 440, y2: 70 },
          { x1: 380, y1: 150, x2: 440, y2: 150 },
          { x1: 440, y1: 70, x2: 440, y2: 240 },
          { x1: 440, y1: 240, x2: 120, y2: 240 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 1 : 0,
            B: sw['SW2'] ? 1 : 0
          }
        }),
        targetCondition: { requiredOn: ['B'], requiredOff: ['A'], description: '電球Bのみ点灯（Aは消灯）' },
        hint: 'SW1をOFFにし、SW2をONにしましょう。',
        explanation: 'SW1を開いて電球Aを消し、SW2を閉じて電球Bをつけました！',
        examTip: '【ポイント】枝分かれした回路（並列回路）は、それぞれの電球が独立しています。'
      },
      {
        id: 'g3_l2_p3',
        title: '両方の電球を点灯！',
        subtitle: '2つのスイッチを両方使いこなそう！',
        question: 'スイッチSW1とSW2の両方をONにして、【両方の電球】を光らせよう！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 240, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '豆電球A', x: 250, y: 70 },
          { id: 'B', label: '豆電球B', x: 250, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1', x: 380, y: 70, defaultOn: false },
          { id: 'SW2', label: 'SW2', x: 380, y: 150, defaultOn: false }
        ],
        wireSegments: [
          { x1: 120, y1: 240, x2: 80, y2: 240 },
          { x1: 80, y1: 240, x2: 80, y2: 70 },
          { x1: 80, y1: 70, x2: 250, y2: 70 },
          { x1: 80, y1: 150, x2: 250, y2: 150 },
          { x1: 250, y1: 70, x2: 380, y2: 70 },
          { x1: 250, y1: 150, x2: 380, y2: 150 },
          { x1: 380, y1: 70, x2: 440, y2: 70 },
          { x1: 380, y1: 150, x2: 440, y2: 150 },
          { x1: 440, y1: 70, x2: 440, y2: 240 },
          { x1: 440, y1: 240, x2: 120, y2: 240 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 1 : 0,
            B: sw['SW2'] ? 1 : 0
          }
        }),
        targetCondition: { requiredOn: ['A', 'B'], requiredOff: [], description: '電球AとBの両方を点灯' },
        hint: 'SW1とSW2をどちらもONにしてください。',
        explanation: '両方のスイッチを入れたことで、両方の電球に電気が流れて明るく点灯しました！',
        examTip: '【乾電池の持ち】並列に電球を2つつなぐと、電池から流れる電気は2倍になるため、電池は早く減ります。'
      }
    ],
    3: [
      {
        id: 'g3_l3_p1',
        title: '電気を通すもの・通さないもの',
        subtitle: '身の回りのものを回路にはさんでみよう！',
        question: '回路の途中に挟んだとき、【豆電球が光るもの（電気を通すもの）】はどれ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 220, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: '📎 鉄のゼムクリップ', correct: true },
          { id: 'o2', text: '🧼 ゴム消しゴム', correct: false },
          { id: 'o3', text: '🪵 わりばし（木）', correct: false },
          { id: 'o4', text: '🥤 プラスチック定規', correct: false }
        ],
        hint: '金属でできているものは電気を通します！',
        explanation: '鉄、銅、アルミニウムなどの「金属」は電気を通します（導体）。ゴムやプラスチック、木などは電気を通しません（不導体/絶縁体）。',
        examTip: '【入試のひっかけ】アルミ缶は表面に塗装があると電気を通しません！紙やすりで削ると電気を通すようになります。'
      },
      {
        id: 'g3_l3_p2',
        title: '金属と電気',
        subtitle: 'コインを挟んだらどうなる？',
        question: '10円玉（銅）や1円玉（アルミニウム）を回路に挟むと豆電球はどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 220, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: 'どちらを挟んでも豆電球は光る（電気を通す）', correct: true },
          { id: 'o2', text: '10円玉だけ光り、1円玉は光らない', correct: false },
          { id: 'o3', text: 'どちらを挟んでも光らない', correct: false }
        ],
        hint: '10円玉も1円玉もどちらも「金属」でできています！',
        explanation: '銅もアルミニウムも金属なので、どちらも電気をよく通します！',
        examTip: '【中学受験のツボ】金属以外の身近な物質で電気を通す特別なものとして「シャープペンの芯（黒鉛/炭素）」が超頻出です！'
      },
      {
        id: 'g3_l3_p3',
        title: '電気を通さない素材',
        subtitle: '電気を通さないものはどれ？',
        question: '回路に挟んだときに【電気が通らない（豆電球が光らない）】ものはどれ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 220, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: 'ガラスのコップ', correct: true },
          { id: 'o2', text: 'スチール缶の削った部分', correct: false },
          { id: 'o3', text: 'アルミホイル', correct: false },
          { id: 'o4', text: '真ちゅうの画びょう', correct: false }
        ],
        hint: 'ガラスは金属ではありません。',
        explanation: 'ガラスは電気を通しません。電線の周りをゴムやビニールで覆うのも、感電を防ぐためです。',
        examTip: '【安全の工夫】電線の導線（銅）の外側にビニールが巻かれているのは、電気が外に逃げないようにするためです。'
      }
    ],
    4: [
      {
        id: 'g3_l4_p1',
        title: '切り替えスイッチ（分岐）',
        subtitle: 'スイッチ1つで行き先を変える！',
        question: 'SW1を切り替えて、【電球Aだけ】を光らせてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 150, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A（赤）', x: 250, y: 80 },
          { id: 'B', label: '電球B（青）', x: 250, y: 160 }
        ],
        switches: [{ id: 'SW1', label: '切替スイッチ (ON=A / OFF=B)', x: 380, y: 120, defaultOn: false }],
        wireSegments: [
          { x1: 150, y1: 220, x2: 80, y2: 220 },
          { x1: 80, y1: 220, x2: 80, y2: 80 },
          { x1: 80, y1: 80, x2: 250, y2: 80 },
          { x1: 80, y1: 160, x2: 250, y2: 160 },
          { x1: 250, y1: 80, x2: 380, y2: 120 },
          { x1: 250, y1: 160, x2: 380, y2: 120 },
          { x1: 380, y1: 120, x2: 440, y2: 120 },
          { x1: 440, y1: 120, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 150, y2: 220 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 1 : 0,
            B: !sw['SW1'] ? 1 : 0
          }
        }),
        targetCondition: { requiredOn: ['A'], requiredOff: ['B'], description: '電球Aのみ点灯（Bは消灯）' },
        hint: '切替スイッチをONにすると電球Aの回路がつながります！',
        explanation: 'スイッチの向きを変えることで、電流の通り道を切り替えて光る電球を選ぶことができます！',
        examTip: '【豆知識】鉄道の線路のポイント（分岐器）と同じ仕組みです！'
      },
      {
        id: 'g3_l4_p2',
        title: '電球Bへの切り替え',
        subtitle: 'スイッチを反対に切り替えよう！',
        question: '切替スイッチを操作して、【電球Bだけ】を光らせてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 150, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 250, y: 80 },
          { id: 'B', label: '電球B', x: 250, y: 160 }
        ],
        switches: [{ id: 'SW1', label: '切替スイッチ', x: 380, y: 120, defaultOn: true }],
        wireSegments: [
          { x1: 150, y1: 220, x2: 80, y2: 220 },
          { x1: 80, y1: 220, x2: 80, y2: 80 },
          { x1: 80, y1: 80, x2: 250, y2: 80 },
          { x1: 80, y1: 160, x2: 250, y2: 160 },
          { x1: 250, y1: 80, x2: 380, y2: 120 },
          { x1: 250, y1: 160, x2: 380, y2: 120 },
          { x1: 380, y1: 120, x2: 440, y2: 120 },
          { x1: 440, y1: 120, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 150, y2: 220 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 1 : 0,
            B: !sw['SW1'] ? 1 : 0
          }
        }),
        targetCondition: { requiredOn: ['B'], requiredOff: ['A'], description: '電球Bのみ点灯（Aは消灯）' },
        hint: '切替スイッチをクリックしてOFF（電球B側）に切り替えましょう。',
        explanation: '電球B側に回路がつながり、電球Bが点灯しました！',
        examTip: '【3路スイッチへの布石】この切替スイッチの仕組みが、高学年で学ぶ階段スイッチの基本になります。'
      },
      {
        id: 'g3_l4_p3',
        title: '3つの電球の選択',
        subtitle: '狙った電球に電気を流そう！',
        question: 'スイッチSW1, SW2, SW3を操作して、【電球Bだけ】を点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 240, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 250, y: 60 },
          { id: 'B', label: '電球B', x: 250, y: 120 },
          { id: 'C', label: '電球C', x: 250, y: 180 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1（電球A）', x: 380, y: 60, defaultOn: true },
          { id: 'SW2', label: 'SW2（電球B）', x: 380, y: 120, defaultOn: false },
          { id: 'SW3', label: 'SW3（電球C）', x: 380, y: 180, defaultOn: true }
        ],
        wireSegments: [
          { x1: 120, y1: 240, x2: 80, y2: 240 },
          { x1: 80, y1: 240, x2: 80, y2: 60 },
          { x1: 80, y1: 60, x2: 250, y2: 60 },
          { x1: 80, y1: 120, x2: 250, y2: 120 },
          { x1: 80, y1: 180, x2: 250, y2: 180 },
          { x1: 250, y1: 60, x2: 380, y2: 60 },
          { x1: 250, y1: 120, x2: 380, y2: 120 },
          { x1: 250, y1: 180, x2: 380, y2: 180 },
          { x1: 380, y1: 60, x2: 440, y2: 60 },
          { x1: 380, y1: 120, x2: 440, y2: 120 },
          { x1: 380, y1: 180, x2: 440, y2: 180 },
          { x1: 440, y1: 60, x2: 440, y2: 240 },
          { x1: 440, y1: 240, x2: 120, y2: 240 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 1 : 0,
            B: sw['SW2'] ? 1 : 0,
            C: sw['SW3'] ? 1 : 0
          }
        }),
        targetCondition: { requiredOn: ['B'], requiredOff: ['A', 'C'], description: '電球Bのみ点灯（AとCは消灯）' },
        hint: 'SW1とSW3をOFFにし、SW2だけをONにしましょう。',
        explanation: '見事に電球Bだけに通電させることができました！',
        examTip: '【観察眼】どの線がどこにつながっているかを指でなぞって確認する習慣をつけましょう。'
      }
    ],
    5: [
      {
        id: 'g3_l5_p1',
        title: '乾電池の向き（＋極とー極）',
        subtitle: '乾電池の向きを確かめよう！',
        question: '乾電池のでっぱりがある側はどちらの極でしょう？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 200, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: '＋（プラス）極', correct: true },
          { id: 'o2', text: 'ー（マイナス）極', correct: false }
        ],
        hint: '丸いでっぱりがある頭のほうがプラスです！',
        explanation: '乾電池の出っ張っている側が「＋極」、平らな底の側が「ー極」です！電流は＋極から出てー極へと流れます。',
        examTip: '【理科の基本】豆電球は乾電池の向きを逆にしても同じように光りますが、モーターやLEDは向きによって回転方向や点灯が変わります！'
      },
      {
        id: 'g3_l5_p2',
        title: '乾電池を逆向きにつないだら？',
        subtitle: '豆電球の明かりはどうなる？',
        question: '乾電池の＋極とー極を反対向きにつなぎかえると、普通の豆電球はどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 200, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: '向きを変えても同じ明るさで光る', correct: true },
          { id: 'o2', text: '消えて光らなくなる', correct: false },
          { id: 'o3', text: '明るさが半分になる', correct: false }
        ],
        hint: '普通の豆電球（フィラメント）はどちら向きに電気が流れても熱くなって光ります！',
        explanation: '豆電球のフィラメントは電気の流れる向きに関係なく発熱するため、乾電池を逆にしても明るさは変わりません！',
        examTip: '【LEDとの違い】LED（発光ダイオード）は電気を一方向にしか通さないため、逆にすると光りません！中学受験でよく比較されます。'
      },
      {
        id: 'g3_l5_p3',
        title: '乾電池の正しい接続',
        subtitle: 'ソケットと電池ボックス',
        question: '豆電球のソケットと乾電池をつなぐとき、絶対にやってはいけない危険なつなぎ方はどれ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 200, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: '豆電球を通さずに、＋極とー極を直接導線だけでつなぐ（ショート）', correct: true },
          { id: 'o2', text: 'スイッチを回路の途中に挟む', correct: false },
          { id: 'o3', text: '導線を長くする', correct: false }
        ],
        hint: '電球などの抵抗を通さずに直接つなぐと、大電流が流れて電池が熱くなります！',
        explanation: '電球を通さずに＋極とー極を導線だけでつなぐと「ショート（短絡）」し、乾電池や導線が発熱して火傷や故障の原因になり大変危険です！',
        examTip: '【超重要】ショート回路は乾電池が猛烈に熱くなり危険です！入試でも「ショートする回路を選べ」という問題が頻出します。'
      }
    ],
    6: [
      {
        id: 'g3_l6_p1',
        title: '小3総合：スイッチ迷路パズル',
        subtitle: '隠された宝箱の電球Cを点灯せよ！',
        question: 'SW1, SW2, SW3を操作して、【電球Cだけを点灯】させ、電球AとBは消灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 240, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 200, y: 70 },
          { id: 'B', label: '電球B', x: 200, y: 140 },
          { id: 'C', label: '電球C（秘宝）', x: 200, y: 210 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1', x: 350, y: 70, defaultOn: true },
          { id: 'SW2', label: 'SW2', x: 350, y: 140, defaultOn: true },
          { id: 'SW3', label: 'SW3', x: 350, y: 210, defaultOn: false }
        ],
        wireSegments: [
          { x1: 100, y1: 240, x2: 60, y2: 240 },
          { x1: 60, y1: 240, x2: 60, y2: 70 },
          { x1: 60, y1: 70, x2: 200, y2: 70 },
          { x1: 60, y1: 140, x2: 200, y2: 140 },
          { x1: 60, y1: 210, x2: 200, y2: 210 },
          { x1: 200, y1: 70, x2: 350, y2: 70 },
          { x1: 200, y1: 140, x2: 350, y2: 140 },
          { x1: 200, y1: 210, x2: 350, y2: 210 },
          { x1: 350, y1: 70, x2: 440, y2: 70 },
          { x1: 350, y1: 140, x2: 440, y2: 140 },
          { x1: 350, y1: 210, x2: 440, y2: 210 },
          { x1: 440, y1: 70, x2: 440, y2: 240 },
          { x1: 440, y1: 240, x2: 100, y2: 240 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 1 : 0,
            B: sw['SW2'] ? 1 : 0,
            C: sw['SW3'] ? 1 : 0
          }
        }),
        targetCondition: { requiredOn: ['C'], requiredOff: ['A', 'B'], description: '電球Cのみ点灯（AとBは消灯）' },
        hint: 'SW1とSW2をOFFにして、SW3だけをONにしましょう！',
        explanation: 'お見事！SW1とSW2を遮断し、SW3のみを通電させて電球Cだけを輝かせました！',
        examTip: '【3年まとめ】電気が流れる道（回路）とスイッチの役割をマスターしました！4年生では乾電池の数を増やします！'
      },
      {
        id: 'g3_l6_p2',
        title: '小3総合：電球AとBの同時点灯',
        subtitle: '2つの電球を同時に光らせよう！',
        question: 'SW1, SW2, SW3を操作して、【電球AとBだけを点灯】させ、Cは消灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 240, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 200, y: 70 },
          { id: 'B', label: '電球B', x: 200, y: 140 },
          { id: 'C', label: '電球C', x: 200, y: 210 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1', x: 350, y: 70, defaultOn: false },
          { id: 'SW2', label: 'SW2', x: 350, y: 140, defaultOn: false },
          { id: 'SW3', label: 'SW3', x: 350, y: 210, defaultOn: true }
        ],
        wireSegments: [
          { x1: 100, y1: 240, x2: 60, y2: 240 },
          { x1: 60, y1: 240, x2: 60, y2: 70 },
          { x1: 60, y1: 70, x2: 200, y2: 70 },
          { x1: 60, y1: 140, x2: 200, y2: 140 },
          { x1: 60, y1: 210, x2: 200, y2: 210 },
          { x1: 200, y1: 70, x2: 350, y2: 70 },
          { x1: 200, y1: 140, x2: 350, y2: 140 },
          { x1: 200, y1: 210, x2: 350, y2: 210 },
          { x1: 350, y1: 70, x2: 440, y2: 70 },
          { x1: 350, y1: 140, x2: 440, y2: 140 },
          { x1: 350, y1: 210, x2: 440, y2: 210 },
          { x1: 440, y1: 70, x2: 440, y2: 240 },
          { x1: 440, y1: 240, x2: 100, y2: 240 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 1 : 0,
            B: sw['SW2'] ? 1 : 0,
            C: sw['SW3'] ? 1 : 0
          }
        }),
        targetCondition: { requiredOn: ['A', 'B'], requiredOff: ['C'], description: '電球AとBのみ点灯（Cは消灯）' },
        hint: 'SW1とSW2をONにし、SW3をOFFにしましょう。',
        explanation: '電球AとBに電気が通り、Cは回路が開いて消灯しました！',
        examTip: '【完璧な理解】これで小3理科「電気の通り道」はパーフェクトです！'
      },
      {
        id: 'g3_l6_p3',
        title: '小3総合：全点灯マスター',
        subtitle: '3つの電球すべてに明かりを灯せ！',
        question: 'SW1, SW2, SW3のすべてをONにして、【すべての電球】を点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 240, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 200, y: 70 },
          { id: 'B', label: '電球B', x: 200, y: 140 },
          { id: 'C', label: '電球C', x: 200, y: 210 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1', x: 350, y: 70, defaultOn: false },
          { id: 'SW2', label: 'SW2', x: 350, y: 140, defaultOn: true },
          { id: 'SW3', label: 'SW3', x: 350, y: 210, defaultOn: false }
        ],
        wireSegments: [
          { x1: 100, y1: 240, x2: 60, y2: 240 },
          { x1: 60, y1: 240, x2: 60, y2: 70 },
          { x1: 60, y1: 70, x2: 200, y2: 70 },
          { x1: 60, y1: 140, x2: 200, y2: 140 },
          { x1: 60, y1: 210, x2: 200, y2: 210 },
          { x1: 200, y1: 70, x2: 350, y2: 70 },
          { x1: 200, y1: 140, x2: 350, y2: 140 },
          { x1: 200, y1: 210, x2: 350, y2: 210 },
          { x1: 350, y1: 70, x2: 440, y2: 70 },
          { x1: 350, y1: 140, x2: 440, y2: 140 },
          { x1: 350, y1: 210, x2: 440, y2: 210 },
          { x1: 440, y1: 70, x2: 440, y2: 240 },
          { x1: 440, y1: 240, x2: 100, y2: 240 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 1 : 0,
            B: sw['SW2'] ? 1 : 0,
            C: sw['SW3'] ? 1 : 0
          }
        }),
        targetCondition: { requiredOn: ['A', 'B', 'C'], requiredOff: [], description: 'すべての電球(A, B, C)を点灯' },
        hint: 'SW1, SW2, SW3をすべてONにしてください！',
        explanation: '3つすべての電球がパッと明るく灯りました！見事な回路制御です！',
        examTip: '【合格認定】小学3年生の電気回路基礎ステージを完全クリアしました！'
      }
    ]
  },

  // 🎒 Grade 4: 乾電池の直列・並列つなぎと電流の強さ
  4: {
    1: [
      {
        id: 'g4_l1_p1',
        title: '乾電池の直列つなぎ',
        subtitle: '乾電池2個を直列につなぐと明るさは？',
        question: '乾電池2個を直列（＋とーを交互）につなぐと、豆電球の明るさは乾電池1個の時と比べてどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個直列', x: 250, y: 220, count: 2, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 2 } }),
        options: [
          { id: 'o1', text: '約2倍の明るさになる', correct: true },
          { id: 'o2', text: '明るさは変わらない', correct: false },
          { id: 'o3', text: '半分になって暗くなる', correct: false }
        ],
        hint: '乾電池を直列につなぐと電圧（電気を押し出す力）が2倍になります！',
        explanation: '乾電池を直列につなぐと電圧が2倍になり、回路に流れる電流も2倍になるため、豆電球は約2倍の明るさで強く光ります！',
        examTip: '【直列つなぎの長所と短所】長所：電球がとても明るくなる！ 短所：電流がたくさん流れるので、乾電池が早く（約半分の時間で）なくなってしまう。'
      },
      {
        id: 'g4_l1_p2',
        title: '乾電池直列の電流',
        subtitle: '流れる電気の量を比べよう！',
        question: '乾電池2個を直列につないだとき、回路を流れる電流の大きさは乾電池1個の時の何倍？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個直列', x: 250, y: 220, count: 2, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 2 } }),
        options: [
          { id: 'o1', text: '2倍', correct: true },
          { id: 'o2', text: '1倍（同じ）', correct: false },
          { id: 'o3', text: '4倍', correct: false }
        ],
        hint: '乾電池1個で流れる電流を1とすると、2個直列では？',
        explanation: '乾電池2個直列では、電気を押し出す力が2倍になるため、流れる電流も2倍になります！',
        examTip: '【入試頻出】検流計（電流計）をつなぐと、針の振れ幅がちょうど2倍になります！'
      },
      {
        id: 'g4_l1_p3',
        title: '直列つなぎの乾電池の減り方',
        subtitle: '電池の寿命はどうなる？',
        question: '乾電池2個直列で豆電球を光らせ続けたとき、乾電池1個の時と比べて電池の寿命（点灯し続ける時間）はどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個直列', x: 250, y: 220, count: 2, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 2 } }),
        options: [
          { id: 'o1', text: '約半分（1/2）の時間で使い切ってしまう', correct: true },
          { id: 'o2', text: '2倍長持ちする', correct: false },
          { id: 'o3', text: '同じ時間使える', correct: false }
        ],
        hint: '電流が2倍のスピードで消費されます！',
        explanation: '2倍の電流を一気に流すため、乾電池のエネルギーも2倍の速さで消費され、約半分の時間で使い切ってしまいます！',
        examTip: '【明るさと寿命のトレードオフ】直列＝明るさ2倍・寿命1/2。並列＝明るさ1倍・寿命2倍！'
      }
    ],
    2: [
      {
        id: 'g4_l2_p1',
        title: '乾電池の並列つなぎ',
        subtitle: '乾電池2個を並列につなぐと？',
        question: '乾電池2個を並列（＋極どうし、ー極どうし）につないだとき、豆電球の明るさは乾電池1個の時と比べてどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個並列', x: 250, y: 220, count: 2, connection: 'parallel' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: '明るさは変わらないが約2倍長持ちする', correct: true },
          { id: 'o2', text: '明るさが2倍になるが寿命は半分になる', correct: false },
          { id: 'o3', text: '明るさが半分になり長持ちもしない', correct: false }
        ],
        hint: '並列につなぐと電圧（電気を押し出す力）は1個分と同じですが、電池2個で電気を分け合って流します！',
        explanation: '乾電池を並列につないでも電圧は1個分と同じなので明るさは変わりません。しかし、2個の電池が半分ずつ電流を出し合うため、乾電池が約2倍長持ちします！',
        examTip: '【並列つなぎのメリット】懐中電灯や時計など、電池交換を少なくして長持ちさせたい器具で活用されます！'
      },
      {
        id: 'g4_l2_p2',
        title: '並列電池の電流の分担',
        subtitle: 'それぞれの電池から出る電流',
        question: '乾電池2個並列の回路で、豆電球に電流1が流れているとき、それぞれの乾電池1個あたりが出している電流は？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個並列', x: 250, y: 220, count: 2, connection: 'parallel' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: 'それぞれ 0.5（半分ずつ）', correct: true },
          { id: 'o2', text: 'それぞれ 1（同じ）', correct: false },
          { id: 'o3', text: 'それぞれ 2', correct: false }
        ],
        hint: '2個の電池が協力して1の電流を供給します。',
        explanation: '電球に流れる電流1を、2個の電池が0.5ずつ分担して流します。そのため電池1個あたりの負担が半分になり、長持ちするのです！',
        examTip: '【中学受験計算のツボ】並列電池は「全体の電流 ÷ 並列の個数」が電池1個あたりの電流になります！'
      },
      {
        id: 'g4_l2_p3',
        title: '並列電池の1個を外すと？',
        subtitle: '1個がなくなったらどうなる？',
        question: '乾電池2個並列で豆電球を光らせているとき、乾電池の1個を外すと豆電球はどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個並列', x: 250, y: 220, count: 2, connection: 'parallel' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: 'もう1個の電池があるので、同じ明るさのまま点灯し続ける', correct: true },
          { id: 'o2', text: '消えてしまう', correct: false },
          { id: 'o3', text: '明るさが半分になる', correct: false }
        ],
        hint: 'もう片方の電池がつながったまま回路ができています！',
        explanation: '残った1個の乾電池だけで回路が保たれるため、同じ明るさのまま点灯し続けます（寿命は普通の1個分に戻ります）。',
        examTip: '【直列との比較】直列の場合は1個外すと回路が途切れて消灯しますが、並列なら消えません！'
      }
    ],
    3: [
      {
        id: 'g4_l3_p1',
        title: '明るさ勝負：直列 vs 並列',
        subtitle: '一番明るい回路を選べ！',
        question: '豆電球が【最も明るく光る回路】はどれ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池', x: 250, y: 220, count: 2, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 2 } }),
        options: [
          { id: 'o1', text: '乾電池2個を「直列」につないだ回路（明るさ 2）', correct: true },
          { id: 'o2', text: '乾電池2個を「並列」につないだ回路（明るさ 1）', correct: false },
          { id: 'o3', text: '乾電池1個だけの回路（明るさ 1）', correct: false }
        ],
        hint: '直列につなぐと電圧が合算されて2倍になります！',
        explanation: '乾電池2個直列の回路が電圧2倍・電流2倍となり、最も明るく光ります！',
        examTip: '【明るさの公式】豆電球1個の場合、豆電球の明るさは「直列につながった乾電池の個数」に比例します！'
      },
      {
        id: 'g4_l3_p2',
        title: '長持ち勝負：直列 vs 並列',
        subtitle: '一番長持ちする回路はどれ？',
        question: '豆電球をつけてから【乾電池が最も長く持つ回路】はどれ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池', x: 250, y: 220, count: 2, connection: 'parallel' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: '乾電池2個を「並列」につないだ回路', correct: true },
          { id: 'o2', text: '乾電池2個を「直列」につないだ回路', correct: false },
          { id: 'o3', text: '乾電池1個の回路', correct: false }
        ],
        hint: '乾電池2個が半分ずつ電流を出し合う回路です。',
        explanation: '乾電池2個並列は、乾電池1個の回路の約2倍、乾電池2個直列の回路の約4倍も長持ちします！',
        examTip: '【入試の計算】直列の寿命を「1」とすると、電池1個は「2」、電池2個並列は「4」の比率になります！'
      },
      {
        id: 'g4_l3_p3',
        title: '検流計の針の振れ',
        subtitle: '電流の大きさと針の振れ幅',
        question: '検流計の針が最も大きく振れる（最も強い電流が流れている）回路はどれ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池', x: 250, y: 220, count: 2, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 2 } }),
        options: [
          { id: 'o1', text: '乾電池2個直列の回路', correct: true },
          { id: 'o2', text: '乾電池2個並列の回路', correct: false },
          { id: 'o3', text: '乾電池1個の回路', correct: false }
        ],
        hint: '電球が最も明るい回路と同じです！',
        explanation: '検流計は電流の強さに比例して針が振れます。乾電池2個直列は電流が2流れるため、針が一番大きく振れます！',
        examTip: '【検流計の使い方】検流計は必ず豆電球などの抵抗と直列につなぎます。乾電池に直接つなぐと壊れてしまいます！'
      }
    ],
    4: [
      {
        id: 'g4_l4_p1',
        title: '乾電池逆向き打ち消しトラップ！',
        subtitle: '2個の電池が向かい合っていると？',
        question: '乾電池2個の「＋極どうし」をつないで豆電球につなぐと、豆電球はどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 (＋極と＋極対向)', x: 250, y: 220, count: 2, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0 } }),
        options: [
          { id: 'o1', text: '電気が互いに打ち消し合って電圧0になり、点灯しない（つかない）', correct: true },
          { id: 'o2', text: '乾電池2個分で2倍明るく光る', correct: false },
          { id: 'o3', text: '乾電池1個分と同じ明るさで光る', correct: false }
        ],
        hint: '右向きに押す力と左向きに押す力が同じ強さでぶつかり合っています！',
        explanation: '同じ強さの乾電池が逆向きに対向していると、押し出す力が完全に相殺されて電圧がゼロ（1 - 1 = 0）になり、電流が流れず点灯しません！',
        examTip: '【中学受験頻出トラップ】乾電池が複数ある問題では、必ず「＋」と「ー」の向きを確認しましょう！逆向きの電池は打ち消し算（引き算）になります。'
      },
      {
        id: 'g4_l4_p2',
        title: '3個の乾電池（1個逆向き）',
        subtitle: '2個右向き、1個左向き！',
        question: '乾電池3個を直列につなぎましたが、1個だけ逆向きにセットしてしまいました。豆電球の明るさは乾電池何個分？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 3個 (2個順, 1個逆)', x: 250, y: 220, count: 3, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: '乾電池 1個分（2 - 1 = 1個分の明るさ）', correct: true },
          { id: 'o2', text: '乾電池 3個分', correct: false },
          { id: 'o3', text: '点灯しない（0個分）', correct: false }
        ],
        hint: '順方向が2個、逆方向が1個です。引き算してみましょう！',
        explanation: '順方向の2個から逆方向の1個が打ち消されるため、実質的な電圧は「2 - 1 = 1個分」となり、乾電池1個と同じ明るさで点灯します！',
        examTip: '【計算のツボ】乾電池の直列合成電圧 ＝（順方向の個数）ー（逆方向の個数）です！'
      },
      {
        id: 'g4_l4_p3',
        title: '4個の乾電池（2個逆向き）',
        subtitle: '2個順向き、2個逆向き！',
        question: '乾電池4個を直列につなぎ、2個を順向き、2個を逆向きにしました。豆電球はどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 4個 (2個順, 2個逆)', x: 250, y: 220, count: 4, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0 } }),
        options: [
          { id: 'o1', text: '2 - 2 = 0 となり、全く点灯しない', correct: true },
          { id: 'o2', text: '2個分の明るさで点灯する', correct: false },
          { id: 'o3', text: '4個分の明るさで点灯する', correct: false }
        ],
        hint: '2個と2個で完全に引き分けになります！',
        explanation: '順方向2個と逆方向2個の力が等しく釣り合い、電圧がゼロになるため点灯しません！',
        examTip: '【入試の盲点】電池がたくさんあっても、向きが合っていなければ全く光らないことがあります。'
      }
    ],
    5: [
      {
        id: 'g4_l5_p1',
        title: '乾電池3個の直列回路',
        subtitle: 'さらに強力なパワー！',
        question: '乾電池3個をすべて同じ向きに直列につなぐと、豆電球の明るさは乾電池1個の時の何倍？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 3個直列', x: 250, y: 220, count: 3, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 3 } }),
        options: [
          { id: 'o1', text: '3倍', correct: true },
          { id: 'o2', text: '1倍', correct: false },
          { id: 'o3', text: '1.5倍', correct: false }
        ],
        hint: '乾電池の個数分だけ電圧が足し算されます！',
        explanation: '乾電池3個直列では電圧が3倍になり、電流も3倍流れるため、明るさは3倍になります！（※実際の電球だとフィラメントが焼き切れる恐れがあるほど強力です）',
        examTip: '【実験の注意】実験室では電球が切れないように、通常は乾電池2個までの直列で実験します。'
      },
      {
        id: 'g4_l5_p2',
        title: '乾電池3個の並列回路',
        subtitle: '並列の数を3個に増やしたら？',
        question: '乾電池3個をすべて並列につないだとき、明るさと電池の寿命はどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 3個並列', x: 250, y: 220, count: 3, connection: 'parallel' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: '明るさは変わらないが約3倍長持ちする', correct: true },
          { id: 'o2', text: '明るさが3倍になり長持ちもする', correct: false },
          { id: 'o3', text: '明るさが1/3になり長持ちもしない', correct: false }
        ],
        hint: '並列なら何個つないでも電圧は1個分と同じです！',
        explanation: '何個並列にしても電圧は1個分と同じなので明るさは1倍のままです。電流を3個の電池で3等分（0.33ずつ）するため、3倍長持ちします！',
        examTip: '【並列の極意】並列にした乾電池の個数は、明るさには影響せず「寿命（点灯時間）」だけに比例します！'
      },
      {
        id: 'g4_l5_p3',
        title: '乾電池2個並列＋1個直列のミックス',
        subtitle: '電池の複合回路！',
        question: '（乾電池2個並列）に「もう1個の乾電池」を直列につなぐと、豆電球の明るさは乾電池何個分？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '電池(2並列＋1直列)', x: 250, y: 220, count: 3, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 2 } }),
        options: [
          { id: 'o1', text: '乾電池2個分の明るさ', correct: true },
          { id: 'o2', text: '乾電池3個分の明るさ', correct: false },
          { id: 'o3', text: '乾電池1個分の明るさ', correct: false }
        ],
        hint: '並列部分は電圧1、それに直列の1が足されます！',
        explanation: '並列部分の電圧は1個分（1V）、それに直列の乾電池（1V）が加わるので、全体の電圧は「1 + 1 = 2個分」となり、明るさも2倍になります！',
        examTip: '【複合回路の考え方】並列部分をまず「1個の電池」に置き換えてから、直列と足し算しましょう！'
      }
    ],
    6: [
      {
        id: 'g4_l6_p1',
        title: '小4総合：乾電池ボックス切り替えパズル',
        subtitle: '指定された【明るさ2（超明るい）】を作れ！',
        question: 'スイッチSW1（直列モード）とSW2（並列モード）を操作して、豆電球Aを【明るさ2倍（直列モード）】で点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池2個ボックス', x: 250, y: 220, count: 2, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        switches: [
          { id: 'SW1', label: 'SW1（直列スイッチ）', x: 160, y: 150, defaultOn: false },
          { id: 'SW2', label: 'SW2（並列スイッチ）', x: 340, y: 150, defaultOn: true }
        ],
        wireSegments: [
          { x1: 250, y1: 220, x2: 160, y2: 150 },
          { x1: 250, y1: 220, x2: 340, y2: 150 },
          { x1: 160, y1: 150, x2: 250, y2: 70 },
          { x1: 340, y1: 150, x2: 250, y2: 70 }
        ],
        calculateState: (sw) => {
          let b = 0;
          if (sw['SW1'] && !sw['SW2']) b = 2; // 直列
          else if (!sw['SW1'] && sw['SW2']) b = 1; // 並列
          else if (sw['SW1'] && sw['SW2']) b = 0; // 短絡/衝突
          return { bulbBrightness: { A: b } };
        },
        targetCondition: { requiredOn: ['A'], requiredOff: [], description: '豆電球Aを明るさ2（直列モード）にする' },
        hint: 'SW1（直列）をONにし、SW2（並列）をOFFにしましょう！',
        explanation: 'お見事！直列回路を構成したことで電圧が2倍になり、豆電球がサンバーストのように眩しく2倍の明るさで輝きました！',
        examTip: '【4年マスター認定】乾電池の直列つなぎ（明るさ2倍・寿命半分）と並列つなぎ（明るさ1倍・寿命2倍）を完全に攻略しました！'
      },
      {
        id: 'g4_l6_p2',
        title: '小4総合：長持ち並列モードへの切り替え',
        subtitle: '指定された【明るさ1（並列長持ちモード）】を作れ！',
        question: 'スイッチを操作して、豆電球Aを【明るさ1（並列モード）】に切り替えてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池2個ボックス', x: 250, y: 220, count: 2, connection: 'parallel' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        switches: [
          { id: 'SW1', label: 'SW1（直列スイッチ）', x: 160, y: 150, defaultOn: true },
          { id: 'SW2', label: 'SW2（並列スイッチ）', x: 340, y: 150, defaultOn: false }
        ],
        wireSegments: [
          { x1: 250, y1: 220, x2: 160, y2: 150 },
          { x1: 250, y1: 220, x2: 340, y2: 150 },
          { x1: 160, y1: 150, x2: 250, y2: 70 },
          { x1: 340, y1: 150, x2: 250, y2: 70 }
        ],
        calculateState: (sw) => {
          let b = 0;
          if (sw['SW1'] && !sw['SW2']) b = 2;
          else if (!sw['SW1'] && sw['SW2']) b = 1;
          return { bulbBrightness: { A: b } };
        },
        targetCondition: { requiredOn: ['A'], requiredOff: [], description: '豆電球Aを明るさ1（並列モード）にする' },
        hint: 'SW1をOFFにして、SW2をONにしましょう。',
        explanation: '並列モードに切り替わりました！明るさは1倍ですが、電池が2倍長持ちします！',
        examTip: '【用途による使い分け】強い光が必要なときは直列、長く照らしたいときは並列と使い分けるのがエンジニアの知恵です。'
      },
      {
        id: 'g4_l6_p3',
        title: '小4総合：安全消灯・待機モード',
        subtitle: 'スイッチを切って回路を安全に遮断しよう！',
        question: '実験が終わりました！直列SW1と並列SW2の両方をOFFにして、豆電球Aを安全に【消灯】させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池2個ボックス', x: 250, y: 220, count: 2, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        switches: [
          { id: 'SW1', label: 'SW1（直列）', x: 160, y: 150, defaultOn: true },
          { id: 'SW2', label: 'SW2（並列）', x: 340, y: 150, defaultOn: false }
        ],
        wireSegments: [
          { x1: 250, y1: 220, x2: 160, y2: 150 },
          { x1: 250, y1: 220, x2: 340, y2: 150 },
          { x1: 160, y1: 150, x2: 250, y2: 70 },
          { x1: 340, y1: 150, x2: 250, y2: 70 }
        ],
        calculateState: (sw) => {
          let b = 0;
          if (sw['SW1'] && !sw['SW2']) b = 2;
          else if (!sw['SW1'] && sw['SW2']) b = 1;
          return { bulbBrightness: { A: b } };
        },
        targetCondition: { requiredOn: [], requiredOff: ['A'], description: 'スイッチを両方OFFにして豆電球Aを消灯させる' },
        hint: '直列SW1をクリックしてOFFに切り替えましょう！両方のスイッチがOFFになれば回路が完全に開きます。',
        explanation: 'パーフェクト！両方のスイッチをOFFにして回路を開き、豆電球を安全に消灯させました！直列モード（明るさ2倍）、並列モード（長持ち）、安全消灯モードのすべてをマスターしました！',
        examTip: '【小4マスター認定】乾電池の直列（電圧2倍）・並列（長持ち）・開回路（消灯）を自由自在にコントロールできる電気回路の達人になりました！'
      }
    ]
  },

  // 🎒 Grade 5: 豆電球の直列・並列つなぎと明るさの変化
  5: {
    1: [
      {
        id: 'g5_l1_p1',
        title: '豆電球の直列つなぎ',
        subtitle: '豆電球を2個直列につなぐと明るさは？',
        question: '乾電池1個に「豆電球2個を直列」につなぐと、それぞれの豆電球の明るさは電球1個の時と比べてどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '豆電球A', x: 180, y: 70 },
          { id: 'B', label: '豆電球B', x: 320, y: 70 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.5, B: 0.5 } }),
        options: [
          { id: 'o1', text: '明るさは半分の1/2になる', correct: true },
          { id: 'o2', text: '明るさは変わらない', correct: false },
          { id: 'o3', text: '明るさは2倍になる', correct: false }
        ],
        hint: '豆電球は電気を通しにくい「障害物（抵抗）」です。障害物が2つ連続すると、流れる電気は半分になります！',
        explanation: '豆電球を直列につなぐと、全体の抵抗が2倍（1+1=2）になるため、流れる電流は「1 ÷ 2 = 1/2」に減り、それぞれの明るさは半分のうす暗い光になります！',
        examTip: '【豆電球直列の宿命】豆電球を直列につなぐと、電球が増えるほど暗くなります（3個なら1/3、4個なら1/4）。また、1個外すと回路が途切れて両方消えます！'
      },
      {
        id: 'g5_l1_p2',
        title: '電球直列で1個外すと？',
        subtitle: '直列回路の弱点',
        question: '豆電球2個直列の回路で、電球Aをソケットから外すと、もう一方の電球Bはどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '豆電球A（外す）', x: 180, y: 70 },
          { id: 'B', label: '豆電球B', x: 320, y: 70 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0, B: 0 } }),
        options: [
          { id: 'o1', text: '電球Bも消灯する', correct: true },
          { id: 'o2', text: '電球Bは点灯し続ける', correct: false },
          { id: 'o3', text: '電球Bが2倍明るくなる', correct: false }
        ],
        hint: '電球を外すと、そこが切れた電線と同じ状態になります！',
        explanation: '直列回路は電球を外すと回路に隙間ができて電流が完全に止まるため、電球Bも消えてしまいます！昔のクリスマスツリーの電球が1個切れると全部消えたのはこのためです。',
        examTip: '【入試の定番問】「電球を1個外したとき他の電球が消えるか否か」で直列か並列かを見分けさせられます！'
      },
      {
        id: 'g5_l1_p3',
        title: '豆電球3個の直列',
        subtitle: 'さらに電球を増やしたら？',
        question: '乾電池1個に豆電球3個を直列につなぐと、それぞれの明るさは電球1個の時の何倍？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 150, y: 70 },
          { id: 'B', label: '電球B', x: 250, y: 70 },
          { id: 'C', label: '電球C', x: 350, y: 70 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.33, B: 0.33, C: 0.33 } }),
        options: [
          { id: 'o1', text: '1/3 の明るさ（かなり暗い）', correct: true },
          { id: 'o2', text: '1/2 の明るさ', correct: false },
          { id: 'o3', text: '3倍の明るさ', correct: false }
        ],
        hint: '抵抗が3倍になるので、電流は1/3になります！',
        explanation: '抵抗が3倍になるため流れる電流は「1/3」になり、3個すべての電球が1/3の暗い光で均等に光ります！',
        examTip: '【直列の電流の性質】直列回路のどこを測っても、流れる電流の大きさは全く同じ（すべて1/3）です！'
      }
    ],
    2: [
      {
        id: 'g5_l2_p1',
        title: '豆電球の並列つなぎ',
        subtitle: '豆電球2個を並列につなぐと明るさは？',
        question: '乾電池1個に「豆電球2個を並列」につなぐと、それぞれの豆電球の明るさは電球1個の時と比べてどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 150, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '豆電球A', x: 300, y: 80 },
          { id: 'B', label: '豆電球B', x: 300, y: 220 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1, B: 1 } }),
        options: [
          { id: 'o1', text: 'どちらの電球も同じ明るさ（1倍）', correct: true },
          { id: 'o2', text: 'どちらの電球も半分の明るさ（1/2）', correct: false },
          { id: 'o3', text: '電球Aだけが光り電球Bは消灯する', correct: false }
        ],
        hint: 'それぞれの電球に、乾電池1個が直接つながっているのと同じ状態です！',
        explanation: '並列につなぐと、電球Aにも電球Bにも乾電池の電圧（1V）がそのまま丸々かかるため、どちらも電球1個の時と同じ「明るさ 1」で元気に光ります！',
        examTip: '【豆電球並列の電流と寿命】電球Aに電流1、電球Bに電流1が流れるので、乾電池からは合計「1 + 1 = 2」の電流が出ます！そのため乾電池は半分の時間で切れてしまいます。'
      },
      {
        id: 'g5_l2_p2',
        title: '電球並列で1個外すと？',
        subtitle: '並列回路の強み！',
        question: '豆電球2個並列の回路で、電球Aをソケットから外すと、もう一方の電球Bはどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 150, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '豆電球A（外す）', x: 300, y: 80 },
          { id: 'B', label: '豆電球B', x: 300, y: 220 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0, B: 1 } }),
        options: [
          { id: 'o1', text: '同じ明るさのまま点灯し続ける', correct: true },
          { id: 'o2', text: '電球Bも消灯する', correct: false },
          { id: 'o3', text: '電球Bの明るさが2倍になる', correct: false }
        ],
        hint: '電球Bへの電気の通り道は遮られていません！',
        explanation: '電球Bへの回路は独立して維持されているため、電球Aを外しても電球Bは全く影響を受けずに同じ明るさで点灯し続けます！',
        examTip: '【実社会での応用】家庭内の電化製品や照明がすべて並列で配線されているのは、テレビを消しても冷蔵庫や明かりが消えないようにするためです！'
      },
      {
        id: 'g5_l2_p3',
        title: '電球並列時の乾電池から出る電流',
        subtitle: '電池の負担を計算しよう！',
        question: '乾電池1個に豆電球3個を並列につないだとき、乾電池から流れ出す全体の電流は電球1個の時の何倍？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 150, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 300, y: 60 },
          { id: 'B', label: '電球B', x: 300, y: 150 },
          { id: 'C', label: '電球C', x: 300, y: 240 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1, B: 1, C: 1 } }),
        options: [
          { id: 'o1', text: '3倍（各電球に1ずつ流れるので、合計 1+1+1=3）', correct: true },
          { id: 'o2', text: '1倍（同じ）', correct: false },
          { id: 'o3', text: '1/3倍', correct: false }
        ],
        hint: '3つの枝に電流が1ずつ分かれて流れます。大元の川にはいくつの電流が流れているでしょう？',
        explanation: '3本の枝にそれぞれ1の電流が流れるため、合流地点である乾電池には「1 + 1 + 1 = 3」の電流が流れます！電池は3倍の速さで消耗します。',
        examTip: '【キルヒホッフの第一法則】合流・分岐する点では「流れ込む電流の合計 ＝ 流れ出る電流の合計」になります！中学入試の超基本です。'
      }
    ],
    3: [
      {
        id: 'g5_l3_p1',
        title: '豆電球の明るさランキング',
        subtitle: '直列と並列を比較せよ！',
        question: '回路ア（電球1個）、回路イ（電球2個直列）、回路ウ（電球2個並列）の電球の明るさを比べたとき、正しい順番はどれ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 220, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1 } }),
        options: [
          { id: 'o1', text: 'ア と ウ は同じ明るさ（1）で、イ が一番暗い（1/2）', correct: true },
          { id: 'o2', text: 'イ が一番明るく、次に ウ、最後に ア', correct: false },
          { id: 'o3', text: 'ウ が一番明るく、ア と イ は同じ', correct: false }
        ],
        hint: 'ア=1, イ=1/2, ウ=1 です！',
        explanation: 'ア（電球1個）＝明るさ1、イ（直列2個）＝明るさ1/2、ウ（並列2個）＝明るさ1！よって「アとウが同じ明るさで、イが一番暗い」が正解です！',
        examTip: '【入試の超頻出比較表】電球の明るさ：1個(1) ＝ 並列(1) ＞ 直列(1/2)！電池の持ち：直列(2) ＞ 1個(1) ＞ 並列(1/2)！'
      },
      {
        id: 'g5_l3_p2',
        title: '電池2個＋電球2個の直列',
        subtitle: '両方直列にしたら？',
        question: '乾電池2個直列に、豆電球2個直列をつなぎました。電球の明るさは乾電池1個・電球1個の基本回路と比べてどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個直列', x: 250, y: 220, count: 2, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 180, y: 70 },
          { id: 'B', label: '電球B', x: 320, y: 70 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1, B: 1 } }),
        options: [
          { id: 'o1', text: '基本回路と同じ明るさ（1倍）', correct: true },
          { id: 'o2', text: '2倍明るくなる', correct: false },
          { id: 'o3', text: '半分の明るさになる', correct: false }
        ],
        hint: '電圧が2倍、抵抗も2倍です。2 ÷ 2 ＝ ？',
        explanation: '乾電池が2個直列で電圧が2倍になりますが、豆電球も2個直列で抵抗が2倍になるため、流れる電流は「2 ÷ 2 = 1」となり、基本回路（電池1個・電球1個）と全く同じ明るさになります！',
        examTip: '【入試の重要法則】電流 ＝（乾電池の直列個数）÷（豆電球の直列個数）です！'
      },
      {
        id: 'g5_l3_p3',
        title: '電池2個直列＋電球2個並列（最強モード）',
        subtitle: 'もっとも明るい組み合わせ！',
        question: '乾電池2個直列に、豆電球2個を並列につなぐと、電球それぞれの明るさは？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個直列', x: 100, y: 150, count: 2, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 300, y: 80 },
          { id: 'B', label: '電球B', x: 300, y: 220 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 2, B: 2 } }),
        options: [
          { id: 'o1', text: 'どちらの電球も明るさ2', correct: true },
          { id: 'o2', text: 'どちらの電球も明るさ1', correct: false },
          { id: 'o3', text: 'どちらの電球も明るさ4', correct: false }
        ],
        hint: '並列の電球それぞれに乾電池2個分の電圧（2V）が丸ごとかかります！',
        explanation: '並列の枝それぞれに電圧2Vがかかるため、電球Aも電球Bも「明るさ 2」で激しく光ります！乾電池からは合計2+2=4の電流が出るため、電池の消耗は極めて激しくなります。',
        examTip: '【エネルギー保存の法則】全体の明るさ（2+2=4）と乾電池から出るエネルギー（4）は完全に一致します！'
      }
    ],
    4: [
      {
        id: 'g5_l4_p1',
        title: '階段の3路スイッチパズル',
        subtitle: '1階と2階のどちらからでもON/OFF！',
        question: '1階スイッチSW1と2階スイッチSW2を操作して、階段の照明（電球A）を点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 240, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '階段の電球A', x: 250, y: 70 }],
        switches: [
          { id: 'SW1', label: '1階SW (上/下)', x: 160, y: 150, defaultOn: false },
          { id: 'SW2', label: '2階SW (上/下)', x: 340, y: 150, defaultOn: true }
        ],
        wireSegments: [
          { x1: 120, y1: 240, x2: 80, y2: 240 },
          { x1: 80, y1: 240, x2: 80, y2: 150 },
          { x1: 80, y1: 150, x2: 160, y2: 150 },
          { x1: 160, y1: 150, x2: 340, y2: 120 },
          { x1: 160, y1: 150, x2: 340, y2: 180 },
          { x1: 340, y1: 150, x2: 420, y2: 150 },
          { x1: 420, y1: 150, x2: 420, y2: 70 },
          { x1: 420, y1: 70, x2: 250, y2: 70 },
          { x1: 250, y1: 70, x2: 80, y2: 70 },
          { x1: 80, y1: 70, x2: 80, y2: 240 },
          { x1: 420, y1: 240, x2: 120, y2: 240 }
        ],
        calculateState: (sw) => {
          // Both switch to same track (both true or both false) -> ON
          const on = sw['SW1'] === sw['SW2'];
          return { bulbBrightness: { A: on ? 1 : 0 } };
        },
        targetCondition: { requiredOn: ['A'], requiredOff: [], description: '階段の電球Aを点灯させる' },
        hint: '1階と2階のスイッチが「同じ線（上または下）」を選ぶと電気がつながります！SW1をON（SW2と同じ）にしましょう！',
        explanation: 'お見事！1階と2階のスイッチが同じ連絡線を選んだことで回路がつながり点灯しました！どちらか一方をカチッと切り替えるだけで消灯・点灯を反転できます。',
        examTip: '【3路スイッチの仕組み】2本の連絡線があり、両方のスイッチが同じ線を選択しているときだけ点灯します。中学入試の記述問題でも頻出です！'
      },
      {
        id: 'g5_l4_p2',
        title: '3路スイッチで消灯する',
        subtitle: '2階に上がって電気を消そう！',
        question: '2階スイッチSW2を切り替えて、階段の照明（電球A）を【消灯】させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 240, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '階段の電球A', x: 250, y: 70 }],
        switches: [
          { id: 'SW1', label: '1階SW', x: 160, y: 150, defaultOn: true },
          { id: 'SW2', label: '2階SW', x: 340, y: 150, defaultOn: true }
        ],
        wireSegments: [
          { x1: 120, y1: 240, x2: 80, y2: 240 },
          { x1: 80, y1: 240, x2: 80, y2: 150 },
          { x1: 80, y1: 150, x2: 160, y2: 150 },
          { x1: 160, y1: 150, x2: 340, y2: 120 },
          { x1: 160, y1: 150, x2: 340, y2: 180 },
          { x1: 340, y1: 150, x2: 420, y2: 150 },
          { x1: 420, y1: 150, x2: 420, y2: 70 },
          { x1: 420, y1: 70, x2: 250, y2: 70 },
          { x1: 250, y1: 70, x2: 80, y2: 70 },
          { x1: 80, y1: 70, x2: 80, y2: 240 },
          { x1: 420, y1: 240, x2: 120, y2: 240 }
        ],
        calculateState: (sw) => {
          const on = sw['SW1'] === sw['SW2'];
          return { bulbBrightness: { A: on ? 1 : 0 } };
        },
        targetCondition: { requiredOn: [], requiredOff: ['A'], description: '電球Aを消灯させる' },
        hint: 'SW2をクリックしてOFF（別の線）に切り替えましょう。',
        explanation: '2階のスイッチを切り替えたことで連絡線がずれ、回路が開いて消灯しました！',
        examTip: '【論理回路との結びつき】3路スイッチの論理は、プログラミングや情報科学で学ぶ「XNOR（同値ゲート）」そのものです！'
      },
      {
        id: 'g5_l4_p3',
        title: '3路スイッチの再点灯',
        subtitle: '1階に戻って再び電気をつける！',
        question: '1階スイッチSW1を切り替えて、再び電球Aを点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 240, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '階段の電球A', x: 250, y: 70 }],
        switches: [
          { id: 'SW1', label: '1階SW', x: 160, y: 150, defaultOn: true },
          { id: 'SW2', label: '2階SW', x: 340, y: 150, defaultOn: false }
        ],
        wireSegments: [
          { x1: 120, y1: 240, x2: 80, y2: 240 },
          { x1: 80, y1: 240, x2: 80, y2: 150 },
          { x1: 80, y1: 150, x2: 160, y2: 150 },
          { x1: 160, y1: 150, x2: 340, y2: 120 },
          { x1: 160, y1: 150, x2: 340, y2: 180 },
          { x1: 340, y1: 150, x2: 420, y2: 150 },
          { x1: 420, y1: 150, x2: 420, y2: 70 },
          { x1: 420, y1: 70, x2: 250, y2: 70 },
          { x1: 250, y1: 70, x2: 80, y2: 70 },
          { x1: 80, y1: 70, x2: 80, y2: 240 },
          { x1: 420, y1: 240, x2: 120, y2: 240 }
        ],
        calculateState: (sw) => {
          const on = sw['SW1'] === sw['SW2'];
          return { bulbBrightness: { A: on ? 1 : 0 } };
        },
        targetCondition: { requiredOn: ['A'], requiredOff: [], description: '電球Aを点灯させる' },
        hint: 'SW1をクリックしてSW2と同じOFF側に合わせましょう！',
        explanation: '下りてきた人が1階でスイッチを押すと、再び電気がつきました！実生活で毎日使われている素晴らしい知恵です。',
        examTip: '【身近な電気工学】階段や廊下の両端にあるスイッチは、すべてこの3路スイッチで配線されています。'
      }
    ],
    5: [
      {
        id: 'g5_l5_p1',
        title: '直列と並列の切り替えスイッチ',
        subtitle: '電球のつなぎ方を一瞬で変える！',
        question: 'スイッチSW1を操作して、電球AとBを【並列つなぎ（どちらも明るさ1）】にしてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 250, y: 70 },
          { id: 'B', label: '電球B', x: 250, y: 150 }
        ],
        switches: [{ id: 'SW1', label: '並列接続スイッチ', x: 380, y: 150, defaultOn: false }],
        wireSegments: [
          { x1: 100, y1: 220, x2: 80, y2: 220 },
          { x1: 80, y1: 220, x2: 80, y2: 70 },
          { x1: 80, y1: 70, x2: 250, y2: 70 },
          { x1: 250, y1: 70, x2: 420, y2: 70 },
          { x1: 420, y1: 70, x2: 420, y2: 220 },
          { x1: 420, y1: 220, x2: 100, y2: 220 }
        ],
        calculateState: (sw) => {
          const isParallel = Boolean(sw['SW1']);
          return {
            bulbBrightness: {
              A: isParallel ? 1 : 0.5,
              B: isParallel ? 1 : 0.5
            }
          };
        },
        targetCondition: { requiredOn: ['A', 'B'], requiredOff: [], description: '電球AとBをどちらも明るさ1（並列）にする' },
        hint: 'SW1をONにすると並列回路が完成し、明るさが1/2から1へと一気にパワーアップします！',
        explanation: 'SW1を入れることで電球Bに乾電池の電圧がダイレクトにかかり、直列（明るさ1/2）から並列（明るさ1）へと劇的に明るくなりました！',
        examTip: '【入試頻出の回路変化】スイッチを入れることで直列回路が並列回路に化ける問題は、難関中学の理科で大人気です！'
      },
      {
        id: 'g5_l5_p2',
        title: '直列モード（省エネ）への切り替え',
        subtitle: '明るさ1/2で長持ちさせよう！',
        question: 'スイッチSW1をOFFにして、電球AとBを【直列つなぎ（明るさ1/2）】に戻してください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 250, y: 70 },
          { id: 'B', label: '電球B', x: 250, y: 150 }
        ],
        switches: [{ id: 'SW1', label: '並列接続スイッチ', x: 380, y: 150, defaultOn: true }],
        wireSegments: [
          { x1: 100, y1: 220, x2: 80, y2: 220 },
          { x1: 80, y1: 220, x2: 80, y2: 70 },
          { x1: 80, y1: 70, x2: 250, y2: 70 },
          { x1: 250, y1: 70, x2: 420, y2: 70 },
          { x1: 420, y1: 70, x2: 420, y2: 220 },
          { x1: 420, y1: 220, x2: 100, y2: 220 }
        ],
        calculateState: (sw) => {
          const isParallel = Boolean(sw['SW1']);
          return {
            bulbBrightness: {
              A: isParallel ? 1 : 0.5,
              B: isParallel ? 1 : 0.5
            }
          };
        },
        targetCondition: { requiredOn: ['A', 'B'], requiredOff: [], description: '電球AとBを直列つなぎにする' },
        hint: 'SW1をOFFにしてください。',
        explanation: '直列つなぎになり、うす暗い光になりましたが、消費電流が1/4（並列時の2に対して直列は0.5）になり乾電池が4倍長持ちします！',
        examTip: '【消費電力の比較】並列時の消費電流は2、直列時の消費電流は0.5。なんと直列の方が電池が4倍も長持ちします！'
      },
      {
        id: 'g5_l5_p3',
        title: '点灯パターンの切り替え',
        subtitle: '1個点灯・直列2個点灯',
        question: 'スイッチSW1とSW2を操作して、【電球Aだけを明るさ1】で点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 70 },
          { id: 'B', label: '電球B', x: 340, y: 70 }
        ],
        switches: [
          { id: 'SW1', label: '主スイッチ', x: 150, y: 220, defaultOn: true },
          { id: 'SW2', label: '電球BバイパスSW', x: 340, y: 150, defaultOn: false }
        ],
        wireSegments: [
          { x1: 100, y1: 220, x2: 80, y2: 220 },
          { x1: 80, y1: 220, x2: 80, y2: 70 },
          { x1: 80, y1: 70, x2: 220, y2: 70 },
          { x1: 220, y1: 70, x2: 340, y2: 70 },
          { x1: 340, y1: 70, x2: 440, y2: 70 },
          { x1: 440, y1: 70, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 100, y2: 220 }
        ],
        calculateState: (sw) => {
          if (!sw['SW1']) return { bulbBrightness: { A: 0, B: 0 } };
          const bypassB = Boolean(sw['SW2']);
          return {
            bulbBrightness: {
              A: bypassB ? 1 : 0.5,
              B: bypassB ? 0 : 0.5
            }
          };
        },
        targetCondition: { requiredOn: ['A'], requiredOff: ['B'], description: '電球Aのみ明るさ1で点灯（Bは消灯）' },
        hint: 'SW2をONにすると、電球Bがバイパス（ショート）されて電球Aだけに全力で電流が流れます！',
        explanation: 'SW2を閉じることで電球Bの両端が直結されて消灯し、電球Aに乾電池の全電圧がかかって明るさ1で点灯しました！',
        examTip: '【ショートの応用】意図的に電球をショートさせるバイパススイッチは、電球を壊さずに消灯させる高度なテクニックです。'
      }
    ],
    6: [
      {
        id: 'g5_l6_p1',
        title: '小5総合：乾電池2個×豆電球2個の回路迷宮',
        subtitle: '【すべての電球を明るさ2】にせよ！',
        question: 'スイッチSW1とSW2を操作して、電球AとBを【どちらも明るさ2（最大発光）】で点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 2個直列', x: 100, y: 220, count: 2, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 250, y: 70 },
          { id: 'B', label: '電球B', x: 250, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1（電球A）', x: 380, y: 70, defaultOn: false },
          { id: 'SW2', label: 'SW2（電球B）', x: 380, y: 150, defaultOn: false }
        ],
        wireSegments: [
          { x1: 100, y1: 220, x2: 60, y2: 220 },
          { x1: 60, y1: 220, x2: 60, y2: 70 },
          { x1: 60, y1: 70, x2: 250, y2: 70 },
          { x1: 60, y1: 150, x2: 250, y2: 150 },
          { x1: 250, y1: 70, x2: 380, y2: 70 },
          { x1: 250, y1: 150, x2: 380, y2: 150 },
          { x1: 380, y1: 70, x2: 440, y2: 70 },
          { x1: 380, y1: 150, x2: 440, y2: 150 },
          { x1: 440, y1: 70, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 100, y2: 220 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 2 : 0,
            B: sw['SW2'] ? 2 : 0
          }
        }),
        targetCondition: { requiredOn: ['A', 'B'], requiredOff: [], description: '電球AとBの両方を明るさ2で点灯' },
        hint: '乾電池2個直列のパワーを、電球AとBの両方に並列で流すため、SW1とSW2をどちらもONにしましょう！',
        explanation: 'すばらしい！乾電池2個直列（電圧2V）に電球2個並列をつなぎ、両方の電球を明るさ2で煌々と輝かせました！',
        examTip: '【5年マスター認定】豆電球の直列（暗くなる）と並列（同じ明るさ）の法則を完全にマスターしました！6年生では中学入試本番の混列回路に挑みます！'
      },
      {
        id: 'g5_l6_p2',
        title: '小5総合：電球Aのみ最大発光',
        subtitle: '1つの電球にエネルギーを集中！',
        question: 'スイッチを操作して、【電球Aだけを明るさ2】で点灯させ、電球Bは消灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 2個直列', x: 100, y: 220, count: 2, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 250, y: 70 },
          { id: 'B', label: '電球B', x: 250, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1', x: 380, y: 70, defaultOn: false },
          { id: 'SW2', label: 'SW2', x: 380, y: 150, defaultOn: true }
        ],
        wireSegments: [
          { x1: 100, y1: 220, x2: 60, y2: 220 },
          { x1: 60, y1: 220, x2: 60, y2: 70 },
          { x1: 60, y1: 70, x2: 250, y2: 70 },
          { x1: 60, y1: 150, x2: 250, y2: 150 },
          { x1: 250, y1: 70, x2: 380, y2: 70 },
          { x1: 250, y1: 150, x2: 380, y2: 150 },
          { x1: 380, y1: 70, x2: 440, y2: 70 },
          { x1: 380, y1: 150, x2: 440, y2: 150 },
          { x1: 440, y1: 70, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 100, y2: 220 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 2 : 0,
            B: sw['SW2'] ? 2 : 0
          }
        }),
        targetCondition: { requiredOn: ['A'], requiredOff: ['B'], description: '電球Aのみ点灯（Bは消灯）' },
        hint: 'SW1をONにし、SW2をOFFにしてください。',
        explanation: '電球Aのみに電圧2Vがかかり、単独で2倍の明るさで輝きました！',
        examTip: '【完璧な制御力】独立した並列スイッチの操作を完璧にマスターしました！'
      },
      {
        id: 'g5_l6_p3',
        title: '小5総合：電球Bのみ最大発光',
        subtitle: '反対側の電球を光らせろ！',
        question: 'スイッチを操作して、【電球Bだけを明るさ2】で点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 2個直列', x: 100, y: 220, count: 2, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 250, y: 70 },
          { id: 'B', label: '電球B', x: 250, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1', x: 380, y: 70, defaultOn: true },
          { id: 'SW2', label: 'SW2', x: 380, y: 150, defaultOn: false }
        ],
        wireSegments: [
          { x1: 100, y1: 220, x2: 60, y2: 220 },
          { x1: 60, y1: 220, x2: 60, y2: 70 },
          { x1: 60, y1: 70, x2: 250, y2: 70 },
          { x1: 60, y1: 150, x2: 250, y2: 150 },
          { x1: 250, y1: 70, x2: 380, y2: 70 },
          { x1: 250, y1: 150, x2: 380, y2: 150 },
          { x1: 380, y1: 70, x2: 440, y2: 70 },
          { x1: 380, y1: 150, x2: 440, y2: 150 },
          { x1: 440, y1: 70, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 100, y2: 220 }
        ],
        calculateState: (sw) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 2 : 0,
            B: sw['SW2'] ? 2 : 0
          }
        }),
        targetCondition: { requiredOn: ['B'], requiredOff: ['A'], description: '電球Bのみ点灯（Aは消灯）' },
        hint: 'SW1をOFF、SW2をONにしましょう。',
        explanation: '電球Bのみが強く輝きました！5年生の電磁気・電気回路ステージを見事に全制覇です！',
        examTip: '【合格】いよいよ最高峰、6年生の中学入試混列回路＆ショート回路ステージへ進みましょう！'
      }
    ]
  },

  // 🎒 Grade 6: 中学入試難関！合成混列回路・電流比・ショート回路
  6: {
    1: [
      {
        id: 'g6_l1_p1',
        title: '基本混列回路の電流比',
        subtitle: '直列電球A ＋ 並列電球B,C',
        question: '乾電池1個に、電球Aが直列につながり、その先に電球Bと電球Cが並列につながっています。電球Aと電球Bの明るさはそれぞれいくつ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個 (V=1)', x: 100, y: 180, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A（直列部）', x: 220, y: 180 },
          { id: 'B', label: '電球B（並列上）', x: 360, y: 110 },
          { id: 'C', label: '電球C（並列下）', x: 360, y: 250 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.67, B: 0.33, C: 0.33 } }),
        options: [
          { id: 'o1', text: '電球A は「2/3」、電球B・C はそれぞれ「1/3」', correct: true },
          { id: 'o2', text: '電球A は「1」、電球B・C はそれぞれ「1/2」', correct: false },
          { id: 'o3', text: '3つの電球すべて「1/3」', correct: false },
          { id: 'o4', text: '電球A は「1/2」、電球B・C はそれぞれ「1/4」', correct: false }
        ],
        hint: '回路全体の合成抵抗は、電球Aの抵抗1 ＋ 並列部分(BとC)の抵抗1/2 ＝ 1.5（3/2）です！電流は 1 ÷ 1.5 ＝ ？',
        explanation: '回路全体の合成抵抗は「1 + 1/2 = 1.5（3/2）」です。乾電池1個なので、全体に流れる電流は「1 ÷ 1.5 = 2/3」！これがそのまま電球Aに流れます。並列のBとCには、2/3が半分ずつ分かれて「各 1/3」流れます！',
        examTip: '【開成・麻布・桜蔭の超定番】直列1個＋並列2個の電流比は「主幹＝2/3、枝＝1/3」！この「2/3と1/3」の比率は中学入試で最も出題される黄金比です！'
      },
      {
        id: 'g6_l1_p2',
        title: '混列回路で電球Cを外すと？',
        subtitle: '並列の片方が消えたら電球Aはどうなる？',
        question: '電球Aの直列に（電球BとCの並列）がつながった回路で、電球Cを外すと、電球Aの明るさはどう変わる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 180, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 180 },
          { id: 'B', label: '電球B', x: 360, y: 110 },
          { id: 'C', label: '電球C（外す）', x: 360, y: 250 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.5, B: 0.5, C: 0 } }),
        options: [
          { id: 'o1', text: '明るさ 2/3 から 1/2 に暗くなる', correct: true },
          { id: 'o2', text: '明るさ 2/3 から 1 に明るくなる', correct: false },
          { id: 'o3', text: '明るさは 2/3 のまま変わらない', correct: false }
        ],
        hint: '電球Cを外すと、電球Aと電球Bの「ただの直列つなぎ（2個直列）」になります！',
        explanation: '電球Cを外すと全体の回路は「電球AとBの2個直列」になります。全体の抵抗が1.5から2に増えるため、電球Aに流れる電流は「2/3（約0.67）」から「1/2（0.5）」へと暗くなります！',
        examTip: '【直感の罠に注意！】「電球を外したから余った電気が流れて明るくなるのでは？」と思いがちですが、抵抗が増えて全体の電流が減るため暗くなります！難関校の大好物トラップです。'
      },
      {
        id: 'g6_l1_p3',
        title: '電球Aと（電球B＋C直列）の並列',
        subtitle: '別の混列パターンの電流比',
        question: '電球Aと「電球B・Cの直列」が並列につながっています。電球Aと電球Bの明るさは？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 180, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A（単独枝）', x: 300, y: 100 },
          { id: 'B', label: '電球B（直列枝1）', x: 250, y: 240 },
          { id: 'C', label: '電球C（直列枝2）', x: 350, y: 240 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1, B: 0.5, C: 0.5 } }),
        options: [
          { id: 'o1', text: '電球A は「1」、電球B・C はそれぞれ「1/2」', correct: true },
          { id: 'o2', text: '電球A は「2/3」、電球B・C はそれぞれ「1/3」', correct: false },
          { id: 'o3', text: '3つの電球すべて「1」', correct: false }
        ],
        hint: '並列の上の枝（A単独）には電圧1が丸ごとかかります！下の枝（BとC直列）には電圧1を2個で分け合います。',
        explanation: '並列の上の枝にある電球Aには丸々電圧1がかかるので「明るさ 1」！下の枝は電球2個直列なので電圧を分け合って「各 1/2」になります！',
        examTip: '【枝ごとの独立計算】並列回路は、それぞれの枝を別々の独立した回路として計算するとミスがなくなります！'
      }
    ],
    2: [
      {
        id: 'g6_l2_p1',
        title: 'ショート回路（短絡）の見破り',
        subtitle: 'スイッチを入れると消える電球はどれ？',
        question: '電球AとBの直列回路で、電球Bの両端をつなぐバイパススイッチSW1を入れるとどうなる？',
        puzzleType: 'short_detect',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 230, y: 90 },
          { id: 'B', label: '電球B（バイパスあり）', x: 350, y: 90 }
        ],
        switches: [{ id: 'SW1', label: 'SW1（B短絡スイッチ）', x: 350, y: 160, defaultOn: false }],
        wireSegments: [
          { x1: 120, y1: 220, x2: 80, y2: 220 },
          { x1: 80, y1: 220, x2: 80, y2: 90 },
          { x1: 80, y1: 90, x2: 230, y2: 90 },
          { x1: 230, y1: 90, x2: 350, y2: 90 },
          { x1: 350, y1: 90, x2: 440, y2: 90 },
          { x1: 440, y1: 90, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 120, y2: 220 },
          { x1: 290, y1: 90, x2: 290, y2: 160 },
          { x1: 290, y1: 160, x2: 350, y2: 160 },
          { x1: 350, y1: 160, x2: 410, y2: 160 },
          { x1: 410, y1: 160, x2: 410, y2: 90 }
        ],
        calculateState: (sw) => {
          const shortB = Boolean(sw['SW1']);
          return {
            bulbBrightness: {
              A: shortB ? 1 : 0.5,
              B: shortB ? 0 : 0.5
            },
            shortedBulbs: shortB ? ['B'] : []
          };
        },
        options: [
          { id: 'o1', text: '電球Bがショートして消灯し、電球Aが明るくなる', correct: true },
          { id: 'o2', text: '電球AとBの両方が消灯する', correct: false },
          { id: 'o3', text: '電球Bが2倍明るくなる', correct: false }
        ],
        hint: '電流は抵抗のある電球Bを通らず、抵抗ゼロの導線（SW1）だけを一気に通り抜けます！',
        explanation: 'スイッチSW1を入れると、電流はすべて抵抗のない導線側を通過するため、電球Bには電流が一切流れず消灯します（ショート）。回路全体は電球Aのみ（抵抗1）となるため、電球Aの明るさは1/2から1へアップします！',
        examTip: '【中学入試最頻出】「抵抗のない道（近道）があれば、電流はすべてそちらを通る」！これがショート回路の鉄則です。'
      },
      {
        id: 'g6_l2_p2',
        title: '乾電池直結ショートの危険判定',
        subtitle: '絶対にやってはいけない回路を見抜け！',
        question: 'スイッチを入れたとき、【乾電池が直接ショートして危険な事故になる回路】はどれ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 220, count: 1, connection: 'series' }],
        bulbs: [{ id: 'A', label: '電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0 }, isShortCircuit: true }),
        options: [
          { id: 'o1', text: '電球を通さない導線が、乾電池の＋極とー極を直結している回路', correct: true },
          { id: 'o2', text: '電球2個を並列につないだ回路', correct: false },
          { id: 'o3', text: '電球2個を直列につないだ回路', correct: false }
        ],
        hint: '回路の中に1つも電球（抵抗）がない導線ループがある回路です。',
        explanation: '乾電池の＋極とー極が抵抗を通さず導線だけでつながると、無限大に近い大電流が一瞬で流れ、導線や電池が過熱・破裂する恐れがあり大変危険です！',
        examTip: '【入試の出題形式】複雑なスイッチ回路で「どのスイッチを入れると乾電池がショートするか？」を答えさせる問題が名門校で頻出します！'
      },
      {
        id: 'g6_l2_p3',
        title: '3つの電球とショート回路',
        subtitle: 'どの電球が消えるか追跡せよ！',
        question: '電球A, B, Cが直列に並んでいます。電球BとCをまたぐように導線をつなぐとどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 200, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 200, y: 80 },
          { id: 'B', label: '電球B', x: 300, y: 80 },
          { id: 'C', label: '電球C', x: 400, y: 80 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1, B: 0, C: 0 }, shortedBulbs: ['B', 'C'] }),
        options: [
          { id: 'o1', text: '電球BとCが消灯し、電球Aだけが明るさ1で光る', correct: true },
          { id: 'o2', text: 'すべての電球が消灯する', correct: false },
          { id: 'o3', text: '電球AとBが消灯し、Cだけ光る', correct: false }
        ],
        hint: '電流は電球Aを通った後、電球BとCを避けてバイパス導線を通って戻ります！',
        explanation: '電球Aを通過した電流は、電球BとCを通らずにバイパス導線を通って乾電池のマイナス極に戻るため、電球BとCは消灯し、電球Aだけが明るさ1で点灯します！',
        examTip: '【電位追跡法】導線でつながっている部分はすべて同じ電位です。両端が同じ電位になった電球はすべてショートして消えます！'
      }
    ],
    3: [
      {
        id: 'g6_l3_p1',
        title: '豆電球3個混列の精密明るさ比',
        subtitle: '筑駒・開成レベルの完全計算！',
        question: '乾電池1個に、電球Aが直列、その先に（電球Bと電球Cの並列）がつながっています。電球Aの明るさを「1」と基準にしたとき、電球Bの明るさはいくつ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 180, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 180 },
          { id: 'B', label: '電球B', x: 360, y: 110 },
          { id: 'C', label: '電球C', x: 360, y: 250 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.67, B: 0.33, C: 0.33 } }),
        options: [
          { id: 'o1', text: '電球Aの「半分（1/2倍）」の明るさ', correct: true },
          { id: 'o2', text: '電球Aと「同じ（1倍）」の明るさ', correct: false },
          { id: 'o3', text: '電球Aの「1/4倍」の明るさ', correct: false }
        ],
        hint: '電球Aの電流は2/3、電球Bの電流は1/3です。1/3 ÷ 2/3 ＝ ？',
        explanation: '電球Aには全体の電流（2/3）が流れ、並列の電球Bにはその半分の電流（1/3）が流れます。したがって電球Bの明るさは、電球Aのちょうど「半分（1/2）」になります！',
        examTip: '【比率問題の攻略】分数の絶対値だけでなく「AとBの比は 2 : 1」という比の感覚を持つと、入試問題を驚くほど素早く解けます！'
      },
      {
        id: 'g6_l3_p2',
        title: '4個の電球混列回路',
        subtitle: '2個並列 ＋ 2個並列！',
        question: '（電球AとBの並列）と（電球CとDの並列）が直列につながっています。電球A, B, C, Dの明るさは？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 180, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 110 },
          { id: 'B', label: '電球B', x: 220, y: 250 },
          { id: 'C', label: '電球C', x: 360, y: 110 },
          { id: 'D', label: '電球D', x: 360, y: 250 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.5, B: 0.5, C: 0.5, D: 0.5 } }),
        options: [
          { id: 'o1', text: '4つの電球すべて「明るさ 1/2」', correct: true },
          { id: 'o2', text: '4つの電球すべて「明るさ 1/4」', correct: false },
          { id: 'o3', text: '4つの電球すべて「明るさ 1」', correct: false }
        ],
        hint: '合成抵抗は 1/2 ＋ 1/2 ＝ 1 です！乾電池から出る電流は 1 ÷ 1 ＝ 1 です。',
        explanation: '回路全体の合成抵抗は「1/2 + 1/2 = 1」なので、全体に流れる電流は「1 ÷ 1 = 1」！この電流1が最初の並列（AとB）で0.5ずつに分かれ、次の並列（CとD）でも0.5ずつに分かれるため、4つすべて「明るさ 1/2」になります！',
        examTip: '【対称性の利用】回路が左右対称なら、流れる電流も完全に対称になります！計算を省略する強力な武器です。'
      },
      {
        id: 'g6_l3_p3',
        title: '非対称混列回路の難問',
        subtitle: '電球1個と電球2個直列の並列',
        question: '乾電池1個に、上の枝は「電球A（1個）」、下の枝は「電球BとCの直列（2個）」がつながっています。乾電池から出る全体の電流は？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 180, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 300, y: 100 },
          { id: 'B', label: '電球B', x: 250, y: 250 },
          { id: 'C', label: '電球C', x: 350, y: 250 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1, B: 0.5, C: 0.5 } }),
        options: [
          { id: 'o1', text: '全体の電流は「1.5（3/2）」', correct: true },
          { id: 'o2', text: '全体の電流は「1」', correct: false },
          { id: 'o3', text: '全体の電流は「2」', correct: false }
        ],
        hint: '上の枝の電流は 1、下の枝の電流は 1/2 です。足し算してみましょう！',
        explanation: '上の枝には電流1が流れ、下の枝（電球2個直列）には電流1/2（0.5）が流れます。合流した乾電池には「1 + 0.5 = 1.5（3/2）」の電流が流れます！',
        examTip: '【並列の合成電流】並列回路の主幹電流は、各枝の電流をそれぞれ計算して足し算するだけ！一番シンプルで確実な解法です。'
      }
    ],
    4: [
      {
        id: 'g6_l4_p1',
        title: '乾電池2個直列 ＋ 3電球混列',
        subtitle: '高電圧と混列の融合！',
        question: '乾電池2個直列（電圧2）に、電球Aの直列＋（電球BとCの並列）をつなぎました。電球Aの明るさはいくつ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個直列 (V=2)', x: 100, y: 180, count: 2, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 180 },
          { id: 'B', label: '電球B', x: 360, y: 110 },
          { id: 'C', label: '電球C', x: 360, y: 250 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 1.33, B: 0.67, C: 0.67 } }),
        options: [
          { id: 'o1', text: '電球A は「4/3（約1.33）」', correct: true },
          { id: 'o2', text: '電球A は「2」', correct: false },
          { id: 'o3', text: '電球A は「2/3」', correct: false },
          { id: 'o4', text: '電球A は「1」', correct: false }
        ],
        hint: '全体の抵抗は 1.5（3/2）、電圧は 2 です。電流は 2 ÷ 1.5 ＝ 4/3！',
        explanation: '合成抵抗は「1 + 1/2 = 3/2」、乾電池2個で電圧は「2」！したがって回路全体（電球A）に流れる電流は「2 ÷ (3/2) = 4/3（約1.33）」になります！並列のBとCにはその半分の「2/3」が流れます。',
        examTip: '【分数計算の瞬発力】難関校入試では 4/3 や 2/3 といった仮分数・真分数が頻出します。小数の概算ではなく分数で扱うのが合格への鉄則です！'
      },
      {
        id: 'g6_l4_p2',
        title: '乾電池2個並列 ＋ 3電球混列',
        subtitle: '並列電池の混列回路！',
        question: '乾電池2個並列（電圧1）に、電球A直列＋（電球BとCの並列）をつなぎました。電球Aの明るさと、乾電池1個あたりの電流は？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 2個並列 (V=1)', x: 100, y: 180, count: 2, connection: 'parallel' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 180 },
          { id: 'B', label: '電球B', x: 360, y: 110 },
          { id: 'C', label: '電球C', x: 360, y: 250 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.67, B: 0.33, C: 0.33 } }),
        options: [
          { id: 'o1', text: '電球A は「2/3」、乾電池1個あたりの電流は「1/3」', correct: true },
          { id: 'o2', text: '電球A は「1」、乾電池1個あたりの電流は「1/2」', correct: false },
          { id: 'o3', text: '電球A は「4/3」、乾電池1個あたりの電流は「2/3」', correct: false }
        ],
        hint: '電圧は1Vなので電球Aは2/3です。並列電池2個でこの2/3を半分ずつ分担します！',
        explanation: '並列電池の電圧は1個分と同じなので、回路全体の電流（電球A）は2/3！この2/3の電流を2個の並列乾電池が半分ずつ供給するので、電池1個あたりは「(2/3) ÷ 2 = 1/3」になります！',
        examTip: '【麻布中頻出】回路側の電流計算と、電池側の分担計算の2段階ステップ！焦らず順を追って解きほぐしましょう。'
      },
      {
        id: 'g6_l4_p3',
        title: '逆向き電池を含む混列回路',
        subtitle: 'トラップの最高峰！',
        question: '乾電池3個直列ですが、1個が逆向き（実質電圧 2 - 1 = 1）です。電球A直列＋（電球BとCの並列）の電球Aの明るさは？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 3個 (2個順, 1個逆)', x: 100, y: 180, count: 3, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 180 },
          { id: 'B', label: '電球B', x: 360, y: 110 },
          { id: 'C', label: '電球C', x: 360, y: 250 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.67, B: 0.33, C: 0.33 } }),
        options: [
          { id: 'o1', text: '明るさは「2/3」', correct: true },
          { id: 'o2', text: '明るさは「2」', correct: false },
          { id: 'o3', text: '明るさは「0（消灯）」', correct: false }
        ],
        hint: '乾電池の有効電圧は 2 - 1 ＝ 1 です！',
        explanation: '順方向2個から逆方向1個が引かれて有効電圧は「1」！したがって通常の乾電池1個の時と全く同じになり、電球Aの明るさは「2/3」になります！',
        examTip: '【複合トラップ対策】どんなに複雑に見えても、「電源の電圧」と「回路の合成抵抗」の2つに分解すれば必ず解けます！'
      }
    ],
    5: [
      {
        id: 'g6_l5_p1',
        title: '3連スイッチ複合解析パズル',
        subtitle: 'スイッチSW1, SW2, SW3の連携！',
        question: 'スイッチを操作して、【電球Aだけを点灯】させ、電球BとCは消灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 70 },
          { id: 'B', label: '電球B', x: 340, y: 70 },
          { id: 'C', label: '電球C', x: 280, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1（主電源）', x: 140, y: 220, defaultOn: false },
          { id: 'SW2', label: 'SW2（電球Bバイパス）', x: 340, y: 120, defaultOn: false },
          { id: 'SW3', label: 'SW3（電球C回路）', x: 280, y: 190, defaultOn: true }
        ],
        wireSegments: [
          { x1: 100, y1: 220, x2: 60, y2: 220 },
          { x1: 60, y1: 220, x2: 60, y2: 70 },
          { x1: 60, y1: 70, x2: 220, y2: 70 },
          { x1: 220, y1: 70, x2: 340, y2: 70 },
          { x1: 340, y1: 70, x2: 440, y2: 70 },
          { x1: 440, y1: 70, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 100, y2: 220 }
        ],
        calculateState: (sw) => {
          if (!sw['SW1']) return { bulbBrightness: { A: 0, B: 0, C: 0 } };
          const bypassB = Boolean(sw['SW2']);
          const onC = Boolean(sw['SW3']);
          return {
            bulbBrightness: {
              A: bypassB && !onC ? 1 : (onC ? 0.67 : 0.5),
              B: bypassB ? 0 : 0.5,
              C: onC ? 0.33 : 0
            }
          };
        },
        targetCondition: { requiredOn: ['A'], requiredOff: ['B', 'C'], description: '電球Aのみ点灯（BとCは消灯）' },
        hint: '主電源SW1をON、電球BをショートさせるSW2をON、電球CのSW3をOFFにしましょう！',
        explanation: 'SW1で通電し、SW2で電球Bをバイパスショート、SW3を開いて電球Cを切り離すことで、電球Aのみの単独点灯（明るさ1）を達成しました！',
        examTip: '【回路設計の思考力】「どの道をつなぎ、どの道を遮断・バイパスするか」を逆算する能力は、プログラミング思考とも直結しています！'
      },
      {
        id: 'g6_l5_p2',
        title: '3連スイッチ：AとBの等明度点灯',
        subtitle: '直列つなぎで均等に光らせろ！',
        question: 'スイッチを操作して、【電球AとBだけを同じ明るさ（1/2）】で点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 70 },
          { id: 'B', label: '電球B', x: 340, y: 70 },
          { id: 'C', label: '電球C', x: 280, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1（主電源）', x: 140, y: 220, defaultOn: false },
          { id: 'SW2', label: 'SW2（電球Bバイパス）', x: 340, y: 120, defaultOn: true },
          { id: 'SW3', label: 'SW3（電球C回路）', x: 280, y: 190, defaultOn: true }
        ],
        wireSegments: [
          { x1: 100, y1: 220, x2: 60, y2: 220 },
          { x1: 60, y1: 220, x2: 60, y2: 70 },
          { x1: 60, y1: 70, x2: 220, y2: 70 },
          { x1: 220, y1: 70, x2: 340, y2: 70 },
          { x1: 340, y1: 70, x2: 440, y2: 70 },
          { x1: 440, y1: 70, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 100, y2: 220 }
        ],
        calculateState: (sw) => {
          if (!sw['SW1']) return { bulbBrightness: { A: 0, B: 0, C: 0 } };
          const bypassB = Boolean(sw['SW2']);
          const onC = Boolean(sw['SW3']);
          return {
            bulbBrightness: {
              A: bypassB && !onC ? 1 : (!bypassB && !onC ? 0.5 : 0.67),
              B: bypassB ? 0 : (!onC ? 0.5 : 0.33),
              C: onC ? 0.33 : 0
            }
          };
        },
        targetCondition: { requiredOn: ['A', 'B'], requiredOff: ['C'], description: '電球AとBのみ点灯（Cは消灯）' },
        hint: 'SW1をON、バイパスSW2をOFF、電球CのSW3をOFFにしましょう！',
        explanation: '電球AとBが綺麗な直列回路になり、両方が等しく「明るさ 1/2」で点灯しました！',
        examTip: '【直列の美しさ】直列回路は各部品が全く同じ電流を共有します。'
      },
      {
        id: 'g6_l5_p3',
        title: '3連スイッチ：黄金混列モード',
        subtitle: '全電球点灯の混列回路！',
        question: 'スイッチを操作して、【電球A, B, Cのすべて】を点灯させてください！',
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 220, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 220, y: 70 },
          { id: 'B', label: '電球B', x: 340, y: 70 },
          { id: 'C', label: '電球C', x: 280, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1（主電源）', x: 140, y: 220, defaultOn: false },
          { id: 'SW2', label: 'SW2（電球Bバイパス）', x: 340, y: 120, defaultOn: false },
          { id: 'SW3', label: 'SW3（電球C回路）', x: 280, y: 190, defaultOn: false }
        ],
        wireSegments: [
          { x1: 100, y1: 220, x2: 60, y2: 220 },
          { x1: 60, y1: 220, x2: 60, y2: 70 },
          { x1: 60, y1: 70, x2: 220, y2: 70 },
          { x1: 220, y1: 70, x2: 340, y2: 70 },
          { x1: 340, y1: 70, x2: 440, y2: 70 },
          { x1: 440, y1: 70, x2: 440, y2: 220 },
          { x1: 440, y1: 220, x2: 100, y2: 220 }
        ],
        calculateState: (sw) => {
          if (!sw['SW1']) return { bulbBrightness: { A: 0, B: 0, C: 0 } };
          const bypassB = Boolean(sw['SW2']);
          const onC = Boolean(sw['SW3']);
          return {
            bulbBrightness: {
              A: onC && !bypassB ? 0.67 : (bypassB ? 1 : 0.5),
              B: bypassB ? 0 : (onC ? 0.33 : 0.5),
              C: onC ? 0.33 : 0
            }
          };
        },
        targetCondition: { requiredOn: ['A', 'B', 'C'], requiredOff: [], description: 'すべての電球(A, B, C)を点灯' },
        hint: 'SW1をON、SW2をOFF（バイパス解除）、SW3をON（並列分岐）にしましょう！',
        explanation: '電球A(2/3)、電球B(1/3)、電球C(1/3)の黄金混列回路が見事に成立し、全電球が点灯しました！',
        examTip: '【入試完成】3つのスイッチ状態の組み合わせ（$2^3 = 8$パターン）を瞬時に分析できるようになりました！'
      }
    ],
    6: [
      {
        id: 'g6_l6_p1',
        title: '開成・筑駒レベル：超難関ショート＆混列パズル',
        subtitle: '電球4個の究極マトリクス！',
        question: '電球A, B, C, DとスイッチSW1, SW2があります。SW1をON、SW2をOFFにした時、【もっとも明るく光る電球】はどれ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 80, y: 180, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A（主幹）', x: 180, y: 180 },
          { id: 'B', label: '電球B', x: 290, y: 100 },
          { id: 'C', label: '電球C', x: 290, y: 260 },
          { id: 'D', label: '電球D（末端）', x: 400, y: 180 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.8, B: 0.4, C: 0.4, D: 0.8 } }),
        options: [
          { id: 'o1', text: '電球A と 電球D が最も明るい', correct: true },
          { id: 'o2', text: '電球B が最も明るい', correct: false },
          { id: 'o3', text: '電球C が最も明るい', correct: false },
          { id: 'o4', text: '4つの電球すべて同じ明るさ', correct: false }
        ],
        hint: '回路全体の電流は電球Aを通り、BとCに分流した後、電球Dで再び合流します！',
        explanation: 'すべての電流が電球Aを通り、中央のBとCで2等分されたあと、末端の電球Dで再び全電流が合流して乾電池に戻ります。したがって主幹にある電球Aと電球Dに最大の電流が流れ、最も明るく光ります！',
        examTip: '【最難関校の決め手：流路保存則】川と同じで、本流（AとD）には全水量が流れ、支流（BとC）には半分の水量が流れます。回路の「本流」を見抜くのが極意です！'
      },
      {
        id: 'g6_l6_p2',
        title: '開成・筑駒レベル：SW2投入時の劇変',
        subtitle: '短絡ラインの出現！',
        question: '上の回路でさらにスイッチSW2（中央バイパス）を入れると、電球BとCはどうなる？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 80, y: 180, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 180, y: 180 },
          { id: 'B', label: '電球B', x: 290, y: 100 },
          { id: 'C', label: '電球C', x: 290, y: 260 },
          { id: 'D', label: '電球D', x: 400, y: 180 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.5, B: 0, C: 0, D: 0.5 } }),
        options: [
          { id: 'o1', text: '電球BとCがショートして消灯し、AとDだけの直列になる', correct: true },
          { id: 'o2', text: 'すべての電球が明るくなる', correct: false },
          { id: 'o3', text: '電球AとDが消灯し、BとCだけが点灯する', correct: false }
        ],
        hint: '中央の並列部分をショートさせる導線が開通します！',
        explanation: 'バイパス線によって電球BとCの両端が等電位になり、電流はBとCを完全に避けてバイパス線を流れます。BとCは消灯し、回路は電球AとDの2個直列（明るさ各 1/2）に変わります！',
        examTip: '【灘中・開成中完全制覇】バイパスショートによる回路の「等価回路への書き換え」スキルは、難関中学受験理科の最高到達点です！'
      },
      {
        id: 'g6_l6_p3',
        title: '開成・筑駒レベル：全STEAM回路制覇',
        subtitle: '電気回路グランドマスター認定！',
        question: '電球AとDが直列、その間に抵抗のない導線があるとき、全体の回路の抵抗は乾電池1個に対していくつ？',
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 80, y: 180, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '電球A', x: 180, y: 180 },
          { id: 'D', label: '電球D', x: 400, y: 180 }
        ],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: 0.5, D: 0.5 } }),
        options: [
          { id: 'o1', text: '全体の抵抗は 2（流れる電流は 1/2）', correct: true },
          { id: 'o2', text: '全体の抵抗は 1（流れる電流は 1）', correct: false },
          { id: 'o3', text: '全体の抵抗は 4（流れる電流は 1/4）', correct: false }
        ],
        hint: '電球Aの抵抗1 ＋ 電球Dの抵抗1 ＝ 2 です！',
        explanation: '電球A(1)と電球D(1)の2個直列なので全体の合成抵抗は「2」！乾電池1個なので流れる電流は「1 ÷ 2 = 1/2」となり、両方の電球が明るさ1/2で点灯します！',
        examTip: '【栄光の電気回路マスター】小学校3年から6年、そして中学受験の最難関レベルまで、すべての電気回路の謎を解き明かしました！胸を張って本番の入試に挑んでください！'
      }
    ]
  }
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const CircuitGame: React.FC<CircuitGameProps> = ({
  level,
  grade = 4,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const [problemIndex, setProblemIndex] = useState(0);
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>({});
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Determine puzzles
  const currentGrade = Math.min(Math.max(grade, 3), 6);
  const puzzleList: CircuitPuzzle[] = useMemo(() => {
    return customPuzzles
      ? customPuzzles.map((cp, idx) => ({
          id: cp.id || `custom_${idx}`,
          title: cp.title || '特別回路パズル',
          subtitle: cp.subtitle || '',
          question: cp.question || '',
          puzzleType: cp.puzzleType || 'brightness_quiz',
          batteries: cp.batteries || [{ id: 'b1', label: '乾電池', x: 100, y: 200, count: 1, connection: 'series' }],
          bulbs: cp.bulbs || [{ id: 'A', label: '豆電球A', x: 250, y: 80 }],
          switches: cp.switches || [],
          wireSegments: cp.wireSegments || [],
          calculateState: cp.calculateState || ((_sw: Record<string, boolean>) => {
            // If custom puzzle provides custom calculateState, use it
            // For bridge circuit or fallback:
            if (cp.id === 'ex_c1') {
              return { bulbBrightness: { A: 0.5, B: 0.5, C: 0, D: 0.5, E: 0.5 } };
            }
            if (cp.id === 'ex_c2') {
              return { bulbBrightness: { A: 2, B: 1, C: 1 } };
            }
            if (cp.id === 'ex_c3') {
              const sw1 = _sw['SW1'] ?? false;
              const sw2 = _sw['SW2'] ?? false; // bypass B
              const sw3 = _sw['SW3'] ?? false; // branch C
              if (!sw1) return { bulbBrightness: { A: 0, B: 0, C: 0 } };
              return {
                bulbBrightness: {
                  A: 1,
                  B: sw2 ? 0 : (sw3 ? 0.5 : 1),
                  C: sw3 ? 0.5 : 0
                },
                shortedBulbs: sw2 ? ['B'] : []
              };
            }
            return {
              bulbBrightness: cp.bulbs?.reduce((acc: any, b: any) => {
                acc[b.id] = 1;
                return acc;
              }, {}) || { A: 1 }
            };
          }),
          targetCondition: cp.targetCondition,
          options: cp.options,
          hint: cp.hint || '回路のつながりを確認しよう！',
          explanation: cp.explanation || '正解です！',
          examTip: cp.examTip || '【ツボ】回路の法則をマスターしよう！'
        }))
      : GRADE_CIRCUIT_PUZZLES[currentGrade]?.[level] || GRADE_CIRCUIT_PUZZLES[3][1];
  }, [customPuzzles, currentGrade, level]);

  const currentPuzzle = puzzleList[problemIndex] || puzzleList[0];

  // Initialize switches when puzzle changes
  useEffect(() => {
    const initialSw: Record<string, boolean> = {};
    currentPuzzle.switches?.forEach((sw) => {
      initialSw[sw.id] = sw.defaultOn ?? false;
    });
    setSwitchStates(initialSw);
    setSelectedOptionId(null);
    setIsCompleted(false);
    setFeedbackError(null);
  }, [problemIndex, level, currentGrade, currentPuzzle.id]);

  // Compute live circuit state
  const circuitState = currentPuzzle.calculateState(switchStates);
  const { bulbBrightness, isShortCircuit, shortedBulbs } = circuitState;

  // Toggle switch
  const handleToggleSwitch = (switchId: string) => {
    sound.playClick();
    setSwitchStates((prev) => ({
      ...prev,
      [switchId]: !prev[switchId]
    }));
    setFeedbackError(null);
  };

  // Check target condition for switch_target puzzles
  const handleCheckTarget = () => {
    if (!currentPuzzle.targetCondition) return;
    const { requiredOn, requiredOff } = currentPuzzle.targetCondition;

    const allOnMet = requiredOn.every((id) => (bulbBrightness[id] || 0) > 0);
    const allOffMet = requiredOff.every((id) => (bulbBrightness[id] || 0) === 0);

    if (allOnMet && allOffMet && !isShortCircuit) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedbackError('惜しい！目標の点灯・消灯状態と一致していません。スイッチの組み合わせを見直してみよう！');
    }
  };

  // Option select for brightness_quiz
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
      setFeedbackError('おしい！もう一度問題文と図をじっくり見てみよう！');
    }
  };

  const handleNextProblem = () => {
    if (problemIndex < puzzleList.length - 1) {
      setProblemIndex((p) => p + 1);
      setIsCompleted(false);
      setSelectedOptionId(null);
      setFeedbackError(null);
    } else if (onNextLevel) {
      onNextLevel();
    }
  };

  const handleRetry = () => {
    const initialSw: Record<string, boolean> = {};
    currentPuzzle.switches?.forEach((sw) => {
      initialSw[sw.id] = sw.defaultOn ?? false;
    });
    setSwitchStates(initialSw);
    setSelectedOptionId(null);
    setIsCompleted(false);
    setFeedbackError(null);
  };

  // Badge tag
  const badgeTag = customBadge || `理科ラボ ${currentGrade}年 Lv.${level}`;

  return (
    <GameModalWrapper
      title={customTitle || `豆電球と電気回路パズル - ${currentPuzzle.title}`}
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
      onSwitchProblem={(idx) => {
        setProblemIndex(idx);
        setIsCompleted(false);
        setSelectedOptionId(null);
        setFeedbackError(null);
      }}
      onNextProblem={handleNextProblem}
    >
      <div className="flex-1 flex flex-col items-center justify-between p-3 sm:p-5 max-w-5xl mx-auto w-full gap-4 overflow-y-auto">
        {/* Top Question Header */}
        <div className="w-full bg-slate-900/90 border-2 border-amber-300/60 rounded-2xl p-3.5 sm:p-4 shadow-md text-center text-white backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
              {currentPuzzle.title ? `${currentPuzzle.title}${currentPuzzle.subtitle ? ` : ${currentPuzzle.subtitle}` : ''}` : (currentPuzzle.subtitle || '回路シミュレーション・チャレンジ')}
            </span>
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-black text-amber-100">
            {currentPuzzle.question}
          </h3>

          {currentPuzzle.targetCondition && (
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-xs font-bold text-amber-200">
              <span>🎯 もくひょう:</span>
              <span>{currentPuzzle.targetCondition.description}</span>
            </div>
          )}
        </div>

        {/* Interactive Circuit Canvas / Board */}
        <div className="w-full bg-slate-950 border-2 border-slate-700 rounded-3xl p-4 shadow-inner relative flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px] overflow-hidden">
          {/* Subtle Circuit Blueprint Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* SVG Circuit Canvas */}
          <svg className="w-full h-56 sm:h-72 max-w-2xl select-none" viewBox="0 0 500 300">
            <defs>
              {/* Glow filter for lit bulbs */}
              <filter id="bulbGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="superGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Wires */}
            {currentPuzzle.wireSegments?.map((wire, idx) => {
              const isCurrentFlowing = Object.values(bulbBrightness).some((b) => b > 0);
              return (
                <g key={idx}>
                  {/* Base dark copper wire */}
                  <line
                    x1={wire.x1}
                    y1={wire.y1}
                    x2={wire.x2}
                    y2={wire.y2}
                    stroke="#475569"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  {/* Glowing flowing current line */}
                  {isCurrentFlowing && (
                    <line
                      x1={wire.x1}
                      y1={wire.y1}
                      x2={wire.x2}
                      y2={wire.y2}
                      stroke="#fbbf24"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      className="animate-[dash_1s_linear_infinite]"
                      style={{
                        animation: 'dash 1.2s linear infinite'
                      }}
                    />
                  )}
                </g>
              );
            })}

            {/* Batteries */}
            {currentPuzzle.batteries?.map((bat) => (
              <g key={bat.id} transform={`translate(${bat.x - 45}, ${bat.y - 20})`}>
                {/* Battery body */}
                <rect x="0" y="0" width="80" height="40" rx="8" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2.5" />
                {/* Positive terminal nib */}
                <rect x="80" y="10" width="8" height="20" rx="2" fill="#38bdf8" />
                {/* Internal battery color blocks */}
                <rect x="6" y="6" width="32" height="28" rx="4" fill="#0284c7" />
                <rect x="42" y="6" width="32" height="28" rx="4" fill="#0369a1" />
                {/* Labels */}
                <text x="20" y="24" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                  +
                </text>
                <text x="60" y="24" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                  -
                </text>
                <text x="40" y="54" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {bat.label}
                </text>
              </g>
            ))}

            {/* Bulbs */}
            {currentPuzzle.bulbs?.map((bulb) => {
              const b = bulbBrightness[bulb.id] ?? 0;
              const isLit = b > 0;
              const isSuper = b >= 1.5;
              const isShorted = shortedBulbs?.includes(bulb.id);

              return (
                <g key={bulb.id} transform={`translate(${bulb.x}, ${bulb.y})`} className="transition-all duration-300">
                  {/* Radial background aura when lit */}
                  {isLit && (
                    <circle
                      cx="0"
                      cy="0"
                      r={isSuper ? 36 : 28}
                      fill={isSuper ? 'rgba(253, 224, 71, 0.45)' : 'rgba(250, 204, 21, 0.25)'}
                      className="animate-pulse"
                    />
                  )}

                  {/* Socket base */}
                  <rect x="-12" y="14" width="24" height="12" rx="3" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
                  <rect x="-8" y="26" width="16" height="5" rx="2" fill="#475569" />

                  {/* Glass bulb */}
                  <circle
                    cx="0"
                    cy="0"
                    r="18"
                    fill={isLit ? (isSuper ? '#fef08a' : '#fde047') : '#334155'}
                    stroke={isLit ? '#eab308' : '#64748b'}
                    strokeWidth="2"
                    filter={isLit ? (isSuper ? 'url(#superGlow)' : 'url(#bulbGlow)') : undefined}
                  />

                  {/* Filament inside */}
                  <path
                    d="M -6 8 L -3 -2 L 0 2 L 3 -2 L 6 8"
                    fill="none"
                    stroke={isLit ? '#ffffff' : '#94a3b8'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Bulb name label */}
                  <text x="0" y="-24" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle">
                    {bulb.label}
                  </text>

                  {/* Brightness status badge */}
                  <g transform="translate(0, 44)">
                    <rect
                      x="-32"
                      y="-10"
                      width="64"
                      height="18"
                      rx="9"
                      fill={isShorted ? '#ef4444' : isLit ? (isSuper ? '#ca8a04' : '#15803d') : '#475569'}
                    />
                    <text x="0" y="3" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {isShorted
                        ? 'ショート⚡'
                        : isLit
                        ? isSuper
                          ? `超明るい(x${b})`
                          : b < 1
                          ? `暗い(${b.toFixed(2)})`
                          : '明るい(x1)'
                        : '消灯'}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Interactive Knife Switches */}
            {currentPuzzle.switches?.map((sw) => {
              const isOn = Boolean(switchStates[sw.id]);
              return (
                <g
                  key={sw.id}
                  transform={`translate(${sw.x}, ${sw.y})`}
                  onClick={() => handleToggleSwitch(sw.id)}
                  className="cursor-pointer group"
                >
                  {/* Click target hit area */}
                  <rect x="-25" y="-25" width="50" height="50" fill="transparent" />

                  {/* Switch Base terminals */}
                  <circle cx="-16" cy="0" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
                  <circle cx="16" cy="0" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />

                  {/* Switch Lever blade */}
                  <line
                    x1="-16"
                    y1="0"
                    x2="16"
                    y2={isOn ? 0 : -22}
                    stroke={isOn ? '#22c55e' : '#e2e8f0'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="transition-all duration-200"
                  />

                  {/* Switch knob */}
                  <circle
                    cx="16"
                    cy={isOn ? 0 : -22}
                    r="4"
                    fill={isOn ? '#15803d' : '#ef4444'}
                    className="transition-all duration-200"
                  />

                  {/* Switch Label */}
                  <text x="0" y="20" fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {sw.label}
                  </text>
                  <text
                    x="0"
                    y="32"
                    fill={isOn ? '#4ade80' : '#f87171'}
                    fontSize="9"
                    fontWeight="black"
                    textAnchor="middle"
                  >
                    [{isOn ? 'ON' : 'OFF'}]
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Short circuit warning alert */}
          {isShortCircuit && (
            <div className="absolute top-3 bg-red-600/90 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-bounce">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>ショート回路発生！乾電池が直結されています！</span>
            </div>
          )}
        </div>

        {/* Interactive Controls & Answers Area */}
        <div className="w-full flex flex-col items-center gap-3">
          {/* Switch Target Mode: Live Status & Check Button */}
          {currentPuzzle.puzzleType === 'switch_target' && (
            <div className="w-full flex flex-col items-center gap-3">
              {/* Switch Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {currentPuzzle.switches?.map((sw) => {
                  const isOn = Boolean(switchStates[sw.id]);
                  return (
                    <button
                      key={sw.id}
                      onClick={() => handleToggleSwitch(sw.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all active:scale-95 shadow-sm border-2 ${
                        isOn
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-emerald-200'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
                      }`}
                    >
                      {isOn ? <ToggleRight className="w-5 h-5 text-white" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                      <span>{sw.label}: {isOn ? 'ON (閉じる)' : 'OFF (開く)'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Check Result Button */}
              {!isCompleted && (
                <button
                  onClick={handleCheckTarget}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-base shadow-md transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>実験結果をたしかめる！</span>
                </button>
              )}
            </div>
          )}

          {/* Multiple Choice Quiz Options */}
          {(currentPuzzle.puzzleType === 'brightness_quiz' || currentPuzzle.puzzleType === 'short_detect') && currentPuzzle.options && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-3xl">
              {currentPuzzle.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    disabled={isCompleted}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-3.5 rounded-xl text-left text-xs sm:text-sm font-black transition-all border-2 active:scale-95 flex items-center gap-2.5 shadow-sm ${
                      isSelected
                        ? opt.correct
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200'
                          : 'bg-rose-500 text-white border-rose-600 shadow-rose-200'
                        : 'bg-white hover:bg-amber-50 text-slate-800 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 text-xs font-black">
                      {isSelected && opt.correct ? '✓' : opt.id.replace('o', '')}
                    </span>
                    <span className="flex-1 leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Inline Feedback Error Message */}
          {feedbackError && (
            <div className="text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 px-4 py-1.5 rounded-full animate-shake">
              {feedbackError}
            </div>
          )}
        </div>
      </div>

      {/* Hint Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-4 border-amber-300 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 text-amber-600 font-black text-lg mb-3">
              <HelpCircle className="w-6 h-6" />
              <span>ヒント＆考え方</span>
            </div>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-wrap">
              {currentPuzzle.hint}
            </p>
            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-sm shadow-md transition-all"
            >
              わかった！
            </button>
          </div>
        </div>
      )}
    </GameModalWrapper>
  );
};
