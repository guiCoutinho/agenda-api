import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, UserRound, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getApiErrorMessage } from "@/services/api";
import { getVisitadores, type Visitador } from "@/services/visitadores";
import { getUpcomingByVisitador, type Visita } from "@/services/visitas";
import type { UserRole } from "@/services/users";

type Me = { id: string; login: string; role: UserRole };

const START_HOUR = 8, END_HOUR = 20, SLOT_MINUTES = 30, SLOT_HEIGHT = 60;
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;
const DAY_COLUMN_HEIGHT = TOTAL_SLOTS * SLOT_HEIGHT;

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function formatWeekday(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).format(d);
}
function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}
function formatHourLabel(h: number, m: number) {
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}
function getMinutesSinceStart(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes() - START_HOUR * 60;
}
function clamp(v: number, min: number, max: number) { return Math.min(Math.max(v, min), max); }
function isToday(d: Date) {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function Agenda() {
  const navigate = useNavigate();
  const me = useMemo(() => {
    const raw = localStorage.getItem("me");
    return raw ? (JSON.parse(raw) as Me) : null;
  }, []);

  const [visitadores, setVisitadores] = useState<Visitador[]>([]);
  const [selectedId, setSelectedId]   = useState("");
  const [visitas, setVisitas]         = useState<Visita[]>([]);
  const [loadingVisitadores, setLoadingVisitadores] = useState(true);
  const [loadingVisitas, setLoadingVisitas]         = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const start = new Date(); start.setHours(0,0,0,0);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate()+i); return d; });
  }, []);

  const timeSlots = useMemo(() => Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const total = START_HOUR * 60 + i * SLOT_MINUTES;
    return { hour: Math.floor(total/60), minute: total%60 };
  }), []);

  const startRange = weekDays[0];
  const endRange   = useMemo(() => { const d = new Date(weekDays[0]); d.setDate(d.getDate()+7); return d; }, [weekDays]);

  async function loadVisitadores() {
    setLoadingVisitadores(true); setError(null);
    try {
      const data = await getVisitadores();
      setVisitadores(data);
      if (data.length > 0) setSelectedId(prev => prev && data.some(v => v.id === prev) ? prev : data[0].id);
      else setSelectedId("");
    } catch(err) { setError(getApiErrorMessage(err, "Não foi possível carregar visitadores.")); }
    finally { setLoadingVisitadores(false); }
  }

  async function loadVisitas(id: string) {
    setLoadingVisitas(true); setError(null);
    try { const data = await getUpcomingByVisitador(id); setVisitas(data); }
    catch(err) { setError(getApiErrorMessage(err, "Não foi possível carregar visitas.")); }
    finally { setLoadingVisitas(false); }
  }

  useEffect(() => { if (me) loadVisitadores(); }, []);
  useEffect(() => { if (!selectedId) { setVisitas([]); return; } loadVisitas(selectedId); }, [selectedId]);

  const visitasSemana = useMemo(() =>
    visitas.filter(v => { const d = new Date(v.data_hora); return d >= startRange && d < endRange; })
           .sort((a,b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()),
  [visitas, startRange, endRange]);

  const visitasHoje = useMemo(() => {
    const hoje = dayKey(new Date());
    return visitasSemana.filter(v => dayKey(new Date(v.data_hora)) === hoje).length;
  }, [visitasSemana]);

  const visitasPorDia = useMemo(() => {
    const map = new Map<string, Visita[]>();
    for (const day of weekDays) map.set(dayKey(day), []);
    for (const v of visitasSemana) { const k = dayKey(new Date(v.data_hora)); const l = map.get(k); if (l) l.push(v); }
    return map;
  }, [visitasSemana, weekDays]);

  const selected  = visitadores.find(v => v.id === selectedId);
  const nextVisita = visitasSemana[0] ?? null;

  if (!me) return null;

  return (
    <AppLayout onRefresh={loadVisitadores} loadingRefresh={loadingVisitadores}>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <p className="page-subtitle">
            {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
          </p>
          <h1 className="page-title">Agenda semanal</h1>
        </div>
        <div className="page-header-actions">
          {me.role === "ADMIN" && (
            <button className="btn btn-outline btn-sm" onClick={() => navigate("/usuarios/novo")}>
              <UserRound size={13} /> Usuários
            </button>
          )}
          <button
            className="btn btn-gold"
            onClick={() => navigate(`/visitas/nova?visitadorId=${selectedId}`)}
            disabled={!selectedId}
          >
            <Plus size={15} /> Nova visita
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><CalendarDays size={17} /></div>
          <div className="stat-label">Visitas na semana</div>
          <div className="stat-value">{visitasSemana.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Clock3 size={17} /></div>
          <div className="stat-label">Visitas hoje</div>
          <div className="stat-value">{visitasHoje}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><UserRound size={17} /></div>
          <div className="stat-label">Visitador selecionado</div>
          <div className="stat-value" style={{ fontSize: "1.1rem", lineHeight: 1.3, marginTop: "0.3rem" }}>
            {selected ? selected.login : "—"}
          </div>
          {nextVisita && <div className="stat-sub">Próx. às {formatTime(nextVisita.data_hora)}</div>}
        </div>
      </div>

      {/* Filters */}
      <div className="uni-card">
        <div className="uni-card-header">
          <span className="uni-card-title">Filtros</span>
        </div>
        <div className="uni-card-body" style={{ display: "flex", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
          <div className="form-group" style={{ minWidth: 200, flex: "0 0 auto" }}>
            <label className="form-label">Visitador</label>
            <select
              className="form-select"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              disabled={loadingVisitadores || visitadores.length === 0}
            >
              {visitadores.length === 0 && <option value="">Nenhum visitador</option>}
              {visitadores.map(v => <option key={v.id} value={v.id}>{v.login}</option>)}
            </select>
          </div>
          {selected && !error && (
            <p style={{ fontSize: "0.82rem", color: "#5a6a7e", margin: 0, paddingBottom: "0.1rem" }}>
              Exibindo <strong style={{ color: "#0d1b2e" }}>7 dias</strong> a partir de hoje para{" "}
              <strong style={{ color: "#0d1b2e" }}>{selected.login}</strong>.
            </p>
          )}
          {error && <div className="alert alert-error" style={{ flex: 1 }}>{error}</div>}
        </div>
      </div>

      {/* Calendar */}
      <div className="uni-card">
        <div className="uni-card-header">
          <span className="uni-card-title">Grade semanal</span>
          {!loadingVisitas && selected && (
            <span style={{ fontSize: "0.76rem", color: "#5a6a7e" }}>
              {visitasSemana.length} visita{visitasSemana.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div style={{ padding: 0 }}>
          {loadingVisitas ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "0.88rem" }}>
              Carregando agenda...
            </div>
          ) : !selected ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <UserRound size={34} style={{ color: "#ddd", margin: "0 auto 0.75rem", display: "block" }} />
              <p style={{ color: "#999", fontSize: "0.88rem", margin: 0 }}>Selecione um visitador para ver a agenda.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto", borderRadius: "0 0 16px 16px" }}>
              <div className="agenda-grid">
                {/* Header */}
                <div className="ag-hcell ag-header" style={{ borderRight: "1px solid rgba(0,0,0,0.06)" }}>Hora</div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className={`ag-hcell ag-header ${isToday(day) ? "today-col" : ""}`}>
                    {formatWeekday(day)}
                    {isToday(day) && (
                      <span style={{ display: "block", width: 5, height: 5, borderRadius: "50%", background: "#b8912a", marginTop: 3 }} />
                    )}
                  </div>
                ))}

                {/* Time col */}
                <div style={{ borderRight: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ height: DAY_COLUMN_HEIGHT }}>
                    {timeSlots.map(({ hour, minute }) => (
                      <div key={`t-${hour}-${minute}`} className="ag-tcell" style={{ height: SLOT_HEIGHT }}>
                        {formatHourLabel(hour, minute)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day cols */}
                {weekDays.map(day => {
                  const key = dayKey(day);
                  const dayVisitas = visitasPorDia.get(key) ?? [];
                  return (
                    <div key={`col-${key}`} className={`ag-dcol ${isToday(day) ? "today-col" : ""}`} style={{ height: DAY_COLUMN_HEIGHT }}>
                      {timeSlots.map(({ hour, minute }) => (
                        <div key={`s-${key}-${hour}-${minute}`} className="ag-slot" style={{ height: SLOT_HEIGHT }} />
                      ))}
                      {dayVisitas.map(v => {
                        const rawTop = getMinutesSinceStart(v.data_hora);
                        const dur    = Math.max(v.duracao_minutos ?? 30, 30);
                        const topMin = clamp(rawTop, 0, (END_HOUR-START_HOUR)*60);
                        const botMin = clamp(rawTop+dur, 0, (END_HOUR-START_HOUR)*60);
                        const visMin = Math.max(botMin-topMin, 30);
                        const top    = (topMin/SLOT_MINUTES)*SLOT_HEIGHT;
                        const height = (visMin/SLOT_MINUTES)*SLOT_HEIGHT;
                        return (
                          <div key={v.id} className="ag-event" style={{ top, height }}>
                            <div className="ag-event-time">{formatTime(v.data_hora)}</div>
                            <div className="ag-event-name">{v.nome_cliente}</div>
                            <div className="ag-event-detail">🔑 {v.chaves}</div>
                            {v.endereco_imovel && height >= 90 && (
                              <div className="ag-event-detail">📍 {v.endereco_imovel}</div>
                            )}
                            {height >= 100 && (
                              <div style={{ marginTop: "0.25rem" }}>
                                <StatusBadge status={v.status ?? null} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
