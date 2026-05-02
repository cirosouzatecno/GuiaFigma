import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { api } from "@/services/api";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
  type AuthUser
} from "@/lib/auth-storage";

type LoginResponse = {
  token?: string;
  accessToken?: string;
  refreshToken: string;
  admin: AuthUser;
};

type AuthContextValue = {
  token: string | null;
  refreshToken: string | null;
  usuario: AuthUser | null;
  isAuthenticated: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const storedAuth = getStoredAuth();
  const [token, setToken] = useState<string | null>(storedAuth.token);
  const [refreshToken, setRefreshToken] = useState<string | null>(
    storedAuth.refreshToken
  );
  const [usuario, setUsuario] = useState<AuthUser | null>(storedAuth.usuario);

  const login = useCallback(async (usuarioLogin: string, senha: string) => {
    const response = await api.post<LoginResponse>("/auth/login", {
      usuario: usuarioLogin,
      senha
    });

    const nextToken = response.data.accessToken ?? response.data.token;

    if (!nextToken) {
      throw new Error("Token de acesso ausente na resposta de login.");
    }

    setStoredAuth({
      token: nextToken,
      refreshToken: response.data.refreshToken,
      usuario: response.data.admin
    });

    setToken(nextToken);
    setRefreshToken(response.data.refreshToken);
    setUsuario(response.data.admin);
  }, []);

  const logout = useCallback(async () => {
    const currentRefreshToken = getStoredAuth().refreshToken;

    try {
      if (currentRefreshToken) {
        await api.post("/auth/logout", {
          refreshToken: currentRefreshToken
        });
      }
    } finally {
      clearStoredAuth();
      setToken(null);
      setRefreshToken(null);
      setUsuario(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      refreshToken,
      usuario,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [login, logout, refreshToken, token, usuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
