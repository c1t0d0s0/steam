export interface CollectibleItem {
  id: string;
  name: string;
  category: 'S' | 'T' | 'E' | 'A' | 'M';
  rarity: 1 | 2 | 3;
  icon: string;
  tagline: string;
  description: string;
  examTrivia: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'mastery' | 'collection';
}

export interface UserProgress {
  name: string;
  grade: number; // 3 to 6
  furiganaEnabled: boolean;
  soundEnabled: boolean;
  level: number;
  xp: number;
  coins: number;
  stamps: string[]; // YYYY-MM-DD
  lastStampDate: string | null;
  unlockedItems: string[]; // item ids
  unlockedBadges: string[]; // badge ids
  stageProgress: Record<string, { stars: number; cleared: boolean; bestScore?: number }>;
}

export const ITEMS: CollectibleItem[] = [
  // Science (S)
  {
    id: 's_lever',
    name: 'アルキメデスの金のてこ',
    category: 'S',
    rarity: 3,
    icon: '⚖️',
    tagline: '「支点さえあれば、地球も動かしてみせる！」',
    description: '紀元前の大天才アルキメデスが発見した、小さな力で重いものを持ち上げる道具。',
    examTrivia: '【中学受験のツボ】「支点からの距離 × おもりの重さ」が左右で同じになると釣り合います！'
  },
  {
    id: 's_microscope',
    name: 'レーウェンフックの顕微鏡',
    category: 'S',
    rarity: 2,
    icon: '🔬',
    tagline: '目に見えない小さなミクロの世界を発見！',
    description: '微生物や細胞を人類で初めて観察した顕微鏡。小さなレンズに大きなロマンが詰まっています。',
    examTrivia: '【中学受験のツボ】顕微鏡は「低倍率から高倍率」へ！倍率を上げると視野は狭く、暗くなります。'
  },
  {
    id: 's_bulb',
    name: 'エジソンの竹フィラメント電球',
    category: 'S',
    rarity: 2,
    icon: '💡',
    tagline: '京都八幡の竹を使って世界を照らした発明！',
    description: '発明王エジソンが、日本の竹を使って長持ちする電球を完成させました。',
    examTrivia: '【中学受験のツボ】乾電池を「並列」にすると長持ちし、「直列」にすると電球が明るくなります！'
  },
  {
    id: 's_prism',
    name: 'ニュートンの光のプリズム',
    category: 'S',
    rarity: 1,
    icon: '🌈',
    tagline: '白い光の中に隠れた７色の虹を取り出すガラス',
    description: '太陽の白い光が実はたくさんの色が混ざり合ってできていることを証明した三角形のガラス。',
    examTrivia: '【中学受験のツボ】光の三原色は「赤・緑・青」。混ぜると明るくなって白色に近づきます！'
  },
  {
    id: 's_meteor',
    name: '夜空をかける流れ星の結晶',
    category: 'S',
    rarity: 3,
    icon: '🌠',
    tagline: '太陽系のかなたからやってきた神秘のかけら',
    description: '宇宙空間を旅してきた流星が残した特別な星の結晶。科学者の夢を叶えてくれます。',
    examTrivia: '【中学受験のツボ】月の満ち欠けは、月が太陽の光を反射して光り、地球の周りを回るから起こります！'
  },

  // Technology (T)
  {
    id: 't_turing',
    name: 'チューリングの思考回路石',
    category: 'T',
    rarity: 3,
    icon: '🧠',
    tagline: 'コンピュータの父が残した論理の結晶',
    description: 'コンピュータが命令を一つずつ順番に処理するアルゴリズムの仕組みを考え出した天才の遺産。',
    examTrivia: '【中学受験のツボ】複雑な問題は「順序立てて場合分け（樹形図）」すると必ず解けます！'
  },
  {
    id: 't_pascaline',
    name: 'パスカルの歯車計算機（パスカリーヌ）',
    category: 'T',
    rarity: 2,
    icon: '🧮',
    tagline: '世界で最初の機械式計算機！',
    description: '税理士のお父さんの計算の手間を減らそうと、19歳のパスカルが発明した歯車マシン。',
    examTrivia: '【中学受験のツボ】くり上がり・くり下がりの仕組みは、歯車の10進法の回転と同じです！'
  },
  {
    id: 't_binary',
    name: '二進法のバイナリ・キー',
    category: 'T',
    rarity: 1,
    icon: '💾',
    tagline: '「0」と「1」の2つの数字で世界を記録する鍵',
    description: '現代のすべてのスマホやゲーム機が使っている、電気のオン・オフ（0と1）の魔法。',
    examTrivia: '【中学受験のツボ】N進法の問題は、2進法なら「1, 2, 4, 8, 16」のおもりの組み合わせで考えます！'
  },
  {
    id: 't_compass',
    name: '大航海時代の黄金の羅針盤',
    category: 'T',
    rarity: 2,
    icon: '🧭',
    tagline: '地磁気を感じて常に北を指し示すナビゲーター',
    description: '地球そのものが巨大な磁石であることを利用した、人類の航海技術を大きく進めた道具。',
    examTrivia: '【中学受験のツボ】方位磁針のN極が指すのは「北（北極付近＝地磁気のS極）」です！'
  },

  // Engineering (E)
  {
    id: 'e_gears',
    name: '永久回転のクロックワーク・ギア',
    category: 'E',
    rarity: 2,
    icon: '⚙️',
    tagline: '噛み合って力を伝える工学の基本パーツ',
    description: '歯と歯が正確に噛み合って回転の向きを変えたり、力やスピードを調節する機械の心臓部。',
    examTrivia: '【中学受験のツボ】2つの歯車が噛み合うと「逆向き」に回転し、歯数が多いほど回転数は少なくなります！'
  },
  {
    id: 'e_pulley',
    name: 'アルキメデスの複滑車システム',
    category: 'E',
    rarity: 2,
    icon: '🏗️',
    tagline: '船を一隻、片手で引き上げられる秘密の滑車！',
    description: '動滑車を組み合わせることで、引っ張る力を半分、さらに半分へと小さくできる驚きの装置。',
    examTrivia: '【中学受験のツボ】動滑車を1個使うと引く力は「1/2」、ただし引く長さは「2倍」になります（仕事の原理）！'
  },
  {
    id: 'e_davinci',
    name: 'ダ・ヴィンチのオーニソプター羽',
    category: 'E',
    rarity: 3,
    icon: '🦅',
    tagline: '鳥のように空を飛びたいと夢見た飛行機械の翼',
    description: 'レオナルド・ダ・ヴィンチが鳥の骨格や羽ばたきを徹底研究して設計した工学の先駆的スケッチ。',
    examTrivia: '【中学受験のツボ】鳥の骨は軽くて中空、骨格と筋肉の仕組みは理科の生物単元で頻出です！'
  },
  {
    id: 'e_steam',
    name: 'ワットの蒸気機関シリンダー',
    category: 'E',
    rarity: 1,
    icon: '🚂',
    tagline: '水蒸気の力で産業革命を起こした巨大エンジン',
    description: '水を熱して沸騰させたときの膨大な水蒸気の力でピストンを押し出し、列車や船を動かしました。',
    examTrivia: '【中学受験のツボ】水が水蒸気（気体）になると体積は約1700倍に膨らみます！'
  },

  // Art & Geometry (A)
  {
    id: 'a_golden',
    name: '黄金比のディバイダーコンパス',
    category: 'A',
    rarity: 3,
    icon: '📐',
    tagline: 'パルテノン神殿やモナ・リザに宿る「1 : 1.618」',
    description: '人間が最も美しいと感じる比率「黄金比」を測るための芸術家と建築家の必須アイテム。',
    examTrivia: '【中学受験のツボ】比と相似の図形問題！面積比は「相似比の2乗」、体積比は「3乗」になります！'
  },
  {
    id: 'a_platonic',
    name: 'プラトンの正十二面体クリスタル',
    category: 'A',
    rarity: 3,
    icon: '💎',
    tagline: '宇宙にたった5種類しか存在しない正多面体',
    description: 'すべての面が同じ正多角形で、すべての頂点に集まる面の数が同じ美しい立体。',
    examTrivia: '【中学受験のツボ】正多面体は「正四・六・八・十二・二十面体」の5種類しかありません！'
  },
  {
    id: 'a_mobius',
    name: '無限ループのメビウスの帯',
    category: 'A',
    rarity: 2,
    icon: '♾️',
    tagline: '表と裏の境目がない、不思議な1つの面',
    description: 'テープを半回転ひねってつなげると、どこまで歩いても裏返ることなく一周できるトポロジーの輪。',
    examTrivia: '【中学受験のツボ】一筆書きができる条件は「奇数個の線が集まる頂点（奇頂点）が0個または2個」の時です！'
  },
  {
    id: 'a_kaleidoscope',
    name: '幾何学模様の魔法の万華鏡',
    category: 'A',
    rarity: 1,
    icon: '🔮',
    tagline: '鏡の反射が生み出す無限の線対称・点対称アート',
    description: '3枚の鏡を三角柱にして覗くと、カラフルなビーズが美しい対称パターンを描きます。',
    examTrivia: '【中学受験のツボ】線対称は「折り目でピッタリ重なる」、点対称は「180度回して重なる」図形です！'
  },

  // Mathematics (M)
  {
    id: 'm_blocks',
    name: '立体視のルービックキューブ',
    category: 'M',
    rarity: 3,
    icon: '🧊',
    tagline: '見えない裏側のブロックも見通す空間把握の眼',
    description: '立方体を組み合わせたパズル。正面、真上、真横から見て頭の中で立体を組み立てる力を養います。',
    examTrivia: '【中学受験のツボ】積み木の個数は「上から見た図に各列の高さを数字で書き込む」とミスがゼロになります！'
  },
  {
    id: 'm_soroban',
    name: '名人の五つ玉そろばん',
    category: 'M',
    rarity: 1,
    icon: '🧮',
    tagline: 'パチパチはじいて暗算力を究極に高める日本の知恵',
    description: '5のまとまりと1の玉を使って、驚くべきスピードで四則計算をこなす伝統の計算器。',
    examTrivia: '【中学受験のツボ】計算の工夫（37×3=111、25×4=100、分配法則）を使うと難問が秒速で解けます！'
  },
  {
    id: 'm_crane_turtle',
    name: 'ツルとカメの黄金レリーフ',
    category: 'M',
    rarity: 2,
    icon: '🐢',
    tagline: '「もしも全員ツルだったら？」面積図のひらめき',
    description: '江戸時代の算額にも登場する、日本の伝統的かつ最強の中学受験算数テクニックの象徴。',
    examTrivia: '【中学受験のツボ】つるかめ算は「全部ツルと仮定」→「足の差÷1匹あたりの足の差(4-2)」でカメが出ます！'
  },
  {
    id: 'm_fibonacci',
    name: 'フィボナッチの黄金の巻き貝',
    category: 'M',
    rarity: 2,
    icon: '🐚',
    tagline: 'ヒマワリの種やオウムガイに潜む数列の魔法',
    description: '1, 1, 2, 3, 5, 8, 13... 前の2つの数を足すと次の数になる自然界が愛する数列。',
    examTrivia: '【中学受験のツボ】規則性の問題では、差に注目する（階差数列）か、周期（グループ分け）を見つけましょう！'
  }
];

