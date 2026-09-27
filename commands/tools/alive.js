import { replyForwarded } from '../../lib/helpers/forwarded.js';
import { panel } from '../../lib/design.js';
import { brandLine } from '../../lib/menu/info.js';
import { formatRuntimeHMS } from '../../lib/utils/format.js';

export default {
  name: 'alive',
  description: "Check that the bot is alive and see basic status. Usage: .alive",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const text = panel({
      brand: brandLine(ctx),
      title: 'alive',
      pairs: [['Status', '🟢 ONLINE'], ['Uptime', formatRuntimeHMS(process.uptime())], ['Prefix', ctx.isPrefixless ? 'none' : currentPrefix]]
    });
    await replyForwarded(sock, msg, text, { contextInfo: ctx.channelContextInfo?.() });
  }
};
