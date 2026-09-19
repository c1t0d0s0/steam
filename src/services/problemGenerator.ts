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
// Master Daily Challenge Generator (5 Questions: 1 from each island)
// =============================================================================

export const generateDailyChallenge = (
  solvedSignaturesList: string[],
  dateStr: string,
  grade: number = 4
): DailyChallengeState => {
  const solvedSet = new Set<string>(solvedSignaturesList);

  // 1. Science Island: Lever Balance
  const lever = generateLeverPuzzle(solvedSet, grade);

  // 2. Math Island: Alternate between Tsurukame and Block Count by day
  const dateDay = parseInt(dateStr.split('-')[2] || '1', 10);
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

  // 3. Engineering Island: Gear Chain
  const gear = generateGearPuzzle(solvedSet, grade);

  // 4. Art Island: Cube Net
  const cubeNet = generateCubeNetPuzzle(solvedSet, grade);

  // 5. Tech Island: Algo Maze
  const algoMaze = generateMazePuzzle(solvedSet, grade);

  const questions: DailyChallengeQuestion[] = [
    {
      islandId: 'science',
      islandName: 'サイエンス島',
      islandIcon: '🔬',
      gameType: 'lever',
      title: 'てこ天秤の釣り合い',
      signature: lever.signature,
      puzzle: lever.puzzle
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
      gameType: 'gear',
      title: '歯車伝達パズル',
      signature: gear.signature,
      puzzle: gear.puzzle
    },
    {
      islandId: 'art',
      islandName: 'デザイン神殿',
      islandIcon: '🎨',
      gameType: 'cube_net',
      title: '立体展開図マスター',
      signature: cubeNet.signature,
      puzzle: cubeNet.puzzle
    },
    {
      islandId: 'tech',
      islandName: 'テックラボ',
      islandIcon: '🤖',
      gameType: 'algo_maze',
      title: 'アルゴ・迷路',
      signature: algoMaze.signature,
      puzzle: algoMaze.puzzle
    }
  ];

  return {
    date: dateStr,
    questions,
    clearedIndices: [],
    completed: false
  };
};
