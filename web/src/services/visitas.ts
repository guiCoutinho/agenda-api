import { api } from "./api";

export type Visita = {
  id: string;
  criado_em?: string;
  data_hora: string;
  nome_cliente: string;
  telefone_cliente: string;
  chaves: string;
  observacoes?: string;
  status?: string;
  ativa?: boolean;
  duracao_minutos?: number;
  endereco_imovel?: string;
};

export type CreateVisitaRequest = {
  data_hora: string;
  designado_a_id: string;
  nome_cliente: string;
  telefone_cliente: string;
  chaves: string;
  observacoes?: string;
  duracao_minutos?: number;
  endereco_imovel?: string;
};

export async function getUpcomingByVisitador(visitadorId: string) {
  const res = await api.get<Visita[]>(`/api/visita/upcoming/visitador/${visitadorId}`);
  return res.data;
}

export async function createVisita(payload: CreateVisitaRequest) {
  const res = await api.post("/api/visita", payload);
  return res.data;
}
export async function transferirVisita(visitaId: string, novoVisitadorId: string) {
  const res = await api.put<Visita>(`/api/visita/${visitaId}/transferir`, { novoVisitadorId });
  return res.data;
}

export async function cancelarVisita(visitaId: string) {
  await api.delete(`/api/visita/${visitaId}`);
}
