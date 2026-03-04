import { api } from "./api";

export type Visitador = {
  id: string;
  login: string;
};

export async function getVisitadores() {
  const res = await api.get<Visitador[]>("/api/users/visitadores");
  return res.data;
}