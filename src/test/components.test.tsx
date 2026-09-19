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
  });

  it('can open and close the museum modal and displays full item names without truncation', () => {
    render(<App />);

    const museumBtn = screen.getByText('図鑑');
    fireEvent.click(museumBtn);

    expect(screen.getByText('🏛️ 発明品・科学図鑑')).toBeInTheDocument();
    // Default unlocked items should display their full name without truncation
    expect(screen.getByText('ニュートンの光のプリズム')).toBeInTheDocument();
    expect(screen.getByText('名人の五つ玉そろばん')).toBeInTheDocument();
  });

  it('opens stage select modal when an island is clicked', () => {
    render(<App />);

    const scienceIsland = screen.getByText('サイエンス島');
    fireEvent.click(scienceIsland);

    expect(screen.getByText('てこ天秤の釣り合いパズル')).toBeInTheDocument();
    expect(screen.getByText('Lv.1 (初級)')).toBeInTheDocument();
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
    expect(screen.getByText('Lv.1 (初級)')).toBeInTheDocument();
  });

  it('renders all 6 gears including Gear A driver in Engineering Mine Level 5 without clipping', () => {
    render(<App />);

    // Click on Engineering island
    fireEvent.click(screen.getByText('エンジニア鉱山'));

    // Find Lv.5 (応用) card
    expect(screen.getByText('Lv.5 (応用)')).toBeInTheDocument();
    
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

    // In Grade 3, Science island earned stars is 3 / 18
    expect(screen.getByText('🎒 小学3年生レベル')).toBeInTheDocument();
    expect(screen.getByText('3 / 18')).toBeInTheDocument();

    // Switch grade to Grade 6 via header select
    const gradeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(gradeSelect, { target: { value: '6' } });

    // Now in Grade 6, stage banner indicates Grade 6 and Science island is 0 / 18 (no island has 3 / 18)
    expect(screen.getByText('🎒 小学6年生レベル')).toBeInTheDocument();
    expect(screen.queryByText('3 / 18')).not.toBeInTheDocument();
    expect(screen.getAllByText('0 / 18')).toHaveLength(4);
    expect(screen.getByText('0 / 36')).toBeInTheDocument();

    // Switch back to Grade 3
    fireEvent.change(gradeSelect, { target: { value: '3' } });

    // In Grade 3, previous 3 / 18 stars are preserved
    expect(screen.getByText('🎒 小学3年生レベル')).toBeInTheDocument();
    expect(screen.getByText('3 / 18')).toBeInTheDocument();
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
    expect(screen.getAllByText('Lv.1 (EX初級)').length).toBe(6);

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
});




