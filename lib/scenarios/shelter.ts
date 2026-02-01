import { Scenario, GameState } from '@/lib/types';
import { processTurn } from './logic';
import { applyResources, applyHeal } from './helpers';

// 에코 대사 헬퍼 함수
const getEchoGreeting = (state: GameState): string => {
  const { turnCount, player, pollution, worldTree, resources, visitedRooms } = state;
  const explored = visitedRooms?.length || 0;
  
  // 첫 턴
  if (turnCount === 0) {
    return '...여기가 안전해요.\n일단은요.\n\n어떻게 하실 건가요?';
  }
  
  // 위급 상황만 최우선 (정말 심각할 때만)
  if (player.health <= 10) {
    return '위험해요!\n당장 쉬어야 해요!\n\n...제발요.';
  }
  
  if (pollution >= 95) {
    return '오염이... 거의 다 왔어요.\n몇 턴 남지 않았어요.\n\n서둘러야 해요!';
  }
  
  // 승리 직전 (정말 임박했을 때만)
  if (worldTree >= 95) {
    return '세계수가... 거의 다 자랐어요!\n조금만 더!';
  }
  
  // 랜덤 일반 대사 (대부분은 이걸로)
  const randomDialogues = [
    '어디로 가시겠어요?',
    '...준비되셨나요?',
    '괜찮으세요?',
    '밖은 여전히 위험해요.\n조심하세요.',
    '...조용하네요.',
    '세계수를 보고 계셨나요?',
    '이 대피소도 언제까지 안전할지 모르겠어요.',
    '...쉬실 건가요, 아니면 나가실 건가요?',
    '저는... 여기서 기다리고 있을게요.',
    '밖에서 무슨 소리가 들렸어요.\n...괴물일까요?',
    '공기가 점점 탁해지는 것 같아요.',
    '...피곤하지 않으세요?',
    '세계수가 자라는 걸 보면...\n조금은 희망이 생기네요.',
    '예전엔 이곳도 아름다웠대요.\n...믿기지 않지만.',
    '혼자 있으면 무서워요.\n...당신이 있어서 다행이에요.',
    '탑 꼭대기엔 뭐가 있을까요?',
    '...때때로 목소리가 들려요.\n사람들의 비명... 아니, 착각이겠죠.',
    '오늘은... 아무 일도 일어나지 않았으면 좋겠어요.',
    '배고프진 않으세요?',
    '다치신 데는 없으세요?',
  ];
  
  // 가끔씩만 조언 (확률 30%)
  if (turnCount % 10 < 3) {
    // 체력 낮을 때
    if (player.health < 30 && resources.food >= 2) {
      return '많이 다치셨네요.\n쉬는 게 좋겠어요.';
    }
    
    // 오염 높을 때
    if (pollution > 70 && worldTree < 50) {
      return '오염이 심해지고 있어요.\n...서두르는 게 좋을 것 같아요.';
    }
    
    // 식량 부족
    if (turnCount >= 8 && resources.food < 2) {
      return '식량이 부족해요.\n밖에서 구해와야 할 것 같아요.';
    }
  }
  
  // 세계수 성장 단계별 감상 (가끔)
  if (turnCount % 7 === 0) {
    if (worldTree >= 80) {
      return '세계수가 많이 자랐어요.\n...정말 해낼 수 있을 것 같아요.';
    }
    if (worldTree >= 60) {
      return '세계수가 자라는 속도가 빨라진 것 같아요.\n희망이 보여요.';
    }
    if (worldTree >= 40) {
      return '세계수... 생각보다 잘 자라고 있어요.';
    }
  }
  
  return randomDialogues[turnCount % randomDialogues.length];
};

