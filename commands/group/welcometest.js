import { isSenderAdmin, replyText, getGroupMetadata } from '../../lib/groupHelper.js';
import { getGroupSettings } from '../../lib/settingsStore.js';
import { renderWelcome, panel } from '../../lib/design.js';
import { brandLine } from '../../lib/menu/info.js';

export default {
  name: 'welcometest',
  description: 'Preview the currently configured welcome (or goodbye) message without a real join event. Usage: .welcometest [goodbye]',
  async execute(sock, msg, args = [], prefix, ctx) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return replyText(sock, msg, '❌ This command only works in groups.');
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!(await isSenderAdmin(sock, chatId, sender))) return replyText(sock, msg, '❌ Only group admins can use this command.');
    const settings = getGroupSettings(chatId);
    const brand = brandLine(ctx || {});
    const isJoin = (args[0] || '').toLowerCase() !== 'goodbye';
    if (isJoin && !settings.welcome) return replyText(sock, msg, panel({ brand, title: 'welcome', pairs: [['Status', 'OFF']], hint: 'Turn it on with .welcome on' }));
    if (!isJoin && !settings.goodbye) return replyText(sock, msg, panel({ brand, title: 'goodbye', pairs: [['Status', 'OFF']], hint: 'Turn it on with .goodbye on' }));
    const meta = await getGroupMetadata(sock, chatId).catch(() => null);
    const user = `@${sender.split('@')[0].split(':')[0]}`;
    const groupName = meta?.subject || 'the group';
    const count = meta?.participants?.length || 0;
    const template = isJoin ? settings.welcomeText : settings.goodbyeText;
    const custom = template
      ? template.replace(/@user|\{user\}/gi, user).replace(/@group|\{group\}/gi, groupName).replace(/@count|\{count\}/gi, String(count))
      : '';
    const text = renderWelcome({ brand, isJoin, custom, users: user, groupName, count, emoji: settings.groupEmoji || (isJoin ? '🎉' : '👋') });
    await sock.sendMessage(chatId, { text, mentions: [sender] }, { quoted: msg });
  }
};
