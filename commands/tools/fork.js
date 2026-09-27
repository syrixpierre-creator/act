import { config } from '../../config/index.js';
import { panel } from '../../lib/design.js';
import { brandLine } from '../../lib/menu/info.js';

export default {
  name: 'fork',
  description: "Get the link to the bot's repo. Usage: .fork",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const text = panel({ brand: brandLine(ctx || {}), title: 'repo', pairs: [['Repo', config.repoUrl]] });
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
