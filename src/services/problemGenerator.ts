import { DailyChallengeQuestion, DailyChallengeState } from './storage';

/**
 * Utility: pseudo-random number generator or standard Math.random with range
 */
const randInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const shuffle = <T>(arr: T[]): T[] => {
  return [...arr].sort(() => Math.random() - 0.5);
};

// =============================================================================
// 1. Science Island: Lever Balance Puzzle Generator
// =============================================================================

export const generateLeverPuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: any; signature: string } => {
  const weightPool = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70];

  for (let attempt = 0; attempt < 100; attempt++) {
    const targetPos = randInt(1, 4); // right target position 1 to 4
    const ansWeight = pickRandom([15, 20, 25, 30, 35, 40, 50, 60]);
    const targetTorque = targetPos * ansWeight;

    // Build left weights whose torques sum to targetTorque
    const isMulti = grade >= 5 && Math.random() > 0.4;
    let initialWeights: { pos: number; weight: number; locked: boolean }[] = [];

    if (!isMulti) {
      // Single weight on the left
      // Choose left pos (-1 to -4) differing from targetPos so it cannot be a symmetric mirror copy
      const validLeftPositions: number[] = [];
      for (let p = 1; p <= 4; p++) {
        if (p === targetPos) continue; // Different distance!
        if (targetTorque % p === 0) {
          const w = targetTorque / p;
          if (w !== ansWeight && w >= 10 && w <= 80 && (w % 5 === 0)) {
            validLeftPositions.push(p);
          }
        }
      }

      if (validLeftPositions.length === 0) continue;
      const chosenP = pickRandom(validLeftPositions);
      const chosenW = targetTorque / chosenP;
      initialWeights = [{ pos: -chosenP, weight: chosenW, locked: true }];
    } else {
      // Double weights on the left
      const pos1 = randInt(1, 4);
      let pos2 = randInt(1, 4);
      while (pos2 === pos1) pos2 = randInt(1, 4);

      const w1 = pickRandom([10, 15, 20, 25, 30, 40].filter((w) => w !== ansWeight));
      const t1 = pos1 * w1;
      const remainingTorque = targetTorque - t1;

      if (remainingTorque <= 0 || remainingTorque % pos2 !== 0) continue;
      const w2 = remainingTorque / pos2;
      if (w2 === ansWeight || w2 < 10 || w2 > 60 || (w2 % 5 !== 0)) continue;

      initialWeights = [
        { pos: -pos1, weight: w1, locked: true },
        { pos: -pos2, weight: w2, locked: true }
      ];
    }

    const initWs = initialWeights.map((w) => w.weight);
    // availableWeights must NOT contain any weight used on the left
    const allowedPool = weightPool.filter((w) => !initWs.includes(w) && w !== ansWeight);
    allowedPool.sort((a, b) => Math.abs(a - ansWeight) - Math.abs(b - ansWeight));
    const puzzleAvailableWeights = [ansWeight, ...allowedPool.slice(0, 4)].sort((a, b) => a - b);

    const leftDesc = initialWeights
      .map((w) => `「きょり ${Math.abs(w.pos)} × 重さ ${w.weight}g = ${Math.abs(w.pos) * w.weight}」`)
      .join(' と ');

    const signature = `lever:t${targetPos}_w${ansWeight}_l${initialWeights.map((w) => `${w.pos}:${w.weight}`).sort().join('_')}`;

    if (!solvedSignatures.has(signature)) {
      const explanation = `左の力は ${leftDesc} で合計【${targetTorque}】です。右のフック ${targetPos} には「${ansWeight}g」を置くと「${targetPos} × ${ansWeight}g = ${targetTorque}」でピタリと釣り合います！`;
      const examTip = '【中学入試の鉄則】支点からの距離とおもりの重さをかけ算した「力のモーメント（回転させる力）」が左右で等しくなると釣り合います！';

      return {
        signature,
        puzzle: {
          targetPos,
          initialWeights,
          explanation,
          examTip,
          availableWeights: puzzleAvailableWeights
        }
      };
    }
  }

  // Fallback if space is saturated
  return {
    signature: `lever:fallback_${Date.now()}`,
    puzzle: {
      targetPos: 2,
      initialWeights: [{ pos: -3, weight: 20, locked: true }],
      explanation: '左の力は 3 × 20g = 60。右のフック 2 には 30g を置くと 2 × 30g = 60 で釣り合います！',
      examTip: 'てこの規則性：【距離 × 重さ】が左右で一致すると釣り合います！',
      availableWeights: [10, 30, 40, 50, 60] // 20g is excluded!
    }
  };
};

// =============================================================================
// 2. Math Island: Tsurukame Game Generator
// =============================================================================

export const generateTsurukamePuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: any; signature: string } => {
  const minAnimal = grade <= 3 ? 2 : grade <= 4 ? 3 : 5;
  const maxAnimal = grade <= 3 ? 5 : grade <= 4 ? 8 : grade <= 5 ? 12 : 16;

  // Grade-adaptive theme selection
  const themes = [
    {
      themeName: 'ツルとカメ',
      itemA: { name: 'ツル', emoji: '🦩', unit: '羽', value: 2 },
      itemB: { name: 'カメ', emoji: '🐢', unit: '匹', value: 4 },
      totalLabel: 'あたまの数（合計匹数）',
      valueLabel: 'めざす足の合計',
      valueUnit: '本'
    }
  ];

  if (grade >= 4) {
    themes.push({
      themeName: '乗り物の車輪算',
      itemA: { name: '自転車', emoji: '🚲', unit: '台', value: 2 },
      itemB: { name: '自動車', emoji: '🚗', unit: '台', value: 4 },
      totalLabel: '乗り物の台数（合計）',
      valueLabel: 'めざすタイヤ・車輪の合計',
      valueUnit: '輪'
    });
  }

  if (grade >= 5) {
    themes.push({
      themeName: '切手算（金額つるかめ算）',
      itemA: { name: '50円切手', emoji: '💌', unit: '枚', value: 50 },
      itemB: { name: '80円切手', emoji: '📮', unit: '枚', value: 80 },
      totalLabel: '切手の合計枚数',
      valueLabel: 'めざす合計金額',
      valueUnit: '円'
    });
  }

  if (grade >= 6) {
    themes.push({
      themeName: '昆虫つるかめ算（カブトムシとクモ）',
      itemA: { name: 'カブトムシ', emoji: '🪲', unit: '匹', value: 6 },
      itemB: { name: 'クモ', emoji: '🕷️', unit: '匹', value: 8 },
      totalLabel: '虫の匹数（合計）',
      valueLabel: 'めざす足の合計',
      valueUnit: '本'
    });
  }

  const selectedTheme = pickRandom(themes);

  for (let attempt = 0; attempt < 100; attempt++) {
    const countA = randInt(minAnimal, maxAnimal);
    const countB = randInt(minAnimal, maxAnimal);
    const totalCount = countA + countB;
    const totalVal = countA * selectedTheme.itemA.value + countB * selectedTheme.itemB.value;

    const signature = `tsuru:${selectedTheme.itemA.name}_h${totalCount}_v${totalVal}_a${countA}_b${countB}`;
    if (!solvedSignatures.has(signature)) {
      const assumedVal = totalCount * selectedTheme.itemA.value;
      const missingVal = totalVal - assumedVal;
      const diffVal = selectedTheme.itemB.value - selectedTheme.itemA.value;

      const explanation = `もし全部${selectedTheme.itemA.name}なら ${totalCount}${selectedTheme.itemB.unit} × ${selectedTheme.itemA.value}${selectedTheme.valueUnit} = ${assumedVal}${selectedTheme.valueUnit}。足りない分は ${totalVal} - ${assumedVal} = ${missingVal}${selectedTheme.valueUnit}。${selectedTheme.itemA.name}を${selectedTheme.itemB.name}に変えると「1${selectedTheme.itemB.unit}あたり${diffVal}${selectedTheme.valueUnit}」増えるので、${missingVal}${selectedTheme.valueUnit} ÷ ${diffVal} = ${countB}${selectedTheme.itemB.unit}が${selectedTheme.itemB.name}！${selectedTheme.itemA.name}は ${totalCount} - ${countB} = ${countA}${selectedTheme.itemA.unit}です。`;
      const examTip = '【中学受験のツボ】「もし全員が少ない方だったら」と仮定し、不足分を「1つあたりの差」で割ることで多い方の数が求まります！';

      return {
        signature,
        puzzle: {
          totalHeads: totalCount,
          totalLegs: totalVal,
          correctCranes: countA,
          correctTurtles: countB,
          themeName: selectedTheme.themeName,
          itemA: selectedTheme.itemA,
          itemB: selectedTheme.itemB,
          totalLabel: selectedTheme.totalLabel,
          valueLabel: selectedTheme.valueLabel,
          valueUnit: selectedTheme.valueUnit,
          explanation,
          examTip
        }
      };
    }
  }

  return {
    signature: `tsuru:fallback_${Date.now()}`,
    puzzle: {
      totalHeads: 6,
      totalLegs: 18,
      correctCranes: 3,
      correctTurtles: 3,
      themeName: 'ツルとカメ',
      itemA: { name: 'ツル', emoji: '🦩', unit: '羽', value: 2 },
      itemB: { name: 'カメ', emoji: '🐢', unit: '匹', value: 4 },
      totalLabel: 'あたまの数（合計匹数）',
      valueLabel: 'めざす足の合計',
      valueUnit: '本',
      explanation: 'もし全員ツルなら 6×2=12本。差の6本÷2=3匹がカメ。ツルは 6-3=3羽です。',
      examTip: 'つるかめ算の基本公式をしっかりマスターしよう！'
    }
  };
};