export const BADGES: Badge[] = [
  {
    id: 'b_first_step',
    title: '探検の第一歩',
    description: 'はじめてステージをクリアした！',
    icon: '🌱',
    category: 'progress'
  },
  {
    id: 'b_lever_master',
    title: 'てこの達人',
    description: '理科ラボのてこ天秤パズルを全レベル制覇！',
    icon: '⚖️',
    category: 'mastery'
  },
  {
    id: 'b_block_master',
    title: '3D建築士',
    description: '算数アリーナの積み木数えを全レベル制覇！',
    icon: '🧊',
    category: 'mastery'
  },
  {
    id: 'b_tsurukame_master',
    title: 'つるかめハカセ',
    description: 'つるかめ算アリーナを全レベル制覇！',
    icon: '🐢',
    category: 'mastery'
  },
  {
    id: 'b_gear_master',
    title: 'からくり技師',
    description: 'エンジニア工場の歯車パズルを全レベル制覇！',
    icon: '⚙️',
    category: 'mastery'
  },
  {
    id: 'b_net_master',
    title: '立体折り紙マスター',
    description: 'デザイン工房の展開図パズルを全レベル制覇！',
    icon: '📦',
    category: 'mastery'
  },
  {
    id: 'b_algo_master',
    title: '天才プログラマー',
    description: 'テック研究所のプログラミング迷路を全クリア！',
    icon: '🤖',
    category: 'mastery'
  },
  {
    id: 'b_collector_5',
    title: 'かけだしコレクター',
    description: 'STEAM図鑑のアイテムを5個以上集めた！',
    icon: '🎒',
    category: 'collection'
  },
  {
    id: 'b_collector_all',
    title: '大博物館の館長',
    description: 'STEAM図鑑の全アイテム（20個以上）をコンプリート！',
    icon: '🏛️',
    category: 'collection'
  },
  {
    id: 'b_stamp_3',
    title: 'コツコツ探検隊',
    description: 'スタンプ帳にスタンプを3個以上集めた！',
    icon: '💮',
    category: 'progress'
  },
  {
    id: 'b_steam_master',
    title: '名誉STEAM博士',
    description: '研究員レベル5に到達した！',
    icon: '🎓',
    category: 'mastery'
  }
];

