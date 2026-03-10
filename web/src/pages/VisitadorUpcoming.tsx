import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, LogOut, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { formatDateOnly, formatDateTime, formatTime } from "@/lib/format";
import { getUpcomingByVisitador, type Visita } from "@/services/visitas";

type Me = {
  id: string;
  login: string;
  role: string;
};

export default function VisitadorUpcoming() {
  const [loading, setLoading] = useState(true);
  const [visitas, setVisitas] = useState<Visita[]>([]);

  const me: Me | null = JSON.parse(localStorage.getItem("me") || "null");

  async function loadData() {
    if (!me?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getUpcomingByVisitador(me.id);
      setVisitas(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const nextVisita = visitas[0] ?? null;

  const totalSemana = useMemo(() => {
    const now = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(now.getDate() + 7);

    return visitas.filter((v) => {
      const d = new Date(v.data_hora);
      return d >= now && d <= inSevenDays;
    }).length;
  }, [visitas]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    window.location.href = "/login";
  }

  return (
    <AppShell>
      <PageHeader
        title={`Olá, ${me?.login ?? "visitador"}`}
        description="Aqui estão suas próximas visitas agendadas."
        actions={
          <>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" />
              Próximas visitas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {visitas.length}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4" />
              Visitas em 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {totalSemana}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base">Próximo horário</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {nextVisita ? formatDateTime(nextVisita.data_hora) : "Nenhum agendamento"}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Agenda</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <LoadingState />
          ) : visitas.length === 0 ? (
            <EmptyState
              title="Nenhuma visita futura"
              description="Quando houver novos agendamentos, eles aparecerão aqui."
            />
          ) : (
            <div className="grid gap-4">
              {visitas.map((visita) => (
                <div
                  key={visita.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-900">
                        {visita.nome_cliente}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {formatDateOnly(visita.data_hora)} às {formatTime(visita.data_hora)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Telefone: {visita.telefone_cliente}
                      </p>
                      <p className="text-sm text-slate-600">
                        Chaves: {visita.chaves}
                      </p>
                      {visita.duracao_minutos ? (
                        <p className="text-sm text-slate-600">
                          Duração: {visita.duracao_minutos} min
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-start">
                      <StatusBadge status={visita.status ?? null} />
                    </div>
                  </div>

                  {visita.observacoes ? (
                    <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                      {visita.observacoes}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}