// 세계수 성장 단계 설명
const getWorldTreeGrowthText = (beforeValue: number, afterValue: number): string => {
  if (afterValue >= 100) {
    return '세계수가 완전히 자랐다!\n\n거대한 나무가 하늘로 뻗어 오른다.\n푸른 빛이 사방으로 퍼져나간다.\n\n오염된 공기가 정화되기 시작한다.\n검은 안개가 걷힌다.\n\n...희망이 보인다.';
  }
  
  if (afterValue >= 90 && beforeValue < 90) {
    return '세계수가 쑥쑥 자란다.\n줄기가 굵어지고 가지가 뻗어나간다.\n\n푸른 빛이 점점 강해진다.\n거의 다 왔다.';
  }
  
  if (afterValue >= 70 && beforeValue < 70) {
    return '세계수가 무성해진다.\n잎들이 생기를 되찾는다.\n\n주변의 오염이 눈에 띄게 약해진다.\n숨쉬기가 한결 편해진다.';
  }
  
  if (afterValue >= 50 && beforeValue < 50) {
    return '세계수가 절반쯤 자랐다.\n어린 나무에서 청년목으로.\n\n뿌리가 땅 깊이 내린다.\n생명력이 느껴진다.';
  }
  
  if (afterValue >= 30 && beforeValue < 30) {
    return '세계수가 조금씩 자란다.\n연약했던 새싹이 단단해진다.\n\n작지만 확실한 성장.\n가능성이 보인다.';
  }
  
  return '세계수에 물을 준다.\n싹이 조금 더 자란다.\n\n미약하지만... 살아있다.';
};