// =============================================================================
// 3. Math Island: Block Count Game Generator
// =============================================================================

export const generateBlockPuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: any; signature: string } => {
  for (let attempt = 0; attempt < 100; attempt++) {
    // 3x3 height array: heights[x][y]
    // x in 0..2 (front to back), y in 0..2 (depth)
    const heights: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];

    let totalBlocks = 0;
    const minBlocks = grade <= 4 ? 6 : 8;
    const maxBlocks = grade <= 4 ? 11 : 16;

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        // Ground blocks are more likely, higher blocks rarer
        const h = Math.random() < 0.25 ? 0 : randInt(1, grade <= 4 ? 2 : 3);
        heights[x][y] = h;
        totalBlocks += h;
      }
    }

    if (totalBlocks < minBlocks || totalBlocks > maxBlocks) continue;

    const signature = `block:h_${heights.flat().join('')}`;
    if (!solvedSignatures.has(signature)) {
      // Convert heights into 3D voxel list
      const blocks: { x: number; y: number; z: number }[] = [];
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < heights[x][y]; z++) {
            blocks.push({ x, y, z });
          }
        }
      }

      // Generate 4 distinct options around the answer
      const optionsSet = new Set<number>([totalBlocks]);
      while (optionsSet.size < 4) {
        const offset = pickRandom([-3, -2, -1, 1, 2, 3]);
        const cand = totalBlocks + offset;
        if (cand > 0) optionsSet.add(cand);
      }
      const options = Array.from(optionsSet).sort((a, b) => a - b);

      const explanation = `各列の高さは、上から見ると [${heights[0].join(',')}], [${heights[1].join(',')}], [${heights[2].join(',')}] となっています。すべて合計すると ${totalBlocks}個です！見えない奥の段差にも注意しましょう。`;
      const examTip = '【中学受験のツボ】「上から見た図」を描いて、それぞれのマスにブロックの高さを数字で書き込んでから合計すると数え間違いゼロに！';

      return {
        signature,
        puzzle: {
          blocks,
          answer: totalBlocks,
          options,
          explanation,
          examTip
        }
      };
    }
  }

  // Fallback
  return {
    signature: `block:fallback_${Date.now()}`,
    puzzle: {
      blocks: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 1, y: 0, z: 1 }
      ],
      answer: 7,
      options: [5, 6, 7, 8],
      explanation: '1段目に5個、2段目に2個あり、合計7個です。',
      examTip: '段ごとに階層を分けて数えるのも有効な方法です！'
    }
  };
};

// =============================================================================
// 4. Engineering Island: Gear Chain Puzzle Generator
// =============================================================================

export const generateGearPuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: any; signature: string } => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  for (let attempt = 0; attempt < 100; attempt++) {
    // 50% direction puzzle, 50% ratio puzzle (for grade >= 4)
    const isRatio = grade >= 4 && Math.random() > 0.45;

    if (isRatio) {
      // 2 or 3 gears ratio problem (grade >= 5 introduces 3-gear idler trains)
      const teethChoices = [8, 10, 12, 15, 16, 20, 24, 30];
      const teethA = pickRandom([8, 10, 12, 14, 15, 16, 20]);
      const turnsA = pickRandom([3, 4, 5, 6]);
      const totalMoved = teethA * turnsA;

      const isIdler = grade >= 5 && Math.random() > 0.4;
      if (isIdler) {
        // 3-gear train with middle idler gear
        const teethB = pickRandom([10, 12, 16, 18, 20]); // intermediate idler
        const validTeethC = teethChoices.filter((t) => t !== teethA && totalMoved % t === 0);
        if (validTeethC.length === 0) continue;
        const teethC = pickRandom(validTeethC);
        const correctTurns = totalMoved / teethC;

        const signature = `gear:idler_ta${teethA}_na${turnsA}_tb${teethB}_tc${teethC}`;
        if (!solvedSignatures.has(signature)) {
          const gears = [
            { label: 'A', teeth: teethA, radius: Math.max(24, Math.min(48, teethA * 2.2)), isCW: true, speedSec: 3, color: colors[0] },
            { label: 'B (中間)', teeth: teethB, radius: Math.max(24, Math.min(48, teethB * 2.2)), isCW: false, speedSec: 3 * (teethB / teethA), color: '#94a3b8' },
            { label: 'C', teeth: teethC, radius: Math.max(24, Math.min(48, teethC * 2.2)), isCW: true, speedSec: 3 * (teethC / teethA), color: colors[2] }
          ];

          const optionsSet = new Set<number>([correctTurns]);
          while (optionsSet.size < 4) {
            const offset = pickRandom([-3, -2, -1, 1, 2, 3]);
            const c = correctTurns + offset;
            if (c > 0) optionsSet.add(c);
          }
          const options = Array.from(optionsSet).sort((a, b) => a - b);

          const explanation = `中間の歯車Bの歯数に関わらず、最初と最後の歯数積だけで決まります！1つの歯車が送る歯数は「${teethA}枚 × ${turnsA}回転 = ${totalMoved}枚」。最後の歯車Cは「${totalMoved} ÷ ${teethC} = ${correctTurns}回転」回ります！`;
          const examTip = '【アイドラギアの定理】中間に挟まれた歯車は向きを変えるだけで、回転数比には影響しません！';

          return {
            signature,
            puzzle: {
              question: `歯車A（${teethA}枚）が時計回りに【${turnsA}回転】するとき、中間ギアB（${teethB}枚）を経由してつながる歯車C（${teethC}枚）は何回転する？`,
              isRatioPuzzle: true,
              correctTurns,
              options,
              gears,
              explanation,
              examTip
            }
          };
        }
      } else {
        // Standard 2-gear ratio
        const validTeethB = teethChoices.filter((t) => t !== teethA && totalMoved % t === 0);
        if (validTeethB.length === 0) continue;
        const teethB = pickRandom(validTeethB);
        const correctTurns = totalMoved / teethB;

        const signature = `gear:ratio_ta${teethA}_na${turnsA}_tb${teethB}`;
        if (!solvedSignatures.has(signature)) {
          const gears = [
            { label: 'A', teeth: teethA, radius: Math.max(24, Math.min(48, teethA * 2.2)), isCW: true, speedSec: 3, color: colors[0] },
            { label: 'B', teeth: teethB, radius: Math.max(24, Math.min(48, teethB * 2.2)), isCW: false, speedSec: 3 * (teethB / teethA), color: colors[1] }
          ];

          const optionsSet = new Set<number>([correctTurns]);
          while (optionsSet.size < 4) {
            const offset = pickRandom([-3, -2, -1, 1, 2, 3]);
            const c = correctTurns + offset;
            if (c > 0) optionsSet.add(c);
          }
          const options = Array.from(optionsSet).sort((a, b) => a - b);

          const explanation = `ギアAが進む歯数は「${teethA}枚 × ${turnsA}回転 = ${totalMoved}枚」です。ギアBの歯数は${teethB}枚なので、「${totalMoved} ÷ ${teethB} = ${correctTurns}回転」回ります！`;
          const examTip = '【中学受験のツボ】「歯数 × 回転数 ＝ 一定」！歯数が半分になれば回転数は2倍（反比例関係）になります！';

          return {
            signature,
            puzzle: {
              question: `ギアA（歯数${teethA}枚）が時計回りに【${turnsA}回転】するとき、噛み合っているギアB（歯数${teethB}枚）は何回転する？`,
              isRatioPuzzle: true,
              correctTurns,
              options,
              gears,
              explanation,
              examTip
            }
          };
        }
      }
    } else {
      // Direction puzzle with 3 or 4 gears
      const count = grade <= 3 ? 3 : randInt(3, 4);
      const startCW = Math.random() > 0.5;
      const labels = ['A', 'B', 'C', 'D'].slice(0, count);
      const teethList = labels.map(() => pickRandom([10, 12, 14, 16]));

      const gears = labels.map((lbl, idx) => {
        const isCW = idx % 2 === 0 ? startCW : !startCW;
        return {
          label: lbl,
          teeth: teethList[idx],
          radius: teethList[idx] * 3,
          isCW,
          speedSec: 3.5,
          color: colors[idx]
        };
      });

      const targetIdx = count - 1;
      const targetLabel = labels[targetIdx];
      const targetDirection: 'CW' | 'CCW' = gears[targetIdx].isCW ? 'CW' : 'CCW';

      const signature = `gear:dir_c${count}_s${startCW ? 'CW' : 'CCW'}_t${targetLabel}`;
      if (!solvedSignatures.has(signature)) {
        const dirName = targetDirection === 'CW' ? '時計回り（右回り）' : '反時計回り（左回り）';
        const startDirName = startCW ? '時計回り' : '反時計回り';

        const explanation = `ギアAが【${startDirName}】で回ると、隣のギアは順番に逆回転します。${labels.map((l, i) => `${l}(${gears[i].isCW ? '時計' : '反時計'})`).join(' → ')} となるため、ギア${targetLabel}は【${dirName}】です！`;
        const examTip = '【中学入試の鉄則】噛み合う歯車は「隣り合うと逆回転」！歯車が奇数個並ぶと最初と同じ回転向き、偶数個並ぶと逆回転になります！';

        return {
          signature,
          puzzle: {
            question: `ギアAが【${startDirName}】に回っているとき、最後のギア${targetLabel}の回転方向はどっち？`,
            targetDirection,
            gears,
            explanation,
            examTip
          }
        };
      }
    }
  }

  // Fallback
  return {
    signature: `gear:fallback_${Date.now()}`,
    puzzle: {
      question: 'ギアAが時計回りに回っているとき、ギアCの回転方向はどっち？',
      targetDirection: 'CW',
      gears: [
        { label: 'A', teeth: 12, radius: 36, isCW: true, speedSec: 3, color: '#3b82f6' },
        { label: 'B', teeth: 12, radius: 36, isCW: false, speedSec: 3, color: '#10b981' },
        { label: 'C', teeth: 12, radius: 36, isCW: true, speedSec: 3, color: '#f59e0b' }
      ],
      explanation: 'A(時計回り) → B(反時計回り) → C(時計回り) となります。',
      examTip: '奇数個目の歯車は最初の歯車と同じ向きに回ります！'
    }
  };
};

