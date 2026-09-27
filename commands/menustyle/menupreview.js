import { STYLE_DESCRIPTIONS, STYLE_COUNT } from '../../lib/menu/styles.js';
import { SCOPES } from '../../lib/menu/scopes.js';
import { reply } from '../../lib/helpers/reply.js';
import { header, section, footer } from '../../lib/design.js';
import { brandLine } from '../../lib/menu/info.js';

export default {
  name: 'menupreview',
  description: 'Describe every menu style and view without switching. Usage: .menupreview',
  async execute(sock, msg, args, prefix, ctx) {
    const brand = brandLine(ctx || {});
    const styles = Object.entries(STYLE_DESCRIPTIONS).map(([n, d]) => `  ❁ ${n}. ${d}`).join('\n');
    const views = Object.entries(SCOPES).map(([k, v]) => `  ❁ ${k} — ${v.title}`).join('\n');
    await reply(sock, msg, `${header(brand)}\n\n${section(`MENU STYLES 1-${STYLE_COUNT}`)}\n${styles}\n\n${section('VIEWS')}\n${views}\n\n Owner: ${prefix}menustyle <n> [view|all]\n Group admin: ${prefix}setmenustyle <n>\n\n${footer(brand)}`);
  }
};
