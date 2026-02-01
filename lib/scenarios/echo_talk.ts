import { Scenario, GameState } from '@/lib/types';
import { applyTrust } from './helpers';

// 에코의 현재 기분 판단
const getEchoMood = (state: GameState): 'happy' | 'worried' | 'sad' | 'angry' | 'neutral' => {
  const { echoTrust, pollution, worldTree, player, turnCount } = state;
  
  if (pollution >= 90) return 'worried';
  if (player.health <= 20) return 'worried';
  if (echoTrust >= 80 && worldTree >= 60) return 'happy';
  if (echoTrust <= 20) return 'sad';
  if (turnCount >= 20 && worldTree < 30) return 'angry';
  
  return 'neutral';
};

// 에코 대화 시작 멘트
const getEchoTalkGreeting = (state: GameState): string => {
  const mood = getEchoMood(state);
  const trust = state.echoTrust;
  const turnCount = state.turnCount;
  
  if (mood === 'worried') {
    if (state.pollution >= 90) return '...시간이 없어요.\n정말 지금 대화할 시간이 있나요?';
    if (state.player.health <= 20) return '괜찮으세요?\n먼저 쉬는 게...';
    return '...걱정돼요.';
  }
  
  if (mood === 'angry') {
    return '...뭐예요.\n세계수가 자라지 않고 있어요.';
  }
  
  if (mood === 'happy' && trust >= 80) {
    const greetings = [
      '...네?\n무슨 일이세요?',
      '저한테 할 말이 있으세요?',
      '...이야기하고 싶으신가 봐요.',
    ];
    return greetings[turnCount % greetings.length];
  }
  
  if (trust >= 60) {
    const greetings = [
      '뭐가 궁금하세요?',
      '...무슨 일이에요?',
      '저한테 물어보실 게 있나요?',
      '...네?',
    ];
    return greetings[turnCount % greetings.length];
  }
  
  if (trust <= 30) {
    return '...뭐예요?';
  }
  
  return '뭐가 궁금하세요?';
};

