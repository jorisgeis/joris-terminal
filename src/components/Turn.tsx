import type { Block, TurnData } from '../lib/types';
import { Linkified } from './Linkified';

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'tool':
      return (
        <div className="tool">
          <span className="g">▸ </span>
          <span className="n">{block.name}</span>
          {block.arg && <span className="arg">{' ' + block.arg}</span>}
          <div className="res">{'└ ' + (block.result || '…')}</div>
        </div>
      );
    case 'out':
      return (
        <div className={'out' + (block.cls ? ' ' + block.cls : '')}>
          <Linkified text={block.text} />
        </div>
      );
    case 'help':
      return (
        <div className="out">
          {block.rows.map((r) => (
            <div key={r.cmd}>
              <span className="k">{r.cmd.padEnd(13)}</span>
              <span className="d">{r.desc}</span>
            </div>
          ))}
          <div className="d">{block.footer}</div>
        </div>
      );
    case 'ans':
      return (
        <div className="ans">
          {block.shown >= block.text.length ? (
            <Linkified text={block.text} />
          ) : (
            block.text.slice(0, block.shown)
          )}
        </div>
      );
  }
}

export function Turn({ turn }: { turn: TurnData }) {
  return (
    <section className="turn">
      <div className="u">
        <span className="p">›</span>
        <span>{turn.input}</span>
      </div>
      {turn.blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </section>
  );
}
