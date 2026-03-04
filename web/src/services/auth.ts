import { api } from "./api";

export type LoginRequest = {
  login: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  // bate no seu controller: POST /auth/login
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}