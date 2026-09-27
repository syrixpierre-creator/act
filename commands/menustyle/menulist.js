import { CATEGORY_META } from '../../lib/menu/categories.js';
import { reply } from '../../lib/helpers/reply.js';
import { header, section, item, footer, smallCaps } from '../../lib/design.js';
import { brandLine } from '../../lib/menu/info.js';

export default {
  name: 'menulist',
  description: 'Show every command category and how many commands it has. Usage: .menulist',
  async execute(sock, msg, args, prefix, ctx) {
    const brand = brandLine(ctx);
    const lines = [];
    for (const [cat, cmds] of ctx.commandCategories.entries()) {
      const m = CATEGORY_META[cat];
      lines.push(`  ❁ ${smallCaps(m ? m.label : cat)} : ${cmds.length}`);
    }
    const text = `${header(brand)}\n\n${section('MENU LIST')}\n${lines.join('\n')}\n\n  ❁ ${smallCaps('total')} : ${ctx.getTotalCommandCount()}\n\n ${smallCaps('use')} ${prefix}menu <category> ${smallCaps('to browse one')}\n\n${footer(brand)}`;
    await reply(sock, msg, text);
  }
};
