export default {
  name: 'sessions',
  alias: ['listsessions'],
  ownerOnly: true,
  strictOwner: true,
  description: 'List every WhatsApp session hosted by this deployment, with its status and owner. Requires "node sessions.js".',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    if (!ctx.IS_MANAGED_SESSION) {
      return sock.sendMessage(chatId, { text: `ℹ️ Running as a single session ("${ctx.SESSION_LABEL}"). Start the bot with \`node sessions.js\` to host and list multiple sessions.` }, { quoted: msg });
    }
    const result = await ctx.requestOrchestrator('sessions-list', {});
    if (!result.ok) {
      return sock.sendMessage(chatId, { text: `❌ Could not fetch session list: ${result.error || 'unknown error'}` }, { quoted: msg });
    }
    const statusEmoji = { connected: '🟢', pairing: '🟡', starting: '🔄', stopped: '🔴', removing: '⚫' };
    const lines = result.sessions.map((s) => {
      const label = s.isDefault ? `${s.id} (default)` : s.id;
      const who = s.ownerNumber ? `+${s.ownerNumber}` : (s.phone ? `+${s.phone} (pairing)` : '—');
      const requester = !s.isDefault && s.requestedBy ? ` — requested by @${s.requestedBy.split('@')[0]}` : '';
      return `${statusEmoji[s.status] || '⚪'} *${label}* — ${s.status} — ${who}${requester}`;
    });
    await sock.sendMessage(chatId, {
      text: `🗂️ *ACTIVE SESSIONS (${result.sessions.length})*\n\n${lines.join('\n') || 'No sessions.'}\n\nAdd one: ${currentPrefix}linkme <phone>\nRemove one: ${currentPrefix}delsession <id>`
    }, { quoted: msg });
  }
};