// =============================================================================
// 5. Art Island: Cube Net Puzzle Generator
// =============================================================================

export const generateCubeNetPuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: any; signature: string } => {
  // Defined templates for 1-4-1 net layouts
  // Standard Cross 1-4-1:
  // Row 0: [, A, , ]
  // Row 1: [B, C, D, E]
  // Row 2: [, F, , ]
  // Opposite pairs in this cross: (B, D), (C, E), (A, F)

  const templates = [
    {
      id: 'cross_141',
      gridCols: 4,
      // 3 rows x 4 cols = 12 cells
      cells: [
        null, { id: 'A', r: 0, c: 1 }, null, null,
        { id: 'B', r: 1, c: 0 }, { id: 'C', r: 1, c: 1 }, { id: 'D', r: 1, c: 2 }, { id: 'E', r: 1, c: 3 },
        null, { id: 'F', r: 2, c: 1 }, null, null
      ],
      oppositePairs: [
        ['B', 'D'],
        ['C', 'E'],
        ['A', 'F']
      ]
    },
    {
      id: 't_shape_141',
      gridCols: 4,
      cells: [
        null, null, { id: 'A', r: 0, c: 2 }, null,
        { id: 'B', r: 1, c: 0 }, { id: 'C', r: 1, c: 1 }, { id: 'D', r: 1, c: 2 }, { id: 'E', r: 1, c: 3 },
        null, null, { id: 'F', r: 2, c: 2 }, null
      ],
      oppositePairs: [
        ['B', 'D'],
        ['C', 'E'],
        ['A', 'F']
      ]
    },
    {
      id: 'step_231',
      gridCols: 4,
      cells: [
        { id: 'A', r: 0, c: 0 }, { id: 'B', r: 0, c: 1 }, null, null,
        null, { id: 'C', r: 1, c: 1 }, { id: 'D', r: 1, c: 2 }, { id: 'E', r: 1, c: 3 },
        null, null, null, { id: 'F', r: 2, c: 3 }
      ],
      oppositePairs: [
        ['A', 'D'],
        ['B', 'F'],
        ['C', 'E']
      ]
    }
  ];

  for (let attempt = 0; attempt < 100; attempt++) {
    const tpl = pickRandom(templates);
    const chosenPair = pickRandom(tpl.oppositePairs);
    const isDicePuzzle = grade >= 4 && Math.random() > 0.45;

    if (isDicePuzzle) {
      // Dice sum 7 puzzle:
      // Assign dots (1 to 6) to faces such that opposite faces sum to 7
      // We pick random assignment for the 3 opposite pairs: {1, 6}, {2, 5}, {3, 4}
      const pairValues = shuffle([
        [1, 6],
        [2, 5],
        [3, 4]
      ]);

      const faceValues: Record<string, number> = {};
      tpl.oppositePairs.forEach((pair, idx) => {
        const [v1, v2] = Math.random() > 0.5 ? pairValues[idx] : [pairValues[idx][1], pairValues[idx][0]];
        faceValues[pair[0]] = v1;
        faceValues[pair[1]] = v2;
      });

      const qFace = chosenPair[0];
      const ansFace = chosenPair[1];
      const qVal = faceValues[qFace];
      const correctVal = faceValues[ansFace]; // 7 - qVal

      const signature = `cubenet:dice_${tpl.id}_q${qFace}${qVal}_a${correctVal}`;
      if (!solvedSignatures.has(signature)) {
        // Build grid cells
        const grid = tpl.cells.map((cell) => {
          if (!cell) return null;
          if (cell.id === ansFace) {
            return {
              label: '？',
              bg: 'bg-amber-100',
              border: 'border-amber-500 border-2',
              textClass: 'text-amber-700 font-black text-xl'
            };
          }
          return {
            label: String(faceValues[cell.id]),
            bg: 'bg-white',
            border: 'border-slate-300',
            textClass: 'text-slate-800 font-bold'
          };
        });

        const options = shuffle([correctVal, ...[1, 2, 3, 4, 5, 6].filter((n) => n !== correctVal).slice(0, 3)]).map(String);

        const explanation = `展開図を組み立てると、面【${qFace}】（${qVal}）と向かい合う面は【？】の位置になります。サイコロの向かい合う面の和は常に 7 なので、「7 - ${qVal} = ${correctVal}」となります！`;
        const examTip = '【中学受験のツボ】一般的なサイコロは「向かい合う面の目の合計が必ず7」です（1と6、2と5、3と4）。対面を見つければ一瞬で解けます！';

        return {
          signature,
          puzzle: {
            question: `一般的なサイコロの展開図です。向かい合う面の目の合計が【7】になるとき、【？】に入る数はどれ？`,
            correctAnswer: String(correctVal),
            options,
            explanation,
            examTip,
            gridCols: tpl.gridCols,
            grid
          }
        };
      }
    } else {
      // Opposite face mark puzzle
      const marks = ['A', 'B', 'C', 'D', 'E', 'F'];
      const qFace = chosenPair[0];
      const correctAns = chosenPair[1];

      const signature = `cubenet:face_${tpl.id}_q${qFace}_ans${correctAns}`;
      if (!solvedSignatures.has(signature)) {
        const grid = tpl.cells.map((cell) => {
          if (!cell) return null;
          const isQ = cell.id === qFace;
          return {
            label: cell.id,
            bg: isQ ? 'bg-indigo-100' : 'bg-white',
            border: isQ ? 'border-indigo-500 border-2' : 'border-slate-300',
            textClass: isQ ? 'text-indigo-700 font-black' : 'text-slate-800 font-bold'
          };
        });

        const options = marks.filter((m) => m !== qFace).slice(0, 4);
        if (!options.includes(correctAns)) {
          options[0] = correctAns;
        }
        const shuffledOptions = shuffle(options);

        const explanation = `この展開図を立体に組み立てると、面【${qFace}】の真反対（対面）に来る面は【${correctAns}】です！一直線に並ぶ面は1つ飛ばしで向かい合います。`;
        const examTip = '【中学入試の鉄則】展開図で同じ列に並ぶ面は「1マス飛ばし」で向かい合う面（対面）になります！';

        return {
          signature,
          puzzle: {
            question: `この立方体の展開図を組み立てたとき、面【${qFace}】と向かい合う面（対面）はどれ？`,
            correctAnswer: correctAns,
            options: shuffledOptions,
            explanation,
            examTip,
            gridCols: tpl.gridCols,
            grid
          }
        };
      }
    }
  }

  // Fallback
  return {
    signature: `cubenet:fallback_${Date.now()}`,
    puzzle: {
      question: '面【A】と向かい合う面はどれ？',
      correctAnswer: 'F',
      options: ['B', 'C', 'D', 'F'],
      explanation: '上下に出っ張った面同士（AとF）が向かい合います。',
      examTip: '対面関係の法則を覚えよう！',
      gridCols: 4,
      grid: [
        null, { label: 'A', bg: 'bg-indigo-100', border: 'border-indigo-400', textClass: 'text-indigo-700' }, null, null,
        { label: 'B' }, { label: 'C' }, { label: 'D' }, { label: 'E' },
        null, { label: 'F' }, null, null
      ]
    }
  };
};

