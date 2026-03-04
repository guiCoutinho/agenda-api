import { api } from "./api";

export type UserRole = "ADMIN" | "ATENDENTE" | "VISITADOR";

export type MeResponse = {
  id: string;
  login: string;
  role: UserRole;
};

export async function getMe(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/api/users/me");
  return res.data;
}