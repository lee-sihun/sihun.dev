// 카드 제목을 6점 점자 셀(비트마스크)로 옮긴다.
// 한글은 한국 점자 규정의 주요 약자를, 로마자는 영어 1종 점자를 따른다.
// 비트: 1점=1, 2점=2, 3점=4, 4점=8, 5점=16, 6점=32

const cell = (...dots: number[]) =>
  dots.reduce((bits, dot) => bits | (1 << (dot - 1)), 0);

// 초성 (ㅇ은 적지 않는다)
const INITIAL: (number[] | null)[] = [
  [cell(4)], // ㄱ
  [cell(6), cell(4)], // ㄲ
  [cell(1, 4)], // ㄴ
  [cell(2, 4)], // ㄷ
  [cell(6), cell(2, 4)], // ㄸ
  [cell(5)], // ㄹ
  [cell(1, 5)], // ㅁ
  [cell(4, 5)], // ㅂ
  [cell(6), cell(4, 5)], // ㅃ
  [cell(6)], // ㅅ
  [cell(6), cell(6)], // ㅆ
  null, // ㅇ
  [cell(4, 6)], // ㅈ
  [cell(6), cell(4, 6)], // ㅉ
  [cell(5, 6)], // ㅊ
  [cell(1, 2, 4)], // ㅋ
  [cell(1, 2, 5)], // ㅌ
  [cell(1, 4, 5)], // ㅍ
  [cell(2, 4, 5)], // ㅎ
];

const VOWEL: number[][] = [
  [cell(1, 2, 6)], // ㅏ
  [cell(1, 2, 3, 5)], // ㅐ
  [cell(3, 4, 5)], // ㅑ
  [cell(3, 4, 5), cell(1, 2, 3, 5)], // ㅒ
  [cell(2, 3, 4)], // ㅓ
  [cell(1, 3, 4, 5)], // ㅔ
  [cell(1, 5, 6)], // ㅕ
  [cell(3, 4)], // ㅖ
  [cell(1, 3, 6)], // ㅗ
  [cell(1, 2, 3, 6)], // ㅘ
  [cell(1, 2, 3, 6), cell(1, 2, 3, 5)], // ㅙ
  [cell(1, 3, 4, 5, 6)], // ㅚ
  [cell(3, 4, 6)], // ㅛ
  [cell(1, 3, 4)], // ㅜ
  [cell(1, 2, 3, 4)], // ㅝ
  [cell(1, 2, 3, 4), cell(1, 2, 3, 5)], // ㅞ
  [cell(1, 3, 4), cell(1, 2, 3, 5)], // ㅟ
  [cell(1, 4, 6)], // ㅠ
  [cell(2, 4, 6)], // ㅡ
  [cell(2, 4, 5, 6)], // ㅢ
  [cell(1, 3, 5)], // ㅣ
];

// 받침 (0번은 받침 없음)
const FINAL: number[][] = [
  [],
  [cell(1)], // ㄱ
  [cell(1), cell(1)], // ㄲ
  [cell(1), cell(3)], // ㄳ
  [cell(2, 5)], // ㄴ
  [cell(2, 5), cell(1, 3)], // ㄵ
  [cell(2, 5), cell(3, 5, 6)], // ㄶ
  [cell(3, 5)], // ㄷ
  [cell(2)], // ㄹ
  [cell(2), cell(1)], // ㄺ
  [cell(2), cell(2, 6)], // ㄻ
  [cell(2), cell(1, 2)], // ㄼ
  [cell(2), cell(3)], // ㄽ
  [cell(2), cell(2, 3, 6)], // ㄾ
  [cell(2), cell(2, 5, 6)], // ㄿ
  [cell(2), cell(3, 5, 6)], // ㅀ
  [cell(2, 6)], // ㅁ
  [cell(1, 2)], // ㅂ
  [cell(1, 2), cell(3)], // ㅄ
  [cell(3)], // ㅅ
  [cell(3, 4)], // ㅆ
  [cell(2, 3, 5, 6)], // ㅇ
  [cell(1, 3)], // ㅈ
  [cell(2, 3)], // ㅊ
  [cell(2, 3, 5)], // ㅋ
  [cell(2, 3, 6)], // ㅌ
  [cell(2, 5, 6)], // ㅍ
  [cell(3, 5, 6)], // ㅎ
];

