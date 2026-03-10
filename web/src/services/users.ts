import { api } from "./api";

export type UserRole = "ADMIN" | "ATENDENTE" | "VISITADOR";

export type MeResponse = {
  id: string;
  login: string;
  role: UserRole;
  mustChangePassword: boolean;
};

export async function getMe(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/api/users/me");
  return res.data;
}

export async function createUser(data: { login: string; role: UserRole }) {
  await api.post("/api/users", data);
}

export async function changeMyPassword(newPassword: string) {
  await api.put("/api/users/me/password", { newPassword });
}