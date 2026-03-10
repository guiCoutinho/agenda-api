import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  LogOut,
  Plus,
  RefreshCw,
  UserRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getApiErrorMessage } from "@/services/api";
import { getVisitadores, type Visitador } from "@/services/visitadores";
import { getUpcomingByVisitador, type Visita } from "@/services/visitas";
import type { UserRole } from "@/services/users";

type Me = {
  id: string;
  login: string;
  role: UserRole;
};

const START_HOUR = 8;
const END_HOUR = 20; // fim visual da grade
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 64; // px
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;
const DAY_COLUMN_HEIGHT = TOTAL_SLOTS * SLOT_HEIGHT;

function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatWeekday(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(d);
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatHourLabel(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getMinutesSinceStart(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes() - START_HOUR * 60;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function Agenda() {
  const navigate = useNavigate();

  const me = useMemo(() => {
    const raw = localStorage.getItem("me");
    return raw ? (JSON.parse(raw) as Me) : null;
  }, []);

  const [visitadores, setVisitadores] = useState<Visitador[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loadingVisitadores, setLoadingVisitadores] = useState(true);
  const [loadingVisitas, setLoadingVisitas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  const timeSlots = useMemo(() => {
    return Array.from({ length: TOTAL_SLOTS }, (_, i) => {
      const totalMinutes = START_HOUR * 60 + i * SLOT_MINUTES;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      return { hour, minute };
    });
  }, []);

  const startRange = weekDays[0];

  const endRange = useMemo(() => {
    const d = new Date(weekDays[0]);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekDays]);

  async function loadVisitadores() {
    setLoadingVisitadores(true);
    setError(null);

    try {
      const data = await getVisitadores();
      setVisitadores(data);

      if (data.length > 0) {
        setSelectedId((prev) =>
          prev && data.some((v) => v.id === prev) ? prev : data[0].id
        );
      } else {
        setSelectedId("");
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Nao foi possivel carregar a lista de visitadores."
        )
      );
    } finally {
      setLoadingVisitadores(false);
    }
  }

  async function loadVisitas(visitadorId: string) {
    setLoadingVisitas(true);
    setError(null);

    try {
      const data = await getUpcomingByVisitador(visitadorId);
      setVisitas(data);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Nao foi possivel carregar as visitas do visitador."
        )
      );
    } finally {
      setLoadingVisitas(false);
    }
  }

  useEffect(() => {
    if (!me) return;
    loadVisitadores();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setVisitas([]);
      return;
    }

    loadVisitas(selectedId);
  }, [selectedId]);

  const visitasSemana = useMemo(() => {
    return visitas
      .filter((v) => {
        const d = new Date(v.data_hora);
        return d >= startRange && d < endRange;
      })
      .sort(
        (a, b) =>
          new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
      );
  }, [visitas, startRange, endRange]);

  const visitasHoje = useMemo(() => {
    const hoje = dayKey(new Date());
    return visitasSemana.filter((v) => dayKey(new Date(v.data_hora)) === hoje)
      .length;
  }, [visitasSemana]);

  const visitasPorDia = useMemo(() => {
    const map = new Map<string, Visita[]>();

    for (const day of weekDays) {
      map.set(dayKey(day), []);
    }

    for (const visita of visitasSemana) {
      const key = dayKey(new Date(visita.data_hora));
      const list = map.get(key);
      if (list) list.push(visita);
    }

    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
      );
    }

    return map;
  }, [visitasSemana, weekDays]);

  const nextVisita = visitasSemana[0] ?? null;
  const selected = visitadores.find((v) => v.id === selectedId);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    window.location.href = "/login";
  }

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

  return (
    <AppShell>
      <PageHeader
        title="Agenda semanal"
        description={`Logado como ${me.login} (${me.role})`}
        actions={
          <>
            <Button
              onClick={() => navigate(`/visitas/nova?visitadorId=${selectedId}`)}
              disabled={!selectedId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar visita
            </Button>

            <Button
              variant="outline"
              onClick={loadVisitadores}
              disabled={loadingVisitadores}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {loadingVisitadores ? "Atualizando..." : "Atualizar"}
            </Button>

            <Button variant="outline" onClick={logout}>
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
              Visitas na semana
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {visitasSemana.length}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4" />
              Visitas hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {visitasHoje}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="h-4 w-4" />
              Visitador selecionado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {selected ? selected.login : "Nenhum visitador"}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Filtros e contexto</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid gap-2 md:max-w-sm">
            <label
              htmlFor="visitador"
              className="text-sm font-medium text-slate-700"
            >
              Visitador
            </label>

            <select
              id="visitador"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={loadingVisitadores || visitadores.length === 0}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400"
            >
              {visitadores.length === 0 && (
                <option value="">Nenhum visitador</option>
              )}

              {visitadores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.login}
                </option>
              ))}
            </select>
          </div>

          {!error && selected ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Janela exibida: 7 dias a partir de hoje para{" "}
              <span className="font-medium text-slate-900">
                {selected.login}
              </span>
              .
              {nextVisita ? (
                <>
                  {" "}Proxima visita às{" "}
                  <span className="font-medium text-slate-900">
                    {formatTime(nextVisita.data_hora)}
                  </span>
                  .
                </>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Agenda semanal</CardTitle>
        </CardHeader>

        <CardContent>
          {loadingVisitas ? (
            <LoadingState />
          ) : !error && selected && visitasSemana.length === 0 ? (
            <EmptyState
              title="Nenhuma visita nesta semana"
              description="Nao ha visitas futuras para este visitador na janela de 7 dias."
            />
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1180px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="grid grid-cols-[90px_repeat(7,minmax(150px,1fr))]">
                  <div className="border-b border-r bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-700">
                    Hora
                  </div>

                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className="border-b border-r bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-700 last:border-r-0"
                    >
                      {formatWeekday(day)}
                    </div>
                  ))}

                  <div className="border-r bg-white">
                    <div style={{ height: DAY_COLUMN_HEIGHT }}>
                      {timeSlots.map(({ hour, minute }, index) => (
                        <div
                          key={`time-${hour}-${minute}`}
                          className="border-b border-slate-200 px-3 py-2 text-sm text-slate-500"
                          style={{ height: SLOT_HEIGHT }}
                        >
                          {index < TOTAL_SLOTS ? formatHourLabel(hour, minute) : ""}
                        </div>
                      ))}
                    </div>
                  </div>

                  {weekDays.map((day) => {
                    const key = dayKey(day);
                    const dayVisitas = visitasPorDia.get(key) ?? [];

                    return (
                      <div
                        key={`day-col-${key}`}
                        className="relative border-r last:border-r-0"
                        style={{ height: DAY_COLUMN_HEIGHT }}
                      >
                        {timeSlots.map(({ hour, minute }) => (
                          <div
                            key={`line-${key}-${hour}-${minute}`}
                            className="border-b border-slate-200"
                            style={{ height: SLOT_HEIGHT }}
                          />
                        ))}

                        {dayVisitas.map((v) => {
                          const rawTopMinutes = getMinutesSinceStart(v.data_hora);
                          const durationMinutes = Math.max(v.duracao_minutos ?? 30, 30);

                          const topMinutes = clamp(
                            rawTopMinutes,
                            0,
                            (END_HOUR - START_HOUR) * 60
                          );

                          const bottomMinutes = clamp(
                            rawTopMinutes + durationMinutes,
                            0,
                            (END_HOUR - START_HOUR) * 60
                          );

                          const visibleDurationMinutes = Math.max(
                            bottomMinutes - topMinutes,
                            30
                          );

                          const top = (topMinutes / SLOT_MINUTES) * SLOT_HEIGHT;
                          const height =
                            (visibleDurationMinutes / SLOT_MINUTES) * SLOT_HEIGHT;

                          return (
                            <article
                              key={v.id}
                              className="absolute left-1 right-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm"
                              style={{
                                top,
                                height,
                              }}
                            >
                              <p className="text-xs font-semibold text-slate-900">
                                {formatTime(v.data_hora)} - {v.nome_cliente}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Tel: {v.telefone_cliente}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Chaves: {v.chaves}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <StatusBadge status={v.status ?? null} />
                                {v.duracao_minutos ? (
                                  <span className="text-[11px] text-slate-500">
                                    {v.duracao_minutos} min
                                  </span>
                                ) : null}
                              </div>

                              {height >= 120 && v.observacoes ? (
                                <div className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-[11px] text-slate-600">
                                  {v.observacoes}
                                </div>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}