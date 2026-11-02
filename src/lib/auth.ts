import { axiosInstance } from "@/api/mutator/custom-instance";

const TOKEN_KEY = "auth_token";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const isAuthenticated = () => !!getToken();

export async function login(credentials: LoginCredentials) {
  const { data } = await axiosInstance.post<{ accessToken: string }>(
    "/auth/login",
    credentials,
  );
  setToken(data.accessToken);
}

export const logout = () => clearToken();
