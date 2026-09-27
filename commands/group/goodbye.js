import { isSenderAdmin, replyText } from '../../lib/groupHelper.js';
import { getGroupSettings, setGroupSetting } from '../../lib/settingsStore.js';
import { panel } from '../../lib/design.js';
import { brandLine } from '../../lib/menu/info.js';

export default {
  name: 'goodbye',
  description: 'Toggle the goodbye message for members who leave (admin only). Usage: .goodbye on|off',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
      const settings = getGroupSettings(chatId);
      return replyText(sock, msg, panel({ brand: brandLine(ctx || {}), title: 'goodbye', pairs: [['Status', settings.goodbye ? 'ON' : 'OFF']], hint: 'Usage: .goodbye on|off' }));
    }
    setGroupSetting(chatId, 'goodbye', choice === 'on');
    await replyText(sock, msg, panel({ brand: brandLine(ctx || {}), title: 'goodbye', pairs: [['Status', choice.toUpperCase()]] }));
  }
};
