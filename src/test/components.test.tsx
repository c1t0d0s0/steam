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
});



