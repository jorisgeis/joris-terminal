import { ANSWERS, type AnswerRule } from '../content/answers';

export type Routed = Pick<AnswerRule, 'topic' | 'files' | 'answer'>;

/** The first rule whose pattern matches wins; the last rule is the catch-all. */
export function route(text: string, rules: AnswerRule[] = ANSWERS): Routed {
  const hit = rules.find((r) => r.pattern.test(text)) ?? rules[rules.length - 1];
  if (!hit) throw new Error('route: no answer rules');
  return { topic: hit.topic, files: hit.files, answer: hit.answer };
}
