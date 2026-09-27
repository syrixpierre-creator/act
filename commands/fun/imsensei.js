export default {
  name: 'imsensei',
  alias: ["iminconnuboysensei"],
  description: "A little identity easter egg. Usage: .imsensei",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const text = `🌑 *I'm Inconnu Boy Sensei.*\n\nBuilt from the shadows, running ${ctx.BOT_NAME} v${ctx.VERSION}.\n${ctx.commands.size} commands strong, always watching, always online. ⚡`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
