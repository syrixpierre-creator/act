// ============================================================
//  Session context — makes "which session is this?" available to any
//  file, at any depth, without threading sessionId through every
//  function call. Built on Node's AsyncLocalStorage: whatever session
//  the current async call chain started under stays attached through
//  every await/.then()/catch() in that chain.
//
//  Used by lib/settingsStore.js, lib/brand.js, lib/statusViews.js and
//  a few owner/dev commands so each session reads/writes its own
//  ./sessions/<id>/data/... files instead of sharing one ./data/ dir
//  now that all sessions share a single process (see index.js's
//  createBotSession() and server.js).
//
//  Falls back to the single-session default ('default') when nothing
//  established a context — e.g. scripts, tests, or code paths that
//  run outside a session's event handlers. This keeps behaviour
//  identical to the old one-session-per-process model until every
//  call site is wired through runInSession().
// ============================================================
import { AsyncLocalStorage } from 'async_hooks';
import path from 'path';

const als = new AsyncLocalStorage();

export function runInSession(sessionId, fn) {
    return als.run({ sessionId }, fn);
}

export function currentSessionId() {
    return als.getStore()?.sessionId || 'default';
}

// 'default' keeps using the repo root's ./data (see sessions.js's own
// comment about not moving the pre-existing single-session install) —
// every other session gets its own ./sessions/<id>/data.
export function currentDataDir() {
    const id = currentSessionId();
    return id === 'default'
        ? path.join(process.cwd(), 'data')
        : path.join(process.cwd(), 'sessions', id, 'data');
}