// =============================================================================
// 6. Technology Island: Algo Maze Puzzle Generator
// =============================================================================

export const generateMazePuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: any; signature: string } => {
  type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';
  const gridSize = grade <= 4 ? 4 : 5;

  for (let attempt = 0; attempt < 100; attempt++) {
    const start = { x: 0, y: 0, dir: 'RIGHT' as Direction };
    const goal = { x: gridSize - 1, y: randInt(1, gridSize - 1) };

    // Generate random obstacles avoiding start and goal
    const walls: { x: number; y: number }[] = [];
    const numWalls = grade <= 4 ? randInt(2, 3) : randInt(3, 5);

    const isStartOrGoal = (x: number, y: number) =>
      (x === start.x && y === start.y) || (x === goal.x && y === goal.y);

    while (walls.length < numWalls) {
      const wx = randInt(0, gridSize - 1);
      const wy = randInt(0, gridSize - 1);
      if (!isStartOrGoal(wx, wy) && !walls.some((w) => w.x === wx && w.y === wy)) {
        walls.push({ x: wx, y: wy });
      }
    }

    // BFS to ensure reachable
    const queue: { x: number; y: number; dist: number }[] = [{ x: start.x, y: start.y, dist: 0 }];
    const visited = new Set<string>([`${start.x},${start.y}`]);
    let reached = false;
    let shortestDist = 0;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.x === goal.x && curr.y === goal.y) {
        reached = true;
        shortestDist = curr.dist;
        break;
      }

      const neighbors = [
        { x: curr.x + 1, y: curr.y },
        { x: curr.x - 1, y: curr.y },
        { x: curr.x, y: curr.y + 1 },
        { x: curr.x, y: curr.y - 1 }
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < gridSize && n.y >= 0 && n.y < gridSize) {
          const key = `${n.x},${n.y}`;
          if (!visited.has(key) && !walls.some((w) => w.x === n.x && w.y === n.y)) {
            visited.add(key);
            queue.push({ x: n.x, y: n.y, dist: curr.dist + 1 });
          }
        }
      }
    }

    if (!reached || shortestDist < 3) continue;

    const signature = `algo:g${gridSize}_g${goal.x}${goal.y}_w${walls.map((w) => `${w.x},${w.y}`).sort().join(';')}`;
    if (!solvedSignatures.has(signature)) {
      const maxCommands = shortestDist + 4; // allow rotations and buffer
      const explanation = `スタートからゴール (${goal.x + 1}, ${goal.y + 1}) へは、障害物を避けながら進みます。ロボットの向いている方向（最初：右向き）に注意して「前進」と「回転」を組み合わせましょう！`;
      const examTip = '【中学入試・情報的思考】自分自身がロボットに乗っている気持ちで「自分から見て右折か左折か」を考えると向きを間違えません！';

      return {
        signature,
        puzzle: {
          gridSize,
          start,
          goal,
          walls,
          maxCommands,
          explanation,
          examTip
        }
      };
    }
  }

  // Fallback
  return {
    signature: `algo:fallback_${Date.now()}`,
    puzzle: {
      gridSize: 4,
      start: { x: 0, y: 0, dir: 'RIGHT' as Direction },
      goal: { x: 2, y: 2 },
      walls: [{ x: 1, y: 1 }, { x: 0, y: 2 }],
      maxCommands: 8,
      explanation: '障害物をよけて前進・回転のプログラムを組もう！',
      examTip: 'ロボット目線で向きを考えよう！'
    }
  };
};

// =============================================================================
// Science Island: Circuit Puzzle Generator
// =============================================================================

