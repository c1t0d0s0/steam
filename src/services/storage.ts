export interface CollectibleItem {
  id: string;
  name: string;
  category: 'S' | 'T' | 'E' | 'A' | 'M';
  rarity: 1 | 2 | 3 | 4 | 5;
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

export interface DailyChallengeQuestion {
  islandId: 'science' | 'math' | 'engineering' | 'art' | 'tech';
  islandName: string;
  islandIcon: string;
  gameType: 'lever' | 'block' | 'tsurukame' | 'gear' | 'cube_net' | 'algo_maze' | 'circuit' | 'contraption';
  title: string;
  signature: string;
  puzzle: any;
}

export interface DailyChallengeState {
  date: string; // YYYY-MM-DD
  questions: DailyChallengeQuestion[];
  clearedIndices: number[]; // e.g. [0, 1]
  completed: boolean;
  completedAt?: string;
}

export interface AvatarItem {
  id: string;
  name: string;
  icon: string;
  requiredStamps: number;
  description: string;
  bgGradient: string;
}

export interface TitleItem {
  id: string;
  title: string;
  requiredStamps: number;
  description: string;
}

export interface StampMilestone {
  stampsRequired: number;
  title: string;
  avatarId: string;
  avatarIcon: string;
  titleName: string;
  bonusCoins: number;
  bonusXp: number;
  unlockExIsland?: boolean;
  badgeId?: string;
  description: string;
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
  solvedDailySignatures: string[];
  dailyChallenge?: DailyChallengeState;
  lastDailyPromptDate?: string;
  dailyStreak: number;
  maxDailyStreak: number;
  lastDailyCompletedDate?: string;
  selectedAvatar?: string;
  selectedTitle?: string;
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
  {
    id: 's_galileo_telescope',
    name: 'ガリレオの木星観測望遠鏡',
    category: 'S',
    rarity: 4,
    icon: '🔭',
    tagline: '「それでも地球は回っている！」地動説を証明した望遠鏡',
    description: '1609年、ガリレオが自作した望遠鏡で木星の4大衛星を発見し、天動説を覆し地動説の決定打となった歴史的望遠鏡。',
    examTrivia: '【中学受験のツボ】太陽系の惑星の並び順「水金地火木土天海」！木星は太陽系最大のガス惑星です！'
  },
  {
    id: 's_newton_apple_orrery',
    name: 'ニュートンの万有引力・天体運行儀',
    category: 'S',
    rarity: 5,
    icon: '🌌',
    tagline: '落ちるリンゴと月を同じ物理法則で結びつけた宇宙の真理',
    description: 'あらゆる物質は互いに引き合うという「万有引力の法則」を解き明かし、太陽系の天体運行を完璧に数式化した物理学の最高峰至宝。',
    examTrivia: '【中学受験のツボ】地球上の「重力」と「質量」の違い！質量は月でも変わりませんが、重さ（重力）は月の表面では約1/6になります！'
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
  {
    id: 't_neumann_core',
    name: 'フォン・ノイマンの電脳思考コア',
    category: 'T',
    rarity: 4,
    icon: '💾',
    tagline: '現代の全スマートフォン・PCの基本設計となった頭脳構造',
    description: 'プログラムとデータを同じメモリに記憶させ、順番に読み込んで実行する「プログラム内蔵方式（ノイマン型）」を確立した天才の遺産。',
    examTrivia: '【中学受験のツボ】情報処理の基本単位！「1バイト＝8ビット」。2の8乗＝256通りの情報（文字や数字）を表すことができます！'
  },
  {
    id: 't_ada_lovelace',
    name: 'エイダ・ラブレスの世界初プログラム原典',
    category: 'T',
    rarity: 5,
    icon: '📜',
    tagline: '1843年に記された、人類史上最初のコンピュータプログラム',
    description: '詩人バイロンの娘エイダが、バベッジの解析機関のために世界最初のアルゴリズムを記述した、全プログラミングの聖典。',
    examTrivia: '【中学受験のツボ】規則性の周期とループ処理！「○番目の数」を求める数列問題は、プログラミングのループ演算そのものです！'
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
  {
    id: 'e_wright_propeller',
    name: 'ライト兄弟のフライヤー1号プロペラ',
    category: 'E',
    rarity: 4,
    icon: '✈️',
    tagline: '1903年、人類が初めて空を飛んだ翼と推力の原点',
    description: '木材を削り出して流体力学の翼断面をプロペラに応用。人類初の動力有人飛行を成し遂げた、航空工学の歴史を開いた伝説のパーツ。',
    examTrivia: '【中学受験のツボ】飛行機が飛ぶ原理「揚力」！翼の上の空気の流れが速くなり、気圧が下がることで上向きの力が生まれます！'
  },
  {
    id: 'e_antikythera',
    name: '古代の奇跡 アンティキティラ島の天文歯車',
    category: 'E',
    rarity: 5,
    icon: '🪐',
    tagline: '紀元前100年の海底から発見された、世界最古のアナログ電脳',
    description: '太陽や月の位置、日食・月食の時期、古代オリンピックの開催年までを30個以上の精密な青銅歯車で計算・表示した古代ギリシャの超絶工学。',
    examTrivia: '【中学受験のツボ】複合歯車列の計算！歯車が何枚連なっても、中継ギアは向きだけ変え、回転比は「最初÷最後」で求まります！'
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
  {
    id: 'a_vitruvian',
    name: 'ダ・ヴィンチのウィトルウィウス的人体図',
    category: 'A',
    rarity: 4,
    icon: '🏛️',
    tagline: '正方形と円の中に黄金比で宿る、人体の幾何学的調和',
    description: '人体の両手足を広げると正方形と円に美しく内接する。古代建築家ウィトルウィウスの理論をレオナルドが昇華させた美術・幾何学の傑作。',
    examTrivia: '【中学受験のツボ】円に内接・外接する正方形！内接する正方形の面積は、外接する正方形の面積のちょうど「半分（1/2）」です！'
  },
  {
    id: 'a_escher_stair',
    name: 'エッシャーの上昇と下降・無限立体結晶',
    category: 'A',
    rarity: 5,
    icon: '🌀',
    tagline: '登り続けても元の場所に戻る、錯視と無限ループの超空間',
    description: '版画家エッシャーがペンローズの階段を描いた幾何学絵画。3次元の空間法則を2次元の平面で欺くトポロジーと錯視の芸術的至宝。',
    examTrivia: '【中学受験のツボ】立方体や展開図の空間認識！頭の中で立体を90度回転させ、視点を切り替える思考力が難問攻略の鍵です！'
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
  },
  {
    id: 'm_pythagoras',
    name: 'ピタゴラスの直角三角形ピラミッド儀',
    category: 'M',
    rarity: 4,
    icon: '📐',
    tagline: '「3 : 4 : 5」直角を測りピラミッドを築いた古代幾何学の礎',
    description: '直角をはさむ2辺の正方形の面積の和は、斜辺の正方形の面積と等しい。古代エジプトの縄張り師から続く三平方の定理の起源。',
    examTrivia: '【中学受験のツボ】特別な直角三角形の辺の比！「3:4:5」「5:12:13」、そして三角定規の「1:1:√2」「1:2:√3」は頻出です！'
  },
  {
    id: 'm_euler_identity',
    name: 'オイラーの神の数式ゴールデンプレート',
    category: 'M',
    rarity: 5,
    icon: '👑',
    tagline: '「e^(iπ) + 1 = 0」数学界で最も美しいと讃えられる至高の等式',
    description: '全く起源の異なる自然対数の底 e、円周率 π、虚数単位 i、すべての始まり 1、何もない 0 の5大定数が1つの式で結ばれた数学の奇跡。',
    examTrivia: '【中学受験のツボ】円周率 π（3.14）の計算名人！「3.14×1〜9」の段を暗記しておくと、円や扇形の計算スピードが何倍にも跳ね上がります！'
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
    id: 'b_circuit_master',
    title: '電気回路マスター',
    description: '理科ラボの豆電球回路パズルを全レベル制覇！',
    icon: '💡',
    category: 'mastery'
  },
  {
    id: 'b_contraption_master',
    title: 'からくり工学マスター',
    description: 'エンジニア鉱山のピタゴラ物理連鎖パズルを全レベル制覇！',
    icon: '🏗️',
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
    id: 'b_collector_legend',
    title: '伝説の発明発見者',
    description: '科学図鑑で最高レア度（★5）のレジェンド発明品を発掘した！',
    icon: '👑',
    category: 'collection'
  },
  {
    id: 'b_collector_all',
    title: '大博物館の館長',
    description: 'STEAM図鑑の全発明品をコンプリート！',
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
  },
  {
    id: 'b_grand_explorer',
    title: '全知全能の探検マスター',
    description: '全モジュールのLv.6（達人級）まで完全制覇！',
    icon: '👑',
    category: 'mastery'
  },
  {
    id: 'b_daily_first',
    title: 'デイリーチャレンジャー',
    description: '本日のデイリーミッション（5島横断）を全問クリア！',
    icon: '🥉',
    category: 'progress'
  },
  {
    id: 'b_daily_streak_3',
    title: 'ひらめきスプリンター',
    description: 'デイリーミッションを3日連続で完全達成！',
    icon: '🥈',
    category: 'progress'
  },
  {
    id: 'b_daily_streak_7',
    title: '1週間マスターメダル',
    description: 'デイリーミッションを1週間（7日連続）完全制覇！',
    icon: '🥇',
    category: 'mastery'
  },
  {
    id: 'b_ex_island_unlocked',
    title: '次元の扉を開きし者',
    description: 'スタンプを7個集めて裏ステージ「EX島」を解放した！',
    icon: '🌌',
    category: 'progress'
  },
  {
    id: 'b_stamp_complete',
    title: 'スタンプ帳の大覇者',
    description: 'スタンプ帳（14個）を完全コンプリートした！',
    icon: '👑',
    category: 'collection'
  }
];

export const AVATARS: AvatarItem[] = [
  {
    id: 'a_rocket',
    name: 'ロケット研究員',
    icon: '🚀',
    requiredStamps: 0,
    description: '未知なる知恵の世界へ飛び立つ探検ロケット！',
    bgGradient: 'from-amber-400 to-yellow-300'
  },
  {
    id: 'a_student',
    name: 'わくわく小学生',
    icon: '🎒',
    requiredStamps: 0,
    description: '好奇心いっぱいのSTEAM探検隊員！',
    bgGradient: 'from-sky-400 to-blue-500'
  },
  {
    id: 'a_scientist',
    name: 'ミクロ博士',
    icon: '🔬',
    requiredStamps: 0,
    description: '身の回りのふしぎを解き明かす若き科学者！',
    bgGradient: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'a_seedling',
    name: '新米エクスプローラー',
    icon: '🌱',
    requiredStamps: 3,
    description: '【スタンプ3個達成】まいにち学びの芽を育てる探検隊！',
    bgGradient: 'from-emerald-400 to-lime-500'
  },
  {
    id: 'a_robot',
    name: 'メカロボ研究員',
    icon: '🤖',
    requiredStamps: 7,
    description: '【スタンプ7個達成】論理的思考とからくりを極めたAIロボ！',
    bgGradient: 'from-cyan-400 to-blue-600'
  },
  {
    id: 'a_cosmic',
    name: 'コズミックパイロット',
    icon: '🛸',
    requiredStamps: 10,
    description: '【スタンプ10個達成】銀河の星々を駆け巡る宇宙航海士！',
    bgGradient: 'from-purple-500 to-indigo-700'
  },
  {
    id: 'a_crown',
    name: '銀河のひらめき王',
    icon: '👑',
    requiredStamps: 14,
    description: '【スタンプ14個達成】スタンプ帳を完全制覇した伝説の王者！',
    bgGradient: 'from-amber-400 via-rose-500 to-yellow-300'
  }
];

export const TITLES: TitleItem[] = [
  {
    id: 't_starter',
    title: '見習い研究員',
    requiredStamps: 0,
    description: '探検の第一歩を踏み出したばかりの研究員。'
  },
  {
    id: 't_daily_explorer',
    title: 'まいにち探検隊',
    requiredStamps: 3,
    description: '【スタンプ3個達成】毎日の継続学習を習慣づけた証。'
  },
  {
    id: 't_inspiration_master',
    title: 'ひらめきマスター',
    requiredStamps: 7,
    description: '【スタンプ7個達成】1週間の努力を積み重ねたひらめきの達人。'
  },
  {
    id: 't_nebula_nav',
    title: '星雲のナビゲーター',
    requiredStamps: 10,
    description: '【スタンプ10個達成】広大な知識の海を迷わず導く者。'
  },
  {
    id: 't_transcendent',
    title: '時空を超えし大賢者',
    requiredStamps: 14,
    description: '【スタンプ14個達成】スタンプ帳を全制覇し、真理に到達した最高峰の賢者。'
  }
];

export const STAMP_MILESTONES: StampMilestone[] = [
  {
    stampsRequired: 3,
    title: '3日連続の芽生え',
    avatarId: 'a_seedling',
    avatarIcon: '🌱',
    titleName: 'まいにち探検隊',
    bonusCoins: 50,
    bonusXp: 30,
    badgeId: 'b_stamp_3',
    description: '限定称号「まいにち探検隊」＆ アバター「🌱」解放！'
  },
  {
    stampsRequired: 7,
    title: '1週間継続の金字塔',
    avatarId: 'a_robot',
    avatarIcon: '🤖',
    titleName: 'ひらめきマスター',
    bonusCoins: 100,
    bonusXp: 80,
    unlockExIsland: true,
    badgeId: 'b_ex_island_unlocked',
    description: '★裏ステージ【EX島】完全解放！★ 限定称号＆アバター解放！'
  },
  {
    stampsRequired: 10,
    title: '星雲の到達者',
    avatarId: 'a_cosmic',
    avatarIcon: '🛸',
    titleName: '星雲のナビゲーター',
    bonusCoins: 150,
    bonusXp: 120,
    description: '限定称号「星雲のナビゲーター」＆ アバター「🛸」解放！'
  },
  {
    stampsRequired: 14,
    title: 'スタンプ帳完全制覇！',
    avatarId: 'a_crown',
    avatarIcon: '👑',
    titleName: '時空を超えし大賢者',
    bonusCoins: 300,
    bonusXp: 200,
    badgeId: 'b_stamp_complete',
    description: '限定称号「時空を超えし大賢者」＆ アバター「👑」解放！'
  }
];

export const isExIslandUnlocked = (stampsCount: number): boolean => {
  return stampsCount >= 7;
};

const STORAGE_KEY = 'steam_lab_adventure_user_v1';

export const INITIAL_USER_PROGRESS: UserProgress = {
  name: 'ひらめきけんきゅういん',
  grade: 3,
  furiganaEnabled: true,
  soundEnabled: true,
  level: 1,
  xp: 0,
  coins: 100, // Starting bonus for 2 gacha pulls!
  stamps: [],
  lastStampDate: null,
  unlockedItems: ['s_prism', 'm_soroban'], // 2 initial starter items
  unlockedBadges: [],
  stageProgress: {},
  solvedDailySignatures: [],
  dailyStreak: 0,
  maxDailyStreak: 0,
  selectedAvatar: 'a_rocket',
  selectedTitle: undefined
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
      stamps: Array.isArray(parsed.stamps) ? parsed.stamps : [],
      solvedDailySignatures: Array.isArray(parsed.solvedDailySignatures) ? parsed.solvedDailySignatures : [],
      dailyChallenge: parsed.dailyChallenge || undefined,
      lastDailyPromptDate: parsed.lastDailyPromptDate || undefined,
      dailyStreak: typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : 0,
      maxDailyStreak: typeof parsed.maxDailyStreak === 'number' ? parsed.maxDailyStreak : 0,
      lastDailyCompletedDate: parsed.lastDailyCompletedDate || undefined,
      selectedAvatar: parsed.selectedAvatar || 'a_rocket',
      selectedTitle: parsed.selectedTitle || undefined
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

export const getStageKey = (stagePrefixOrType: string, lvl: number, grade: number = 3): string => {
  const prefixMap: Record<string, string> = {
    lever: 'lever',
    block: 'block',
    tsurukame: 'tsuru',
    tsuru: 'tsuru',
    gear: 'gear',
    cube_net: 'net',
    net: 'net',
    algo_maze: 'algo',
    algo: 'algo'
  };
  const prefix = prefixMap[stagePrefixOrType] || stagePrefixOrType;
  return `g${grade}_${prefix}_${lvl}`;
};

export const getLegacyStageKey = (stagePrefixOrType: string, lvl: number): string => {
  const prefixMap: Record<string, string> = {
    lever: 'lever',
    block: 'block',
    tsurukame: 'tsuru',
    tsuru: 'tsuru',
    gear: 'gear',
    cube_net: 'net',
    net: 'net',
    algo_maze: 'algo',
    algo: 'algo',
    circuit: 'circuit',
    contraption: 'contraption'
  };
  const prefix = prefixMap[stagePrefixOrType] || stagePrefixOrType;
  return `${prefix}_${lvl}`;
};

export const getStageProgressData = (
  stageProgress: UserProgress['stageProgress'],
  stagePrefixOrType: string,
  lvl: number,
  grade: number = 3
): { stars: number; cleared: boolean } => {
  if (!stageProgress) return { stars: 0, cleared: false };

  const prefixMap: Record<string, string> = {
    lever: 'lever',
    block: 'block',
    tsurukame: 'tsuru',
    tsuru: 'tsuru',
    gear: 'gear',
    cube_net: 'net',
    net: 'net',
    algo_maze: 'algo',
    algo: 'algo',
    circuit: 'circuit',
    contraption: 'contraption'
  };
  const prefix = prefixMap[stagePrefixOrType] || stagePrefixOrType;
  const gradeKey = `g${grade}_${prefix}_${lvl}`;

  if (stageProgress[gradeKey]) {
    return stageProgress[gradeKey];
  }

  // Fallback for grade 3 legacy keys (e.g. "lever_1" saved previously without grade prefix)
  if (grade === 3 && stageProgress[`${prefix}_${lvl}`]) {
    return stageProgress[`${prefix}_${lvl}`];
  }

  return { stars: 0, cleared: false };
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

  // Helper to check if a module stage is cleared in ANY grade or legacy key
  const isStageCleared = (prefix: string, lvl: number) => {
    return [3, 4, 5, 6].some(g => progress.stageProgress[`g${g}_${prefix}_${lvl}`]?.cleared) ||
      Boolean(progress.stageProgress[`${prefix}_${lvl}`]?.cleared);
  };

  // Science Lever: check lever_1, lever_2, lever_3
  if ([1, 2, 3].every(lvl => isStageCleared('lever', lvl)) && !current.has('b_lever_master')) {
    newlyUnlocked.push('b_lever_master');
  }

  // Block count: block_1, block_2, block_3
  if ([1, 2, 3].every(lvl => isStageCleared('block', lvl)) && !current.has('b_block_master')) {
    newlyUnlocked.push('b_block_master');
  }

  // Tsurukame: tsuru_1, tsuru_2, tsuru_3
  if ([1, 2, 3].every(lvl => isStageCleared('tsuru', lvl)) && !current.has('b_tsurukame_master')) {
    newlyUnlocked.push('b_tsurukame_master');
  }

  // Gears: gear_1, gear_2, gear_3
  if ([1, 2, 3].every(lvl => isStageCleared('gear', lvl)) && !current.has('b_gear_master')) {
    newlyUnlocked.push('b_gear_master');
  }

  // Cube Net: net_1, net_2, net_3
  if ([1, 2, 3].every(lvl => isStageCleared('net', lvl)) && !current.has('b_net_master')) {
    newlyUnlocked.push('b_net_master');
  }

  // Algo: algo_1, algo_2, algo_3
  if ([1, 2, 3].every(lvl => isStageCleared('algo', lvl)) && !current.has('b_algo_master')) {
    newlyUnlocked.push('b_algo_master');
  }

  // Circuit: circuit_1, circuit_2, circuit_3
  if ([1, 2, 3].every(lvl => isStageCleared('circuit', lvl)) && !current.has('b_circuit_master')) {
    newlyUnlocked.push('b_circuit_master');
  }

  // Contraption: contraption_1, contraption_2, contraption_3
  if ([1, 2, 3].every(lvl => isStageCleared('contraption', lvl)) && !current.has('b_contraption_master')) {
    newlyUnlocked.push('b_contraption_master');
  }

  // Collector 5
  if (progress.unlockedItems.length >= 5 && !current.has('b_collector_5')) {
    newlyUnlocked.push('b_collector_5');
  }

  // Collector All
  if (progress.unlockedItems.length >= ITEMS.length && !current.has('b_collector_all')) {
    newlyUnlocked.push('b_collector_all');
  }

  // Collector Legend (★5)
  if (!current.has('b_collector_legend')) {
    const hasLegend = progress.unlockedItems.some((itemId) => {
      const itm = ITEMS.find((i) => i.id === itemId);
      return itm && itm.rarity === 5;
    });
    if (hasLegend) {
      newlyUnlocked.push('b_collector_legend');
    }
  }

  // Stamps 3
  if (progress.stamps.length >= 3 && !current.has('b_stamp_3')) {
    newlyUnlocked.push('b_stamp_3');
  }

  // Steam Master level 5
  if (progress.level >= 5 && !current.has('b_steam_master')) {
    newlyUnlocked.push('b_steam_master');
  }

  // Grand Explorer: clear all 6 modules at Lv.6
  const maxModules = ['lever', 'block', 'tsuru', 'gear', 'net', 'algo'];
  if (maxModules.every(p => isStageCleared(p, 6)) && !current.has('b_grand_explorer')) {
    newlyUnlocked.push('b_grand_explorer');
  }

  // Daily Challenge Badges
  if ((progress.dailyStreak >= 1 || progress.lastDailyCompletedDate) && !current.has('b_daily_first')) {
    newlyUnlocked.push('b_daily_first');
  }

  if (progress.dailyStreak >= 3 && !current.has('b_daily_streak_3')) {
    newlyUnlocked.push('b_daily_streak_3');
  }

  if (progress.dailyStreak >= 7 && !current.has('b_daily_streak_7')) {
    newlyUnlocked.push('b_daily_streak_7');
  }

  // EX Island Unlock Badge (7 stamps)
  if (progress.stamps.length >= 7 && !current.has('b_ex_island_unlocked')) {
    newlyUnlocked.push('b_ex_island_unlocked');
  }

  // Stamp Complete Badge (14 stamps)
  if (progress.stamps.length >= 14 && !current.has('b_stamp_complete')) {
    newlyUnlocked.push('b_stamp_complete');
  }

  return newlyUnlocked;
};

/**
 * Calculates updated streak count when a daily challenge is completed.
 */
export const calculateUpdatedDailyStreak = (
  currentStreak: number,
  maxStreak: number,
  lastCompletedDate: string | undefined,
  todayStr: string
): { newStreak: number; newMaxStreak: number; isSevenDayStreakEarned: boolean } => {
  if (lastCompletedDate === todayStr) {
    // Already completed today
    return {
      newStreak: currentStreak,
      newMaxStreak: maxStreak,
      isSevenDayStreakEarned: false
    };
  }

  // Use UTC arithmetic to avoid local timezone offset skew
  const [y, m, d] = todayStr.split('-').map(Number);
  const todayUtc = new Date(Date.UTC(y, m - 1, d));
  const yesterdayUtc = new Date(todayUtc);
  yesterdayUtc.setUTCDate(yesterdayUtc.getUTCDate() - 1);
  const yesterdayStr = yesterdayUtc.toISOString().split('T')[0];

  let newStreak = 1;
  if (lastCompletedDate === yesterdayStr) {
    newStreak = currentStreak + 1;
  }

  const newMaxStreak = Math.max(maxStreak, newStreak);
  const isSevenDayStreakEarned = newStreak % 7 === 0;

  return { newStreak, newMaxStreak, isSevenDayStreakEarned };
};
