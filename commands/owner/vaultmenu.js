import { reply } from '../../lib/helpers/reply.js';
import { header, section, item, footer } from '../../lib/design.js';
import { brandLine } from '../../lib/menu/info.js';

const NAMES = ['togstatus', 'status', 'statusview', 'statusreact', 'ghostarchive', 'vv', 'vv2', 'ghost'];

export default {
  name: 'vaultmenu',
  ownerOnly: true,
  description: 'Show the status/vault commands. Usage: .vaultmenu',
  async execute(sock, msg, args, prefix, ctx) {
    const brand = brandLine(ctx);
    const lines = NAMES.map((n) => ctx.commands.get(n)).filter(Boolean)
      .map((c) => `${item(c.name)}\n     ${(c.description || '').split(/\.?\s*Usage:/)[0].slice(0, 70)}`);
    await reply(sock, msg, `${header(brand)}\n\n${section('STATUS & VAULT')}\n${lines.join('\n')}\n\n${footer(brand)}`);
  }
};
