'use client';

import { useState, useEffect } from 'react';
import { GameState, Choice } from '../lib/types';
import { scenarios, createInitialState, rollDice, getStatBonus } from '../lib/gameData';

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'stats' | 'resources' | null>(null);

  const currentScenario = scenarios.find(
    (s) => s.id === gameState.currentScenarioId
  );

  // 타이핑 효과
  useEffect(() => {
    if (!currentScenario) return;

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
  }, [currentScenario, gameState]);

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
        return 'text-amber-800';
    }
  };

  // 기존 코드를 이것으로 교체하세요

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* 상단 스탯바 - 컴팩트 */}
      <div className="bg-amber-100 border-b-2 border-amber-800 shadow-sm">
        <div className="p-3">
          {/* 핵심 스탯 - 바 형태 */}
          <div className="space-y-2 mb-3 grid grid-cols-2 gap-4">
            {/* 체력 */}
            <div className="relative">
              <button 
                onClick={() => setShowTooltip(showTooltip === 'health' ? null : 'health')}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-amber-900">❤️ 체력</span>
                  <span className="text-xs text-rose-700 font-bold">{gameState.player.health}/{gameState.player.maxHealth}</span>
                </div>
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-300"
                    style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
                  />
                </div>
              </button>
              {showTooltip === 'health' && (
                <div className="absolute top-full left-0 mt-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <span className="text-xs font-medium text-amber-900">☠️ 오염</span>
                  <span className="text-xs text-red-700 font-bold">{gameState.pollution}%</span>
                </div>
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gray-700 to-gray-900 transition-all duration-300"
                    style={{ width: `${gameState.pollution}%` }}
                  />
                </div>
              </button>
              {showTooltip === 'pollution' && (
                <div className="absolute top-full left-0 mt-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <span className="text-xs font-medium text-amber-900">🌱 세계수</span>
                  <span className="text-xs text-green-700 font-bold">{gameState.worldTree}%</span>
                </div>
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                    style={{ width: `${gameState.worldTree}%` }}
                  />
                </div>
              </button>
              {showTooltip === 'worldTree' && (
                <div className="absolute top-full left-0 mt-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <span className="text-xs font-medium text-amber-900">💫 에코</span>
                  <span className="text-xs text-purple-700 font-bold">{gameState.echoTrust}/100</span>
                </div>
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300"
                    style={{ width: `${gameState.echoTrust}%` }}
                  />
                </div>
              </button>
              {showTooltip === 'echoTrust' && (
                <div className="absolute top-full left-0 mt-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  에코 - 그녀가 당신을 얼마나 믿고 있는지
                </div>
              )}
            </div>
          </div>

          {/* 자원 & 스탯 & 턴 수 */}
          <div className="flex items-center justify-between text-xs border-t border-amber-300 pt-2">
            {/* 자원 */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowTooltip(showTooltip === 'food' ? null : 'food')}
                className="relative"
              >
                <span>🍞 {gameState.resources.food}</span>
                {showTooltip === 'food' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
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
              <span className="text-amber-700">🕐 {gameState.turnCount}</span>
              {showTooltip === 'turn' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 text-xs bg-amber-900 text-amber-50 rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  경과 턴
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 메인 게임 영역 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* 텍스트 박스 */}
        <div
          className="mb-4"
          onClick={skipTyping}
        >
          <div className={`font-bold mb-2 ${getSpeakerColor()}`}>
            {speakerName}
          </div>
          <div className="text-base leading-relaxed whitespace-pre-line text-gray-800">
            {displayedText}
            {isTyping && <span className="text-amber-600">▊</span>}
          </div>
        </div>

        {/* 주사위 표시 - 컴팩트 */}
        {showDice && diceResult !== null && (
          <div className="bg-yellow-50 border-2 border-yellow-700 rounded p-3 mb-4 text-center">
            <div className="text-sm text-yellow-900 mb-1">🎲 주사위</div>
            <div className="text-3xl font-bold text-yellow-700 mb-1">
              {diceResult}
            </div>
            <div className="text-sm">
              {pendingChoice && diceResult >= (pendingChoice.diceCheck || 0) ? (
                <span className="text-green-700">✓ 성공</span>
              ) : (
                <span className="text-red-700">✗ 실패</span>
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
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-amber-100 text-gray-800 active:bg-amber-200'
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
                      <span className="text-yellow-700 text-xs ml-2 px-2 py-1">
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

      {/* 게임 오버 */}
      {(gameState.pollution >= 100 || gameState.player.health <= 0) && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-red-800 rounded-lg p-8 text-center max-w-sm">
            <div className="text-3xl font-bold text-red-700 mb-4">
              게임 오버
            </div>
            <div className="text-lg mb-6 text-gray-700">
              {gameState.pollution >= 100 
                ? '오염이 모든 것을 집어삼켰다...' 
                : '당신은 쓰러졌다...'}
            </div>
            <button
              onClick={() => setGameState(createInitialState())}
              className="bg-red-700 text-white px-6 py-3 rounded border-2 border-red-900 active:bg-red-800"
            >
              다시 시작
            </button>
          </div>
        </div>
      )}

      {/* 하단 정보 */}
      <div className="bg-amber-100 border-t-2 border-amber-800 p-2 text-center text-xs text-amber-700">
        가시나무 탑 · 텍스트를 클릭하여 스킵
      </div>
    </div>
  );
}