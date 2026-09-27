import { panel } from '../../lib/design.js';
import { brandLine } from '../../lib/menu/info.js';

export default {
  name: 'ownerpanel',
  ownerOnly: true,
  description: 'Quick overview of owner-relevant status: mode, prefix, sudo count, blacklist count (owner only). Usage: .ownerpanel',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const settings = ctx.getGlobalSettings();
    const text = panel({
      brand: brandLine(ctx),
      title: 'owner panel',
      pairs: [
        ['Mode', ctx.BOT_MODE],
        ['Prefix', (ctx.getPrefixList?.() || [currentPrefix]).join(' ')],
        ['Blacklist', String((settings.globalBlacklist || []).length)],
        ['Commands', String(ctx.getTotalCommandCount())]
      ]
    });
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
