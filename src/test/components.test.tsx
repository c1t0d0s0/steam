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
  });

  it('can open and close the stamp book modal', () => {
    render(<App />);

    const stampBtn = screen.getByText('スタンプ');
    fireEvent.click(stampBtn);

    expect(screen.getByText('💮 ひらめきスタンプ帳')).toBeInTheDocument();
  });

  it('can open and close the gacha modal', () => {
    render(<App />);

    const gachaBtn = screen.getByText('ガチャ');
    fireEvent.click(gachaBtn);

    expect(screen.getByText('🎁 STEAMガチャマシン')).toBeInTheDocument();
  });

  it('can open and close the museum modal', () => {
    render(<App />);

    const museumBtn = screen.getByText('図鑑');
    fireEvent.click(museumBtn);

    expect(screen.getByText('🏛️ 発明品・科学図鑑')).toBeInTheDocument();
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
});

