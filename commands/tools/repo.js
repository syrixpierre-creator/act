import { config } from '../../config/index.js';
import { panel } from '../../lib/design.js';
import { brandLine } from '../../lib/menu/info.js';

export default {
  name: 'repo',
  alias: ['sc', 'source', 'script', 'git', 'github'],
  description: "Show the bot's repo link. Usage: .repo",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const brand = brandLine(ctx || {});
    const text = panel({
      brand,
      title: 'repo',
      pairs: [['Owner', ctx?.getGlobalSettings?.().ownerName || config.bot.ownerName], ['Version', `v${ctx?.VERSION || config.version}`], ['Repo', config.repoUrl]]
    });
    await sock.sendMessage(chatId, {
      text,
      contextInfo: {
        externalAdReply: { title: brand, body: 'Repo', mediaType: 1, showAdAttribution: false, renderLargerThumbnail: false, sourceUrl: config.repoUrl }
      }
    }, { quoted: msg });
  }
};
