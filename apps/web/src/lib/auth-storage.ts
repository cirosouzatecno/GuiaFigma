export type AuthUser = {
  id: string;
  nome: string;
  usuario?: string;
};

export type StoredAuth = {
  token: string | null;
  refreshToken: string | null;
  usuario: AuthUser | null;
};

const TOKEN_KEY = "guia_expo_token";
const REFRESH_TOKEN_KEY = "guia_expo_refresh_token";
const USER_KEY = "guia_expo_usuario";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredAuth(): StoredAuth {
  if (!canUseStorage()) {
    return {
      token: null,
      refreshToken: null,
      usuario: null
    };
  }

  const usuarioRaw = window.localStorage.getItem(USER_KEY);
  let usuario: AuthUser | null = null;

  if (usuarioRaw) {
    try {
      usuario = JSON.parse(usuarioRaw) as AuthUser;
    } catch {
      usuario = null;
    }
  }

  return {
    token: window.localStorage.getItem(TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
    usuario
  };
}

export function setStoredAuth(auth: {
  token: string;
  refreshToken: string;
  usuario: AuthUser;
}) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, auth.token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.usuario));
}

export function setStoredToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredAuth() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
