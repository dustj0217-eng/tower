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
    // 비활성화 체크
    if (choice.disabled && choice.disabled(gameState)) return;

    // 주사위 판정이 필요한 경우
    if (choice.diceCheck) {
      setPendingChoice(choice);
      setShowDice(true);
      setTimeout(() => {
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
        }, 2000);
      }, 500);
      return;
    }

    // 일반 선택
    let newState = { ...gameState };
    
    if (choice.effect) {
      newState = choice.effect(newState);
    }
    
    if (choice.nextId) {
      // nextId가 함수인 경우 실행, 아니면 그대로 사용
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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">시나리오를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const speakerName = {
    narrator: '나레이터',
    echo: '에코',
    ludwig: '루드비히',
  }[currentScenario.speaker];

  const getSpeakerColor = () => {
    switch (currentScenario.speaker) {
      case 'echo':
        return 'text-green-400';
      case 'ludwig':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* 상태바 */}
      <div className="bg-gray-950 bg-opacity-95 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-2">
          {/* 첫 번째 줄: 핵심 바 */}
          <div className="flex items-center gap-4 mb-2">
            {/* 체력 */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-rose-400 text-xs">❤️</span>
              <div className="flex-1 bg-gray-800 rounded-full h-3 max-w-[120px]">
                <div
                  className="bg-rose-500 h-3 rounded-full transition-all"
                  style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
                />
              </div>
              <span className="text-rose-400 font-bold text-sm min-w-[50px]">
                {gameState.player.health}/{gameState.player.maxHealth}
              </span>
            </div>

            {/* 오염도 */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-red-400 text-xs">☠️</span>
              <div className="flex-1 bg-gray-800 rounded-full h-3 max-w-[120px]">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all"
                  style={{ width: `${gameState.pollution}%` }}
                />
              </div>
              <span className="text-red-400 font-bold text-sm min-w-[40px]">{gameState.pollution}%</span>
            </div>

            {/* 세계수 */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-green-400 text-xs">🌱</span>
              <div className="flex-1 bg-gray-800 rounded-full h-3 max-w-[120px]">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${gameState.worldTree}%` }}
                />
              </div>
              <span className="text-green-400 font-bold text-sm min-w-[40px]">{gameState.worldTree}%</span>
            </div>

            {/* 턴 */}
            <div className="flex items-center gap-1">
              <span className="text-cyan-400 text-xs">🕐</span>
              <span className="text-cyan-400 font-bold text-sm">{gameState.turnCount}</span>
            </div>
          </div>

          {/* 두 번째 줄: 자원 & 스탯 */}
          <div className="flex items-center justify-between text-xs">
            {/* 자원 */}
            <div className="flex items-center gap-3">
              <span className="text-yellow-400">🍞 {gameState.resources.food}</span>
              <span className="text-purple-400">💎 {gameState.resources.manaFragment}</span>
              <span className="text-blue-400">💧 {gameState.resources.purifyingWater}</span>
              <span className="text-indigo-400">✨ {gameState.resources.soulFragment}</span>
            </div>
            
            {/* 스탯 */}
            <div className="flex items-center gap-3 text-gray-400">
              <span>💪 {gameState.player.strength}</span>
              <span>🏃 {gameState.player.agility}</span>
              <span>🔮 {gameState.player.magic}</span>
              <span>👁️ {gameState.player.perception}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 게임 영역 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          {/* 텍스트 표시 */}
          <div
            className="bg-gray-800 bg-opacity-90 rounded-lg p-6 mb-6 min-h-[200px] cursor-pointer border border-gray-700"
            onClick={skipTyping}
          >
            <div className={`font-bold mb-3 ${getSpeakerColor()}`}>
              {speakerName}
            </div>
            <div className="text-lg leading-relaxed whitespace-pre-line">
              {displayedText}
              {isTyping && <span className="animate-pulse">▊</span>}
            </div>
          </div>

          {/* 주사위 표시 */}
          {showDice && (
            <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 mb-6 text-center border border-yellow-500">
              <div className="text-2xl mb-4">🎲 주사위를 굴립니다...</div>
              {diceResult !== null && (
                <div>
                  <div className="text-5xl font-bold text-yellow-400 mb-2">
                    {diceResult}
                  </div>
                  <div className="text-lg">
                    {pendingChoice && diceResult >= (pendingChoice.diceCheck || 0) ? (
                      <span className="text-green-400">✓ 성공!</span>
                    ) : (
                      <span className="text-red-400">✗ 실패...</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 선택지 */}
          {!isTyping && !showDice && (
            <div className="grid gap-3">
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
                      p-4 rounded-lg text-left transition-all
                      ${
                        isDisabled
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500'
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
                        <span className="text-yellow-400 text-sm ml-2">
                          🎲 목표: {choice.diceCheck}+
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 게임 오버 체크 */}
      {(gameState.pollution >= 100 || gameState.player.health <= 0) && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-4">
              게임 오버
            </div>
            <div className="text-xl mb-6">
              {gameState.pollution >= 100 
                ? '오염이 모든 것을 집어삼켰다...' 
                : '당신은 쓰러졌다...'}
            </div>
            <button
              onClick={() => setGameState(createInitialState())}
              className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg text-lg"
            >
              다시 시작
            </button>
          </div>
        </div>
      )}

      {/* 하단 정보 */}
      <div className="bg-gray-950 bg-opacity-80 p-3 text-center text-xs text-gray-500 border-t border-gray-700">
        가시나무 탑 v0.1 - 클릭하여 텍스트 스킵 가능
      </div>
    </div>
  );
}