// Public pairing command — ANY user can run this (not owner-only). The bot
// is meant to be a self-serve multi-session host: someone DMs the bot,
// runs .linkme <their number>, and gets back their own fully independent
// session (their own owner, their own prefix/settings — see
// sessions.js / lib/newsletterAutoReact.js for how the isolation works).
// (Named "linkme", not "pair" — commands/tools/pair.js already uses that
// name for the unrelated QR session-generator link.)
//
// Because this is open to everyone, it needs its own abuse protection
// instead of relying on ownerOnly:
//   - a per-sender cooldown (one pairing request per PAIR_COOLDOWN_MS)
//   - the orchestrator's own MAX_SESSIONS cap as a hard global ceiling
const PAIR_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between requests, per sender
const lastRequestBySender = new Map();

export default {
  name: 'linkme',
  alias: ['newsession'],
  description: 'Link a WhatsApp number as your own fully independent bot session (your own owner, your own settings). Usage: .linkme <phone with country code, no +>.',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const senderJid = msg.key.participant || chatId;

    if (!ctx.IS_MANAGED_SESSION) {
      return sock.sendMessage(chatId, {
        text: `❌ *.linkme isn't available right now.*\n\nThis bot is running as a single session (started with \`node index.js\`), which can only ever host one WhatsApp number. Pairing new numbers needs the multi-session host, started with \`node sessions.js\` instead — ask whoever runs this bot to switch to that.`
      }, { quoted: msg });
    }

    const phone = (args[0] || '').replace(/[^0-9]/g, '');
    if (!phone || phone.length < 10) {
      return sock.sendMessage(chatId, { text: `❌ Usage: ${currentPrefix}linkme <phone number with country code, no +>\nExample: ${currentPrefix}linkme 15551234567` }, { quoted: msg });
    }

    // Owner of THIS session bypasses the cooldown — anyone else is rate
    // limited so one person can't spin up unlimited sessions.
    if (!ctx.isOwner()) {
      const last = lastRequestBySender.get(senderJid) || 0;
      const remaining = PAIR_COOLDOWN_MS - (Date.now() - last);
      if (remaining > 0) {
        const mins = Math.ceil(remaining / 60000);
        return sock.sendMessage(chatId, { text: `⏳ You already requested a pairing code recently. Try again in ~${mins} minute(s).` }, { quoted: msg });
      }
      lastRequestBySender.set(senderJid, Date.now());
    }

    await sock.sendMessage(chatId, { text: `🔗 Requesting a pairing code for +${phone}...` }, { quoted: msg });

    const result = await ctx.requestOrchestrator('pair', { phone, requestedBy: senderJid });
    if (!result.ok) {
      return sock.sendMessage(chatId, { text: `❌ Could not start that session: ${result.error || 'unknown error'}` }, { quoted: msg });
    }

    await sock.sendMessage(chatId, {
      text: `✅ *Your session is ready to link*\n\n📞 Number: +${result.phone}\n🔑 Pairing Code: *${result.pairingCode}*\n⏰ Expires in ~10 minutes\n\n📱 On *that* phone: WhatsApp → Settings → Linked Devices → Link a Device → enter the code above.\n\nOnce linked, it becomes your own bot: you'll automatically be its owner, with your own prefix, your own moderation settings, fully separate from this chat and from every other linked session.`
    }, { quoted: msg });
  }
};
