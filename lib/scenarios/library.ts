import { Scenario } from '@/lib/types';
import { processTurn } from './logic';
import { applyResources, applyDamage, addFlag, applyTrust } from './helpers';

export const libraryScenarios: Scenario[] = [
  {
    id: 'explore_library',
    speaker: 'narrator',
    text: '도서관으로 향한다.\n반쯤 무너진 돔 지붕 사이로 회색 하늘이 보인다.\n\n도서관 입구에는 검은 덩굴이 뒤엉켜 있다.\n오염된 식물.\n마나를 먹고 자란 변이체.',
    choices: [
      {
        id: 'sneak',
        text: '조용히 우회한다 [민첩 판정]',
        diceCheck: 11,
        successId: 'library_enter',
        failureId: 'library_vine_attack',
      },
      {
        id: 'burn',
        text: '마법으로 태워버린다 [마력결정 -1]',
        nextId: 'library_enter',
        disabled: (state) => state.resources.manaFragment < 1,
        effect: (state) => applyResources(state, { manaFragment: -1 }),
      },
      { id: 'back', text: '돌아간다', nextId: 'exploration_choice' },
    ],
  },
  {
    id: 'library_vine_attack',
    speaker: 'narrator',
    text: '덩굴 사이를 빠져나가려는 순간, 덩굴이 반응한다.\n가시 돋친 덩굴이 다리를 휘감는다.\n\n간신히 빠져나왔지만 다쳤다.',
    choices: [
      {
        id: 'continue',
        text: '도서관 안으로 들어간다',
        nextId: 'library_enter',
        effect: (state) => applyDamage(state, 15),
      },
    ],
  },
  {
    id: 'library_enter',
    speaker: 'echo',
    text: '...조심하세요.\n저것들은 움직임을 감지해요.',
    choices: [
      { id: 'continue', text: '안으로 들어간다', nextId: 'library_inside' },
    ],
  },
  {
    id: 'library_inside',
    speaker: 'narrator',
    text: '도서관 내부는 참혹하다.\n책장들은 쓰러져 있고, 책들은 검은 곰팡이에 뒤덮여 있다.\n\n하지만 한쪽 구석, 마법진이 그려진 책상 위의 책들은 오염되지 않고 남아있다.',
    choices: [
      { id: 'check_books', text: '책들을 조사한다', nextId: 'library_books' },
      {
        id: 'leave',
        text: '서둘러 나간다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(state),
      },
    ],
  },
  {
    id: 'library_books',
    speaker: 'narrator',
    text: '책상 위에는 세 권의 책이 놓여있다.\n\n『초급 정화 마법 개론』\n『세계수 신화와 전설』\n『마도력 130년 연구일지』',
    choices: [
      { id: 'book1', text: '『초급 정화 마법 개론』을 읽는다', nextId: 'library_book_magic' },
      { id: 'book2', text: '『세계수 신화와 전설』을 읽는다', nextId: 'library_book_myth' },
      { id: 'book3', text: '『마도력 130년 연구일지』를 읽는다', nextId: 'library_book_journal' },
    ],
  },
  {
    id: 'library_book_magic',
    speaker: 'narrator',
    text: '마법 개론서를 펼친다.\n\n"정화 마법의 기초는 마나의 흐름을 이해하는 것이다.\n오염된 마나를 순수한 마나로 되돌리는 과정..."\n\n유용한 내용이다.\n마법에 대한 이해가 깊어진 것 같다.',
    choices: [
      {
        id: 'continue',
        text: '책을 덮고 돌아간다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn({
          ...state,
          player: { ...state.player, magic: state.player.magic + 1 },
        }),
      },
    ],
  },
  {
    id: 'library_book_myth',
    speaker: 'narrator',
    text: '낡은 책을 펼친다.\n\n"세계수는 세상의 중심이다.\n그 뿌리는 대지 깊숙이, 가지는 하늘 높이 뻗어있다.\n세계수가 시들면 세상도 시든다..."\n\n신화와 전설.\n하지만 묘하게도 지금 상황과 닮아있다.',
    choices: [
      {
        id: 'continue',
        text: '책을 덮고 돌아간다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(state),
      },
    ],
  },
  {
    id: 'library_book_journal',
    speaker: 'narrator',
    text: '연구일지를 펼친다.\n필체가... 묘하게 익숙하다.\n\n"마도력 130년 3월 12일.\n탑주님의 세계수 실험이 본격화되었다.\n실험체는... 아직 어린아이다.\n이게 정말 옳은 일일까?"\n\n"4월 8일.\n아이의 이름은 에코라고 한다.\n맑은 눈을 하고 있다.\n나를 보면 웃어준다."\n\n"5월 23일.\n더 이상 못 보겠다.\n아버지, 당신이 하는 짓은..."\n\n뒷부분은 찢어져 있다.',
    choices: [
      { id: 'ask_echo', text: '"에코, 혹시 이거..."', nextId: 'library_journal_echo_react' },
      { id: 'silent', text: '...조용히 덮는다', nextId: 'library_journal_silent' },
    ],
  },
  {
    id: 'library_journal_echo_react',
    speaker: 'echo',
    text: '...!\n\n아, 아니에요!\n저도 처음 보는 거예요.\n\n그냥... 중요해 보여서요.',
    choices: [
      {
        id: 'accept',
        text: '"...그렇군요."',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(addFlag(state, 'found_journal')),
      },
      { id: 'press', text: '"거짓말하고 있죠?"', nextId: 'library_journal_press' },
    ],
  },
  {
    id: 'library_journal_press',
    speaker: 'echo',
    text: '...그만하세요.\n\n더 이상 묻지 마세요.\n제발.',
    choices: [
      {
        id: 'continue',
        text: '더 이상 묻지 않는다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(applyTrust(addFlag(state, 'found_journal'), -10)),
      },
    ],
  },
  {
    id: 'library_journal_silent',
    speaker: 'narrator',
    text: '연구일지를 조용히 덮는다.\n\n에코는 아무 말이 없다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(applyTrust(addFlag(state, 'found_journal'), 5)),
      },
    ],
  },
];