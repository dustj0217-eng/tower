'use client';

import { useState, useEffect } from 'react';
import { GameState, Choice } from '../lib/types';
import { scenarios, createInitialState, rollDice, getStatBonus } from '../lib/gameData';

type Screen = 'intro' | 'game';
type Theme = 'classic' | 'dark' | 'light';

export default function Game() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  
  // 설정 상태
  const [theme, setTheme] = useState<Theme>('classic');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontFamily, setFontFamily] = useState('serif');

  const currentScenario = scenarios.find(
    (s) => s.id === gameState.currentScenarioId
  );

  // 백엔드
  useEffect(() => {
    fetch('http://localhost:3001/load/1')
      .then(res => res.json())
      .then(data => setHasSave(data.success))
      .catch(() => setHasSave(false));
  }, []);

  // 타이핑 효과
  useEffect(() => {
    if (screen !== 'game' || !currentScenario) return;

    const text =
      typeof currentScenario.text === 'function'
        ? currentScenario.text(gameState)
        : currentScenario.text;

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentScenario, gameState, screen]);

  const handleChoice = (choice: Choice) => {
    if (choice.disabled && choice.disabled(gameState)) return;

    if (choice.diceCheck) {
      setPendingChoice(choice);
      setShowDice(true);
      const result = rollDice();
      setDiceResult(result);
      setTimeout(() => {
        const success = result >= (choice.diceCheck || 0);
        const nextId = success ? choice.successId : choice.failureId;
        if (nextId) {
          let newState = { ...gameState, currentScenarioId: nextId };
          if (choice.effect) {
            newState = choice.effect(newState);
          }
          setGameState(newState);
          // 자동 저장
          setTimeout(() => saveGame(), 100);
        }
        setShowDice(false);
        setDiceResult(null);
        setPendingChoice(null);
      }, 1500);
      return;
    }

    let newState = { ...gameState };
    
    if (choice.effect) {
      newState = choice.effect(newState);
    }
    
    if (choice.nextId) {
      const nextScenarioId = typeof choice.nextId === 'function' 
        ? choice.nextId(newState) 
        : choice.nextId;
      newState.currentScenarioId = nextScenarioId;
    }

    setGameState(newState);
    // 자동 저장
    setTimeout(() => saveGame(), 100);
  };

  const skipTyping = () => {
    if (!currentScenario || !isTyping) return;
    const text =
      typeof currentScenario.text === 'function'
        ? currentScenario.text(gameState)
        : currentScenario.text;
    setDisplayedText(text);
    setIsTyping(false);
  };

  // 게임 저장
  const saveGame = async () => {
    try {
      const res = await fetch('http://localhost:3001/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: 1, gameState }),
      });
      const data = await res.json();
      return data.success;
    } catch (error) {
      console.error('게임 저장 실패:', error);
      return false;
    }
  };

  // 게임 불러오기
  const loadGame = async () => {
    try {
      const res = await fetch('http://localhost:3001/load/1');
      const data = await res.json();
      if (data.success) {
        setGameState(data.gameState);
        setScreen('game');
        return true;
      }
      return false;
    } catch (error) {
      console.error('게임 불러오기 실패:', error);
      return false;
    }
  };

  const startNewGame = (skipTutorial: boolean = false) => {
    const newState = createInitialState();
    if (skipTutorial) {
      // 튜토리얼 스킵: 적절한 시작 지점으로 이동
      // 예: 튜토리얼 이후 시나리오 ID로 설정
      // newState.currentScenarioId = 'after_tutorial'; // 실제 시나리오 ID로 변경 필요
      // 기본 자원 약간 추가
      newState.resources.food = 10;
      newState.resources.manaFragment = 3;
    }
    setGameState(newState);
    setScreen('game');
    setShowNewGameConfirm(false);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-gray-100';
      case 'light':
        return 'bg-gray-50 text-gray-900';
      default:
        return 'bg-amber-50 text-gray-800';
    }
  };

  const getHeaderTheme = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 border-gray-700';
      case 'light':
        return 'bg-white border-gray-300';
      default:
        return 'bg-amber-100 border-amber-800';
    }
  };

  const getButtonTheme = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-700 text-gray-100 active:bg-gray-600';
      case 'light':
        return 'bg-gray-200 text-gray-900 active:bg-gray-300';
      default:
        return 'bg-amber-100 text-gray-800 active:bg-amber-200';
    }
  };

  // 인트로 화면
  if (screen === 'intro') {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* 배경 이미지 */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/intro_background.jpg)',
          }}
        />
        
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0" />

        {/* 콘텐츠 */}
        <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
          {/* 타이틀 */}
          <div className="space-y-4">
            <div className="text-5xl font-serif font-bold text-amber-200 mb-2 tracking-wider drop-shadow-lg">
              가시나무 탑
            </div>
            <div className="text-2xl text-amber-300 font-serif drop-shadow-md">
              이야기
            </div>
            <div className="text-amber-400 text-sm mt-4">
              오염된 세계에서 희망을 찾아
            </div>
          </div>

          {/* 장식 요소 */}
          <div className="flex justify-center items-center space-x-4 py-4">
            <div className="h-px w-24 bg-amber-600"></div>
            <div className="text-amber-500 text-2xl drop-shadow-md">🌿</div>
            <div className="h-px w-24 bg-amber-600"></div>
          </div>

          {/* 메뉴 버튼들 */}
          <div className="space-y-4 p-6 rounded-lg">
            <button
              onClick={() => setShowNewGameConfirm(true)}
              className="w-full max-w-md mx-auto block bg-amber-700 text-amber-50 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-amber-900 shadow-lg"
            >
              새 게임 시작하기
            </button>
            
            <button
              onClick={loadGame}
              disabled={!hasSave}
              className={`w-full max-w-md mx-auto block px-8 py-4 rounded-lg text-lg font-semibold border-2 shadow-lg ${
                hasSave
                  ? 'bg-amber-600 text-amber-50 border-amber-800'
                  : 'bg-gray-700 text-gray-400 border-gray-800 opacity-50 cursor-not-allowed'
              }`}
            >
              이어하기 {!hasSave && '(저장된 데이터 없음)'}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="w-full max-w-md mx-auto block bg-amber-800 text-amber-100 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-amber-900 shadow-lg"
            >
              설정
            </button>
          </div>

          {/* 푸터 정보 */}
          <div className="text-amber-400 text-sm mt-8 drop-shadow-md">
            v1.0.0 · 텍스트 어드벤처 RPG
          </div>
        </div>

        {/* 설정 모달 */}
        {showSettings && (
          <SettingsModal
            theme={theme}
            setTheme={setTheme}
            fontSize={fontSize}
            setFontSize={setFontSize}
            lineHeight={lineHeight}
            setLineHeight={setLineHeight}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* 새 게임 확인 모달 */}
        {showNewGameConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">새 게임 시작</h2>
              <p className="text-gray-600 mb-6">
                어떻게 게임을 시작하시겠습니까?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => startNewGame(false)}
                  className="w-full bg-amber-700 text-white px-6 py-4 rounded-lg font-semibold border-2 border-amber-900"
                >
                  처음부터 시작 (튜토리얼 포함)
                </button>
                
                <button
                  onClick={() => startNewGame(true)}
                  className="w-full bg-amber-600 text-white px-6 py-4 rounded-lg font-semibold border-2 border-amber-800"
                >
                  튜토리얼 건너뛰기
                </button>
                
                <button
                  onClick={() => setShowNewGameConfirm(false)}
                  className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 게임 화면
  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="text-center text-amber-900">시나리오를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const speakerName = {
    narrator: '',
    echo: '에코',
    ludwig: '루드비히',
  }[currentScenario.speaker];

  const getSpeakerColor = () => {
    switch (currentScenario.speaker) {
      case 'echo':
        return 'text-emerald-700';
      case 'ludwig':
        return 'text-blue-700';
      default:
        return theme === 'dark' ? 'text-amber-400' : 'text-amber-800';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${getThemeClasses()}`}>
      {/* 상단 스탯바 - 고정 */}
      <div className={`sticky top-0 z-20 ${getHeaderTheme()} border-b-2 shadow-sm`}>
        <div className="p-3">
          {/* 핵심 스탯 - 바 형태 */}
          <div className="space-y-2 mb-3 grid grid-cols-4 gap-4">
            {/* 체력 */}
            <div className="relative">
              <button 
                onClick={() => setShowTooltip(showTooltip === 'health' ? null : 'health')}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">체력</span>
                  <span className="text-xs text-rose-700 font-bold">{gameState.player.health}/{gameState.player.maxHealth}</span>
                </div>
                <div className={`h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-200'} rounded-full overflow-hidden`}>
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-300"
                    style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
                  />
                </div>
              </button>
              {showTooltip === 'health' && (
                <div className="absolute top-full left-0 mt-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  생명력 - 0이 되면 게임 오버
                </div>
              )}
            </div>

            {/* 오염도 */}
            <div className="relative">
              <button 
                onClick={() => setShowTooltip(showTooltip === 'pollution' ? null : 'pollution')}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">오염</span>
                  <span className="text-xs text-red-700 font-bold">{gameState.pollution}%</span>
                </div>
                <div className={`h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-200'} rounded-full overflow-hidden`}>
                  <div 
                    className="h-full bg-gradient-to-r from-gray-700 to-gray-900 transition-all duration-300"
                    style={{ width: `${gameState.pollution}%` }}
                  />
                </div>
              </button>
              {showTooltip === 'pollution' && (
                <div className="absolute top-full left-0 mt-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  오염도 - 100%가 되면 게임 오버
                </div>
              )}
            </div>

            {/* 세계수 */}
            <div className="relative">
              <button 
                onClick={() => setShowTooltip(showTooltip === 'worldTree' ? null : 'worldTree')}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">세계수</span>
                  <span className="text-xs text-green-700 font-bold">{gameState.worldTree}%</span>
                </div>
                <div className={`h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-200'} rounded-full overflow-hidden`}>
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                    style={{ width: `${gameState.worldTree}%` }}
                  />
                </div>
              </button>
              {showTooltip === 'worldTree' && (
                <div className="absolute top-full left-0 mt-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  세계수 - 회복의 희망
                </div>
              )}
            </div>

            {/* 에코 신뢰도 */}
            <div className="relative">
              <button 
                onClick={() => setShowTooltip(showTooltip === 'echoTrust' ? null : 'echoTrust')}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">에코</span>
                  <span className="text-xs text-purple-700 font-bold">{gameState.echoTrust}/100</span>
                </div>
                <div className={`h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-200'} rounded-full overflow-hidden`}>
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300"
                    style={{ width: `${gameState.echoTrust}%` }}
                  />
                </div>
              </button>
              {showTooltip === 'echoTrust' && (
                <div className="absolute top-full left-0 mt-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  에코 - 그녀가 당신을 얼마나 믿고 있는지
                </div>
              )}
            </div>
          </div>

          {/* 자원 & 스탯 & 턴 수 */}
          <div className={`flex items-center justify-between text-xs ${theme === 'dark' ? 'border-gray-700' : 'border-amber-300'} border-t pt-2`}>
            {/* 자원 */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowTooltip(showTooltip === 'food' ? null : 'food')}
                className="relative"
              >
                <span>🍞 {gameState.resources.food}</span>
                {showTooltip === 'food' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    식량
                  </div>
                )}
              </button>
              <button 
                onClick={() => setShowTooltip(showTooltip === 'mana' ? null : 'mana')}
                className="relative"
              >
                <span>💎 {gameState.resources.manaFragment}</span>
                {showTooltip === 'mana' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    마력 결정
                  </div>
                )}
              </button>
              <button 
                onClick={() => setShowTooltip(showTooltip === 'water' ? null : 'water')}
                className="relative"
              >
                <span>💧 {gameState.resources.purifyingWater}</span>
                {showTooltip === 'water' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    정화의 물
                  </div>
                )}
              </button>
              <button 
                onClick={() => setShowTooltip(showTooltip === 'soul' ? null : 'soul')}
                className="relative"
              >
                <span>✨ {gameState.resources.soulFragment}</span>
                {showTooltip === 'soul' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    영혼의 파편
                  </div>
                )}
              </button>
            </div>

            {/* 스탯 */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowTooltip(showTooltip === 'strength' ? null : 'strength')}
                className="relative"
              >
                <span>💪 {gameState.player.strength}</span>
                {showTooltip === 'strength' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    힘
                  </div>
                )}
              </button>
              <button 
                onClick={() => setShowTooltip(showTooltip === 'agility' ? null : 'agility')}
                className="relative"
              >
                <span>🏃 {gameState.player.agility}</span>
                {showTooltip === 'agility' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    민첩
                  </div>
                )}
              </button>
              <button 
                onClick={() => setShowTooltip(showTooltip === 'magic' ? null : 'magic')}
                className="relative"
              >
                <span>🔮 {gameState.player.magic}</span>
                {showTooltip === 'magic' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    마법
                  </div>
                )}
              </button>
              <button 
                onClick={() => setShowTooltip(showTooltip === 'perception' ? null : 'perception')}
                className="relative"
              >
                <span>👁️ {gameState.player.perception}</span>
                {showTooltip === 'perception' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    감지
                  </div>
                )}
              </button>
            </div>

            {/* 턴 수 */}
            <button 
              onClick={() => setShowTooltip(showTooltip === 'turn' ? null : 'turn')}
              className="relative"
            >
              <span className={theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}>🕐 {gameState.turnCount}</span>
              {showTooltip === 'turn' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-gray-900 text-white rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  경과 턴
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 메인 게임 영역 */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto">
        {/* 텍스트 박스 */}
        <div
          className="mb-4 cursor-pointer"
          onClick={skipTyping}
        >
          <div className={`font-bold mb-2 ${getSpeakerColor()}`}>
            {speakerName}
          </div>
          <div 
            className="leading-relaxed whitespace-pre-line"
            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'sans' ? 'system-ui, sans-serif' : 'monospace'
            }}
          >
            {displayedText}
            {isTyping && <span className={theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}>▊</span>}
          </div>
        </div>

        {/* 주사위 표시 */}
        {showDice && diceResult !== null && (
          <div className={`${theme === 'dark' ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-700'} border-2 rounded p-3 mb-4 text-center`}>
            <div className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-900'} mb-1`}>🎲 주사위</div>
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {diceResult}
            </div>
            <div className="text-sm">
              {pendingChoice && diceResult >= (pendingChoice.diceCheck || 0) ? (
                <span className="text-green-600">✓ 성공</span>
              ) : (
                <span className="text-red-600">✗ 실패</span>
              )}
            </div>
          </div>
        )}

        {/* 선택지 */}
        {!isTyping && !showDice && (
          <div className="space-y-2">
            {currentScenario.choices.map((choice) => {
              const isDisabled = choice.disabled && choice.disabled(gameState);
              const isHidden = choice.condition && !choice.condition(gameState);

              if (isHidden) return null;

              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  disabled={isDisabled}
                  className={`
                    w-full p-3 rounded text-left text-sm
                    ${
                      isDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : getButtonTheme()
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {typeof choice.text === 'function'
                        ? choice.text(gameState)
                        : choice.text}
                    </span>
                    {choice.diceCheck && !isDisabled && (
                      <span className="text-yellow-700 text-xs ml-2 px-2 py-1 bg-yellow-100 rounded">
                        🎲 {choice.diceCheck}+
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 고정 푸터 */}
      <div className={`fixed bottom-0 left-0 right-0 ${getHeaderTheme()} border-t-2 shadow-lg z-20`}>
        <div className="flex items-center justify-around p-3">
          <button
            onClick={() => setShowInventory(true)}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🎒</span>
            <span className="text-xs">가방</span>
          </button>

          <button
            onClick={async () => {
              const success = await saveGame();
              if (success) {
                alert('게임이 저장되었습니다!');
              } else {
                alert('저장에 실패했습니다.');
              }
            }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">💾</span>
            <span className="text-xs">저장</span>
          </button>

          <button
            disabled
            className="flex flex-col items-center gap-1 opacity-50 cursor-not-allowed"
          >
            <span className="text-2xl">🏪</span>
            <span className="text-xs">상점</span>
          </button>

          <button
            onClick={() => setScreen('intro')}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-xs">메뉴</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs">설정</span>
          </button>
        </div>
      </div>

      {/* 게임 오버 */}
      {(gameState.pollution >= 100 || gameState.player.health <= 0) && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-red-800 rounded-lg p-8 text-center max-w-sm">
            <div className="text-3xl font-bold text-red-700 mb-4">
              게임 오버
            </div>
            <div className="text-lg mb-6 text-gray-700">
              {gameState.pollution >= 100 
                ? '오염이 모든 것을 집어삼켰다...' 
                : '당신은 쓰러졌다...'}
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setGameState(createInitialState());
                }}
                className="w-full bg-red-700 text-white px-6 py-3 rounded border-2 border-red-900"
              >
                다시 시작
              </button>
              <button
                onClick={() => setScreen('intro')}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded border-2 border-gray-800"
              >
                메인 메뉴로
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 설정 모달 */}
      {showSettings && (
        <SettingsModal
          theme={theme}
          setTheme={setTheme}
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 가방 모달 */}
      {showInventory && (
        <InventoryModal
          gameState={gameState}
          onClose={() => setShowInventory(false)}
          theme={theme}
        />
      )}
    </div>
  );
}

// 설정 모달 컴포넌트
function SettingsModal({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  fontFamily,
  setFontFamily,
  onClose,
}: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  fontFamily: string;
  setFontFamily: (family: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">설정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* 테마 설정 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              테마
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('classic')}
                className={`p-3 rounded border-2 ${
                  theme === 'classic'
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="text-sm font-medium">클래식</div>
                <div className="w-full h-8 bg-amber-100 rounded mt-1"></div>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded border-2 ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="text-sm font-medium">다크</div>
                <div className="w-full h-8 bg-gray-800 rounded mt-1"></div>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded border-2 ${
                  theme === 'light'
                    ? 'border-gray-600 bg-gray-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="text-sm font-medium">라이트</div>
                <div className="w-full h-8 bg-gray-50 rounded mt-1 border"></div>
              </button>
            </div>
          </div>

          {/* 폰트 설정 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              글꼴
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFontFamily('serif')}
                className={`p-3 rounded border-2 transition-all ${
                  fontFamily === 'serif'
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="text-sm font-serif">명조체</div>
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`p-3 rounded border-2 transition-all ${
                  fontFamily === 'sans'
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="text-sm font-sans">고딕체</div>
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`p-3 rounded border-2 transition-all ${
                  fontFamily === 'mono'
                    ? 'border-amber-600 bg-amber-50'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="text-sm font-mono">모노</div>
              </button>
            </div>
          </div>

          {/* 글씨 크기 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              글씨 크기: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>작게</span>
              <span>크게</span>
            </div>
          </div>

          {/* 줄 간격 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              줄 간격: {lineHeight.toFixed(1)}
            </label>
            <input
              type="range"
              min="1.2"
              max="2.4"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>좁게</span>
              <span>넓게</span>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="border-2 border-gray-300 rounded p-4">
            <div className="text-xs text-gray-500 mb-2">미리보기</div>
            <div
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'sans' ? 'system-ui, sans-serif' : 'monospace'
              }}
            >
              가시나무 탑은 오염된 세계 속에서 희망을 찾아 떠나는 여정입니다.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-amber-600 text-white px-6 py-3 rounded font-semibold"
        >
          확인
        </button>

        {/* 저장 데이터 삭제 */}
        <button
          onClick={() => {
            if (confirm('저장된 게임 데이터를 삭제하시겠습니까?')) {
              localStorage.removeItem('thornTowerSave');
              alert('저장 데이터가 삭제되었습니다.');
            }
          }}
          className="w-full mt-2 bg-red-600 text-white px-6 py-3 rounded font-semibold text-sm"
        >
          저장 데이터 삭제
        </button>
      </div>
    </div>
  );
}

// 가방 모달 컴포넌트
function InventoryModal({
  gameState,
  onClose,
  theme,
}: {
  gameState: GameState;
  onClose: () => void;
  theme: Theme;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">가방</h2>
          <button
            onClick={onClose}
            className="text-gray-500 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 자원 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">자원</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <div className="text-2xl mb-1">🍞</div>
              <div className="text-sm text-gray-600">식량</div>
              <div className="text-xl font-bold text-amber-700">{gameState.resources.food}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="text-2xl mb-1">💎</div>
              <div className="text-sm text-gray-600">마력 결정</div>
              <div className="text-xl font-bold text-blue-700">{gameState.resources.manaFragment}</div>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded p-3">
              <div className="text-2xl mb-1">💧</div>
              <div className="text-sm text-gray-600">정화의 물</div>
              <div className="text-xl font-bold text-cyan-700">{gameState.resources.purifyingWater}</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <div className="text-2xl mb-1">✨</div>
              <div className="text-sm text-gray-600">영혼의 파편</div>
              <div className="text-xl font-bold text-purple-700">{gameState.resources.soulFragment}</div>
            </div>
          </div>
        </div>

        {/* 스탯 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">능력치</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
              <span className="text-sm">💪 힘</span>
              <span className="font-bold text-red-700">{gameState.player.strength}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm">🏃 민첩</span>
              <span className="font-bold text-green-700">{gameState.player.agility}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
              <span className="text-sm">🔮 마법</span>
              <span className="font-bold text-purple-700">{gameState.player.magic}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="text-sm">👁️ 감지</span>
              <span className="font-bold text-blue-700">{gameState.player.perception}</span>
            </div>
          </div>
        </div>

        {/* 아이템 (준비 중) */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">아이템</h3>
          <div className="text-center py-8 text-gray-500">
            아이템 시스템 준비 중...
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-amber-600 text-white px-6 py-3 rounded font-semibold"
        >
          닫기
        </button>
      </div>
    </div>
  );
}