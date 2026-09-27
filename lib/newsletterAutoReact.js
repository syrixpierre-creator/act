// ============================================================
//  NEWSLETTER AUTO-REACT
// ============================================================
//  Auto-reacts (random emoji) to every new post on one or more WhatsApp
//  "channel" (newsletter) JIDs. Ported from the pairing-panel project's
//  forceJoin.js, adapted for Paxton MD.
//
//  Paxton previously reacted to its own update channel with
//  `sock.sendMessage(jid, { react: {...} })` — that's the wrong API for
//  newsletters (it targets normal chat messages) and is unreliable there.
//  Channels use a dedicated Baileys method, `newsletterReactMessage`,
//  keyed by the message's *server id*, not its normal message key.id.
// ============================================================

import { envString } from '../config/index.js';

const DEFAULT_EMOJIS = [
    '❤️', '🔥', '⚡', '🙌', '👑', '💜', '💫', '👍', '🧡', '💛', '💚', '💙',
    '✨', '🌟', '⭐', '💥', '🎉', '🎊', '🎁',
    '😎', '😂', '😍', '🥰', '🤩', '🥳',
    '💎', '🏆', '🥇', '🚀', '🌈', '🎵', '🎶', '🫶', '👏'
];

// NEWSLETTER_CHANNELS env: comma/space separated list of newsletter JIDs
// (each ending in @newsletter). Falls back to Paxton's own update channel
// so behaviour is unchanged for anyone who hasn't configured anything.
function getConfiguredChannels() {
    const raw = envString('NEWSLETTER_CHANNELS', '120363427360133880@newsletter');
    return raw
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => (s.endsWith('@newsletter') ? s : `${s}@newsletter`));
}

/**
 * Registers a messages.upsert listener that auto-reacts to every live post
 * on the configured newsletter channel(s). Safe to call once per socket —
 * everything outside the configured channel set is ignored immediately.
 *
 * @param {*} sock - the connected Baileys socket
 * @param {string} [sessionLabel] - for log lines only, e.g. the session id
 * @param {object} [opts]
 * @param {string[]} [opts.channels] - override the channel list (defaults to NEWSLETTER_CHANNELS env)
 * @param {string[]} [opts.emojis] - override the reaction emoji pool
 */
export function setupNewsletterAutoReact(sock, sessionLabel = 'default', opts = {}) {
    const channels = opts.channels?.length ? opts.channels : getConfiguredChannels();
    if (!channels.length) return () => {};
    const channelSet = new Set(channels);
    const emojis = opts.emojis?.length ? opts.emojis : DEFAULT_EMOJIS;

    async function reactToOne(message) {
        try {
            if (!message?.key) return;
            const jid = message.key.remoteJid;
            if (!channelSet.has(jid)) return;

            // newsletterServerId isn't always populated depending on how the
            // event arrived — fall back to key.server_id / key.id so a post
            // never silently gets skipped.
            const messageId = message.newsletterServerId
                ?? message.key?.server_id
                ?? message.key?.id;
            if (!messageId) return;

            const emoji = emojis[Math.floor(Math.random() * emojis.length)];

            let retries = 3;
            while (retries-- > 0) {
                try {
                    await sock.newsletterReactMessage(jid, String(messageId), emoji);
                    return;
                } catch (err) {
                    if (retries <= 0) {
                        console.log?.(`[${sessionLabel}] newsletter auto-react failed for ${jid}: ${err.message}`);
                        return;
                    }
                    await new Promise((r) => setTimeout(r, 1500));
                }
            }
        } catch {
            // Never let a reaction failure crash the session.
        }
    }

    const listener = ({ type, messages }) => {
        // Skip history-sync replay — only react to live posts, otherwise a
        // fresh connect floods reactions across old channel history.
        if (type && type !== 'notify') return;
        if (!Array.isArray(messages) || !messages.length) return;
        for (const message of messages) {
            if (message?.key?.remoteJid && channelSet.has(message.key.remoteJid)) reactToOne(message);
        }
    };

    sock.ev.on('messages.upsert', listener);

    // Also follow the configured channels on connect so reactions are
    // actually possible (you can't react to a channel you don't follow).
    (async () => {
        for (const jid of channels) {
            try { await sock.newsletterFollow(jid); }
            catch (err) { /* already following / not resolvable — non-fatal */ }
        }
    })();

    // Return an unsubscribe handle in case a session ever needs to detach it.
    return () => sock.ev.off('messages.upsert', listener);
}