export const generateCircuitPuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: any; signature: string } => {
  const g = Math.min(Math.max(grade, 3), 6);

  for (let attempt = 0; attempt < 100; attempt++) {
    const seed = randInt(1000, 9999);
    const signature = `circuit:g${g}_seed${seed}`;
    if (solvedSignatures.has(signature)) continue;

    let puzzle: any;
    if (g === 3) {
      const targetBulb = Math.random() > 0.5 ? 'A' : 'B';
      puzzle = {
        id: `daily_circuit_${seed}`,
        title: 'スイッチ配線チャレンジ',
        subtitle: `電球${targetBulb}を点灯させよう！`,
        question: `スイッチSW1とSW2を操作して、【電球${targetBulb}だけを点灯】させてください！`,
        puzzleType: 'switch_target',
        batteries: [{ id: 'b1', label: '乾電池 1個', x: 120, y: 240, count: 1, connection: 'series' }],
        bulbs: [
          { id: 'A', label: '豆電球A', x: 250, y: 70 },
          { id: 'B', label: '豆電球B', x: 250, y: 150 }
        ],
        switches: [
          { id: 'SW1', label: 'SW1 (A用)', x: 380, y: 70, defaultOn: false },
          { id: 'SW2', label: 'SW2 (B用)', x: 380, y: 150, defaultOn: false }
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
        calculateState: (sw: any) => ({
          bulbBrightness: {
            A: sw['SW1'] ? 1 : 0,
            B: sw['SW2'] ? 1 : 0
          }
        }),
        targetCondition: {
          requiredOn: [targetBulb],
          requiredOff: [targetBulb === 'A' ? 'B' : 'A'],
          description: `電球${targetBulb}のみ点灯`
        },
        hint: `電球${targetBulb}につながるスイッチだけをONにしましょう！`,
        explanation: `電球${targetBulb}への回路だけがつながり、見事に目標をクリアしました！`,
        examTip: '【並列のスイッチ】各枝のスイッチで電球を個別に操作できます。'
      };
    } else if (g === 4) {
      const batCount = pickRandom([2, 3]);
      puzzle = {
        id: `daily_circuit_${seed}`,
        title: `乾電池${batCount}個の直列回路`,
        subtitle: '電圧と電流の倍率を答えよう！',
        question: `乾電池${batCount}個をすべて同じ向きに直列につないだとき、豆電球の明るさは乾電池1個の時の何倍？`,
        puzzleType: 'brightness_quiz',
        batteries: [{ id: 'b1', label: `乾電池 ${batCount}個直列`, x: 250, y: 220, count: batCount, connection: 'series' }],
        bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 70 }],
        wireSegments: [],
        calculateState: () => ({ bulbBrightness: { A: batCount } }),
        options: [
          { id: 'o1', text: `${batCount}倍の明るさ（強く光る！）`, correct: true },
          { id: 'o2', text: '1倍（変わらない）', correct: false },
          { id: 'o3', text: `${(batCount / 2).toFixed(1)}倍`, correct: false },
          { id: 'o4', text: `${batCount * 2}倍`, correct: false }
        ],
        hint: `直列につないだ乾電池の数だけ電圧が掛け算されます！`,
        explanation: `乾電池${batCount}個直列では電圧が${batCount}倍になり、流れる電流も${batCount}倍になるため、明るさは${batCount}倍になります！`,
        examTip: '【乾電池直列の公式】電球1個の明るさは、直列につながった乾電池の個数に比例します！'
      };
    } else if (g === 5) {
      const isParallel = Math.random() > 0.5;
      puzzle = isParallel
        ? {
            id: `daily_circuit_${seed}`,
            title: '豆電球2個並列の特性',
            subtitle: '並列回路の明るさを判定！',
            question: '乾電池1個に豆電球2個を並列につないだとき、電球それぞれの明るさは電球1個の時と比べてどうなる？',
            puzzleType: 'brightness_quiz',
            batteries: [{ id: 'b1', label: '乾電池 1個', x: 100, y: 150, count: 1, connection: 'series' }],
            bulbs: [
              { id: 'A', label: '電球A', x: 300, y: 80 },
              { id: 'B', label: '電球B', x: 300, y: 220 }
            ],
            wireSegments: [],
            calculateState: () => ({ bulbBrightness: { A: 1, B: 1 } }),
            options: [
              { id: 'o1', text: 'どちらも「明るさ 1（同じ明るさ）」で光る！', correct: true },
              { id: 'o2', text: 'どちらも「明るさ 1/2」に暗くなる', correct: false },
              { id: 'o3', text: 'どちらも「明るさ 2」になる', correct: false }
            ],
            hint: 'それぞれの電球に乾電池の電圧がそのままかかります！',
            explanation: '並列につなぐと、それぞれの電球に乾電池1個分の電圧が丸々かかるため、明るさは1倍のまま変わりません！',
            examTip: '【豆電球並列のツボ】電球を何個並列にしても、それぞれの明るさは1倍のままです！'
          }
        : {
            id: `daily_circuit_${seed}`,
            title: '豆電球2個直列の特性',
            subtitle: '直列回路の明るさを判定！',
            question: '乾電池1個に豆電球2個を直列につないだとき、電球それぞれの明るさは電球1個の時と比べてどうなる？',
            puzzleType: 'brightness_quiz',
            batteries: [{ id: 'b1', label: '乾電池 1個', x: 250, y: 220, count: 1, connection: 'series' }],
            bulbs: [
              { id: 'A', label: '電球A', x: 180, y: 70 },
              { id: 'B', label: '電球B', x: 320, y: 70 }
            ],
            wireSegments: [],
            calculateState: () => ({ bulbBrightness: { A: 0.5, B: 0.5 } }),
            options: [
              { id: 'o1', text: '抵抗が2倍になり、どちらも「明るさ 1/2」に暗くなる！', correct: true },
              { id: 'o2', text: 'どちらも「明るさ 1」で変わらない', correct: false },
              { id: 'o3', text: 'どちらも「明るさ 2」になる', correct: false }
            ],
            hint: '電球が2つ直列になると、電気の通り道が狭くなります！',
            explanation: '電球2個直列では全体の抵抗が2倍になるため、流れる電流は1/2になり、明るさは半分（1/2）になります！',
            examTip: '【豆電球直列のツボ】電球を直列にすると、個数が増えるほど暗くなります（2個で1/2、3個で1/3）。'
          };
    } else {
      // Grade 6
      puzzle = {
        id: `daily_circuit_${seed}`,
        title: '直並列混列回路の電流比',
        subtitle: '中学入試頻出の黄金比！',
        question: '電球A（直列）の先に、電球Bと電球C（並列）がつながっています。電球Aと電球Bの明るさは？',
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
          { id: 'o1', text: '電球A は「2/3」、電球B は「1/3」', correct: true },
          { id: 'o2', text: '電球A は「1」、電球B は「1/2」', correct: false },
          { id: 'o3', text: '電球A は「1/2」、電球B は「1/4」', correct: false },
          { id: 'o4', text: '電球A と B はどちらも「1/3」', correct: false }
        ],
        hint: '合成抵抗は 1 + 1/2 = 1.5。電流は 1 ÷ 1.5 = 2/3 です！',
        explanation: '回路全体の電流（電球A）は 1 ÷ 1.5 = 2/3！並列の電球Bにはその半分の「1/3」が流れます！',
        examTip: '【混列の基本比】直列球 : 並列球 ＝ 2 : 1！入試超頻出の比率です。'
      };
    }

    return { puzzle, signature };
  }

  return {
    puzzle: {
      id: 'fallback_circuit',
      title: '電気回路パズル',
      subtitle: '',
      question: 'スイッチを入れて電球を光らせよう！',
      puzzleType: 'switch_target',
      batteries: [{ id: 'b1', label: '乾電池 1個', x: 150, y: 220, count: 1, connection: 'series' }],
      bulbs: [{ id: 'A', label: '豆電球A', x: 250, y: 80 }],
      switches: [{ id: 'SW1', label: 'スイッチ', x: 350, y: 220, defaultOn: false }],
      wireSegments: [],
      calculateState: (sw: any) => ({ bulbBrightness: { A: sw['SW1'] ? 1 : 0 } }),
      targetCondition: { requiredOn: ['A'], requiredOff: [], description: '電球Aを点灯' },
      hint: 'スイッチをONにしましょう。',
      explanation: '正解です！',
      examTip: '【基本】回路がつながると電気が流れます。'
    },
    signature: `circuit:fallback_${Date.now()}`
  };
};

// =============================================================================
// Contraption Puzzle Generator (Daily Challenge / Procedural)
// =============================================================================

