import { Scenario, GameState } from '@/lib/types';
import { createInitialState } from './logic';

export const endingScenarios: Scenario[] = [
  {
    id: 'ending_good',
    speaker: 'narrator',
    text: '세계수가 완전히 자랐다.\n\n작은 새싹이었던 것이 이제 거대한 나무가 되었다.\n푸른 빛이 도시 전체를 감싸며 오염이 사라지기 시작한다.\n\n검은 안개가 걷힌다.\n하늘이 보인다.\n파란 하늘.',
    choices: [
      { id: 'continue', text: '세계수를 바라본다', nextId: 'ending_good_2' },
    ],
  },
  {
    id: 'ending_good_2',
    speaker: 'echo',
    text: '...해냈어요.\n\n우리가 해냈어요.',
    choices: [
      { id: 'continue', text: '"에코?"', nextId: 'ending_good_3' },
    ],
  },
  {
    id: 'ending_good_3',
    speaker: 'echo',
    text: (state: GameState) => {
      if (state.flags.truth_revealed && state.echoTrust >= 80) {
        return (
          '이제... 끝이에요.\n\n'
          + '세계수가 완성되면,\n저는 완전히 나무와 하나가 돼요.\n\n'
          + '더 이상 당신과 이야기할 수 없어요.\n\n'
          + '...고마워요.\n당신 덕분에 속죄할 수 있었어요.\n\n'
          + '그리고... 미안해요.\n\n안녕히.'
        );
      }
      if (state.flags.truth_revealed) {
        return (
          '이제... 끝이에요.\n\n'
          + '세계수가 완성되면,\n저는 사라져요.\n\n'
          + '...미안해요.\n진실을 숨긴 거.\n\n'
          + '하지만 우리가 해냈어요.\n세상을 구했어요.\n\n안녕히.'
        );
      }
      return (
        '이제... 끝이에요.\n\n'
        + '세계수가 완성되면,\n저는 완전히 나무와 하나가 돼요.\n\n'
        + '더 이상 당신과 이야기할 수 없어요.\n\n'
        + '...고마워요.\n당신 덕분에 세상을 구할 수 있었어요.\n\n안녕히.'
      );
    },
    choices: [
      {
        id: 'ending',
        text: '[게임 클리어 - 새로 시작하기]',
        nextId: 'intro_01',
        effect: () => createInitialState(),
      },
    ],
  },
];