// 'ㅏ'를 생략하는 약자: 가(전용 셀)·사(전용 셀)와 나·다·마·바·자·카·타·파·하
const A_CONTRACTION: Record<number, number[]> = {
  0: [cell(1, 2, 4, 6)], // 가
  1: [cell(6), cell(1, 2, 4, 6)], // 까
  9: [cell(1, 2, 3)], // 사
  10: [cell(6), cell(1, 2, 3)], // 싸
};
const A_OMITTED = new Set([2, 3, 4, 6, 7, 8, 12, 13, 15, 16, 17, 18]);

// 모음+받침 약자 (억 언 얼 연 열 영 옥 온 옹 운 울 은 을 인)
const RHYME: Record<string, number> = {
  "4-1": cell(1, 4, 5, 6),
  "4-4": cell(2, 3, 4, 5, 6),
  "4-8": cell(2, 3, 4, 5),
  "6-4": cell(1, 6),
  "6-8": cell(1, 2, 5, 6),
  "6-21": cell(1, 2, 4, 5, 6),
  "8-1": cell(1, 3, 4, 6),
  "8-4": cell(1, 2, 3, 5, 6),
  "8-21": cell(1, 2, 3, 4, 5, 6),
  "13-4": cell(1, 2, 4, 5),
  "13-8": cell(1, 2, 3, 4, 6),
  "18-4": cell(1, 3, 5, 6),
  "18-8": cell(2, 3, 4, 6),
  "20-4": cell(1, 2, 3, 4, 5),
};

// ㅅ·ㅆ·ㅈ·ㅉ·ㅊ 다음의 '엉'은 '영' 약자로 적는다 (성, 정, 청 …)
const SIBILANTS = new Set([9, 10, 12, 13, 14]);

const LETTERS: Record<string, number> = {
  a: cell(1),
  b: cell(1, 2),
  c: cell(1, 4),
  d: cell(1, 4, 5),
  e: cell(1, 5),
  f: cell(1, 2, 4),
  g: cell(1, 2, 4, 5),
  h: cell(1, 2, 5),
  i: cell(2, 4),
  j: cell(2, 4, 5),
  k: cell(1, 3),
  l: cell(1, 2, 3),
  m: cell(1, 3, 4),
  n: cell(1, 3, 4, 5),
  o: cell(1, 3, 5),
  p: cell(1, 2, 3, 4),
  q: cell(1, 2, 3, 4, 5),
  r: cell(1, 2, 3, 5),
  s: cell(2, 3, 4),
  t: cell(2, 3, 4, 5),
  u: cell(1, 3, 6),
  v: cell(1, 2, 3, 6),
  w: cell(2, 4, 5, 6),
  x: cell(1, 3, 4, 6),
  y: cell(1, 3, 4, 5, 6),
  z: cell(1, 3, 5, 6),
  ".": cell(2, 5, 6),
  "-": cell(3, 6),
  " ": 0,
};

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

const decompose = (code: number) => {
  const offset = code - HANGUL_START;
  return {
    initial: Math.floor(offset / 588),
    vowel: Math.floor((offset % 588) / 28),
    final: offset % 28,
  };
};

const startsWithVowel = (char: string | undefined) => {
  const code = char?.charCodeAt(0) ?? 0;
  return (
    code >= HANGUL_START && code <= HANGUL_END && decompose(code).initial === 11
  );
};

function syllable(code: number, next: string | undefined): number[] {
  const { initial, vowel, final } = decompose(code);
  const head = INITIAL[initial] ?? [];
  const base = SIBILANTS.has(initial) && vowel === 4 && final === 21;
  const rhyme = RHYME[`${base ? 6 : vowel}-${final}`];
  if (rhyme !== undefined) return [...head, rhyme];

  if (vowel === 0) {
    const contraction = A_CONTRACTION[initial];
    if (contraction) return [...contraction, ...FINAL[final]];
    // 뒤에 모음으로 시작하는 글자가 오면 'ㅏ'를 생략하지 않는다
    if (A_OMITTED.has(initial) && !(final === 0 && startsWithVowel(next))) {
      return [...head, ...FINAL[final]];
    }
  }
  return [...head, ...VOWEL[vowel], ...FINAL[final]];
}

export function toBraille(text: string): number[] {
  const chars = Array.from(text.toLowerCase());
  return chars.flatMap((char, index) => {
    const code = char.charCodeAt(0);
    if (code >= HANGUL_START && code <= HANGUL_END) {
      return syllable(code, chars[index + 1]);
    }
    const bits = LETTERS[char];
    return bits === undefined ? [] : [bits];
  });
}
