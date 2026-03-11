import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Save, UserRound } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { getApiErrorMessage } from "@/services/api";
import { createVisita } from "@/services/visitas";
import { getVisitadores } from "@/services/visitadores";
import type { UserRole } from "@/services/users";

type Me = {
  id: string;
  login: string;
  role: UserRole;
};

function toBackendOffsetDateTime(date: string, time: string) {
  const [yyyy, mm, dd] = date.split("-").map(Number);
  const [hh, min] = time.split(":").map(Number);

  const d = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);

  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = "00";

  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const offH = pad(Math.floor(abs / 60));
  const offM = pad(abs % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offH}:${offM}`;
}

export default function NovaVisita() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const me = useMemo(() => {
    const raw = localStorage.getItem("me");
    return raw ? (JSON.parse(raw) as Me) : null;
  }, []);

  const visitadorId = params.get("visitadorId") ?? "";

  const [visitadorNome, setVisitadorNome] = useState<string>("Carregando...");
  const [loadingVisitador, setLoadingVisitador] = useState(false);

  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [chaves, setChaves] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState<number | "">("");
  const [enderecoImovel, setEnderecoImovel] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendDateTime = useMemo(() => {
    if (!data || !hora) return "";
    return toBackendOffsetDateTime(data, hora);
  }, [data, hora]);

  useEffect(() => {
    async function loadVisitadorName() {
      if (!visitadorId) return;

      setLoadingVisitador(true);
      try {
        const visitadores = await getVisitadores();
        const found = visitadores.find((v) => v.id === visitadorId);
        setVisitadorNome(found?.login ?? "Visitador selecionado");
      } catch {
        setVisitadorNome("Visitador selecionado");
      } finally {
        setLoadingVisitador(false);
      }
    }

    loadVisitadorName();
  }, [visitadorId]);

  if (!me) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-slate-700">Voce nao esta autenticado.</p>
          <a href="/login" className="mt-3 inline-block text-sm text-sky-700 underline">
            Ir para login
          </a>
        </div>
      </div>
    );
  }

  if (!visitadorId) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm text-rose-700">
            Nenhum visitador selecionado. Volte para a Agenda e selecione um visitador.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/agenda")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!data || !hora) {
      setError("Preencha a data e a hora.");
      return;
    }

    if (!nomeCliente.trim() || !telefoneCliente.trim() || !chaves.trim()) {
      setError("Preencha nome do cliente, telefone e chaves.");
      return;
    }

    if (duracaoMinutos !== "" && duracaoMinutos < 0) {
      setError("A duracao nao pode ser negativa.");
      return;
    }

    setLoading(true);
    try {
      await createVisita({
        data_hora: toBackendOffsetDateTime(data, hora),
        designado_a_id: visitadorId,
        nome_cliente: nomeCliente.trim(),
        telefone_cliente: telefoneCliente.trim(),
        chaves: chaves.trim(),
        observacoes: observacoes.trim() ? observacoes.trim() : undefined,
        duracao_minutos: duracaoMinutos === "" ? undefined : duracaoMinutos,
        endereco_imovel: enderecoImovel.trim() || undefined,
      });

      navigate("/agenda");
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Nao foi possivel criar a visita. Verifique os campos e tente novamente."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Nova visita"
        description="Preencha os dados para criar um novo agendamento."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Dados do agendamento</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao">Duracao (minutos)</Label>
                <Input
                  id="duracao"
                  type="number"
                  min={0}
                  value={duracaoMinutos}
                  onChange={(e) =>
                    setDuracaoMinutos(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Ex: 30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chaves">Chaves</Label>
                <Input
                  id="chaves"
                  value={chaves}
                  onChange={(e) => setChaves(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="enderecoImovel">Endereço do imóvel</Label>
                <Input
                  id="enderecoImovel"
                  value={enderecoImovel}
                  onChange={(e) => setEnderecoImovel(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123, Apto 4, Jardim Primavera, São Paulo - SP"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Dados do cliente</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeCliente">Nome do cliente</Label>
                <Input
                  id="nomeCliente"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefoneCliente">Telefone do cliente</Label>
                  <Input
                    id="telefoneCliente"
                    value={telefoneCliente}
                    onChange={(e) => setTelefoneCliente(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitador">Visitador</Label>
                  <Input
                    id="visitador"
                    value={loadingVisitador ? "Carregando..." : visitadorNome}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observacoes</Label>
                <Textarea
                  id="observacoes"
                  rows={5}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informacoes adicionais da visita"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4" />
                Resumo
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">Criado por:</span>{" "}
                  {me.login}
                </p>

                <p className="mt-2 flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-slate-500" />
                  <span>
                    <span className="font-medium text-slate-900">Visitador:</span>{" "}
                    {loadingVisitador ? "Carregando..." : visitadorNome}
                  </span>
                </p>

                <p className="mt-2">
                  <span className="font-medium text-slate-900">Visitador ID:</span>{" "}
                  {visitadorId}
                </p>

                <p className="mt-2">
                  <span className="font-medium text-slate-900">Data e hora enviadas:</span>{" "}
                  {backendDateTime ? <code>{backendDateTime}</code> : <code>-</code>}
                </p>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Criando..." : "Criar visita"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </AppShell>
  );
}