export const generateContraptionPuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: any; signature: string } => {
  const g = Math.min(Math.max(grade, 3), 6);

  for (let attempt = 0; attempt < 100; attempt++) {
    const seed = randInt(1000, 9999);
    const signature = `contraption:g${g}_seed${seed}`;
    if (solvedSignatures.has(signature)) continue;

    let puzzle: any;
    if (g === 3) {
      puzzle = {
        id: `daily_ct_${seed}`,
        title: '坂道とスピードのひみつ',
        subtitle: '急な坂とゆるやかな坂',
        question: '斜面レールを急にすると、球が転がり落ちる速さはどうなる？',
        puzzleType: 'physics_quiz',
        options: [
          { id: 'opt1', text: 'とても速くなる！', correct: true },
          { id: 'opt2', text: 'とても遅くなる', correct: false },
          { id: 'opt3', text: 'まったく変わらない', correct: false }
        ],
        hint: '滑り台が急なとき、スピードがどうなるか思い出してみよう！',
        explanation: '正解！坂道が急になるほど、重力によって球を引っ張る力が大きくなり、スピードが一気に加速します！',
        examTip: '【斜面の基本】傾きが急なほど球は速く加速します！'
      };
    } else if (g === 4) {
      puzzle = {
        id: `daily_ct_${seed}`,
        title: 'バネの跳躍と角度の科学',
        subtitle: '一番遠くまで飛ばす角度！',
        question: '球をバネ（トランポリン）にぶつけるとき、球が一番遠くまで飛ぶ発射角度は何度かな？',
        puzzleType: 'physics_quiz',
        options: [
          { id: 'opt1', text: '45度（ななめ45度）', correct: true },
          { id: 'opt2', text: '90度（真上）', correct: false },
          { id: 'opt3', text: '15度（ほぼ水平）', correct: false },
          { id: 'opt4', text: '75度（ほぼ真上）', correct: false }
        ],
        hint: '高すぎても遠くへ行かず、低すぎてもすぐ地面に落ちてしまいます。',
        explanation: '正解は「45度」！物理学において、空気抵抗を考えない場合、角度45度で打ち出すと最も遠くまで飛びます！',
        examTip: '【最長到達距離の角度】中学入試でも問われる「45度の法則」！高さと前進のバランスが最も良い角度です！'
      };
    } else if (g === 5) {
      puzzle = {
        id: `daily_ct_${seed}`,
        title: 'シーソーてこの力学連鎖',
        subtitle: '重さと距離のモーメント計算！',
        question: 'シーソーの左（支点から距離4）に20gの球が落ちました。右の距離2の球と釣り合うには右の球は何g？',
        puzzleType: 'physics_quiz',
        options: [
          { id: 'opt1', text: '40g', correct: true },
          { id: 'opt2', text: '20g', correct: false },
          { id: 'opt3', text: '10g', correct: false },
          { id: 'opt4', text: '80g', correct: false }
        ],
        hint: '左の力（4 × 20）＝ 右の力（2 × ？）',
        explanation: '正解は「40g」！左のモーメントは「4 × 20 = 80」。右も80にするには「80 ÷ 2 = 40g」が必要です！',
        examTip: '【てこの原理】「支点からの距離 × 重さ」が左右で等しくなると釣り合います！'
      };
    } else {
      // Grade 6
      puzzle = {
        id: `daily_ct_${seed}`,
        title: '位置エネルギーと仕事の比例関係',
        subtitle: '高さと移動距離の実験！',
        question: '高さ10cmの坂から球を落として木片に当てたら2cm動いたよ。高さを20cm（2倍）にして落としたら木片は何cm動く？',
        puzzleType: 'physics_quiz',
        options: [
          { id: 'opt1', text: '約 4cm（2倍動く）', correct: true },
          { id: 'opt2', text: '約 2cm（変わらない）', correct: false },
          { id: 'opt3', text: '約 1cm（半分になる）', correct: false },
          { id: 'opt4', text: '約 8cm（4倍動く）', correct: false }
        ],
        hint: '球の持つ位置エネルギーは「高さ」にきれいに比例します！',
        explanation: '正解は「約 4cm」！球の持つ位置エネルギーは高さに比例するため、高さが2倍になれば衝突した木片を動かす仕事も2倍（2cm × 2 = 4cm）になります！',
        examTip: '【中学入試力学の最重要グラフ】「落とす高さ」と「木片の移動距離」は正比例します！'
      };
    }

    return { puzzle, signature };
  }

  return {
    puzzle: {
      id: 'fallback_contraption',
      title: 'ピタゴラ物理連鎖',
      subtitle: '',
      question: '坂道を転がしてゴールを目指そう！',
      puzzleType: 'physics_quiz',
      options: [{ id: 'opt1', text: 'スタート！', correct: true }],
      hint: '球を転がそう',
      explanation: '正解です！',
      examTip: '【基本】重力で球は転がります。'
    },
    signature: `contraption:fallback_${Date.now()}`
  };
};

// =============================================================================
// Art Island: Solid Cross-Section Puzzle Generator
// =============================================================================

export interface CrossSectionCutPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  description: string;
}

export interface GeneratedCrossSectionPuzzle {
  id: string;
  title: string;
  subtitle: string;
  question: string;
  puzzleType: 'slice_identify' | 'slice_exam_quiz';
  cutPoints: CrossSectionCutPoint[];
  polygonShape: string;
  polygonVertices: { x: number; y: number; z: number }[];
  options: { id: string; text: string; correct: boolean }[];
  explanation: string;
  examTip: string;
}

