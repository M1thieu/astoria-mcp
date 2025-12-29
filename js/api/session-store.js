const SESSION_KEY = 'astoria_session';
const ACTIVE_CHARACTER_KEY = 'astoria_active_character';

function readJson(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function readSession() {
    return readJson(SESSION_KEY);
}

export function writeSession(session) {
    writeJson(SESSION_KEY, session);
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

export function getActiveCharacter() {
    return readJson(ACTIVE_CHARACTER_KEY);
}

export function setActiveCharacterLocal(character) {
    writeJson(ACTIVE_CHARACTER_KEY, character);
}

export function clearActiveCharacter() {
    localStorage.removeItem(ACTIVE_CHARACTER_KEY);
}