const STORAGE_KEY = 'steam_lab_adventure_user_v1';

export const INITIAL_USER_PROGRESS: UserProgress = {
  name: 'ひらめきけんきゅういん',
  grade: 4,
  furiganaEnabled: true,
  soundEnabled: true,
  level: 1,
  xp: 0,
  coins: 100, // Starting bonus for 2 gacha pulls!
  stamps: [],
  lastStampDate: null,
  unlockedItems: ['s_prism', 'm_soroban'], // 2 initial starter items
  unlockedBadges: [],
  stageProgress: {}
};

export const getStoredProgress = (): UserProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_USER_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_USER_PROGRESS,
      ...parsed,
      stageProgress: parsed.stageProgress || {},
      unlockedItems: Array.isArray(parsed.unlockedItems) ? parsed.unlockedItems : INITIAL_USER_PROGRESS.unlockedItems,
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      stamps: Array.isArray(parsed.stamps) ? parsed.stamps : []
    };
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
    return INITIAL_USER_PROGRESS;
  }
};

export const saveUserProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
};

export const calculateLevel = (xp: number): { level: number; currentXp: number; nextLevelXp: number; title: string } => {
  // Level threshold: 100 XP per level scaling slightly
  // Level 1: 0-99, Level 2: 100-249, Level 3: 250-449, Level 4: 450-699, Level 5: 700+
  const thresholds = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
  const titles = [
    '見習い研究員',
    'ジュニア研究員',
    'ひらめき調査官',
    'ベテラン技師',
    'サイエンス・マスター',
    '名誉STEAM博士',
    '宇宙のひらめき王'
  ];

  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelMin = thresholds[level - 1] || 0;
  const nextLevelMin = thresholds[level] || thresholds[thresholds.length - 1] + 500;
  const currentXp = xp - currentLevelMin;
  const nextLevelXp = nextLevelMin - currentLevelMin;
  const title = titles[Math.min(level - 1, titles.length - 1)];

  return { level, currentXp, nextLevelXp, title };
};