export const generateCrossSectionPuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: GeneratedCrossSectionPuzzle; signature: string } => {
  const patterns = [
    {
      key: 'equilateral_tri',
      title: '立方体のカド切り落とし（正三角形）',
      subtitle: '合同な3本の対角線がつくる切り口',
      question: '立方体の1つの頂点から広がる3辺の長さがすべて等しい点（頂点3つ）を通る平面で切断したよ。切り口の断面は何の図形かな？',
      polygonShape: '正三角形',
      cutPoints: [
        { id: 'p1', label: 'P', x: 1, y: 0, z: 0, description: '頂点B' },
        { id: 'p2', label: 'Q', x: 0, y: 1, z: 0, description: '頂点D' },
        { id: 'p3', label: 'R', x: 0, y: 0, z: 1, description: '頂点E' }
      ],
      polygonVertices: [
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 }
      ],
      options: [
        { text: '3辺の長さが等しい「正三角形」', correct: true },
        { text: '2辺だけ等しい「二等辺三角形」', correct: false },
        { text: '1つの角が90度の「直角二等辺三角形」', correct: false },
        { text: '角が削れた「台形」', correct: false }
      ],
      explanation: '正解は「正三角形」！立方体の3つの正方形の面の対角線が切り口の3辺となり、どの対角線も長さが完全に等しいため、正三角形になります！',
      examTip: '【切断の基本】頂点や等距離の点を結ぶと、正方形の対角線で構成される美しい正三角形が現れます！'
    },
    {
      key: 'isosceles_trapezoid',
      title: '平行面の法則と台形断面',
      subtitle: '向かい合う面の切り口は必ず平行！',
      question: '立方体の上面の2辺の中点と、底面の向かい合う2辺の中点を通る平面で斜めにスライスしたよ。切り口の断面は何の図形かな？',
      polygonShape: '等脚台形',
      cutPoints: [
        { id: 'p1', label: 'P', x: 0.5, y: 0, z: 0, description: '上辺の中点' },
        { id: 'p2', label: 'Q', x: 0, y: 0.5, z: 0, description: '左上辺の中点' },
        { id: 'p3', label: 'R', x: 0, y: 1, z: 1, description: '底面の頂点' },
        { id: 'p4', label: 'S', x: 1, y: 0, z: 1, description: '底面の頂点' }
      ],
      polygonVertices: [
        { x: 0.5, y: 0, z: 0 },
        { x: 0, y: 0.5, z: 0 },
        { x: 0, y: 1, z: 1 },
        { x: 1, y: 0, z: 1 }
      ],
      options: [
        { text: '上底と下底が平行な「等脚台形」', correct: true },
        { text: '向かい合う2組の辺が平行な「平行四辺形」', correct: false },
        { text: 'すべての辺が等しい「ひし形」', correct: false },
        { text: '3辺の「三角形」', correct: false }
      ],
      explanation: '正解は「等脚台形」！上面と底面は平行なので、切り口の線も必ず互いに平行になります（平行面の法則）。上底と下底の長さが異なるため、等脚台形になります！',
      examTip: '【切断の第2鉄則】向かい合う平行な面にあらわれる切り口の線は「必ず平行」になります！中学入試の最頻出作図定理です！'
    },
    {
      key: 'regular_hexagon',
      title: '奇跡の正六角形断面',
      subtitle: '各辺の中点6個を結ぶ究極の断面！',
      question: '立方体の向かい合う6本の辺の「ちょうど真ん中（中点）」を次々と通る平面でスパッと切断したよ。切り口は何の図形かな？',
      polygonShape: '正六角形',
      cutPoints: [
        { id: 'p1', label: 'A', x: 0.5, y: 0, z: 0, description: '中点1' },
        { id: 'p2', label: 'B', x: 1, y: 0.5, z: 0, description: '中点2' },
        { id: 'p3', label: 'C', x: 1, y: 1, z: 0.5, description: '中点3' },
        { id: 'p4', label: 'D', x: 0.5, y: 1, z: 1, description: '中点4' },
        { id: 'p5', label: 'E', x: 0, y: 0.5, z: 1, description: '中点5' },
        { id: 'p6', label: 'F', x: 0, y: 0, z: 0.5, description: '中点6' }
      ],
      polygonVertices: [
        { x: 0.5, y: 0, z: 0 },
        { x: 1, y: 0.5, z: 0 },
        { x: 1, y: 1, z: 0.5 },
        { x: 0.5, y: 1, z: 1 },
        { x: 0, y: 0.5, z: 1 },
        { x: 0, y: 0, z: 0.5 }
      ],
      options: [
        { text: 'すべての辺と角が等しい「正六角形」！', correct: true },
        { text: '辺の長さがバラバラの「不等辺六角形」', correct: false },
        { text: '5辺の「正五角形」', correct: false },
        { text: '大きな「正八角形」', correct: false }
      ],
      explanation: '正解は「正六角形」！向かい合う6辺の中点を通る切断面は、すべての辺が直角二等辺三角形の斜辺（長さが全て等しい）になり、内角もすべて120度になるため完璧な正六角形を描きます！',
      examTip: '【中学受験の至宝・正六角形】立方体の切断で最も美しく難関校で出題される断面！向かい合う辺が3組すべて平行になります！'
    },
    {
      key: 'impossible_seven',
      title: '切断の幾何学限界定理',
      subtitle: '作ることが不可能な多角形は？',
      question: '立方体を「1つの平面」でスパッと切断したとき、切り口の多角形として【絶対に作ることができない】ものはどれかな？',
      polygonShape: '限界定理',
      cutPoints: [],
      polygonVertices: [],
      options: [
        { text: '面が足りず絶対に切れない「七角形」', correct: true },
        { text: 'カドを切ってできる「三角形」', correct: false },
        { text: '面を5つ通ってできる「五角形」', correct: false },
        { text: '面を6つすべて通る「六角形」', correct: false }
      ],
      explanation: '正解は「七角形」！立方体には面が「6つ」しかありません。1つの平面が1つの面と交わってできる切り口の線は最大1本なので、切り口の辺は最大でも6本まで。したがって七角形以上の多角形は絶対にできません！',
      examTip: '【切断の限界法則】立体の面の数が多角形の頂点（辺）の最大数！立方体（6面体）の切断面は最大で六角形です！'
    },
    {
      key: 'center_split_volume',
      title: '立方体の中心を通る2等分切断',
      subtitle: 'どんな角度でも半分になる秘密',
      question: '1辺が6cmの立方体（体積216cm³）を、立方体のちょうど中心（重心）を通る平面で斜めに切断しました。切り分けられた2つの立体の体積はどうなるかな？',
      polygonShape: '体積2等分',
      cutPoints: [],
      polygonVertices: [],
      options: [
        { text: 'どんな向きで切っても「ぴったり半分の108cm³ずつ」！', correct: true },
        { text: '斜めに切ると必ず「120cm³と96cm³」に偏る', correct: false },
        { text: '角度によって「3:1」や「4:1」に変わる', correct: false }
      ],
      explanation: '正解は「ぴったり半分の108cm³ずつ」！立方体は中心に対して点対称な立体です。中心を通る平面で切断すると、分けられた2つの立体は必ず点対称で合同（または体積が等しい）になるため、常に体積は1:1の半分（216÷2=108cm³）になります！',
      examTip: '【中心切断の二等分定理】点対称な立体の中心を通る平面は、体積を確実に2等分します！難関中の大問で大きな武器になります！'
    }
  ];

  for (const pat of patterns) {
    const signature = `cross_section:${pat.key}_g${grade}`;
    if (!solvedSignatures.has(signature)) {
      const opts = pat.options.map((o, idx) => ({
        id: `opt_${idx + 1}`,
        text: o.text,
        correct: o.correct
      }));
      return {
        signature,
        puzzle: {
          id: `gen_${pat.key}`,
          title: pat.title,
          subtitle: pat.subtitle,
          question: pat.question,
          puzzleType: pat.polygonShape.includes('定理') || pat.polygonShape.includes('体積') ? 'slice_exam_quiz' : 'slice_identify',
          cutPoints: pat.cutPoints,
          polygonShape: pat.polygonShape,
          polygonVertices: pat.polygonVertices,
          options: opts,
          explanation: pat.explanation,
          examTip: pat.examTip
        }
      };
    }
  }

  // Fallback pattern
  const fallback = patterns[0];
  const fallbackSig = `cross_section:${fallback.key}_fallback_${Date.now()}`;
  return {
    signature: fallbackSig,
    puzzle: {
      id: 'gen_fallback',
      title: fallback.title,
      subtitle: fallback.subtitle,
      question: fallback.question,
      puzzleType: 'slice_identify',
      cutPoints: fallback.cutPoints,
      polygonShape: fallback.polygonShape,
      polygonVertices: fallback.polygonVertices,
      options: fallback.options.map((o, idx) => ({ id: `opt_${idx + 1}`, text: o.text, correct: o.correct })),
      explanation: fallback.explanation,
      examTip: fallback.examTip
    }
  };
};

// =============================================================================
// Tech Island: Binary & Logic Gate Cipher Puzzle Generator
// =============================================================================

