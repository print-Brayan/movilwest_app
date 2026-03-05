const TOKEN_KEY = 'token_movilwest';
const USER_KEY = 'usuario_movilwest';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function saveSession(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  if (usuario) {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser() {
  const usuarioRaw = localStorage.getItem(USER_KEY);
  if (!usuarioRaw) return null;

  try {
    return JSON.parse(usuarioRaw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}
