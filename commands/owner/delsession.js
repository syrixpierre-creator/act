export default {
  name: 'delsession',
  ownerOnly: true,
  strictOwner: true,
  description: 'Stop and permanently remove an additional session (not the default one). Usage: .delsession <id> — see .sessions for ids.',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const sessionId = (args[0] || '').trim();
    if (!sessionId) {
      return sock.sendMessage(chatId, { text: `❌ Usage: ${currentPrefix}delsession <id>\nSee ${currentPrefix}sessions for the list of ids.` }, { quoted: msg });
    }
    if (!ctx.IS_MANAGED_SESSION) {
      return sock.sendMessage(chatId, { text: '❌ This bot is not running under the multi-session orchestrator (`node sessions.js`).' }, { quoted: msg });
    }
    const result = await ctx.requestOrchestrator('delsession', { sessionId });
    if (!result.ok) {
      return sock.sendMessage(chatId, { text: `❌ ${result.error || 'Could not remove that session.'}` }, { quoted: msg });
    }
    await sock.sendMessage(chatId, { text: `✅ Session "${result.removed}" stopped and removed.` }, { quoted: msg });
  }
};
