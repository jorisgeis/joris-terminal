export type Block =
  | { kind: 'tool'; name: string; arg?: string; result: string }
  | { kind: 'out'; text: string; cls?: 'err' | 'd' }
  | { kind: 'help'; rows: { cmd: string; desc: string }[]; footer: string }
  /** `shown` is how many characters have been typed out so far. */
  | { kind: 'ans'; text: string; shown: number };

export interface TurnData {
  id: number;
  input: string;
  blocks: Block[];
}