export const generateBinaryCipherPuzzle = (
  solvedSignatures: Set<string>,
  grade: number = 4
): { puzzle: any; signature: string } => {
  const g = Math.min(Math.max(grade, 3), 6);

  for (let attempt = 0; attempt < 100; attempt++) {
    const seed = randInt(1000, 9999);
    const signature = `cipher:g${g}_seed${seed}`;
    if (solvedSignatures.has(signature)) continue;

    let puzzle: any;
    if (g === 3) {
      // 2進数 4ビット変換（例: 8 + 2 + 1 = 11）
      const decimalVal = randInt(1, 15);
      const b3 = (decimalVal & 8) ? 1 : 0;
      const b2 = (decimalVal & 4) ? 1 : 0;
      const b1 = (decimalVal & 2) ? 1 : 0;
      const b0 = (decimalVal & 1) ? 1 : 0;
      const binaryStr = `${b3}${b2}${b1}${b0}`;

      puzzle = {
        id: `daily_cipher_${seed}`,
        title: '2進数ビット暗号解読ミッション',
        subtitle: `十進数「${decimalVal}」を4ビットで作ろう！`,
        question: `コンピュータは0と1だけで数を数えます。4つのスイッチ（8, 4, 2, 1）を使って、十進数の「${decimalVal}」を表す2進数はどれかな？`,
        puzzleType: 'binary_match',
        targetDecimal: decimalVal,
        options: [
          { id: 'opt_correct', text: `${binaryStr}₂`, correct: true },
          { id: 'opt_w1', text: `${(b3 ? 0 : 1)}${b2}${b1}${b0}₂`, correct: false },
          { id: 'opt_w2', text: `${b3}${(b2 ? 0 : 1)}${b1}${b0}₂`, correct: false },
          { id: 'opt_w3', text: `${b3}${b2}${(b1 ? 0 : 1)}${b0}₂`, correct: false }
        ],
        explanation: `正解！2進数「${binaryStr}₂」は、8の位が${b3}、4の位が${b2}、2の位が${b1}、1の位が${b0}なので、合計は ${decimalVal} になります！`,
        examTip: '【2進数の位取り】右から順に「1, 2, 4, 8, 16...」と2倍ずつ位が大きくなります！'
      };
    } else if (g === 4) {
      // 論理ゲート（AND, OR, NOT）
      const gates = [
        { type: 'AND', question: 'スイッチAとスイッチBの両方がONの時だけLEDが点灯する論理回路はどれかな？', answer: 'ANDゲート（論理積回路）', tip: '両方成立で1になるのがAND！' },
        { type: 'OR', question: 'スイッチAまたはスイッチBの少なくともどちらか一方がONなら警報が鳴る回路はどれかな？', answer: 'ORゲート（論理和回路）', tip: 'いずれかが1で1になるのがOR！' },
        { type: 'NOT', question: '入力がOFF（0）のときにLEDが点灯（1）し、入力がON（1）のときに消灯（0）する反転回路は？', answer: 'NOTゲート（論理否定回路）', tip: '0と1を真逆にひっくり返すのがNOT！' }
      ];
      const selected = gates[seed % gates.length];

      puzzle = {
        id: `daily_cipher_${seed}`,
        title: '基本論理ゲート照合パズル',
        subtitle: `${selected.type}回路の働きを当てよう！`,
        question: selected.question,
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt_correct', text: selected.answer, correct: true },
          { id: 'opt_w1', text: selected.type === 'AND' ? 'ORゲート（論理和回路）' : 'ANDゲート（論理積回路）', correct: false },
          { id: 'opt_w2', text: 'XORゲート（排他的論理和回路）', correct: false },
          { id: 'opt_w3', text: '直列抵抗回路', correct: false }
        ],
        explanation: `大正解！${selected.answer}です。${selected.tip}`,
        examTip: '【論理回路の3大基本ゲート】AND・OR・NOTの組み合わせがあらゆるコンピュータ演算の原点です！'
      };
    } else if (g === 5) {
      // シーザー暗号
      const shift = 1 + (seed % 3);
      puzzle = {
        id: `daily_cipher_${seed}`,
        title: 'シーザー暗号解読チャレンジ',
        subtitle: `シフト量 +${shift} の秘密メッセージ`,
        question: `古代ローマのカエサル（シーザー）が使った文字シフト暗号です。アルファベットを「+${shift}」文字ずらす暗号で、【D O G】を暗号化するとどうなるかな？`,
        puzzleType: 'cipher_quiz',
        options: [
          { id: 'opt_correct', text: shift === 1 ? 'E P H' : shift === 2 ? 'F Q I' : 'G R J', correct: true },
          { id: 'opt_w1', text: 'C N F', correct: false },
          { id: 'opt_w2', text: 'D O G', correct: false },
          { id: 'opt_w3', text: 'Z B C', correct: false }
        ],
        explanation: `正解！各文字をアルファベット順に+${shift}文字進めると、暗号メッセージが完成します！`,
        examTip: '【シーザー暗号】文字を一定数スライドさせる換字式暗号の代表格！中学入試の規則性・暗号問題で頻出です！'
      };
    } else {
      // 小6: 半加算器（Half Adder）
      puzzle = {
        id: `daily_cipher_${seed}`,
        title: '半加算器（Half Adder）の計算原理',
        subtitle: '1ビットの足し算を論理ゲートで作る！',
        question: '入力 A=1, B=1 のとき、1ビットの和 Sum (A ⊕ B) と繰り上がり Carry (A · B) の出力はどうなるかな？',
        puzzleType: 'logic_quiz',
        options: [
          { id: 'opt_correct', text: '和 Sum＝0、繰り上がり Carry＝1', correct: true },
          { id: 'opt_w1', text: '和 Sum＝1、繰り上がり Carry＝0', correct: false },
          { id: 'opt_w2', text: '和 Sum＝1、繰り上がり Carry＝1', correct: false },
          { id: 'opt_w3', text: '和 Sum＝0、繰り上がり Carry＝0', correct: false }
        ],
        explanation: '正解！1 + 1 = 2（二進数で 10₂）。XORゲートで出力される和 Sum は「0」、ANDゲートで出力される繰り上がり Carry は「1」となります！',
        examTip: '【半加算器の美しさ】和はXOR、繰り上がりはAND！わずか2つのゲートで算数の足し算が実現します！'
      };
    }

    return { puzzle, signature };
  }

  // Fallback
  return {
    signature: `cipher:g${g}_fallback`,
    puzzle: {
      id: 'daily_cipher_fallback',
      title: '論理回路＆2進数暗号ミッション',
      subtitle: '2進数の秘密を解き明かそう！',
      question: '2進数の「1010₂」は十進数でいくつかな？',
      puzzleType: 'binary_match',
      options: [
        { id: 'opt1', text: '10', correct: true },
        { id: 'opt2', text: '8', correct: false },
        { id: 'opt3', text: '12', correct: false }
      ],
      explanation: '正解は「10」！8 + 2 = 10 となります！',
      examTip: '各ビットの重みを足し算しよう！'
    }
  };
};

// =============================================================================
// Master Daily Challenge Generator (5 Questions: 1 from each island)
// =============================================================================

export const generateDailyChallenge = (
  solvedSignaturesList: string[],
  dateStr: string,
  grade: number = 4
): DailyChallengeState => {
  const solvedSet = new Set<string>(solvedSignaturesList);

  const dateDay = parseInt(dateStr.split('-')[2] || '1', 10);

  // 1. Science Island: Alternate between Lever and Circuit by day
  const scienceIsCircuit = dateDay % 2 === 0;
  const scienceQuestion = scienceIsCircuit
    ? {
        gameType: 'circuit' as const,
        title: '豆電球と電気回路パズル',
        ...generateCircuitPuzzle(solvedSet, grade)
      }
    : {
        gameType: 'lever' as const,
        title: 'てこ天秤パズル',
        ...generateLeverPuzzle(solvedSet, grade)
      };

  // 2. Math Island: Alternate between Tsurukame and Block Count by day
  const mathIsTsuru = dateDay % 2 === 1;
  const mathQuestion = mathIsTsuru
    ? {
        gameType: 'tsurukame' as const,
        title: 'つるかめ算アリーナ',
        ...generateTsurukamePuzzle(solvedSet, grade)
      }
    : {
        gameType: 'block' as const,
        title: '立体ブロック積み木数え',
        ...generateBlockPuzzle(solvedSet, grade)
      };

  // 3. Engineering Island: Alternate between Gear and Contraption by day
  const engIsContraption = dateDay % 2 === 0;
  const engQuestion = engIsContraption
    ? {
        gameType: 'contraption' as const,
        title: 'からくりピタゴラ物理連鎖パズル',
        ...generateContraptionPuzzle(solvedSet, grade)
      }
    : {
        gameType: 'gear' as const,
        title: '歯車伝達パズル',
        ...generateGearPuzzle(solvedSet, grade)
      };

  // 4. Art Island: Alternate between Cube Net and Cross Section by day
  const artIsCrossSection = dateDay % 2 === 0;
  const artQuestion = artIsCrossSection
    ? {
        gameType: 'cross_section' as const,
        title: '立体の切断・断面幾何パズル',
        ...generateCrossSectionPuzzle(solvedSet, grade)
      }
    : {
        gameType: 'cube_net' as const,
        title: '立体展開図マスター',
        ...generateCubeNetPuzzle(solvedSet, grade)
      };

  // 5. Tech Island: Alternate between Algo Maze and Binary Cipher by day
  const techIsBinaryCipher = dateDay % 2 === 0;
  const techQuestion = techIsBinaryCipher
    ? {
        gameType: 'binary_cipher' as const,
        title: '論理回路＆2進数・暗号パズル',
        ...generateBinaryCipherPuzzle(solvedSet, grade)
      }
    : {
        gameType: 'algo_maze' as const,
        title: 'アルゴ・迷路',
        ...generateMazePuzzle(solvedSet, grade)
      };

  const questions: DailyChallengeQuestion[] = [
    {
      islandId: 'science',
      islandName: 'サイエンス島',
      islandIcon: '🔬',
      gameType: scienceQuestion.gameType,
      title: scienceQuestion.title,
      signature: scienceQuestion.signature,
      puzzle: scienceQuestion.puzzle
    },
    {
      islandId: 'math',
      islandName: 'マス・アイランド',
      islandIcon: '📐',
      gameType: mathQuestion.gameType,
      title: mathQuestion.title,
      signature: mathQuestion.signature,
      puzzle: mathQuestion.puzzle
    },
    {
      islandId: 'engineering',
      islandName: 'エンジニア鉱山',
      islandIcon: '⚙️',
      gameType: engQuestion.gameType,
      title: engQuestion.title,
      signature: engQuestion.signature,
      puzzle: engQuestion.puzzle
    },
    {
      islandId: 'art',
      islandName: 'デザイン神殿',
      islandIcon: '🎨',
      gameType: artQuestion.gameType,
      title: artQuestion.title,
      signature: artQuestion.signature,
      puzzle: artQuestion.puzzle
    },
    {
      islandId: 'tech',
      islandName: 'テックラボ',
      islandIcon: '💻',
      gameType: techQuestion.gameType,
      title: techQuestion.title,
      signature: techQuestion.signature,
      puzzle: techQuestion.puzzle
    }
  ];

  return {
    date: dateStr,
    questions,
    clearedIndices: [],
    completed: false
  };
};