export const shelterScenarios: Scenario[] = [
  // ============================================
  // 쉘터 복귀 전환 씬
  // ============================================
  {
    id: 'return_to_shelter',
    speaker: 'narrator',
    text: '대피소로 돌아온다.\n\n무거운 문을 열고 안으로 들어선다.\n밖의 오염된 공기와는 달리, 여기는 조금 나은 것 같다.\n\n에코가 기다리고 있다.',
    choices: [
      { id: 'continue', text: '...', nextId: 'shelter_hub' },
    ],
  },
  
  // ============================================
  // 쉘터 허브
  // ============================================
  {
    id: 'shelter_hub',
    speaker: 'echo',
    text: getEchoGreeting,
    choices: [
      { id: 'go_out', text: '밖으로 나간다', nextId: 'exploration_choice' },
      {
        id: 'rest',
        text: (state) => {
          if (state.resources.food < 2) return '휴식 (식량 부족!)';
          return `휴식을 취한다 (식량 -2, 체력 +20)`;
        },
        nextId: 'rest_choice',
        disabled: (state) => state.resources.food < 2,
      },
      {
        id: 'water_tree',
        text: (state) => {
          if (state.resources.purifyingWater < 1) return '세계수 (물주기 불가)';
          return `세계수 (물주기 가능)`;
        },
        nextId: 'check_world_tree',
      },
      {
        id: 'purify_water',
        text: (state) => {
          if (state.resources.manaFragment < 2) return '물 정화 (마력결정 부족!)';
          return `물을 정화한다 (마력결정 -2)`;
        },
        nextId: 'purify_water_choice',
        disabled: (state) => state.resources.manaFragment < 2,
      },
      { id: 'talk_echo', text: '에코와 대화한다', nextId: 'talk_echo_hub' },
    ],
  },

  // ============================================
  // 휴식
  // ============================================
  {
    id: 'rest_choice',
    speaker: 'narrator',
    text: (state) => {
      if (state.player.health >= 80) {
        return '간이 침대에 누우려 한다.\n\n...그런데 몸 상태가 괜찮은 것 같다.\n정말 쉴 필요가 있을까?';
      }
      return '간이 침대에 몸을 눕힌다.\n전신이 욱신거린다.\n\n눈을 감는다.';
    },
    choices: [
      {
        id: 'rest_confirm',
        text: '잔다',
        nextId: 'rest_result',
        effect: (state) => processTurn(
          applyHeal(applyResources(state, { food: -2 }), 20)
        ),
      },
      {
        id: 'rest_cancel',
        text: '그냥 일어난다',
        nextId: 'shelter_hub',
      },
    ],
  },
  {
    id: 'rest_result',
    speaker: 'narrator',
    text: (state) => {
      const pollution = state.pollution;
      const health = state.player.health;
      
      let baseText = '얼마나 지났을까.\n눈을 뜬다.\n\n';
      
      if (health >= 90) {
        baseText += '몸이 완전히 회복되었다.\n상처가 아물었다.';
      } else if (health >= 70) {
        baseText += '몸이 한결 나아진 것 같다.\n통증이 줄었다.';
      } else {
        baseText += '조금 나아진 것 같다.\n아직 완전하진 않지만.';
      }
      
      if (pollution >= 80) {
        baseText += '\n\n하지만 공기가 더 무거워진 것 같다.\n오염이 심해지고 있다.';
      } else if (pollution >= 60) {
        baseText += '\n\n시간이 흐를수록 오염이 퍼지고 있다.';
      } else {
        baseText += '\n\n바깥에서 바람 소리가 들린다.';
      }
      
      return baseText;
    },
    choices: [
      { id: 'continue', text: '일어선다', nextId: 'rest_echo_comment' },
    ],
  },
  {
    id: 'rest_echo_comment',
    speaker: 'echo',
    text: (state) => {
      const turnCount = state.turnCount;
      const pollution = state.pollution;
      
      if (pollution >= 80) {
        return '오래 쉬셨네요.\n...시간이 별로 없어요.';
      }
      
      if (turnCount <= 5) {
        return '좀 나아지셨어요?\n...몸 관리 잘 하세요.';
      }
      
      const comments = [
        '일어나셨군요.\n준비되셨으면 움직이세요.',
        '푹 쉬셨나요?\n...하지만 시간은 계속 흐르고 있어요.',
        '몸은 좀 어때요?\n무리하지 마세요.',
      ];
      
      return comments[turnCount % comments.length];
    },
    choices: [
      { id: 'continue', text: '...', nextId: 'shelter_hub' },
    ],
  },

  // ============================================
  // 세계수 확인 및 물주기
  // ============================================
  {
    id: 'check_world_tree',
    speaker: 'narrator',
    text: (state) => {
      const worldTree = state.worldTree;
      const hasPurifyingWater = state.resources.purifyingWater >= 1;
      
      let baseText = '세계수 앞에 선다.\n\n';
      
      if (worldTree >= 90) {
        baseText += '거대한 나무가 눈앞에 있다.\n잎들이 푸르게 빛난다.\n\n거의 다 왔다.';
      } else if (worldTree >= 70) {
        baseText += '무성한 가지들이 하늘로 뻗어있다.\n생명력이 느껴진다.';
      } else if (worldTree >= 50) {
        baseText += '청년목이 된 나무.\n줄기가 단단하다.';
      } else if (worldTree >= 30) {
        baseText += '어린 나무가 자라고 있다.\n연약하지만 생명력이 있다.';
      } else {
        baseText += '작은 싹.\n너무 작고 약해 보인다.\n\n...하지만 이게 희망이다.';
      }
      
      baseText += `\n\n(세계수 성장도: ${worldTree}%)`;
      
      if (hasPurifyingWater) {
        baseText += '\n\n정화의 물을 가지고 있다.';
      } else {
        baseText += '\n\n...물이 필요하다.';
      }
      
      return baseText;
    },
    choices: [
      {
        id: 'water',
        text: '물을 준다 (정화수 -1)',
        nextId: 'water_tree_process',
        disabled: (state) => state.resources.purifyingWater < 1,
        effect: (state) => {
          const beforeTree = state.worldTree;
          return {
            ...applyResources(state, { purifyingWater: -1 }),
            worldTree: Math.min(100, state.worldTree + 10),
            pollution: Math.max(0, state.pollution - 5),
            _beforeTree: beforeTree,
          };
        },
      },
      { id: 'back', text: '돌아선다', nextId: 'shelter_hub' },
    ],
  },
  {
    id: 'water_tree_process',
    speaker: 'narrator',
    text: (state) => {
      const beforeTree = (state as any)._beforeTree || state.worldTree - 10;
      const afterTree = state.worldTree;
      return getWorldTreeGrowthText(beforeTree, afterTree);
    },
    choices: [
      {
        id: 'continue',
        text: '지켜본다',
        nextId: 'water_tree_echo_comment',
      },
    ],
  },
  {
    id: 'water_tree_echo_comment',
    speaker: 'echo',
    text: (state) => {
      const worldTree = state.worldTree;
      
      if (worldTree >= 100) {
        return '...해냈어요.\n\n세계수가... 완전히 자랐어요.\n이제...';
      }
      
      if (worldTree >= 90) {
        return '거의 다 왔어요!\n조금만 더!\n\n...정화의 물이 더 필요해요!';
      }
      
      if (worldTree >= 70) {
        return '세계수가 자라고 있어요.\n주변의 오염이 정화되고 있어요.\n\n계속하세요!';
      }
      
      if (worldTree >= 50) {
        return '반쯤 왔어요.\n희망이 보여요.\n\n포기하지 마세요.';
      }
      
      if (worldTree >= 30) {
        return '조금씩... 조금씩 자라고 있어요.\n작지만 확실해요.';
      }
      
      return '...자라고 있어요.\n미약하지만, 확실히.\n\n계속 물을 주세요.';
    },
    choices: [
      {
        id: 'continue',
        text: (state) => state.worldTree >= 100 ? '세계수를 바라본다' : '돌아선다',
        nextId: (state) => state.worldTree >= 100 ? 'ending_good' : 'shelter_hub',
      },
    ],
  },

  // ============================================
  // 물 정화
  // ============================================
  {
    id: 'purify_water_choice',
    speaker: 'narrator',
    text: '마력 결정을 꺼낸다.\n\n푸른 빛이 감도는 작은 결정.\n이걸로 오염된 물을 정화할 수 있다.\n\n마법진을 그린다.',
    choices: [
      {
        id: 'purify',
        text: '주문을 외운다',
        nextId: 'purify_water_process',
        effect: (state) => applyResources(state, { manaFragment: -2, purifyingWater: 1 }),
      },
      {
        id: 'cancel',
        text: '그만둔다',
        nextId: 'shelter_hub',
      },
    ],
  },
  {
    id: 'purify_water_process',
    speaker: 'narrator',
    text: '마력을 집중한다.\n\n"정화의 빛이여, 오염을 씻어내라."\n\n마력 결정이 빛나며 녹아내린다.\n물이 투명해진다.\n\n정화의 물이 만들어졌다.',
    choices: [
      { id: 'continue', text: '병에 담는다', nextId: 'purify_water_echo_comment' },
    ],
  },
  {
    id: 'purify_water_echo_comment',
    speaker: 'echo',
    text: (state) => {
      const purifyingWater = state.resources.purifyingWater;
      const worldTree = state.worldTree;
      
      if (purifyingWater >= 3 && worldTree < 70) {
        return '정화의 물이 많이 모였어요.\n세계수에게 주는 게 좋겠어요.\n\n시간이 별로 없으니까요.';
      }
      
      if (purifyingWater >= 1) {
        return '좋아요.\n이제 세계수에게 물을 줄 수 있어요.';
      }
      
      return '물이 정화됐어요.\n...더 만들 필요가 있을 것 같아요.';
    },
    choices: [
      { id: 'continue', text: '...', nextId: 'shelter_hub' },
    ],
  },

  // ============================================
  // 세계수 확인
  // ============================================
  {
    id: 'check_world_tree',
    speaker: 'narrator',
    text: (state) => {
      const worldTree = state.worldTree;
      
      if (worldTree >= 90) {
        return `세계수를 바라본다.\n\n거대한 나무.\n푸른 잎들이 빛난다.\n\n(세계수 성장도: ${worldTree}%)\n\n거의 다 왔다.`;
      }
      
      if (worldTree >= 70) {
        return `세계수를 바라본다.\n\n무성한 가지들.\n생명력이 느껴진다.\n\n(세계수 성장도: ${worldTree}%)\n\n희망이 보인다.`;
      }
      
      if (worldTree >= 50) {
        return `세계수를 바라본다.\n\n청년목으로 자랐다.\n줄기가 단단하다.\n\n(세계수 성장도: ${worldTree}%)\n\n반쯤 왔다.`;
      }
      
      if (worldTree >= 30) {
        return `세계수를 바라본다.\n\n어린 나무.\n연약하지만 자라고 있다.\n\n(세계수 성장도: ${worldTree}%)\n\n조금씩.`;
      }
      
      return `세계수를 바라본다.\n\n작은 싹.\n너무 작다.\n\n(세계수 성장도: ${worldTree}%)\n\n...자랄 수 있을까?`;
    },
    choices: [
      { id: 'back', text: '돌아선다', nextId: 'shelter_hub' },
    ],
  },
];