import { Scenario } from '@/lib/types';
import { processTurn } from './logic';
import { applyResources, applyDamage } from './helpers';

export const lowerTowerScenarios: Scenario[] = [
  // ============================================
  // 탑 하층부 - 탐험 허브
  // ============================================
  {
    id: 'explore_lower_tower',
    speaker: 'narrator',
    text: (state) => {
      const explored = state.visitedRooms?.length || 0;
      if (explored === 0) {
        return '무너진 탑의 하층부로 들어간다.\n복도 곳곳에 검은 얼룩이 번져있다.\n\n발소리가 울린다.\n너무 조용하다.\n\n여러 복도가 사방으로 뻗어있다.';
      } else if (explored < 3) {
        return `탑 하층부.\n복도들이 미로처럼 얽혀있다.\n\n(탐험한 장소: ${explored}/3)`;
      } else {
        return `탑 하층부.\n이미 주요 구역은 모두 탐색했다.\n\n(탐험한 장소: ${explored}/3)`;
      }
    },
    choices: [
      {
        id: 'east',
        text: (state) => {
          const visited = state.visitedRooms?.includes('research_lab');
          return visited ? '동쪽 복도 - 연구실 (재방문)' : '동쪽 복도 - 부서진 문이 보인다';
        },
        nextId: 'east_corridor',
      },
      {
        id: 'west',
        text: (state) => {
          const visited = state.visitedRooms?.includes('storage');
          return visited ? '서쪽 복도 - 보관소 (재방문)' : '서쪽 복도 - 봉인된 문이 보인다';
        },
        nextId: 'west_corridor',
      },
      {
        id: 'north',
        text: (state) => {
          const visited = state.visitedRooms?.includes('living_quarters');
          return visited ? '북쪽 계단 - 거주구역 (재방문)' : '북쪽 계단 - 위층으로 이어진다';
        },
        nextId: 'north_stairs',
      },
      {
        id: 'south',
        text: (state) => {
          const visited = state.visitedRooms?.includes('garden');
          return visited ? '남쪽 통로 - 정원 (재방문)' : '남쪽 통로 - 식물 냄새가 난다';
        },
        nextId: 'south_passage',
      },
      {
        id: 'back',
        text: (state) => {
          const explored = state.visitedRooms?.length || 0;
          if (explored >= 3) {
            return '돌아간다';
          }
          return '돌아간다';
        },
        nextId: (state) => {
          const explored = state.visitedRooms?.length || 0;
          if (explored >= 3) {
            return 'echo_advice_return';
          }
          return 'shelter_hub';
        },
        effect: (state) => processTurn(state),
      },
    ],
  },

  // ============================================
  // 에코 조언
  // ============================================
  {
    id: 'echo_advice_return',
    speaker: 'echo',
    text: '이 정도면 충분해요.\n너무 오래 있으면 위험해요.\n\n오염이 점점 짙어지고 있어요.',
    choices: [
      { id: 'agree', text: '그래, 돌아가자', nextId: 'shelter_hub', effect: (state) => processTurn(state) },
      {
        id: 'continue',
        text: '조금 더 둘러보고 가자',
        nextId: 'explore_lower_tower',
        effect: (state) => ({ ...state, pollution: Math.min(100, state.pollution + 5) }),
      },
    ],
  },

  // ============================================
  // 동쪽 복도 - 연구실
  // ============================================
  {
    id: 'east_corridor',
    speaker: 'narrator',
    text: (state) => {
      const visited = state.visitedRooms?.includes('research_lab');
      if (visited) {
        return '동쪽 복도.\n이미 조사한 연구실이다.\n더 찾을 건 없어 보인다.';
      }
      return '동쪽 복도를 따라 걷는다.\n부서진 문 너머로 연구실이 보인다.\n\n책상과 선반이 쓰러져 있고, 서류들이 바닥에 흩어져 있다.';
    },
    choices: [
      {
        id: 'search',
        text: (state) => {
          const visited = state.visitedRooms?.includes('research_lab');
          return visited ? '대충 둘러본다' : '조사한다';
        },
        nextId: (state) => {
          const visited = state.visitedRooms?.includes('research_lab');
          return visited ? 'research_lab_revisit' : 'research_lab_first';
        },
      },
      { id: 'back', text: '돌아간다', nextId: 'explore_lower_tower' },
    ],
  },
  {
    id: 'research_lab_first',
    speaker: 'narrator',
    text: '연구실을 조사한다.\n\n서류 더미 사이에서 노트를 발견한다.\n먼지를 털어내고 펼쳐본다.\n\n"마도력 134년 3월 7일\n율리우스 탑 안정화 프로젝트 - 5차 실험\n\n공간 왜곡이 심화되고 있다.\n탑이 스스로 성장하고 있다.\n율리우스 대현자께서 남기신 마법진이 아직 작동 중인가?\n\n이대로라면 탑 내부 구조가 계속 변할 것이다."\n\n...탑이 살아있다는 뜻인가.',
    choices: [
      {
        id: 'continue_search',
        text: '더 조사한다 [감지 판정]',
        diceCheck: 10,
        successId: 'research_lab_success',
        failureId: 'research_lab_fail',
      },
    ],
  },
  {
    id: 'research_lab_success',
    speaker: 'narrator',
    text: '구석진 선반을 뒤진다.\n\n마력 결정 몇 개와 낡은 마도 공학 교본을 발견했다.\n표지에는 "기초 마력 증폭 회로"라고 적혀있다.\n\n이 정보는 유용할 것 같다.',
    choices: [
      {
        id: 'take',
        text: '챙기고 나간다',
        nextId: 'explore_lower_tower',
        effect: (state) => {
          const newRooms = [...(state.visitedRooms || []), 'research_lab'];
          return applyResources({ ...state, visitedRooms: newRooms }, { manaFragment: 3 });
        },
      },
    ],
  },
  {
    id: 'research_lab_fail',
    speaker: 'narrator',
    text: '더 찾아보지만 별다른 것을 발견하지 못했다.\n\n마력 결정 하나만 챙긴다.',
    choices: [
      {
        id: 'back',
        text: '돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => {
          const newRooms = [...(state.visitedRooms || []), 'research_lab'];
          return applyResources({ ...state, visitedRooms: newRooms }, { manaFragment: 1 });
        },
      },
    ],
  },
  {
    id: 'research_lab_revisit',
    speaker: 'narrator',
    text: '이미 조사한 곳이다.\n뒤적거려 봐도 더 이상 쓸만한 건 없다.\n\n구석에 먼지 쌓인 병 하나만 발견했다.',
    choices: [
      {
        id: 'back',
        text: '가지고 돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyResources(state, { purifyingWater: 1 }),
      },
    ],
  },

  // ============================================
  // 서쪽 복도 - 보관소
  // ============================================
  {
    id: 'west_corridor',
    speaker: 'narrator',
    text: (state) => {
      const visited = state.visitedRooms?.includes('storage');
      if (visited) {
        return '서쪽 복도.\n봉인이 풀린 보관소 문이 열려있다.';
      }
      return '서쪽 복도 끝에 무거운 문이 있다.\n마법 봉인이 걸려있지만... 빛이 깜빡이고 있다.\n\n마력이 약해진 것 같다.';
    },
    choices: [
      {
        id: 'open',
        text: (state) => {
          const visited = state.visitedRooms?.includes('storage');
          return visited ? '들어간다' : '문을 연다 [마법 판정]';
        },
        nextId: (state) => {
          const visited = state.visitedRooms?.includes('storage');
          return visited ? 'storage_revisit' : 'storage_open';
        },
      },
      { id: 'back', text: '돌아간다', nextId: 'explore_lower_tower' },
    ],
  },
  {
    id: 'storage_open',
    speaker: 'narrator',
    text: '마법진에 손을 댄다.\n미약하게 남은 마력이 느껴진다.\n\n집중한다.',
    choices: [
      {
        id: 'continue',
        text: '[판정 진행]',
        diceCheck: 9,
        successId: 'storage_first',
        failureId: 'storage_fail',
      },
    ],
  },
  {
    id: 'storage_first',
    speaker: 'narrator',
    text: '마법진이 해제된다.\n무거운 문이 천천히 열린다.\n\n보관소 안은 어둡고 축축하다.\n선반에 여러 물건들이 놓여있다.\n\n가장 눈에 띄는 건... 벽에 걸린 초상화다.\n13명의 인물이 그려져 있다.\n\n아래 명판에는 이렇게 적혀있다.\n"문을 닫은 이들 - 마도력 원년"',
    choices: [
      { id: 'examine', text: '초상화를 자세히 본다', nextId: 'storage_painting' },
      { id: 'search', text: '선반을 조사한다', nextId: 'storage_search' },
    ],
  },
  {
    id: 'storage_painting',
    speaker: 'narrator',
    text: '13명의 마법사.\n\n중앙에 서 있는 이는 "율리우스 아이센하르트".\n이 탑을 만든 장본인.\n\n옆에는 "에델 에드위나 하이드", "하멜 메로프"...\n\n모두 대륙을 구한 영웅들.\n마계의 문을 닫고, 세계에 마법을 전한 이들.\n\n...그리고 이제는 전설 속 인물들.',
    choices: [
      { id: 'search', text: '선반을 조사한다', nextId: 'storage_search' },
    ],
  },
  {
    id: 'storage_search',
    speaker: 'narrator',
    text: '선반을 뒤진다.\n\n마력 결정, 정화의 물, 그리고...\n작은 수정 구슬.\n\n손에 들자 미약한 빛이 감돈다.\n율리우스의 유산 중 하나일지도 모른다.',
    choices: [
      {
        id: 'take',
        text: '모두 챙기고 나간다',
        nextId: 'explore_lower_tower',
        effect: (state) => {
          const newRooms = [...(state.visitedRooms || []), 'storage'];
          return applyResources(
            { ...state, visitedRooms: newRooms },
            { manaFragment: 4, purifyingWater: 2, soulFragment: 1 }
          );
        },
      },
    ],
  },
  {
    id: 'storage_fail',
    speaker: 'narrator',
    text: '마법진이 반응하지 않는다.\n집중력이 부족하다.\n\n억지로 열려고 했지만 마력이 역류한다.\n머리가 지끈거린다.',
    choices: [
      {
        id: 'back',
        text: '포기하고 돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyDamage(state, 8),
      },
    ],
  },
  {
    id: 'storage_revisit',
    speaker: 'narrator',
    text: '보관소.\n13인의 초상화가 조용히 당신을 내려다본다.\n\n선반은 거의 비었다.\n마력 결정 하나만 굴러다닌다.',
    choices: [
      {
        id: 'back',
        text: '챙기고 돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyResources(state, { manaFragment: 1 }),
      },
    ],
  },

  // ============================================
  // 북쪽 계단 - 거주 구역
  // ============================================
  {
    id: 'north_stairs',
    speaker: 'narrator',
    text: (state) => {
      const visited = state.visitedRooms?.includes('living_quarters');
      if (visited) {
        return '북쪽 계단.\n붕괴된 거주 구역이 보인다.';
      }
      return '북쪽 계단을 올라간다.\n2층으로 이어지는 듯했지만... 계단이 무너져 있다.\n\n대신 옆으로 난 문이 보인다.\n거주 구역인 것 같다.';
    },
    choices: [
      {
        id: 'enter',
        text: (state) => {
          const visited = state.visitedRooms?.includes('living_quarters');
          return visited ? '들어간다' : '문을 열고 들어간다';
        },
        nextId: (state) => {
          const visited = state.visitedRooms?.includes('living_quarters');
          return visited ? 'living_quarters_revisit' : 'living_quarters_first';
        },
      },
      { id: 'back', text: '돌아간다', nextId: 'explore_lower_tower' },
    ],
  },
  {
    id: 'living_quarters_first',
    speaker: 'narrator',
    text: '거주 구역.\n\n좁은 방들이 복도를 따라 늘어서 있다.\n탑의 하급 마법사들이 살던 곳.\n\n한 방의 문이 열려있다.\n안을 들여다본다.',
    choices: [
      { id: 'examine', text: '방을 조사한다', nextId: 'living_quarters_room' },
    ],
  },
  {
    id: 'living_quarters_room',
    speaker: 'narrator',
    text: '작은 침대, 책상, 선반.\n소박한 방이다.\n\n책상 위에 일기장이 놓여있다.\n펼쳐본다.\n\n"마도력 133년 8월 15일\n\n드디어 율리우스 탑의 견습생이 되었다!\n고향을 떠나 이곳까지 오는 게 쉽지 않았지만...\n돔 도시의 미래를 위해.\n\n아버지, 어머니, 저 열심히 할게요."\n\n...마지막 페이지.\n\n"134년 2월 11일\n\n오염이 번지고 있다.\n탑이 흔들린다.\n모두 대피하라고 한다.\n\n...살아남을 수 있을까?"',
    choices: [
      { id: 'continue', text: '일기장을 덮는다', nextId: 'living_quarters_search' },
    ],
  },
  {
    id: 'living_quarters_search',
    speaker: 'narrator',
    text: '선반을 조사한다.\n\n식량 캔 몇 개, 그리고 낡은 신문 한 장.\n\n"마도력 127년 - 제3 돔 도시 건설 완료\n황무지 위에 새로운 희망이 피어나다"\n\n기사 옆에는 거대한 돔의 사진.\n그 안에 빽빽이 들어선 건물들.\n\n...이제는 모두 무너졌다.',
    choices: [
      {
        id: 'take',
        text: '식량을 챙기고 나온다',
        nextId: 'explore_lower_tower',
        effect: (state) => {
          const newRooms = [...(state.visitedRooms || []), 'living_quarters'];
          return applyResources({ ...state, visitedRooms: newRooms }, { food: 4 });
        },
      },
    ],
  },
  {
    id: 'living_quarters_revisit',
    speaker: 'narrator',
    text: '거주 구역.\n비어있는 방들.\n\n한 방에 식량 캔 하나가 굴러다닌다.',
    choices: [
      {
        id: 'back',
        text: '챙기고 돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyResources(state, { food: 1 }),
      },
    ],
  },

  // ============================================
  // 남쪽 통로 - 변이 정원
  // ============================================
  {
    id: 'south_passage',
    speaker: 'narrator',
    text: (state) => {
      const visited = state.visitedRooms?.includes('garden');
      if (visited) {
        return '남쪽 통로.\n변이된 정원이 보인다.';
      }
      return '남쪽 통로를 따라간다.\n공기가 축축하고 무거워진다.\n\n식물 냄새... 아니, 썩은 냄새가 난다.';
    },
    choices: [
      {
        id: 'continue',
        text: (state) => {
          const visited = state.visitedRooms?.includes('garden');
          return visited ? '들어간다' : '조심스럽게 나아간다';
        },
        nextId: (state) => {
          const visited = state.visitedRooms?.includes('garden');
          return visited ? 'garden_revisit' : 'garden_first';
        },
      },
      { id: 'back', text: '돌아간다', nextId: 'explore_lower_tower' },
    ],
  },
  {
    id: 'garden_first',
    speaker: 'narrator',
    text: '넓은 방이 나타난다.\n\n한때 정원이었을 곳.\n하지만 지금은...\n\n검은 덩굴들이 벽을 타고 자라나 있다.\n변이된 식물들.\n오염에 잠식당한 생명.\n\n중앙에 분수가 보인다.\n물은 말라있지만, 바닥에 푸른 액체가 조금 고여있다.',
    choices: [
      { id: 'examine_fountain', text: '분수를 조사한다', nextId: 'garden_fountain' },
      { id: 'examine_plants', text: '덩굴을 조사한다 [위험]', nextId: 'garden_plants' },
      { id: 'back', text: '나간다', nextId: 'explore_lower_tower' },
    ],
  },
  {
    id: 'garden_fountain',
    speaker: 'narrator',
    text: '분수대에 다가간다.\n바닥의 푸른 액체.\n\n정화의 물이다.\n희미하게 마력이 느껴진다.\n\n명판이 보인다.\n"세계수 정화 프로젝트 - 실험장"\n\n...실패한 프로젝트.',
    choices: [
      {
        id: 'take_water',
        text: '정화의 물을 담는다',
        nextId: 'garden_after_fountain',
        effect: (state) => applyResources(state, { purifyingWater: 3 }),
      },
    ],
  },
  {
    id: 'garden_after_fountain',
    speaker: 'narrator',
    text: '물을 병에 담았다.\n\n그때.',
    choices: [
      { id: 'continue', text: '...?', nextId: 'garden_plants_attack' },
    ],
  },
  {
    id: 'garden_plants',
    speaker: 'narrator',
    text: '덩굴에 가까이 다가간다.\n검은 표면이 맥박치듯 움직인다.\n\n살아있다.\n\n그리고... 당신을 감지했다.',
    choices: [
      { id: 'continue', text: '...!', nextId: 'garden_plants_attack' },
    ],
  },
  {
    id: 'garden_plants_attack',
    speaker: 'narrator',
    text: '덩굴이 움직인다!\n검은 촉수가 휘둘러진다!',
    choices: [
      {
        id: 'dodge',
        text: '피한다! [민첩 판정]',
        diceCheck: 11,
        successId: 'garden_escape',
        failureId: 'garden_hit',
      },
      {
        id: 'burn',
        text: '불태운다! [마법 판정, 마력결정 -2]',
        diceCheck: 9,
        successId: 'garden_burn',
        failureId: 'garden_burn_fail',
        disabled: (state) => state.resources.manaFragment < 2,
        effect: (state) => applyResources(state, { manaFragment: -2 }),
      },
    ],
  },
  {
    id: 'garden_escape',
    speaker: 'narrator',
    text: '재빠르게 뒤로 물러난다.\n덩굴이 허공을 휘젓는다.\n\n거리를 벌려 도망친다.',
    choices: [
      {
        id: 'run',
        text: '황급히 빠져나온다',
        nextId: 'explore_lower_tower',
        effect: (state) => {
          const newRooms = [...(state.visitedRooms || []), 'garden'];
          return { ...state, visitedRooms: newRooms };
        },
      },
    ],
  },
  {
    id: 'garden_hit',
    speaker: 'narrator',
    text: '덩굴이 팔을 휘감는다!\n가시가 파고든다.\n\n억지로 떼어내고 도망친다.\n피가 흐른다.',
    choices: [
      {
        id: 'run',
        text: '비틀거리며 나온다',
        nextId: 'explore_lower_tower',
        effect: (state) => {
          const newRooms = [...(state.visitedRooms || []), 'garden'];
          return applyDamage({ ...state, visitedRooms: newRooms }, 15);
        },
      },
    ],
  },
  {
    id: 'garden_burn',
    speaker: 'narrator',
    text: '마법진을 그린다.\n\n"불꽃이여!"\n\n화염이 덩굴을 집어삼킨다.\n검은 식물이 타들어가며 재가 된다.\n\n연기가 자욱하다.',
    choices: [
      {
        id: 'leave',
        text: '빠져나온다',
        nextId: 'explore_lower_tower',
        effect: (state) => {
          const newRooms = [...(state.visitedRooms || []), 'garden'];
          return { ...state, visitedRooms: newRooms };
        },
      },
    ],
  },
  {
    id: 'garden_burn_fail',
    speaker: 'narrator',
    text: '마법이 약하다.\n불꽃이 덩굴을 태우지 못한다.\n\n덩굴이 덮친다!\n가까스로 벗어났지만 심하게 다쳤다.',
    choices: [
      {
        id: 'run',
        text: '도망친다',
        nextId: 'explore_lower_tower',
        effect: (state) => {
          const newRooms = [...(state.visitedRooms || []), 'garden'];
          return applyDamage({ ...state, visitedRooms: newRooms }, 20);
        },
      },
    ],
  },
  {
    id: 'garden_revisit',
    speaker: 'narrator',
    text: '정원.\n불탄 덩굴의 재가 바닥에 널려있다.\n\n분수대는 비었다.\n하지만 바닥의 틈새에서 물이 조금 고인다.',
    choices: [
      {
        id: 'back',
        text: '조금 모아서 돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyResources(state, { purifyingWater: 1 }),
      },
    ],
  },

  // ============================================
  // 기존 변이체 조우 (랜덤 이벤트로 전환)
  // ============================================
  {
    id: 'encounter_mutant',
    speaker: 'narrator',
    text: '복도를 걷는다.\n\n그때.\n\n"...ㅏ...ㅏ..."\n\n신음 소리.\n모퉁이 너머에서 무언가 다가온다.',
    choices: [
      {
        id: 'hide',
        text: '숨는다 [민첩 판정]',
        diceCheck: 12,
        successId: 'hide_success',
        failureId: 'encounter_mutant_combat',
      },
      { id: 'watch', text: '지켜본다', nextId: 'encounter_mutant_watch' },
    ],
  },
  {
    id: 'hide_success',
    speaker: 'narrator',
    text: '재빠르게 잔해 뒤로 몸을 숨긴다.\n\n괴물이 지나간다.\n한때 사람이었을 형체.\n검게 물든 팔다리가 기괴하게 뒤틀려 있다.\n\n괴물이 멀어진다.',
    choices: [
      {
        id: 'continue',
        text: '조용히 자리를 뜬다',
        nextId: 'explore_lower_tower',
      },
    ],
  },
  {
    id: 'encounter_mutant_watch',
    speaker: 'narrator',
    text: '모퉁이를 돌아 나타난 것은... 사람이었다.\n\n아니, 사람이었던 것.\n\n반쯤 오염된 변이체.\n한쪽 팔은 검게 변이되어 있고, 눈에는 이성의 빛이 거의 사라졌다.\n\n"...ㄷ...도..."\n\n괴물이 당신을 발견했다.',
    choices: [
      { id: 'fight', text: '싸운다', nextId: 'encounter_mutant_combat' },
    ],
  },
  {
    id: 'encounter_mutant_combat',
    speaker: 'narrator',
    text: '변이체가 덤벼든다.\n검게 물든 팔이 휘둘러진다.',
    choices: [
      {
        id: 'melee',
        text: '맞서 싸운다 [힘 판정]',
        diceCheck: 10,
        successId: 'mutant_win',
        failureId: 'mutant_injured',
      },
      {
        id: 'dodge',
        text: '피하며 반격한다 [민첩 판정]',
        diceCheck: 12,
        successId: 'mutant_win_clean',
        failureId: 'mutant_injured',
      },
      {
        id: 'magic',
        text: '마법으로 공격한다 [마법 판정, 마력결정 -1]',
        diceCheck: 8,
        successId: 'mutant_win_magic',
        failureId: 'mutant_magic_fail',
        disabled: (state) => state.resources.manaFragment < 1,
        effect: (state) => applyResources(state, { manaFragment: -1 }),
      },
    ],
  },
  {
    id: 'mutant_win',
    speaker: 'narrator',
    text: '변이체의 공격을 막아내며 반격한다.\n몇 번의 타격 끝에 변이체가 쓰러진다.\n\n검은 안개가 흩어지며 사라진다.\n바닥에 무언가 떨어진다.\n\n마력 결정 몇 개.\n그리고... 낡은 신분증.',
    choices: [
      { id: 'check_id', text: '신분증을 확인한다', nextId: 'mutant_win_id' },
      {
        id: 'leave',
        text: '그냥 둔다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyDamage(applyResources(state, { manaFragment: 2 }), 10),
      },
    ],
  },
  {
    id: 'mutant_win_id',
    speaker: 'narrator',
    text: '신분증을 집어든다.\n\n"마탑 도시 시민증 - 이름: 마르타 슈나이더 - 발급일: 마도력 127년"\n\n사진 속 여성은 미소 짓고 있다.\n\n...이제는 괴물이 되어 사라졌다.',
    choices: [
      {
        id: 'continue',
        text: '신분증을 내려놓고 돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyDamage(applyResources(state, { manaFragment: 2 }), 10),
      },
    ],
  },
  {
    id: 'mutant_win_clean',
    speaker: 'narrator',
    text: '변이체의 공격을 깔끔하게 피하며 반격한다.\n정확한 타격에 변이체가 쓰러진다.\n\n검은 안개가 흩어지며 사라진다.\n바닥에 마력 결정 몇 개가 떨어진다.',
    choices: [
      {
        id: 'continue',
        text: '챙기고 돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyDamage(applyResources(state, { manaFragment: 3 }), 5),
      },
    ],
  },
  {
    id: 'mutant_win_magic',
    speaker: 'narrator',
    text: '마법진을 그리며 주문을 외운다.\n\n푸른 빛이 변이체를 관통한다.\n변이체가 비명을 지르며 사라진다.\n\n검은 안개만 남는다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'explore_lower_tower',
      },
    ],
  },
  {
    id: 'mutant_injured',
    speaker: 'narrator',
    text: '변이체의 공격을 피하지 못했다.\n검게 물든 손톱이 팔을 할퀸다.\n\n간신히 변이체를 쓰러뜨렸지만 심하게 다쳤다.',
    choices: [
      {
        id: 'continue',
        text: '황급히 돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyDamage(applyResources(state, { manaFragment: 1 }), 25),
      },
    ],
  },
  {
    id: 'mutant_magic_fail',
    speaker: 'narrator',
    text: '마법이 빗나갔다.\n변이체가 덤벼든다.\n\n간신히 격퇴했지만 중상을 입었다.',
    choices: [
      {
        id: 'continue',
        text: '비틀거리며 돌아간다',
        nextId: 'explore_lower_tower',
        effect: (state) => applyDamage(state, 30),
      },
    ],
  },
];