export const checkNewBadges = (progress: UserProgress): string[] => {
  const current = new Set(progress.unlockedBadges);
  const newlyUnlocked: string[] = [];

  const stageKeys = Object.keys(progress.stageProgress);
  const clearedStages = stageKeys.filter(k => progress.stageProgress[k]?.cleared);

  // First step
  if (clearedStages.length > 0 && !current.has('b_first_step')) {
    newlyUnlocked.push('b_first_step');
  }

  // Science Lever: check lever_1, lever_2, lever_3
  if (['lever_1', 'lever_2', 'lever_3'].every(k => progress.stageProgress[k]?.cleared) && !current.has('b_lever_master')) {
    newlyUnlocked.push('b_lever_master');
  }

  // Block count: block_1, block_2, block_3
  if (['block_1', 'block_2', 'block_3'].every(k => progress.stageProgress[k]?.cleared) && !current.has('b_block_master')) {
    newlyUnlocked.push('b_block_master');
  }

  // Tsurukame: tsuru_1, tsuru_2, tsuru_3
  if (['tsuru_1', 'tsuru_2', 'tsuru_3'].every(k => progress.stageProgress[k]?.cleared) && !current.has('b_tsurukame_master')) {
    newlyUnlocked.push('b_tsurukame_master');
  }

  // Gears: gear_1, gear_2, gear_3
  if (['gear_1', 'gear_2', 'gear_3'].every(k => progress.stageProgress[k]?.cleared) && !current.has('b_gear_master')) {
    newlyUnlocked.push('b_gear_master');
  }

  // Cube Net: net_1, net_2, net_3
  if (['net_1', 'net_2', 'net_3'].every(k => progress.stageProgress[k]?.cleared) && !current.has('b_net_master')) {
    newlyUnlocked.push('b_net_master');
  }

  // Algo: algo_1, algo_2, algo_3
  if (['algo_1', 'algo_2', 'algo_3'].every(k => progress.stageProgress[k]?.cleared) && !current.has('b_algo_master')) {
    newlyUnlocked.push('b_algo_master');
  }

  // Collector 5
  if (progress.unlockedItems.length >= 5 && !current.has('b_collector_5')) {
    newlyUnlocked.push('b_collector_5');
  }

  // Collector All
  if (progress.unlockedItems.length >= ITEMS.length && !current.has('b_collector_all')) {
    newlyUnlocked.push('b_collector_all');
  }

  // Stamps 3
  if (progress.stamps.length >= 3 && !current.has('b_stamp_3')) {
    newlyUnlocked.push('b_stamp_3');
  }

  // Steam Master level 5
  if (progress.level >= 5 && !current.has('b_steam_master')) {
    newlyUnlocked.push('b_steam_master');
  }

  return newlyUnlocked;
};