export const echoTalkScenarios: Scenario[] = [
  // ============================================
  // 대화 허브
  // ============================================
  {
    id: 'talk_echo_hub',
    speaker: 'echo',
    text: getEchoTalkGreeting,
    choices: [
      {
        id: 'ask_yourself',
        text: '"당신에 대해 물어봐도 될까요?"',
        nextId: 'talk_echo_yourself_hub',
      },
      {
        id: 'ask_world',
        text: '"이 세계에 대해 알려주세요."',
        nextId: 'talk_echo_world_hub',
      },
      {
        id: 'ask_situation',
        text: '"현재 상황은 어떤가요?"',
        nextId: 'talk_echo_situation',
      },
      {
        id: 'ask_feelings',
        text: '"지금 기분이 어때요?"',
        nextId: 'talk_echo_feelings',
        condition: (state) => state.echoTrust >= 40,
      },
      {
        id: 'just_talk',
        text: '"그냥 이야기하고 싶어서요."',
        nextId: 'talk_echo_casual_hub',
        condition: (state) => state.echoTrust >= 60,
      },
      {
        id: 'comfort',
        text: '"괜찮으세요?"',
        nextId: 'talk_echo_comfort',
        condition: (state) => state.echoTrust >= 50 && (state.pollution >= 70 || state.turnCount >= 15),
      },
      { id: 'back', text: '대화를 마친다', nextId: 'talk_echo_end' },
    ],
  },

  // ============================================
  // 에코 자신에 대한 질문
  // ============================================
  {
    id: 'talk_echo_yourself_hub',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 80) {
        return '저에 대해서요?\n...뭐가 궁금하세요?';
      }
      if (state.echoTrust >= 50) {
        return '저요?\n...뭘 알고 싶으신데요?';
      }
      return '...왜 그런 걸 물어보세요?';
    },
    choices: [
      { id: 'ask_identity', text: '"당신은 누구예요?"', nextId: 'talk_echo_identity' },
      { id: 'ask_past', text: '"과거에 무슨 일이 있었나요?"', nextId: 'talk_echo_past' },
      { id: 'ask_body', text: '"육체가 없다는 게..."', nextId: 'talk_echo_body' },
      {
        id: 'ask_name',
        text: '"에코라는 이름은 누가 지어줬어요?"',
        nextId: 'talk_echo_name',
        condition: (state) => state.echoTrust >= 60,
      },
      {
        id: 'ask_lonely',
        text: '"혼자 있어서 외롭지 않았나요?"',
        nextId: 'talk_echo_lonely',
        condition: (state) => state.echoTrust >= 70,
      },
      { id: 'back', text: '다른 걸 묻는다', nextId: 'talk_echo_hub' },
    ],
  },
  {
    id: 'talk_echo_identity',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 70) {
        return '저는... 에코예요.\n세계수의 영혼.\n\n그게 전부예요.\n...아마도.';
      }
      return '저요?\n\n...세계수의 영혼이에요.\n그게 전부예요.';
    },
    choices: [
      {
        id: 'press',
        text: '"아마도...?"',
        nextId: 'talk_echo_identity_press',
        condition: (state) => state.echoTrust >= 70,
      },
      {
        id: 'doubt',
        text: '"정말 그게 전부인가요?"',
        nextId: 'talk_echo_identity_doubt',
      },
      {
        id: 'accept',
        text: '"...알겠어요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 2),
      },
    ],
  },
  {
    id: 'talk_echo_identity_press',
    speaker: 'echo',
    text: '...사실은 저도 잘 모르겠어요.\n\n기억이 명확하지 않아요.\n저는 세계수의 영혼이 맞는데...\n\n가끔 이상한 기억이 떠올라요.\n사람이었던 것 같은 기억들.\n\n...하지만 확신할 수 없어요.',
    choices: [
      {
        id: 'encourage',
        text: '"천천히 생각해봐요."',
        nextId: 'talk_echo_identity_press_kind',
        effect: (state) => applyTrust(state, 5),
      },
      {
        id: 'curious',
        text: '"어떤 기억이 떠오르는데요?"',
        nextId: 'talk_echo_identity_press_curious',
      },
    ],
  },
  {
    id: 'talk_echo_identity_press_kind',
    speaker: 'echo',
    text: '...고마워요.\n\n언젠가는... 알 수 있겠죠.\n지금은 세계수를 살리는 게 먼저예요.',
    choices: [
      { id: 'back', text: '고개를 끄덕인다', nextId: 'talk_echo_yourself_hub', effect: (state) => applyTrust(state, 3) },
    ],
  },
  {
    id: 'talk_echo_identity_press_curious',
    speaker: 'echo',
    text: '...파란 하늘.\n따뜻한 햇살.\n누군가의 웃음소리.\n\n그리고... 이름.\n제 이름이 아닌, 다른 이름.\n\n하지만 떠올릴 수가 없어요.\n머릿속이 흐릿해요.',
    choices: [
      {
        id: 'comfort',
        text: '"무리하지 마세요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 4),
      },
      {
        id: 'push',
        text: '"조금 더 생각해보세요."',
        nextId: 'talk_echo_identity_press_push',
      },
    ],
  },
  {
    id: 'talk_echo_identity_press_push',
    speaker: 'echo',
    text: '...싫어요.\n\n머리가 아파요.\n그만 물어봐 주세요.',
    choices: [
      {
        id: 'apologize',
        text: '"미안해요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, -3),
      },
    ],
  },
  {
    id: 'talk_echo_identity_doubt',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 60) {
        return '...믿지 못하시는군요.\n\n어쩔 수 없죠.\n저도 제가 누군지 확실히 모르니까요.';
      }
      return '...그게 전부라니까요.\n\n더 이상 묻지 마세요.';
    },
    choices: [
      {
        id: 'apologize',
        text: '"미안해요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, -2),
      },
      {
        id: 'insist',
        text: '"뭔가 숨기고 있잖아요."',
        nextId: 'talk_echo_identity_doubt_insist',
      },
    ],
  },
  {
    id: 'talk_echo_identity_doubt_insist',
    speaker: 'echo',
    text: '...숨기는 게 아니에요.\n\n그냥 기억이 안 나는 거예요.\n왜 그렇게 의심하세요?',
    choices: [
      {
        id: 'back_down',
        text: '"...죄송해요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, -5),
      },
      {
        id: 'continue',
        text: '"...그냥 궁금해서요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, -3),
      },
    ],
  },
  {
    id: 'talk_echo_past',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 80) {
        return '과거요...\n\n도시가 무너진 날.\n검은 안개가 쏟아져 나왔어요.\n\n사람들이 비명을 질렀고...\n저는... 저는...\n\n...기억이 안 나요.\n그 다음부터는 아무것도.';
      }
      if (state.echoTrust >= 50) {
        return '...어느 날 갑자기, 탑에서 무언가가 폭발했어요.\n검은 오염이 쏟아져 나왔고, 모든 게 무너졌죠.\n\n그게 전부예요.';
      }
      return '...말하고 싶지 않아요.';
    },
    choices: [
      {
        id: 'comfort',
        text: '"괜찮아요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 3),
        condition: (state) => state.echoTrust >= 50,
      },
      {
        id: 'press',
        text: '"조금만 더 말해줄래요?"',
        nextId: 'talk_echo_past_press',
        condition: (state) => state.echoTrust >= 80,
      },
      {
        id: 'accept',
        text: '"...알겠어요."',
        nextId: 'talk_echo_yourself_hub',
      },
    ],
  },
  {
    id: 'talk_echo_past_press',
    speaker: 'echo',
    text: '...더?\n\n모르겠어요.\n그날 이후로는... 전부 어둠이었어요.\n\n얼마나 지났는지도 모르겠어요.\n시간이 흐르는 것도 느껴지지 않았어요.\n\n그냥... 어둠 속에서 떠다녔어요.\n\n그러다가... 당신이 왔어요.',
    choices: [
      {
        id: 'grateful',
        text: '"...저도 당신을 만나서 다행이에요."',
        nextId: 'talk_echo_past_press_grateful',
        effect: (state) => applyTrust(state, 8),
      },
      {
        id: 'curious',
        text: '"어둠 속에서 뭘 했어요?"',
        nextId: 'talk_echo_past_press_curious',
      },
    ],
  },
  {
    id: 'talk_echo_past_press_grateful',
    speaker: 'echo',
    text: '...저도요.\n\n당신이 없었으면...\n저는 계속 혼자였을 거예요.\n\n...고마워요.',
    choices: [
      {
        id: 'continue',
        text: '미소 짓는다',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },
  {
    id: 'talk_echo_past_press_curious',
    speaker: 'echo',
    text: '...아무것도요.\n\n생각할 수도, 느낄 수도 없었어요.\n그냥... 존재만 했어요.\n\n끝없이.\n\n...끔찍했어요.',
    choices: [
      {
        id: 'comfort',
        text: '"이제 괜찮아요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },
  {
    id: 'talk_echo_body',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 70) {
        return '...육체가 없어요.\n\n만질 수도, 느낄 수도 없어요.\n배고프지도, 춥지도 않아요.\n\n편한 것 같지만...\n사실은 외로워요.';
      }
      return '...육체가 없어요.\n영혼만 남았죠.\n\n그게 전부예요.';
    },
    choices: [
      {
        id: 'sad',
        text: '"...외롭겠어요."',
        nextId: 'talk_echo_body_sad',
        condition: (state) => state.echoTrust >= 70,
        effect: (state) => applyTrust(state, 5),
      },
      {
        id: 'curious',
        text: '"어떤 느낌이에요?"',
        nextId: 'talk_echo_body_curious',
      },
      {
        id: 'back',
        text: '"...알겠어요."',
        nextId: 'talk_echo_yourself_hub',
      },
    ],
  },
  {
    id: 'talk_echo_body_sad',
    speaker: 'echo',
    text: '...네.\n\n그래도 당신이 있어서...\n조금 나아요.\n\n이야기할 수 있으니까요.',
    choices: [
      {
        id: 'continue',
        text: '"언제든 말 걸어요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 4),
      },
    ],
  },
  {
    id: 'talk_echo_body_curious',
    speaker: 'echo',
    text: '...이상해요.\n\n존재하는데 존재하지 않는 것 같아요.\n생각은 할 수 있는데...\n느낄 순 없어요.\n\n바람도, 온기도, 고통도.\n\n...공허해요.',
    choices: [
      {
        id: 'comfort',
        text: '"...미안해요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
  {
    id: 'talk_echo_name',
    speaker: 'echo',
    text: '...에코.\n\n메아리라는 뜻이죠.\n스스로 지은 이름이에요.\n\n제가 한 말이...\n텅 빈 공간에 울려 퍼지는 것 같았거든요.\n\n아무도 듣지 않는 메아리.',
    choices: [
      {
        id: 'sad',
        text: '"...이제는 제가 들어요."',
        nextId: 'talk_echo_name_sad',
        effect: (state) => applyTrust(state, 7),
      },
      {
        id: 'curious',
        text: '"본명은 기억 안 나요?"',
        nextId: 'talk_echo_name_real',
      },
    ],
  },
  {
    id: 'talk_echo_name_sad',
    speaker: 'echo',
    text: '...네.\n\n당신이 들어줘요.\n\n더 이상 메아리가 아니에요.\n...고마워요.',
    choices: [
      {
        id: 'continue',
        text: '고개를 끄덕인다',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
  {
    id: 'talk_echo_name_real',
    speaker: 'echo',
    text: '...본명.\n\n가끔 생각나는 것 같아요.\n누군가 제 이름을 부르는 소리.\n\n하지만 흐릿해요.\n확실하지 않아요.\n\n에코가 편해요.\n지금은.',
    choices: [
      {
        id: 'accept',
        text: '"에코도 좋은 이름이에요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 4),
      },
    ],
  },
  {
    id: 'talk_echo_lonely',
    speaker: 'echo',
    text: '...외로웠어요.\n\n정말 외로웠어요.\n어둠 속에 혼자.\n\n누구도 없었어요.\n시간도 느껴지지 않았어요.\n\n그냥... 영원히 혼자인 것 같았어요.\n\n...당신이 오기 전까지는.',
    choices: [
      {
        id: 'comfort',
        text: '"이제 혼자가 아니에요."',
        nextId: 'talk_echo_lonely_comfort',
        effect: (state) => applyTrust(state, 10),
      },
      {
        id: 'promise',
        text: '"계속 함께 있을게요."',
        nextId: 'talk_echo_lonely_promise',
        effect: (state) => applyTrust(state, 12),
      },
    ],
  },
  {
    id: 'talk_echo_lonely_comfort',
    speaker: 'echo',
    text: '...네.\n\n이제는 혼자가 아니에요.\n당신이 있으니까요.\n\n...정말 고마워요.',
    choices: [
      {
        id: 'continue',
        text: '손을 뻗는다 (닿지 않지만)',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },
  {
    id: 'talk_echo_lonely_promise',
    speaker: 'echo',
    text: '...정말요?\n\n...약속해요?\n\n......고마워요.\n정말... 정말 고마워요.',
    choices: [
      {
        id: 'continue',
        text: '"약속해요."',
        nextId: 'talk_echo_yourself_hub',
        effect: (state) => applyTrust(state, 8),
      },
    ],
  },

  // ============================================
  // 세계에 대한 질문
  // ============================================
  {
    id: 'talk_echo_world_hub',
    speaker: 'echo',
    text: '세계에 대해서요?\n뭐가 궁금하세요?',
    choices: [
      { id: 'ask_city', text: '"이 도시는 어땠나요?"', nextId: 'talk_echo_city' },
      { id: 'ask_tower', text: '"가시나무 탑에 대해 알려주세요."', nextId: 'talk_echo_tower' },
      { id: 'ask_mages', text: '"13명의 마법사에 대해..."', nextId: 'talk_echo_mages' },
      { id: 'ask_pollution', text: '"오염은 어디서 온 건가요?"', nextId: 'talk_echo_pollution' },
      {
        id: 'ask_hope',
        text: '"희망이 있을까요?"',
        nextId: 'talk_echo_hope',
        condition: (state) => state.echoTrust >= 50,
      },
      { id: 'back', text: '다른 걸 묻는다', nextId: 'talk_echo_hub' },
    ],
  },
  {
    id: 'talk_echo_city',
    speaker: 'echo',
    text: '이곳은... 가시나무 탑 아래 세워진 도시였어요.\n\n마도력 1년, 13명의 마법사님들이 마계의 문을 닫은 뒤,\n사람들은 황무지 위에 돔을 세워 모여 살기 시작했죠.\n\n여기도 그런 돔 도시 중 하나였어요.\n마법을 연구하는 탑을 중심으로 번성했던 곳.\n\n...하지만 이제는 전부 사라졌어요.',
    choices: [
      { id: 'ask_people', text: '"사람들은 다 어디로...?"', nextId: 'talk_echo_city_people' },
      { id: 'ask_prosperity', text: '"번성했다니, 어떤 모습이었나요?"', nextId: 'talk_echo_city_prosperity' },
      { id: 'back', text: '"...알겠어요."', nextId: 'talk_echo_world_hub' },
    ],
  },
  {
    id: 'talk_echo_city_people',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 70) {
        return '...죽었어요.\n거의 다.\n\n오염에 잠식당하거나...\n변이체가 되었거나...\n\n일부는 도망갔을지도 모르지만...\n대부분은... 살아남지 못했어요.\n\n...저도 그중 하나였을지 모르죠.';
      }
      return '...모르겠어요.\n\n아마 대부분은...\n살아남지 못했을 거예요.';
    },
    choices: [
      {
        id: 'sad',
        text: '"......"',
        nextId: 'talk_echo_world_hub',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
  {
    id: 'talk_echo_city_prosperity',
    speaker: 'echo',
    text: '...아름다웠어요.\n\n돔 안은 마법 조명으로 밝았고,\n거리마다 사람들로 북적였죠.\n\n마도 전차가 다니고,\n공중에는 비행선이 떠다녔어요.\n\n탑의 첨탑에서는 항상 푸른 빛이 빛났고...\n사람들은 웃고 있었어요.\n\n...예전에는.',
    choices: [
      {
        id: 'nostalgic',
        text: '"...다시 그렇게 될 수 있을까요?"',
        nextId: 'talk_echo_city_prosperity_hope',
      },
      {
        id: 'continue',
        text: '"......"',
        nextId: 'talk_echo_world_hub',
        effect: (state) => applyTrust(state, 2),
      },
    ],
  },
  {
    id: 'talk_echo_city_prosperity_hope',
    speaker: 'echo',
    text: (state) => {
      if (state.worldTree >= 60) {
        return '...어쩌면요.\n\n세계수가 자라고 있으니까요.\n완전히 똑같지는 않겠지만...\n\n새로운 시작이 될 수 있어요.';
      }
      return '...모르겠어요.\n\n하지만 해볼 수는 있겠죠.\n포기하지 않는다면.';
    },
    choices: [
      {
        id: 'encourage',
        text: '"꼭 그렇게 만들 거예요."',
        nextId: 'talk_echo_world_hub',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },
  {
    id: 'talk_echo_tower',
    speaker: 'echo',
    text: '가시나무 탑.\n\n13명의 마법사 중 한 분,\n율리우스 아이센하르트님이 세우신 탑이에요.\n\n공간 왜곡과 자가 성장의 마법이 걸려있어서...\n안은 밖보다 훨씬 넓고 복잡해요.\n\n10층이라고 하지만,\n실제로는 미궁 같은 구조죠.\n\n...그리고 지금은 오염의 근원지가 되었어요.',
    choices: [
      { id: 'ask_julius', text: '"율리우스는 어떤 사람이었나요?"', nextId: 'talk_echo_tower_julius' },
      { id: 'ask_pollution', text: '"왜 오염의 근원이 된 거죠?"', nextId: 'talk_echo_tower_pollution' },
      { id: 'back', text: '"알겠어요."', nextId: 'talk_echo_world_hub' },
    ],
  },
  {
    id: 'talk_echo_tower_julius',
    speaker: 'echo',
    text: '율리우스 아이센하르트.\n\n천재 마법사.\n공간 마법의 대가.\n\n마계의 문을 닫은 13명 중 한 분이에요.\n그분이 없었다면 문은 닫히지 않았을 거예요.\n\n...하지만 그분도 이제는 안 계셔요.\n탑만 남았죠.',
    choices: [
      {
        id: 'respectful',
        text: '"위대한 분이셨군요."',
        nextId: 'talk_echo_world_hub',
        effect: (state) => applyTrust(state, 2),
      },
    ],
  },
  {
    id: 'talk_echo_tower_pollution',
    speaker: 'echo',
    text: '...모르겠어요.\n\n어느 날 갑자기 탑에서 폭발이 일어났고,\n검은 안개가 쏟아져 나왔어요.\n\n마법 실험이 잘못된 건지,\n아니면 다른 이유가 있는 건지...\n\n저도 정확히는 몰라요.',
    choices: [
      {
        id: 'accept',
        text: '"...그렇군요."',
        nextId: 'talk_echo_world_hub',
      },
    ],
  },
  {
    id: 'talk_echo_mages',
    speaker: 'echo',
    text: '13명의 마법사.\n\n마계의 문을 닫고,\n세계에 마법을 전한 영웅들이에요.\n\n율리우스 아이센하르트, 아델라 폰 슈타인,\n레온하르트 그림, 미리암 헤르츠...\n\n모두 전설적인 분들이죠.\n그분들이 없었다면 인류는 멸망했을 거예요.',
    choices: [
      {
        id: 'ask_now',
        text: '"지금은 어디 계시나요?"',
        nextId: 'talk_echo_mages_now',
      },
      {
        id: 'grateful',
        text: '"...고마운 분들이네요."',
        nextId: 'talk_echo_world_hub',
        effect: (state) => applyTrust(state, 2),
      },
    ],
  },
  {
    id: 'talk_echo_mages_now',
    speaker: 'echo',
    text: '...모두 돌아가셨어요.\n\n마계의 문을 닫은 건 100년도 더 전 일이니까요.\n수명을 다하셨죠.\n\n하지만 그분들의 유산은 남았어요.\n마법, 돔 도시, 그리고...\n\n...희망.',
    choices: [
      {
        id: 'continue',
        text: '"......."',
        nextId: 'talk_echo_world_hub',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
  {
    id: 'talk_echo_pollution',
    speaker: 'echo',
    text: '오염...\n\n검은 안개 같은 거예요.\n생명을 잠식하고, 변이시키고, 파괴해요.\n\n탑에서 쏟아져 나왔죠.\n아마 마법 실험이 잘못된 것 같아요.\n\n...하지만 확실하지 않아요.\n저도 잘 모르겠어요.',
    choices: [
      {
        id: 'ask_stop',
        text: '"막을 방법은 없나요?"',
        nextId: 'talk_echo_pollution_stop',
      },
      {
        id: 'back',
        text: '"알겠어요."',
        nextId: 'talk_echo_world_hub',
      },
    ],
  },
  {
    id: 'talk_echo_pollution_stop',
    speaker: 'echo',
    text: (state) => {
      if (state.worldTree >= 50) {
        return '세계수예요.\n\n세계수가 자라면...\n오염을 정화할 수 있어요.\n\n지금도 조금씩 정화되고 있어요.\n계속하세요.';
      }
      return '세계수밖에 없어요.\n\n세계수가 완전히 자라면...\n오염을 정화할 수 있을 거예요.\n\n...그게 유일한 희망이에요.';
    },
    choices: [
      {
        id: 'determined',
        text: '"꼭 세계수를 키울게요."',
        nextId: 'talk_echo_world_hub',
        effect: (state) => applyTrust(state, 4),
      },
    ],
  },
  {
    id: 'talk_echo_hope',
    speaker: 'echo',
    text: (state) => {
      if (state.worldTree >= 70 && state.pollution < 60) {
        return '...있어요.\n\n세계수가 자라고 있어요.\n오염도 줄어들고 있고요.\n\n우리가 해내고 있어요.\n...희망이 보여요.';
      }
      if (state.pollution >= 80) {
        return '...모르겠어요.\n\n오염이 너무 심해요.\n시간이 별로 없어요.\n\n하지만... 포기할 순 없잖아요.';
      }
      return '...모르겠어요.\n\n하지만 해볼 수밖에 없어요.\n다른 방법이 없으니까요.\n\n...희망이 있다고 믿어요.';
    },
    choices: [
      {
        id: 'encourage',
        text: '"함께 해낼 수 있어요."',
        nextId: 'talk_echo_world_hub',
        effect: (state) => applyTrust(state, 6),
      },
      {
        id: 'worried',
        text: '"......"',
        nextId: 'talk_echo_world_hub',
        effect: (state) => applyTrust(state, 2),
      },
    ],
  },

  // ============================================
  // 현재 상황
  // ============================================
  {
    id: 'talk_echo_situation',
    speaker: 'echo',
    text: (state) => {
      const { pollution, worldTree, player, resources, turnCount } = state;
      
      let text = '';
      
      if (pollution >= 90) {
        text = '...위급해요.\n오염이 거의 다 왔어요.\n시간이 별로 없어요.\n\n';
      } else if (pollution >= 70) {
        text = '오염이 심해지고 있어요.\n서둘러야 해요.\n\n';
      } else if (pollution >= 50) {
        text = '오염이 퍼지고 있어요.\n조심하세요.\n\n';
      } else {
        text = '오염은... 아직 괜찮아요.\n\n';
      }
      
      if (worldTree >= 80) {
        text += '세계수가 거의 다 자랐어요!\n조금만 더!\n\n';
      } else if (worldTree >= 60) {
        text += '세계수가 잘 자라고 있어요.\n희망이 보여요.\n\n';
      } else if (worldTree >= 40) {
        text += '세계수가... 조금씩 자라고 있어요.\n\n';
      } else {
        text += '세계수가... 너무 느려요.\n더 빨리 자라야 하는데.\n\n';
      }
      
      if (player.health <= 30) {
        text += '그리고... 당신, 많이 다쳤어요.\n쉬는 게 좋겠어요.';
      } else if (player.health <= 50) {
        text += '당신 상태도 좋지 않아요.\n조심하세요.';
      } else {
        text += '당신은... 괜찮아 보여요.';
      }
      
      return text;
    },
    choices: [
      {
        id: 'ask_advice',
        text: '"뭘 해야 할까요?"',
        nextId: 'talk_echo_situation_advice',
      },
      {
        id: 'reassure',
        text: '"걱정 마세요."',
        nextId: 'talk_echo_situation_reassure',
        effect: (state) => applyTrust(state, 3),
      },
      { id: 'back', text: '"알겠어요."', nextId: 'talk_echo_hub' },
    ],
  },
  {
    id: 'talk_echo_situation_advice',
    speaker: 'echo',
    text: (state) => {
      const { resources, worldTree, pollution } = state;
      
      if (resources.purifyingWater >= 2 && worldTree < 80) {
        return '정화의 물이 있어요.\n세계수에게 주세요.\n\n서둘러야 해요.';
      }
      
      if (resources.manaFragment >= 4 && resources.purifyingWater < 2) {
        return '마력 결정이 많네요.\n정화의 물로 바꾸는 게 좋겠어요.\n\n세계수가 물을 필요로 해요.';
      }
      
      if (resources.food < 3 || resources.manaFragment < 2) {
        return '물자가 부족해요.\n탑을 탐색해서 더 구해오세요.\n\n...조심하세요.';
      }
      
      if (pollution >= 80 && worldTree < 60) {
        return '...시간이 없어요.\n\n세계수를 빨리 키워야 해요.\n정화의 물을 더 구하세요.';
      }
      
      return '...잘 하고 있어요.\n\n계속하세요.';
    },
    choices: [
      {
        id: 'continue',
        text: '"알겠어요."',
        nextId: 'talk_echo_hub',
        effect: (state) => applyTrust(state, 2),
      },
    ],
  },
  {
    id: 'talk_echo_situation_reassure',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 70) {
        return '...네.\n\n당신을 믿어요.\n함께 해낼 수 있어요.';
      }
      return '...그랬으면 좋겠어요.';
    },
    choices: [
      {
        id: 'continue',
        text: '고개를 끄덕인다',
        nextId: 'talk_echo_hub',
        effect: (state) => applyTrust(state, state.echoTrust >= 70 ? 4 : 2),
      },
    ],
  },

  // ============================================
  // 감정 확인
  // ============================================
  {
    id: 'talk_echo_feelings',
    speaker: 'echo',
    text: (state) => {
      const mood = getEchoMood(state);
      
      if (mood === 'happy') {
        return '...기분이요?\n\n좋아요.\n당신이 있고, 세계수도 자라고 있으니까요.\n\n...오랜만에 이런 기분이에요.';
      }
      
      if (mood === 'worried') {
        return '...걱정돼요.\n\n오염이 심해지고 있어요.\n시간이 별로 없어요.\n\n...불안해요.';
      }
      
      if (mood === 'sad') {
        return '...좋지 않아요.\n\n...외로워요.';
      }
      
      if (mood === 'angry') {
        return '...답답해요.\n\n세계수가 자라지 않고 있어요.\n이러다가 늦으면...\n\n...화가 나요.';
      }
      
      return '...그냥 그래요.\n특별히 좋지도, 나쁘지도 않아요.';
    },
    choices: [
      {
        id: 'comfort',
        text: '"제가 있잖아요."',
        nextId: 'talk_echo_feelings_comfort',
        condition: (state) => getEchoMood(state) !== 'happy',
        effect: (state) => applyTrust(state, 5),
      },
      {
        id: 'happy_together',
        text: '"저도 기뻐요."',
        nextId: 'talk_echo_feelings_happy',
        condition: (state) => getEchoMood(state) === 'happy',
        effect: (state) => applyTrust(state, 6),
      },
      {
        id: 'encourage',
        text: '"함께 해낼 거예요."',
        nextId: 'talk_echo_feelings_encourage',
        effect: (state) => applyTrust(state, 4),
      },
      { id: 'back', text: '"...그렇군요."', nextId: 'talk_echo_hub' },
    ],
  },
  {
    id: 'talk_echo_feelings_comfort',
    speaker: 'echo',
    text: '...네.\n\n당신이 있어요.\n그게... 큰 힘이 돼요.\n\n고마워요.',
    choices: [
      {
        id: 'continue',
        text: '미소 짓는다',
        nextId: 'talk_echo_hub',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
  {
    id: 'talk_echo_feelings_happy',
    speaker: 'echo',
    text: '...정말요?\n\n...저도 당신과 함께 있어서 기뻐요.\n정말로.',
    choices: [
      {
        id: 'continue',
        text: '"........."',
        nextId: 'talk_echo_hub',
        effect: (state) => applyTrust(state, 4),
      },
    ],
  },
  {
    id: 'talk_echo_feelings_encourage',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 80) {
        return '...네.\n\n함께라면 할 수 있어요.\n믿어요.';
      }
      return '...그랬으면 좋겠어요.';
    },
    choices: [
      {
        id: 'continue',
        text: '고개를 끄덕인다',
        nextId: 'talk_echo_hub',
      },
    ],
  },

  // ============================================
  // 일상 대화
  // ============================================
  {
    id: 'talk_echo_casual_hub',
    speaker: 'echo',
    text: (state) => {
      const responses = [
        '...이야기요?\n\n뭘 이야기하죠?',
        '...전 그런 거 잘 못해요.\n하지만... 시도해볼게요.',
        '...좋아요.\n무슨 이야기 할까요?',
      ];
      return responses[state.turnCount % responses.length];
    },
    choices: [
      { id: 'weather', text: '"날씨 얘기라도..."', nextId: 'talk_echo_casual_weather' },
      { id: 'memory', text: '"좋았던 기억 있어요?"', nextId: 'talk_echo_casual_memory' },
      { id: 'dream', text: '"꿈이 있나요?"', nextId: 'talk_echo_casual_dream' },
      { id: 'like', text: '"좋아하는 게 있어요?"', nextId: 'talk_echo_casual_like' },
      {
        id: 'future',
        text: '"이 일이 끝나면..."',
        nextId: 'talk_echo_casual_future',
        condition: (state) => state.echoTrust >= 70,
      },
      { id: 'back', text: '대화를 마친다', nextId: 'talk_echo_end_casual' },
    ],
  },
  {
    id: 'talk_echo_casual_weather',
    speaker: 'echo',
    text: (state) => {
      const responses = [
        '...날씨.\n\n밖은 항상 회색 하늘이에요.\n햇빛도 안 비치고.\n\n예전엔... 파란 하늘이었는데.',
        '...구름이 낮게 깔려있어요.\n검은 안개 때문에 더 어두워 보이고요.\n\n...언제쯤 맑아질까요?',
        '비가 내릴 것 같아요.\n하지만... 오염된 비겠죠.\n\n깨끗한 빗소리를 듣고 싶어요.',
      ];
      return responses[state.turnCount % responses.length];
    },
    choices: [
      {
        id: 'hopeful',
        text: '"언젠가 맑아질 거예요."',
        nextId: 'talk_echo_casual_hub',
        effect: (state) => applyTrust(state, 3),
      },
      {
        id: 'continue',
        text: '"...그렇네요."',
        nextId: 'talk_echo_casual_hub',
      },
    ],
  },
  {
    id: 'talk_echo_casual_memory',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 80) {
        return '...좋았던 기억.\n\n흐릿하지만... 있어요.\n\n누군가와 함께 걷던 기억.\n따뜻한 햇살.\n웃음소리.\n\n...누구였는지는 모르겠어요.\n하지만 행복했어요.';
      }
      return '...기억이 잘 안 나요.\n\n좋았던 것 같기도 하고...\n아닌 것 같기도 하고.\n\n확실하지 않아요.';
    },
    choices: [
      {
        id: 'new_memory',
        text: '"새로운 좋은 기억 만들어요."',
        nextId: 'talk_echo_casual_memory_new',
        effect: (state) => applyTrust(state, 7),
      },
      {
        id: 'continue',
        text: '"...그렇군요."',
        nextId: 'talk_echo_casual_hub',
      },
    ],
  },
  {
    id: 'talk_echo_casual_memory_new',
    speaker: 'echo',
    text: '...새로운 기억.\n\n...좋아요.\n당신과 함께라면... 좋은 기억이 될 것 같아요.\n\n고마워요.',
    choices: [
      {
        id: 'continue',
        text: '미소 짓는다',
        nextId: 'talk_echo_casual_hub',
        effect: (state) => applyTrust(state, 4),
      },
    ],
  },
  {
    id: 'talk_echo_casual_dream',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 70) {
        return '꿈...\n\n...육체를 갖고 싶어요.\n만지고, 느끼고, 살아있다는 걸 느끼고 싶어요.\n\n그리고...\n당신과... 함께 걷고 싶어요.\n\n...이상한가요?';
      }
      return '...꿈.\n\n모르겠어요.\n생각해본 적 없어요.';
    },
    choices: [
      {
        id: 'not_strange',
        text: '"이상하지 않아요."',
        nextId: 'talk_echo_casual_dream_kind',
        condition: (state) => state.echoTrust >= 70,
        effect: (state) => applyTrust(state, 8),
      },
      {
        id: 'together',
        text: '"함께 걸을 수 있으면 좋겠어요."',
        nextId: 'talk_echo_casual_dream_together',
        condition: (state) => state.echoTrust >= 70,
        effect: (state) => applyTrust(state, 10),
      },
      {
        id: 'continue',
        text: '"......"',
        nextId: 'talk_echo_casual_hub',
      },
    ],
  },
  {
    id: 'talk_echo_casual_dream_kind',
    speaker: 'echo',
    text: '...정말요?\n\n...다행이에요.\n이상한 꿈이라고 생각했거든요.\n\n하지만... 정말 그럴 수 있다면 좋겠어요.',
    choices: [
      {
        id: 'continue',
        text: '"꼭 그렇게 될 거예요."',
        nextId: 'talk_echo_casual_hub',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },
  {
    id: 'talk_echo_casual_dream_together',
    speaker: 'echo',
    text: '...저도요.\n\n정말... 정말로요.\n\n당신 손을 잡고, 함께 걷고 싶어요.\n푸른 하늘 아래에서.\n\n...언젠가는 그럴 수 있을까요?',
    choices: [
      {
        id: 'promise',
        text: '"약속해요."',
        nextId: 'talk_echo_casual_hub',
        effect: (state) => applyTrust(state, 12),
      },
    ],
  },
  {
    id: 'talk_echo_casual_like',
    speaker: 'echo',
    text: (state) => {
      const responses = [
        '...좋아하는 것.\n\n조용한 게 좋아요.\n평화로운 게.\n\n...그리고 당신 목소리.',
        '...햇살이 좋아요.\n따뜻해 보여서.\n\n느낄 순 없지만... 좋아 보여요.',
        '...새소리요.\n가끔 들려요.\n살아있다는 느낌이 들어서 좋아요.',
      ];
      
      if (state.echoTrust >= 80) {
        return '...당신이요.\n\n당신과 이야기하는 게 좋아요.\n혼자가 아니라는 느낌.\n\n...그게 제일 좋아요.';
      }
      
      return responses[state.turnCount % responses.length];
    },
    choices: [
      {
        id: 'touched',
        text: '"...저도 당신이 좋아요."',
        nextId: 'talk_echo_casual_like_reciprocate',
        condition: (state) => state.echoTrust >= 80,
        effect: (state) => applyTrust(state, 10),
      },
      {
        id: 'continue',
        text: '"...그렇군요."',
        nextId: 'talk_echo_casual_hub',
        effect: (state) => applyTrust(state, 2),
      },
    ],
  },
  {
    id: 'talk_echo_casual_like_reciprocate',
    speaker: 'echo',
    text: '...정말요?\n\n.......\n\n...고마워요.\n정말... 고마워요.\n\n저도... 당신이... 정말 좋아요.',
    choices: [
      {
        id: 'continue',
        text: '......',
        nextId: 'talk_echo_casual_hub',
        effect: (state) => applyTrust(state, 8),
      },
    ],
  },
  {
    id: 'talk_echo_casual_future',
    speaker: 'echo',
    text: '...이 일이 끝나면.\n\n세계수가 자라고, 오염이 걷히고...\n\n그 다음에는...\n...당신은 어떻게 할 건가요?',
    choices: [
      {
        id: 'together',
        text: '"함께 있을 거예요."',
        nextId: 'talk_echo_casual_future_together',
        effect: (state) => applyTrust(state, 12),
      },
      {
        id: 'rebuild',
        text: '"도시를 재건할 거예요."',
        nextId: 'talk_echo_casual_future_rebuild',
        effect: (state) => applyTrust(state, 5),
      },
      {
        id: 'unsure',
        text: '"...아직 모르겠어요."',
        nextId: 'talk_echo_casual_future_unsure',
      },
    ],
  },
  {
    id: 'talk_echo_casual_future_together',
    speaker: 'echo',
    text: '...함께.\n\n...정말요?\n\n.......\n\n...감사해요.\n제가... 있어도 괜찮을까요?\n\n육체도 없는데...',
    choices: [
      {
        id: 'of_course',
        text: '"당연하죠."',
        nextId: 'talk_echo_casual_future_together_yes',
        effect: (state) => applyTrust(state, 15),
      },
    ],
  },
  {
    id: 'talk_echo_casual_future_together_yes',
    speaker: 'echo',
    text: '...고마워요.\n\n정말... 정말 고마워요.\n\n...약속해요.\n끝까지 함께 있어요.\n\n...제가 할 수 있는 건 많지 않지만.\n그래도.',
    choices: [
      {
        id: 'continue',
        text: '"약속해요."',
        nextId: 'talk_echo_casual_hub',
        effect: (state) => applyTrust(state, 10),
      },
    ],
  },
  {
    id: 'talk_echo_casual_future_rebuild',
    speaker: 'echo',
    text: '...도시를.\n\n좋은 생각이에요.\n새로운 시작.\n\n...저도 도울 수 있을까요?\n육체는 없지만... 뭔가 할 수 있을 거예요.',
    choices: [
      {
        id: 'of_course',
        text: '"물론이죠."',
        nextId: 'talk_echo_casual_hub',
        effect: (state) => applyTrust(state, 6),
      },
    ],
  },
  {
    id: 'talk_echo_casual_future_unsure',
    speaker: 'echo',
    text: '...그렇죠.\n\n지금 생각할 여유도 없고요.\n\n하지만... 언젠가는.\n미래를 생각할 수 있는 날이 왔으면 좋겠어요.',
    choices: [
      {
        id: 'agree',
        text: '"그럴 거예요."',
        nextId: 'talk_echo_casual_hub',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },

  // ============================================
  // 위로하기
  // ============================================
  {
    id: 'talk_echo_comfort',
    speaker: 'echo',
    text: (state) => {
      if (state.pollution >= 80) {
        return '...괜찮지 않아요.\n\n오염이 너무 심해요.\n시간이 별로 없어요.\n\n...무서워요.';
      }
      if (state.turnCount >= 20) {
        return '...괜찮지 않아요.\n\n너무 오래 걸리고 있어요.\n이러다가... 늦으면...\n\n...불안해요.';
      }
      return '...괜찮아요.\n\n걱정해줘서 고마워요.';
    },
    choices: [
      {
        id: 'hug',
        text: '(안아주려 하지만... 닿지 않는다)',
        nextId: 'talk_echo_comfort_hug',
        condition: (state) => state.echoTrust >= 70 && (state.pollution >= 70 || state.turnCount >= 15),
        effect: (state) => applyTrust(state, 10),
      },
      {
        id: 'encourage',
        text: '"함께 해낼 거예요."',
        nextId: 'talk_echo_comfort_encourage',
        effect: (state) => applyTrust(state, 5),
      },
      {
        id: 'promise',
        text: '"포기하지 않을게요."',
        nextId: 'talk_echo_comfort_promise',
        effect: (state) => applyTrust(state, 7),
      },
      { id: 'back', text: '"......"', nextId: 'talk_echo_hub' },
    ],
  },
  {
    id: 'talk_echo_comfort_hug',
    speaker: 'echo',
    text: '...손이 닿지 않아요.\n\n하지만... 마음은 느껴져요.\n따뜻해요.\n\n...고마워요.\n정말 고마워요.',
    choices: [
      {
        id: 'continue',
        text: '"......"',
        nextId: 'talk_echo_hub',
        effect: (state) => applyTrust(state, 8),
      },
    ],
  },
  {
    id: 'talk_echo_comfort_encourage',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 80) {
        return '...네.\n\n함께라면... 할 수 있어요.\n당신을 믿어요.\n\n...고마워요.';
      }
      return '...그랬으면 좋겠어요.\n\n...고마워요.';
    },
    choices: [
      {
        id: 'continue',
        text: '고개를 끄덕인다',
        nextId: 'talk_echo_hub',
      },
    ],
  },
  {
    id: 'talk_echo_comfort_promise',
    speaker: 'echo',
    text: '...약속해요?\n\n.......\n\n...믿어요.\n당신을 믿어요.\n\n함께 해요.\n끝까지.',
    choices: [
      {
        id: 'continue',
        text: '"약속해요."',
        nextId: 'talk_echo_hub',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },

  // ============================================
  // 대화 종료
  // ============================================
  {
    id: 'talk_echo_end',
    speaker: 'echo',
    text: (state) => {
      if (state.echoTrust >= 80) {
        const endings = [
          '...알겠어요.\n언제든 다시 말 걸어요.',
          '...네.\n이야기해줘서 고마워요.',
          '...대화 즐거웠어요.\n또 해요.',
        ];
        return endings[state.turnCount % endings.length];
      }
      if (state.echoTrust >= 50) {
        return '...네.\n조심하세요.';
      }
      return '...그래요.';
    },
    choices: [
      {
        id: 'continue',
        text: '대화를 마친다',
        nextId: 'shelter_hub',
        effect: (state) => applyTrust(state, 1),
      },
    ],
  },
  {
    id: 'talk_echo_end_casual',
    speaker: 'echo',
    text: (state) => {
      const endings = [
        '...이야기해줘서 고마워요.\n좋았어요.',
        '...즐거웠어요.\n또 이야기해요.',
        '...대화 나눠줘서 고마워요.\n덜 외로워요.',
      ];
      return endings[state.turnCount % endings.length];
    },
    choices: [
      {
        id: 'continue',
        text: '대화를 마친다',
        nextId: 'shelter_hub',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
];