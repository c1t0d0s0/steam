import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App';

describe('App Component Integration', () => {
  it('renders header, brand title, and island cards', () => {
    render(<App />);

    // Brand title
    expect(screen.getByText('STEAM探検隊')).toBeInTheDocument();

    // All 5 STEAM islands should be visible on map
    expect(screen.getByText('サイエンス島')).toBeInTheDocument();
    expect(screen.getByText('マス・アイランド')).toBeInTheDocument();
    expect(screen.getByText('エンジニア鉱山')).toBeInTheDocument();
    expect(screen.getByText('デザイン神殿')).toBeInTheDocument();
    expect(screen.getByText('テックラボ')).toBeInTheDocument();

    // Grade selector defaults to 3 (小学3年)
    const gradeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(gradeSelect.value).toBe('3');

    // Footer copyright
    expect(screen.getByText(/© 2026 c1t0d0s0/)).toBeInTheDocument();
  });

  it('renders user level and title without truncation under STEAM探検隊 title', () => {
    localStorage.clear();
    // XP 750 corresponds to Level 5 'サイエンス・マスター'
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ xp: 750 })
    );

    render(<App />);

    // Check that STEAM探検隊 is in document
    expect(screen.getByText('STEAM探検隊')).toBeInTheDocument();

    // Check full untruncated title text is displayed in the button
    const titleBtn = screen.getByText('Lv.5 サイエンス・マスター');
    expect(titleBtn).toBeInTheDocument();
    expect(titleBtn.className).toContain('whitespace-nowrap');
    expect(titleBtn.className).not.toContain('truncate');
    expect(titleBtn.className).not.toContain('max-w-[130px]');
  });


  it('can open stamp book modal and displays stamp text without breaking', () => {
    render(<App />);

    const stampBtn = screen.getByText('スタンプ');
    fireEvent.click(stampBtn);

    expect(screen.getByText('💮 ひらめきスタンプ帳')).toBeInTheDocument();

    // Press the stamp button to stamp today
    const stampActionBtn = screen.getByText(/がんばりスタンプを押す/);
    fireEvent.click(stampActionBtn);

    // Verify the stamp displays "たいへん" and "よくできました"
    expect(screen.getByText('たいへん')).toBeInTheDocument();
    expect(screen.getByText('よくできました')).toBeInTheDocument();
  });

  it('can open and close the gacha modal', () => {
    render(<App />);

    const gachaBtn = screen.getByText('ガチャ');
    fireEvent.click(gachaBtn);

    expect(screen.getByText('🎁 STEAMガチャマシン')).toBeInTheDocument();
    expect(screen.getByText('持っている星:')).toBeInTheDocument();
    expect(screen.getByText(/1回 100星で回せるよ！/)).toBeInTheDocument();
    expect(screen.getByText(/ガチャを回す！ \(100星\)/)).toBeInTheDocument();

    // Toggle drop rates table
    const ratesBtn = screen.getByText('ガチャ提供割合（レア度別確率）');
    fireEvent.click(ratesBtn);
    expect(screen.getByText('1.0%')).toBeInTheDocument();
    expect(screen.getByText('5.0%')).toBeInTheDocument();
    expect(screen.getByText('14.0%')).toBeInTheDocument();
    expect(screen.getByText('30.0%')).toBeInTheDocument();
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('can open and close the museum modal, displays full item names, and filters by rarity', () => {
    render(<App />);

    const museumBtn = screen.getByText('図鑑');
    fireEvent.click(museumBtn);

    expect(screen.getByText('🏛️ 発明品・科学図鑑')).toBeInTheDocument();
    // Default unlocked items should display their full name without truncation
    expect(screen.getByText('ニュートンの光のプリズム')).toBeInTheDocument();
    expect(screen.getByText('名人の五つ玉そろばん')).toBeInTheDocument();

    // Verify rarity filters exist
    expect(screen.getByText('全レア度')).toBeInTheDocument();
    const legendFilter = screen.getByText('👑 伝説 (★5)');
    expect(legendFilter).toBeInTheDocument();
    expect(screen.getByText('🌟 秘宝 (★4)')).toBeInTheDocument();

    // Click legend filter
    fireEvent.click(legendFilter);
    // There are 5 legend items in ITEMS, all currently locked in default progress
    expect(screen.getAllByText('未発見の伝説').length).toBe(5);
    // Unlocked normal item is no longer visible
    expect(screen.queryByText('ニュートンの光のプリズム')).not.toBeInTheDocument();

    // Switch to ★1 filter
    const star1Filter = screen.getByText('⚪ ★1');
    fireEvent.click(star1Filter);
    expect(screen.getByText('ニュートンの光のプリズム')).toBeInTheDocument();
  });


  it('opens stage select modal when an island is clicked', () => {
    render(<App />);

    const scienceIsland = screen.getByText('サイエンス島');
    fireEvent.click(scienceIsland);

    expect(screen.getByText('てこ天秤の釣り合いパズル')).toBeInTheDocument();
    expect(screen.getAllByText('Lv.1 (初級)').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to game and returns to stage select upon clicking stage select button', () => {
    render(<App />);

    // Click on science island
    fireEvent.click(screen.getByText('サイエンス島'));

    // Start Lv.1
    const startButtons = screen.getAllByText('スタート');
    fireEvent.click(startButtons[0]);

    // Game screen is shown
    expect(screen.getAllByText('てこ天秤の釣り合いパズル').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('ステージ選択')).toBeInTheDocument();

    // In Level 1, Left pos -3 has 20g (torque 60). Right needs at pos 2 -> 30g
    // Left weight (20g) must NOT be present in selectable buttons (cannot copy left side)
    expect(screen.queryByRole('button', { name: '20g' })).not.toBeInTheDocument();

    // Select 30g weight button
    const weight30 = screen.getByText('30g');
    fireEvent.click(weight30);

    // Click right hook at position 2 (second hook with distance 2)
    const hooksPos2 = screen.getAllByTitle('距離 2');
    fireEvent.click(hooksPos2[1]);

    // Check balance
    const checkBtn = screen.getByText('⚖️ つり合いを判定する！');
    fireEvent.click(checkBtn);

    // Victory modal should be visible with "ステージ選択へ" button
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
    const returnStageBtn = screen.getByText('ステージ選択へ');
    expect(returnStageBtn).toBeInTheDocument();

    // Click "ステージ選択へ"
    fireEvent.click(returnStageBtn);

    // User is returned directly to the stage selection modal of Science island!
    expect(screen.getByText('てこ天秤の釣り合いパズル')).toBeInTheDocument();
    expect(screen.getAllByText('Lv.1 (初級)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all 6 gears including Gear A driver in Engineering Mine Level 5 without clipping', () => {
    render(<App />);

    // Click on Engineering island
    fireEvent.click(screen.getByText('エンジニア鉱山'));

    // Find Lv.5 (応用) card for Gear game (first Lv.5)
    expect(screen.getAllByText('Lv.5 (応用)').length).toBeGreaterThanOrEqual(1);
    
    // Click start on Lv.5 (index 4)
    const startButtons = screen.getAllByText('スタート');
    fireEvent.click(startButtons[4]);

    // Check game header
    expect(screen.getAllByText('歯車（ギア）伝達パズル').length).toBeGreaterThanOrEqual(1);

    // Check driver badge on first gear (Gear A)
    expect(screen.getByText('時計回り')).toBeInTheDocument();

    // Verify all 6 gears (A to F) are rendered
    expect(screen.getByText(/ギア A/)).toBeInTheDocument();
    expect(screen.getByText(/ギア B/)).toBeInTheDocument();
    expect(screen.getByText(/ギア C/)).toBeInTheDocument();
    expect(screen.getByText(/ギア D/)).toBeInTheDocument();
    expect(screen.getByText(/ギア E/)).toBeInTheDocument();
    expect(screen.getByText(/ギア F/)).toBeInTheDocument();
  });

  it('isolates stage clear stars per grade: clearing in Grade 3 does not mark Grade 6 as cleared', () => {
    render(<App />);

    // In default Grade 3, clear Science Island Lv.1
    fireEvent.click(screen.getByText('サイエンス島'));
    const startButtons = screen.getAllByText('スタート');
    fireEvent.click(startButtons[0]);

    // Clear Lv.1
    fireEvent.click(screen.getByText('30g'));
    const hooksPos2 = screen.getAllByTitle('距離 2');
    fireEvent.click(hooksPos2[1]);
    fireEvent.click(screen.getByText('⚖️ つり合いを判定する！'));

    // Return to stage select
    fireEvent.click(screen.getByText('ステージ選択へ'));

    // In Grade 3, Science island earned stars is 3 / 36 (since Science now has 2 games x 18 = 36)
    expect(screen.getByText('🎒 小学3年生レベル')).toBeInTheDocument();
    expect(screen.getByText('3 / 36')).toBeInTheDocument();

    // Switch grade to Grade 6 via header select
    const gradeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(gradeSelect, { target: { value: '6' } });

    // Now in Grade 6, stage banner indicates Grade 6 and Science/Math/Engineering/Art are 0 / 36, and 1 island (Tech) is 0 / 18
    expect(screen.getByText('🎒 小学6年生レベル')).toBeInTheDocument();
    expect(screen.queryByText('3 / 36')).not.toBeInTheDocument();
    expect(screen.getAllByText('0 / 18')).toHaveLength(1);
    expect(screen.getAllByText('0 / 36')).toHaveLength(4);

    // Switch back to Grade 3
    fireEvent.change(gradeSelect, { target: { value: '3' } });

    // In Grade 3, previous 3 / 36 stars are preserved
    expect(screen.getByText('🎒 小学3年生レベル')).toBeInTheDocument();
    expect(screen.getByText('3 / 36')).toBeInTheDocument();
  });

  it('renders Grade 6 Design Atelier Lv.1 3-3 net with 5 columns and validates folding', () => {
    render(<App />);

    // Switch to Grade 6
    const gradeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(gradeSelect, { target: { value: '6' } });

    // Open Design Temple (デザイン神殿)
    fireEvent.click(screen.getByText('デザイン神殿'));

    // Start Lv.1
    const startButtons = screen.getAllByText('スタート');
    fireEvent.click(startButtons[0]);

    // Problem 1 asks about 3-3 net
    expect(screen.getByText('この階段型（3-3型）の展開図は、正しく組み立てて立方体にできるかな？')).toBeInTheDocument();

    // Verify grid has 5 columns
    const cell1 = screen.getByText('1');
    const gridContainer = cell1.parentElement;
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer?.style.gridTemplateColumns).toBe('repeat(5, minmax(0, 1fr))');

    // Answer "できる！"
    const canBtn = screen.getByRole('button', { name: 'できる！' });
    fireEvent.click(canBtn);

    // Feedback shows success
    expect(screen.getByText('大正解！展開図の空間構成を見事にマスターしました！')).toBeInTheDocument();
  });

  it('correctly validates Grade 6 Design Atelier Lv.6 Problem 0 answer as できない due to 2x2 square block', () => {
    render(<App />);

    // Switch to Grade 6
    const gradeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(gradeSelect, { target: { value: '6' } });

    // Open Design Temple (デザイン神殿)
    fireEvent.click(screen.getByText('デザイン神殿'));

    // Start Lv.6 (index 5)
    const startButtons = screen.getAllByText('スタート');
    fireEvent.click(startButtons[5]);

    // Problem 1 of Lv.6
    expect(screen.getByText('【最難関・展開図の完全制覇】この超変形型展開図は、正しく組み立てて立方体にできるかな？')).toBeInTheDocument();

    // Answer "できない"
    const cannotBtn = screen.getByRole('button', { name: 'できない' });
    fireEvent.click(cannotBtn);

    // Feedback shows success
    expect(screen.getByText('大正解！展開図の空間構成を見事にマスターしました！')).toBeInTheDocument();
  });

  it('renders Grade 6 Design Atelier Lv.6 Problem 3 with drawn faces B, C, D, E, F and uses 面 terminology', () => {
    render(<App />);

    // Switch to Grade 6
    const gradeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(gradeSelect, { target: { value: '6' } });

    // Open Design Temple (デザイン神殿)
    fireEvent.click(screen.getByText('デザイン神殿'));

    // Start Lv.6 (index 5)
    const startButtons = screen.getAllByText('スタート');
    fireEvent.click(startButtons[5]);

    // Switch to 第3問
    const prob3Tab = screen.getByText('第3問');
    fireEvent.click(prob3Tab);

    // Question uses 面 instead of 頂点
    expect(screen.getByText('【立体図形レジェンド認定】この展開図で、面「A」と向かい合う面はどれかな？')).toBeInTheDocument();

    // Verify all faces A, B, C, D, E, F are drawn
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    const faceDCell = screen.getByText('D');
    expect(faceDCell).toBeInTheDocument();
    expect(faceDCell).not.toHaveClass('bg-emerald-400');
    expect(faceDCell).toHaveClass('bg-cyan-300');
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();

    // Answer "面D"
    const faceDBtn = screen.getByRole('button', { name: '面D' });
    fireEvent.click(faceDBtn);

    // Feedback shows success
    expect(screen.getByText('大正解！展開図の空間構成を見事にマスターしました！')).toBeInTheDocument();
  });

  it('shows EX island locked when stamps < 7 and allows navigating to stamp book from notice', () => {
    localStorage.clear();
    render(<App />);

    // EX Island card should be visible on map
    expect(screen.getByText('EXアイランド')).toBeInTheDocument();
    expect(screen.getByText(/累計スタンプ 7個 で解放！/)).toBeInTheDocument();

    // Clicking locked EX island opens notice dialog
    fireEvent.click(screen.getByText('EXアイランド'));
    expect(screen.getByText('裏ステージ「EXアイランド」は封印中！')).toBeInTheDocument();
    expect(screen.getByText('累計スタンプ 7個 達成')).toBeInTheDocument();

    // Clicking button in notice opens Stamp Book
    const openStampsFromNotice = screen.getByText('💮 スタンプ帳を開いて押印する');
    fireEvent.click(openStampsFromNotice);
    expect(screen.getByText('💮 ひらめきスタンプ帳')).toBeInTheDocument();
  });

  it('unlocks EX island when stamps >= 7 and launches EX puzzle', () => {
    localStorage.clear();
    const mockStamps = [
      '2026-09-01', '2026-09-02', '2026-09-03',
      '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07'
    ];
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({
        stamps: mockStamps,
        coins: 200,
        xp: 150
      })
    );

    render(<App />);

    // EX Island is unlocked!
    expect(screen.getByText('EXアイランド')).toBeInTheDocument();
    expect(screen.getByText('解放中！')).toBeInTheDocument();
    expect(screen.getAllByText('裏ステージへ').length).toBeGreaterThanOrEqual(1);

    // Click EX island to open stage select
    fireEvent.click(screen.getByText('EXアイランド'));
    expect(screen.getByText('【EX裏】多重モーメント・連鎖天秤パズル')).toBeInTheDocument();
    expect(screen.getAllByText('Lv.1 (EX初級)').length).toBe(9);

    // Launch EX Level 1
    const startButtons = screen.getAllByText('スタート');
    fireEvent.click(startButtons[0]);

    // EX Game launched with EX puzzle
    expect(screen.getByText(/EX島（裏ステージ）/)).toBeInTheDocument();
    expect(screen.getByText(/多重モーメント・連鎖天秤パズル \(EX Lv\.1\)/)).toBeInTheDocument();
    expect(screen.getByText('EX裏 Lv.1')).toBeInTheDocument();
  });

  it('allows opening ProfileModal from Header, equips avatar and title', () => {
    localStorage.clear();
    const mockStamps = [
      '2026-09-01', '2026-09-02', '2026-09-03',
      '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07'
    ];
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({
        stamps: mockStamps,
        selectedAvatar: 'a_rocket'
      })
    );

    render(<App />);

    // Open profile modal by clicking the avatar button in header
    const avatarHeaderBtn = screen.getByTitle('プロフィール・アバター設定を変更');
    fireEvent.click(avatarHeaderBtn);

    expect(screen.getByText('探検隊プロフィール設定')).toBeInTheDocument();
    expect(screen.getByText('アバター')).toBeInTheDocument();
    expect(screen.getByText('限定称号')).toBeInTheDocument();
    expect(screen.getByText('スタンプ特典')).toBeInTheDocument();

    // Robot avatar is unlocked (7 stamps)
    const equipButtons = screen.getAllByText('装備する');
    fireEvent.click(equipButtons[0]);

    // Switch to titles tab
    const titleTab = screen.getByText('限定称号');
    fireEvent.click(titleTab);

    // Equip "ひらめきマスター" title
    const equipTitleButtons = screen.getAllByText('設定する');
    fireEvent.click(equipTitleButtons[0]);

    // Close profile modal
    const allButtons = screen.getAllByRole('button');
    const xButton = allButtons.find((btn) => btn.querySelector('svg.lucide-x'));
    if (xButton) fireEvent.click(xButton);

    // Profile modal is closed
    expect(screen.queryByText('探検隊プロフィール設定')).not.toBeInTheDocument();
  });

  it('differentiates programming maze difficulty and concepts across Grade 3, 4, 5, and 6', () => {
    localStorage.clear();

    // Test Grade 3: Sequential processing
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 3 })
    );
    const { unmount: unmountG3 } = render(<App />);
    fireEvent.click(screen.getByText('テックラボ'));
    const startBtnsG3 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG3[0]);

    // Grade 3 banner and sequential cards
    expect(screen.getByText(/小学3年生: 順次処理/)).toBeInTheDocument();
    expect(screen.getByText('1歩すすむ')).toBeInTheDocument();
    expect(screen.getByText('左を向く')).toBeInTheDocument();
    expect(screen.getByText('右を向く')).toBeInTheDocument();
    expect(screen.queryByText(/2歩すすむ/)).not.toBeInTheDocument();
    expect(screen.queryByText(/関数 F1/)).not.toBeInTheDocument();
    unmountG3();

    // Test Grade 4: Loop / Multi-step
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 4 })
    );
    const { unmount: unmountG4 } = render(<App />);
    fireEvent.click(screen.getByText('テックラボ'));
    const startBtnsG4 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG4[0]);

    expect(screen.getByText(/小学4年生: 繰り返し（ループ）/)).toBeInTheDocument();
    expect(screen.getAllByText(/2歩すすむ/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/3歩ダッシュ/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/前進\+右折/)).toBeInTheDocument();
    unmountG4();

    // Test Grade 5: Conditionals & Sensor
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 5 })
    );
    const { unmount: unmountG5 } = render(<App />);
    fireEvent.click(screen.getByText('テックラボ'));
    const startBtnsG5 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG5[0]);

    expect(screen.getByText(/小学5年生: 条件分岐/)).toBeInTheDocument();
    expect(screen.getAllByText(/壁なら右折/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/壁なら左折/).length).toBeGreaterThanOrEqual(1);
    unmountG5();

    // Test Grade 6: Functions (F1) & While loop
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 6 })
    );
    render(<App />);
    fireEvent.click(screen.getByText('テックラボ'));
    const startBtnsG6 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG6[0]);

    expect(screen.getByText(/小学6年生: 関数（サブルーチン）/)).toBeInTheDocument();
    expect(screen.getByText('関数 F1 の定義')).toBeInTheDocument();
    expect(screen.getByText(/壁まで直進/)).toBeInTheDocument();
    const runF1Btn = screen.getByText(/関数 F1 を実行！/);
    expect(runF1Btn).toBeInTheDocument();

    // Add F1 to command queue
    fireEvent.click(runF1Btn);
    expect(screen.getAllByText('1.').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('📦 関数F1')).toBeInTheDocument();
  });

  it('renders CircuitGame under Science Island and validates switch interaction and quiz', () => {
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 3 })
    );

    render(<App />);

    // Click Science island
    fireEvent.click(screen.getByText('サイエンス島'));

    // Verify both games are displayed
    expect(screen.getByText('てこ天秤の釣り合いパズル')).toBeInTheDocument();
    expect(screen.getByText('豆電球と電気回路パズル')).toBeInTheDocument();

    // Launch Circuit Game Lv.1 (index 6 because Lever has 6 levels: 0..5)
    const startBtns = screen.getAllByText('スタート');
    fireEvent.click(startBtns[6]);

    // Circuit game modal is rendered
    expect(screen.getAllByText(/豆電球と電気回路パズル/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('豆電球A')).toBeInTheDocument();
    expect(screen.getAllByText(/スイッチ/).length).toBeGreaterThanOrEqual(1);

    // Toggle switch to ON
    const swBtn = screen.getByText(/スイッチ: OFF \(開く\)/);
    fireEvent.click(swBtn);

    // Verify switch is now ON
    expect(screen.getByText(/スイッチ: ON \(閉じる\)/)).toBeInTheDocument();

    // Click check result button
    const checkBtn = screen.getByText('実験結果をたしかめる！');
    fireEvent.click(checkBtn);

    // Stage cleared!
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
    expect(screen.getByText(/電気は乾電池の＋極から出て/)).toBeInTheDocument();
  });

  it('renders CircuitGame for Grade 4 and Grade 6 with appropriate physics concepts', () => {
    // Test Grade 4
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 4 })
    );

    const { unmount: unmountG4 } = render(<App />);
    fireEvent.click(screen.getByText('サイエンス島'));
    const startBtnsG4 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG4[6]); // Circuit game Lv.1

    // Grade 4 Lv.1: Batteries in series
    expect(screen.getAllByText(/乾電池の直列つなぎ/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/約2倍の強さで、とても明るくなる！/)).toBeInTheDocument();

    // Select correct option
    fireEvent.click(screen.getByText(/約2倍の強さで、とても明るくなる！/));
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
    unmountG4();

    // Test Grade 6
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 6 })
    );

    render(<App />);
    fireEvent.click(screen.getByText('サイエンス島'));
    const startBtnsG6 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG6[6]); // Circuit game Lv.1

    // Grade 6 Lv.1: Mixed circuit current ratio (2/3 and 1/3)
    expect(screen.getAllByText(/基本混列回路の電流比/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/電球A は「2\/3」、電球B・C はそれぞれ「1\/3」/)).toBeInTheDocument();

    // Select correct option
    fireEvent.click(screen.getByText(/電球A は「2\/3」、電球B・C はそれぞれ「1\/3」/));
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
  });

  it('renders EX Island with Quantum Circuit Puzzle and launches it', () => {
    localStorage.clear();
    const mockStamps = [
      '2026-09-01', '2026-09-02', '2026-09-03',
      '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07'
    ];
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ stamps: mockStamps })
    );

    render(<App />);

    // Click EX island
    fireEvent.click(screen.getByText('EXアイランド'));
    expect(screen.getByText('【EX裏】超電導・量子電気回路パズル')).toBeInTheDocument();

    // Launch EX circuit Lv.1 (Bridge circuit) - index 18
    const startBtns = screen.getAllByText('スタート');
    fireEvent.click(startBtns[18]);

    expect(screen.getByText(/ブリッジ回路と電位差ゼロの幻影電球/)).toBeInTheDocument();
    expect(screen.getByText(/電球Cには電流が流れず、点灯しない（明るさ0）/)).toBeInTheDocument();

    // Select correct option
    fireEvent.click(screen.getByText(/電球Cには電流が流れず、点灯しない（明るさ0）/));
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
  });

  it('renders ContraptionGame on Engineering Island and clears quiz in Grade 3', () => {
    localStorage.clear();
    render(<App />);

    // Click on Engineering Island (エンジニア鉱山)
    fireEvent.click(screen.getByText('エンジニア鉱山'));

    // Both Gear and Contraption games should be visible
    expect(screen.getByText('歯車（ギア）伝達パズル')).toBeInTheDocument();
    expect(screen.getByText('からくりピタゴラ物理連鎖パズル')).toBeInTheDocument();

    // Start Contraption Lv.1 (index 6, since Gear has 6 levels 0..5)
    const startBtns = screen.getAllByText('スタート');
    fireEvent.click(startBtns[6]);

    // Check game header
    expect(screen.getAllByText(/まっすぐ転がる坂道レール/).length).toBeGreaterThanOrEqual(1);

    // Switch to Problem 2 (physics_quiz: 坂道の傾きとスピード)
    fireEvent.click(screen.getByText('第2問'));
    expect(screen.getAllByText(/坂道の傾きとスピード/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/急な坂のほうが一気に加速して速い！/)).toBeInTheDocument();

    // Select correct option
    fireEvent.click(screen.getByText(/急な坂のほうが一気に加速して速い！/));

    // Cleared!
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
    expect(screen.getByText(/急な坂のほうが重力の引っ張る力が進行方向に大きく働くため/)).toBeInTheDocument();
  });

  it('renders ContraptionGame for Grade 4 and Grade 6 with appropriate physics concepts', () => {
    // Grade 4
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 4 })
    );

    const { unmount: unmountG4 } = render(<App />);
    fireEvent.click(screen.getByText('エンジニア鉱山'));
    const startBtnsG4 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG4[6]); // Contraption Lv.1

    // Switch to Problem 2 (45-degree angle rule)
    fireEvent.click(screen.getByText('第2問'));
    expect(screen.getAllByText(/最長到達距離の角度（45度の法則）/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/45度（斜め45度）/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/45度（斜め45度）/));
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
    unmountG4();

    // Grade 6
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 6 })
    );

    render(<App />);
    fireEvent.click(screen.getByText('エンジニア鉱山'));
    const startBtnsG6 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG6[6]); // Contraption Lv.1

    // Grade 6 Lv.1 Problem 1 is Newton's Cradle quiz!
    expect(screen.getAllByText(/ニュートンのゆりかご（弾性衝突）/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/右端の「1個」だけが同じ速さで飛び出す！/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/右端の「1個」だけが同じ速さで飛び出す！/));
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
  });

  it('renders EX Island with Contraption Puzzle and launches it', () => {
    localStorage.clear();
    const mockStamps = [
      '2026-09-01', '2026-09-02', '2026-09-03',
      '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07'
    ];
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ stamps: mockStamps })
    );

    render(<App />);

    // Click EX island
    fireEvent.click(screen.getByText('EXアイランド'));
    expect(screen.getByText('【EX裏】時空連鎖・究極ピタゴラ力学要塞')).toBeInTheDocument();

    // Launch EX contraption Lv.1 (index 21)
    const startBtns = screen.getAllByText('スタート');
    fireEvent.click(startBtns[21]);

    expect(screen.getByText(/三重ニュートン振り子と弾性衝突の共鳴カタパルト/)).toBeInTheDocument();
    expect(screen.getByText(/右側から2個の球が同じ速さで飛び出す！/)).toBeInTheDocument();

    // Select correct option
    fireEvent.click(screen.getByText(/右側から2個の球が同じ速さで飛び出す！/));
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
  });

  it('renders CrossSectionGame on Art Island and clears quiz in Grade 3 with 3D controls', () => {
    localStorage.clear();
    render(<App />);

    // Click on Art Island (デザイン神殿)
    fireEvent.click(screen.getByText('デザイン神殿'));

    // Both Cube Net and Cross Section games should be visible
    expect(screen.getByText('立方体の展開図マスター')).toBeInTheDocument();
    expect(screen.getByText('立体の切断・断面幾何パズル')).toBeInTheDocument();

    // Start Cross Section Lv.1 (index 6, since Cube Net has 6 levels 0..5)
    const startBtns = screen.getAllByText('スタート');
    fireEvent.click(startBtns[6]);

    // Check game header
    expect(screen.getAllByText(/立方体のカド切り落とし（三角形）/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/立方体の1つの角（頂点）を斜めに切り落としました/)).toBeInTheDocument();

    // Test 3D view mode toggle
    const topViewBtn = screen.getByText('真上 (上面)');
    fireEvent.click(topViewBtn);
    expect(screen.getByText('正面')).toBeInTheDocument();
    fireEvent.click(screen.getByText('正面'));
    fireEvent.click(screen.getByText('斜め3D'));

    // Test Slice and Explode toggle
    const sliceBtn = screen.getByText('切断中');
    fireEvent.click(sliceBtn);
    expect(screen.getByText('切断する')).toBeInTheDocument();
    fireEvent.click(screen.getByText('切断する'));

    const explodeBtn = screen.getByText('分離');
    fireEvent.click(explodeBtn);
    expect(screen.getByText('合体')).toBeInTheDocument();
    expect(screen.getByText('断面オープン！')).toBeInTheDocument();

    // Test Hint / Strategy modal
    const helpBtn = screen.getByText('ヒント');
    fireEvent.click(helpBtn);
    expect(screen.getByText('立体切断・空間幾何ノート')).toBeInTheDocument();
    expect(screen.getByText('【切断の3大鉄則】')).toBeInTheDocument();
    fireEvent.click(screen.getByText('わかった！閉じる'));
    expect(screen.queryByText('立体切断・空間幾何ノート')).not.toBeInTheDocument();

    // Select correct option
    fireEvent.click(screen.getByText(/3つの頂点を結ぶ「三角形」！/));

    // Stage cleared!
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
    expect(screen.getByText(/立方体の1つの頂点に集まる3つの面を通る平面で切断すると/)).toBeInTheDocument();
  });

  it('renders CrossSectionGame for Grade 4 and Grade 6 with geometry concepts', () => {
    // Grade 4
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 4 })
    );

    const { unmount: unmountG4 } = render(<App />);
    fireEvent.click(screen.getByText('デザイン神殿'));
    const startBtnsG4 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG4[6]); // CrossSection Lv.1

    // Grade 4 Lv.1: Rule 1 - points on same plane
    expect(screen.getAllByText(/【第1鉄則】同一平面上の2点は結ぶ！/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/同じ面（上の面）の上を「まっすぐな直線」で結ぶ！/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/同じ面（上の面）の上を「まっすぐな直線」で結ぶ！/));
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
    unmountG4();

    // Grade 6
    localStorage.clear();
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ grade: 6 })
    );

    render(<App />);
    fireEvent.click(screen.getByText('デザイン神殿'));
    const startBtnsG6 = screen.getAllByText('スタート');
    fireEvent.click(startBtnsG6[6]); // CrossSection Lv.1

    // Grade 6 Lv.1: Corner pyramid volume
    expect(screen.getAllByText(/切断によって生じる三角すいの体積/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/底面積\(3×3÷2\) × 高さ3 ÷ 3 ＝「4\.5 cm³」！/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/底面積\(3×3÷2\) × 高さ3 ÷ 3 ＝「4\.5 cm³」！/));
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
  });

  it('renders EX Island with CrossSection Puzzle and launches it', () => {
    localStorage.clear();
    const mockStamps = [
      '2026-09-01', '2026-09-02', '2026-09-03',
      '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07'
    ];
    localStorage.setItem(
      'steam_lab_adventure_user_v1',
      JSON.stringify({ stamps: mockStamps })
    );

    render(<App />);

    // Click EX island
    fireEvent.click(screen.getByText('EXアイランド'));
    expect(screen.getByText('【EX裏】多面体切断・極限断面幾何パズル')).toBeInTheDocument();

    // Launch EX CrossSection Lv.1 (index 24)
    const startBtns = screen.getAllByText('スタート');
    fireEvent.click(startBtns[24]);

    expect(screen.getByText(/立方体の3方向直交中心切断と切断面/)).toBeInTheDocument();
    expect(screen.getByText(/8個の小立方体に分かれ、切断面の総面積は「108cm²」！/)).toBeInTheDocument();

    // Select correct option
    fireEvent.click(screen.getByText(/8個の小立方体に分かれ、切断面の総面積は「108cm²」！/));
    expect(screen.getByText('クリアおめでとう！')).toBeInTheDocument();
  });
});




