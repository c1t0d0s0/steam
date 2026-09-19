import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';


interface CubeNetGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: CubeNetPuzzle[];
  customTitle?: string;
  customBadge?: string;
}
interface NetCell {
  label?: string;
  bg?: string;
  border?: string;
  textClass?: string;
}

interface CubeNetPuzzle {
  question: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  examTip: string;
  gridCols: number;
  grid: (NetCell | null)[];
}

export const CubeNetGame: React.FC<CubeNetGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const getLevelPuzzles = (lvl: number): CubeNetPuzzle[] => {
    switch (lvl) {
      case 1:
        return [
          {
            question: '展開図を組み立てたとき、黄色い面「B」と向かい合う（平行になる）面はどれ？',
            correctAnswer: 'F',
            options: ['A', 'C', 'D', 'F'],
            explanation: '十字型の展開図では、上下に飛び出た「B」と「F」が向かい合う面（対面）になります！また、1行に4枚並んだ面は1つ飛ばしで向かい合います（AとD、CとE）。',
            examTip: '【展開図の超基本技】1列に3枚以上並んでいる面は「1マス飛ばし」が必ず向かい合う面になります！',
            gridCols: 4,
            grid: [
              null, { label: 'B', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null, null,
              { label: 'A', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'C', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              { label: 'D', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'E', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              null, { label: 'F', bg: 'bg-emerald-400', border: 'border-emerald-600', textClass: 'text-emerald-950' }, null, null
            ]
          },
          {
            question: 'この展開図で、青い面「A」と向かい合う面はどれかな？',
            correctAnswer: 'D',
            options: ['B', 'C', 'D', 'E'],
            explanation: '横に並んだ A-C-D-E では、1マス飛ばしになる「AとD」が向かい合います！',
            examTip: '1列に並んだ4枚は、隣どうしが直角に折れ曲がり、1マス飛ばしの面どうしが平行に向かい合います！',
            gridCols: 4,
            grid: [
              null, { label: 'B', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null, null,
              { label: 'A', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'C', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              { label: 'D', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'E', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              null, { label: 'F', bg: 'bg-emerald-400', border: 'border-emerald-600', textClass: 'text-emerald-950' }, null, null
            ]
          },
          {
            question: 'この展開図で、青い面「C」と向かい合う面はどれかな？',
            correctAnswer: 'E',
            options: ['A', 'B', 'D', 'E'],
            explanation: '1マス飛ばしの法則により、Cの1つ飛ばしである「E」が向かい合う面になります！',
            examTip: 'AとD、CとE、BとF の3組の対面ペアを素早く見抜くのが展開図攻略の基本です！',
            gridCols: 4,
            grid: [
              null, { label: 'B', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null, null,
              { label: 'A', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'C', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              { label: 'D', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'E', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              null, { label: 'F', bg: 'bg-emerald-400', border: 'border-emerald-600', textClass: 'text-emerald-950' }, null, null
            ]
          }
        ];
      case 2:
        return [
          {
            question: '向かい合う面の合計が「7」になるサイコロを作りたい！「？」に入る数字は何かな？',
            correctAnswer: '6',
            options: ['4', '5', '6', '7'],
            explanation: '上の面が「1」で、向かい合う底の面が「？」です。サイコロは向かい合う面の合計が「7」になるので、7 - 1 = 6 が正解です！',
            examTip: '【サイコロの原則】サイコロは【1と6】【2と5】【3と4】がそれぞれ向かい合います（和が7）。入試頻出です！',
            gridCols: 4,
            grid: [
              null, { label: '1', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null, null,
              { label: '2', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: '3', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              { label: '5', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: '4', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              null, { label: '?', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' }, null, null
            ]
          },
          {
            question: 'サイコロの和が「7」になるように組み立てるよ！上の面が「2」のとき、向かい合う底の「？」は何？',
            correctAnswer: '5',
            options: ['3', '4', '5', '6'],
            explanation: '7 - 2 = 5 が正解です！サイコロの向かい合う面は 2 と 5 です。',
            examTip: 'サイコロ問題では「対面の和＝7」を即座に引き算で求めましょう！',
            gridCols: 4,
            grid: [
              null, { label: '2', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null, null,
              { label: '1', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: '3', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              { label: '6', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: '4', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              null, { label: '?', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' }, null, null
            ]
          },
          {
            question: 'サイコロの和が「7」になるよ！上の面が「3」のとき、向かい合う底の「？」に入る数字は？',
            correctAnswer: '4',
            options: ['2', '3', '4', '5'],
            explanation: '7 - 3 = 4 が正解です！サイコロの向かい合う面は 3 と 4 です。',
            examTip: 'サイコロの3組のペア「1-6」「2-5」「3-4」は反射的に言えるように暗記しましょう！',
            gridCols: 4,
            grid: [
              null, { label: '3', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null, null,
              { label: '1', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: '2', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              { label: '6', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: '5', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              null, { label: '?', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' }, null, null
            ]
          }
        ];
      case 3:
        return [
          {
            question: 'この展開図は、正しく組み立てて立方体（サイコロ）にできるかな？',
            correctAnswer: 'できない',
            options: ['できる！', 'できない'],
            explanation: 'この展開図は組み立てると右の2つの面が重なってしまい、底の面が足りなくなります！立方体の展開図は全部で「11種類」しかありません。',
            examTip: '【展開図の11種類】「1-4-1型(6種)」「2-3-1型(3種)」「2-2-2型(1種)」「3-3型(1種)」を覚えておくと瞬時に見抜けます！',
            gridCols: 4,
            grid: [
              null, { label: '1', bg: 'bg-purple-400', border: 'border-purple-600', textClass: 'text-white' },
              { label: '2', bg: 'bg-purple-400', border: 'border-purple-600', textClass: 'text-white' }, null,
              { label: '3', bg: 'bg-purple-300', border: 'border-purple-500', textClass: 'text-purple-950' },
              { label: '4', bg: 'bg-purple-300', border: 'border-purple-500', textClass: 'text-purple-950' },
              { label: '5', bg: 'bg-purple-300', border: 'border-purple-500', textClass: 'text-purple-950' },
              { label: '6', bg: 'bg-purple-300', border: 'border-purple-500', textClass: 'text-purple-950' }
            ]
          },
          {
            question: 'この展開図は組み立てて立方体にできるかな？（横に5マス並んでいるよ）',
            correctAnswer: 'できない',
            options: ['できる！', 'できない'],
            explanation: '1列に5マス並んでしまうと、巻いたときに面が重複してしまい、立方体には絶対になりません！',
            examTip: '【最大4マスの法則】立方体の展開図で、1列に並ぶことができる正方形は最大で「4マス」までです！5マス以上は即座に除外できます。',
            gridCols: 5,
            grid: [
              null, { label: '1', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' }, null, null, null,
              { label: '2', bg: 'bg-rose-300', border: 'border-rose-500', textClass: 'text-rose-950' },
              { label: '3', bg: 'bg-rose-300', border: 'border-rose-500', textClass: 'text-rose-950' },
              { label: '4', bg: 'bg-rose-300', border: 'border-rose-500', textClass: 'text-rose-950' },
              { label: '5', bg: 'bg-rose-300', border: 'border-rose-500', textClass: 'text-rose-950' },
              { label: '6', bg: 'bg-rose-300', border: 'border-rose-500', textClass: 'text-rose-950' }
            ]
          },
          {
            question: 'この展開図（T字型）は、正しく組み立てて立方体にできるかな？',
            correctAnswer: 'できる！',
            options: ['できる！', 'できない'],
            explanation: '正解は「できる！」です。最も代表的な1-4-1型の展開図で、綺麗にサイコロを組み立てることができます！',
            examTip: '1-4-1型は上下のフタになる面が1マスずつ互い違いについていれば、必ず立方体になります！',
            gridCols: 4,
            grid: [
              null, { label: '1', bg: 'bg-emerald-400', border: 'border-emerald-600', textClass: 'text-emerald-950' }, null, null,
              { label: '2', bg: 'bg-emerald-300', border: 'border-emerald-500', textClass: 'text-emerald-950' },
              { label: '3', bg: 'bg-emerald-300', border: 'border-emerald-500', textClass: 'text-emerald-950' },
              { label: '4', bg: 'bg-emerald-300', border: 'border-emerald-500', textClass: 'text-emerald-950' },
              { label: '5', bg: 'bg-emerald-300', border: 'border-emerald-500', textClass: 'text-emerald-950' },
              null, null, { label: '6', bg: 'bg-emerald-400', border: 'border-emerald-600', textClass: 'text-emerald-950' }, null
            ]
          }
        ];
      case 4:
        return [
          {
            question: 'この1-4-1変形型で、青い面「C」と向かい合う面はどれかな？',
            correctAnswer: 'E',
            options: ['A', 'D', 'E', 'F'],
            explanation: '横4マス列（B, C, D, E）の中で1マス飛ばしになるので、Cの対面は「E」です！',
            examTip: '上下のフタの位置がズレていても、真ん中の4連マスにおける1マス飛ばしの原則はそのまま使えます！',
            gridCols: 4,
            grid: [
              null, null, { label: 'A', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null,
              { label: 'B', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'C', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              { label: 'D', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'E', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              null, { label: 'F', bg: 'bg-emerald-400', border: 'border-emerald-600', textClass: 'text-emerald-950' }, null, null
            ]
          },
          {
            question: 'この1-4-1変形型で、黄色い面「A」と向かい合う面はどれかな？',
            correctAnswer: 'F',
            options: ['B', 'C', 'E', 'F'],
            explanation: '真ん中の4枚（B-C-D-E）が側面を取り囲む筒になり、上下にある「A」と「F」が上蓋と底面になって向かい合います！',
            examTip: '上下に1枚ずつ出ている面は、必ず向かい合う「対面」の関係になります！',
            gridCols: 4,
            grid: [
              null, null, { label: 'A', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null,
              { label: 'B', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'C', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              { label: 'D', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'E', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              null, { label: 'F', bg: 'bg-emerald-400', border: 'border-emerald-600', textClass: 'text-emerald-950' }, null, null
            ]
          },
          {
            question: 'この1-4-1変形型で、面「B」と向かい合う面はどれかな？',
            correctAnswer: 'D',
            options: ['A', 'C', 'D', 'F'],
            explanation: 'B-C-D-E の1マス飛ばしにより、Bと向かい合うのは「D」です！',
            examTip: '3組の対面（A-F, B-D, C-E）をすべて把握できれば満点です！',
            gridCols: 4,
            grid: [
              null, null, { label: 'A', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null,
              { label: 'B', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'C', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              { label: 'D', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
              { label: 'E', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
              null, { label: 'F', bg: 'bg-emerald-400', border: 'border-emerald-600', textClass: 'text-emerald-950' }, null, null
            ]
          }
        ];
      case 5:
        return [
          {
            question: '2-3-1型の展開図でサイコロを作りたい！「4」と向かい合う「？」に入る数字は何？',
            correctAnswer: '3',
            options: ['1', '2', '3', '5'],
            explanation: '7 - 4 = 3 が正解です！2-3-1型を組み立てると、4の面と向かい合うのは「3」になります。',
            examTip: '【2-3-1型サイコロ】真ん中の3枚のうち両端と、上下の面がそれぞれどう折れるかをイメージしましょう！',
            gridCols: 4,
            grid: [
              { label: '2', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' },
              { label: '4', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' }, null, null,
              null,
              { label: '1', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' },
              { label: '6', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' },
              { label: '5', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' },
              null, null, { label: '?', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' }, null
            ]
          },
          {
            question: 'この2-3-1型サイコロで、「5」と向かい合う対面に入る数字は何？（和が7）',
            correctAnswer: '2',
            options: ['1', '2', '3', '4'],
            explanation: '7 - 5 = 2 が正解です！組み立てたとき「2」と「5」が向かい合います。',
            examTip: 'サイコロの対面の和は7！組み立てたときの面の位置関係を確実に推理しましょう。',
            gridCols: 4,
            grid: [
              { label: '?', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' },
              { label: '4', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' }, null, null,
              null,
              { label: '1', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' },
              { label: '6', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' },
              { label: '5', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' },
              null, null, { label: '3', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' }, null
            ]
          },
          {
            question: 'この2-3-1型サイコロで、「6」と向かい合う対面に入る数字は何？（和が7）',
            correctAnswer: '1',
            options: ['1', '2', '3', '5'],
            explanation: '7 - 6 = 1 が正解です！1行に並んだ面で「1」と「6」が向かい合います。',
            examTip: '難関校の図形問題で差がつく2-3-1型の空間把握を完全マスター！',
            gridCols: 4,
            grid: [
              { label: '2', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' },
              { label: '4', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' }, null, null,
              null,
              { label: '?', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' },
              { label: '6', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' },
              { label: '5', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' },
              null, null, { label: '3', bg: 'bg-indigo-300', border: 'border-indigo-500', textClass: 'text-indigo-950' }, null
            ]
          }
        ];
      case 6:
      default:
        return [
          {
            question: 'この階段型（3-3型）の展開図は、正しく組み立てて立方体にできるかな？',
            correctAnswer: 'できる！',
            options: ['できる！', 'できない'],
            explanation: '「できる！」が大正解！一見重なりそうに見えますが、3枚ずつの階段型（3-3型）は立方体を作ることができる有名な11種類の1つです！',
            examTip: '【展開図11種類の名問】3-3型は入試で「できない」と誤答しやすいワナ問題として最もよく出題されます！',
            gridCols: 4,
            grid: [
              { label: '1', bg: 'bg-fuchsia-400', border: 'border-fuchsia-600', textClass: 'text-white' },
              { label: '2', bg: 'bg-fuchsia-400', border: 'border-fuchsia-600', textClass: 'text-white' },
              { label: '3', bg: 'bg-fuchsia-400', border: 'border-fuchsia-600', textClass: 'text-white' }, null,
              null,
              { label: '4', bg: 'bg-fuchsia-300', border: 'border-fuchsia-500', textClass: 'text-fuchsia-950' },
              { label: '5', bg: 'bg-fuchsia-300', border: 'border-fuchsia-500', textClass: 'text-fuchsia-950' },
              { label: '6', bg: 'bg-fuchsia-300', border: 'border-fuchsia-500', textClass: 'text-fuchsia-950' }
            ]
          },
          {
            question: 'このギザギザ階段型（2-2-2型）の展開図は、立方体にできるかな？',
            correctAnswer: 'できる！',
            options: ['できる！', 'できない'],
            explanation: '正解は「できる！」です！2枚ずつのギザギザ階段（2-2-2型）も、立方体を組み立てることができる貴重な1種類です！',
            examTip: '【11種類の希少型】2-2-2型と3-3型はそれぞれ1種類ずつしか存在しない特別な展開図です！',
            gridCols: 4,
            grid: [
              { label: '1', bg: 'bg-cyan-400', border: 'border-cyan-600', textClass: 'text-white' },
              { label: '2', bg: 'bg-cyan-400', border: 'border-cyan-600', textClass: 'text-white' }, null, null,
              null,
              { label: '3', bg: 'bg-cyan-300', border: 'border-cyan-500', textClass: 'text-cyan-950' },
              { label: '4', bg: 'bg-cyan-300', border: 'border-cyan-500', textClass: 'text-cyan-950' }, null,
              null, null,
              { label: '5', bg: 'bg-cyan-200', border: 'border-cyan-400', textClass: 'text-cyan-950' },
              { label: '6', bg: 'bg-cyan-200', border: 'border-cyan-400', textClass: 'text-cyan-950' }
            ]
          },
          {
            question: 'この展開図は立方体にできるかな？（同じ列の上下に面が突き出ているよ）',
            correctAnswer: 'できない',
            options: ['できる！', 'できない'],
            explanation: '正解は「できない」！上下の面が同じ側に重なってしまい、底面が足りなくなります。',
            examTip: '【達人の直感】フタになる面が同じ場所で向かい合うと必ず重なります。展開図マスター達成です！',
            gridCols: 4,
            grid: [
              null, { label: '1', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' }, null, null,
              null, { label: '2', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' }, null, null,
              { label: '3', bg: 'bg-rose-300', border: 'border-rose-500', textClass: 'text-rose-950' },
              { label: '4', bg: 'bg-rose-300', border: 'border-rose-500', textClass: 'text-rose-950' },
              { label: '5', bg: 'bg-rose-300', border: 'border-rose-500', textClass: 'text-rose-950' },
              { label: '6', bg: 'bg-rose-300', border: 'border-rose-500', textClass: 'text-rose-950' }
            ]
          }
        ];
    }
  };

  const puzzles = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level);
  const [problemIndex, setProblemIndex] = useState(0);
  const puzzle = puzzles[problemIndex % puzzles.length];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(puzzle.question);

  const switchProblem = (idx: number) => {
    const nextIdx = idx % puzzles.length;
    const nextP = puzzles[nextIdx];
    setProblemIndex(nextIdx);
    setSelectedOption(null);
    setIsCompleted(false);
    setFeedback(nextP.question);
  };

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
    if (opt === puzzle.correctAnswer) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback('大正解！展開図の空間構成を見事にマスターしました！');
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('おしい！頭の中で紙を折って組み立てるイメージをしてみよう！');
    }
  };

  return (
    <GameModalWrapper
      title={customTitle || "立方体の展開図マスター"}
      badgeTag={customBadge || `デザイン工房 Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={puzzle.explanation}
      examTip={puzzle.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      problemIndex={problemIndex}
      totalProblems={puzzles.length}
      onSwitchProblem={switchProblem}
      onNextProblem={() => switchProblem(problemIndex + 1)}
      onRetry={() => {
        setSelectedOption(null);
        setIsCompleted(false);
        setFeedback(puzzle.question);
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-purple-50 border border-purple-200 rounded-2xl mb-4 font-extrabold text-purple-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* 2D Net Display Canvas */}
        <div className="w-full max-w-sm bg-gradient-to-b from-indigo-50 to-purple-50 border-2 border-purple-200 rounded-3xl p-4 sm:p-6 mb-5 flex flex-col items-center justify-center shadow-inner relative min-h-[180px]">
          <div
            className="grid gap-1 sm:gap-2"
            style={{ gridTemplateColumns: `repeat(${puzzle.gridCols}, minmax(0, 1fr))` }}
          >
            {puzzle.grid.map((cell, idx) =>
              cell ? (
                <div
                  key={idx}
                  className={`w-11 h-11 sm:w-12 sm:h-12 ${cell.bg || 'bg-sky-400'} border-2 ${
                    cell.border || 'border-sky-600'
                  } rounded-xl flex items-center justify-center font-black ${
                    cell.textClass || 'text-sky-950'
                  } text-lg sm:text-xl shadow`}
                >
                  {cell.label}
                </div>
              ) : (
                <div key={idx} className="w-11 h-11 sm:w-12 sm:h-12" />
              )
            )}
          </div>
        </div>

        {/* Options */}
        <div className="w-full max-w-md">
          <span className="text-xs font-black text-slate-600 block text-center mb-3">
            選択肢から選んでね！
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {puzzle.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelectOption(opt)}
                className={`py-3.5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-md border-2 ${
                  selectedOption === opt
                    ? opt === puzzle.correctAnswer
                      ? 'bg-emerald-500 text-white border-emerald-300'
                      : 'bg-rose-500 text-white border-rose-300'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameModalWrapper>
  );
};
