import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../services/api";
import { getVisitadores, type Visitador } from "../services/visitadores";
import { getUpcomingByVisitador, type Visita } from "../services/visitas";
import type { UserRole } from "../services/users";

type Me = {
  id: string;
  login: string;
  role: UserRole;
};

function dayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
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

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

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
        setSelectedId((prev) => (prev && data.some((v) => v.id === prev) ? prev : data[0].id));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Nao foi possivel carregar a lista de visitadores."));
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
      setError(getApiErrorMessage(err, "Nao foi possivel carregar as visitas do visitador."));
    } finally {
      setLoadingVisitas(false);
    }
  }

  useEffect(() => {
    if (!me) return;
    loadVisitadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadVisitas(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const visitasSemana = useMemo(() => {
    return visitas
      .filter((v) => {
        const d = new Date(v.data_hora);
        return d >= startRange && d < endRange;
      })
      .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
  }, [visitas, startRange, endRange]);

  const visitasPorSlot = useMemo(() => {
    const map = new Map<string, Visita[]>();

    for (const visita of visitasSemana) {
      const d = new Date(visita.data_hora);
      const key = `${dayKey(d)}-${d.getHours()}`;
      const list = map.get(key);
      if (list) {
        list.push(visita);
      } else {
        map.set(key, [visita]);
      }
    }

    return map;
  }, [visitasSemana]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    window.location.href = "/login";
  }

  const selected = visitadores.find((v) => v.id === selectedId);

  if (!me) {
    return (
      <div className="page-bg">
        <div className="page-shell card" style={{ padding: 24 }}>
          <p>Voce nao esta autenticado.</p>
          <a href="/login">Ir para login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg">
      <div className="page-shell" style={{ display: "grid", gap: 14 }}>
        <section className="card" style={{ padding: 18 }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>Agenda Semanal</h2>
              <p className="muted" style={{ margin: "4px 0 0" }}>
                Logado como <strong>{me.login}</strong> ({me.role})
              </p>
            </div>

            <div className="toolbar">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/visitas/nova?visitadorId=${selectedId}`)}
                disabled={!selectedId}
              >
                Criar visita
              </button>
              <button className="btn btn-ghost" onClick={loadVisitadores} disabled={loadingVisitadores}>
                {loadingVisitadores ? "Atualizando..." : "Atualizar visitadores"}
              </button>
              <button className="btn btn-danger" onClick={logout}>
                Sair
              </button>
            </div>
          </header>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <label>
              Visitador
              <select
                className="select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                disabled={loadingVisitadores || visitadores.length === 0}
                style={{ maxWidth: 360 }}
              >
                {visitadores.length === 0 && <option value="">Nenhum visitador</option>}
                {visitadores.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.login}
                  </option>
                ))}
              </select>
            </label>

            {!error && selected && (
              <p className="muted" style={{ margin: 0 }}>
                Janela exibida: 7 dias a partir de hoje para <strong>{selected.login}</strong>
              </p>
            )}

            {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
            {loadingVisitas && <p className="muted" style={{ margin: 0 }}>Carregando visitas...</p>}
          </div>
        </section>

        <section className="card" style={{ padding: 14 }}>
          <div className="calendar-wrap">
            <div className="calendar-grid">
              <div className="calendar-head">Hora</div>
              {weekDays.map((day) => (
                <div className="calendar-head" key={day.toISOString()}>
                  {formatWeekday(day)}
                </div>
              ))}

              {hours.map((hour) => (
                <Fragment key={`row-${hour}`}>
                  <div className="calendar-time">{hourLabel(hour)}</div>
                  {weekDays.map((day) => {
                    const key = `${dayKey(day)}-${hour}`;
                    const slotVisitas = visitasPorSlot.get(key) ?? [];
                    return (
                      <div key={`${key}-cell`} className="calendar-cell">
                        {slotVisitas.map((v) => (
                          <article className="event-card" key={v.id}>
                            <p className="event-title">{formatTime(v.data_hora)} - {v.nome_cliente}</p>
                            <p className="event-sub">Tel: {v.telefone_cliente}</p>
                            <p className="event-sub">Chaves: {v.chaves}</p>
                            <p className="event-sub">
                              {v.status ? <span className="badge">{v.status}</span> : null}
                              {v.duracao_minutos ? ` ${v.duracao_minutos}min` : ""}
                            </p>
                          </article>
                        ))}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>

          {!loadingVisitas && !error && selected && visitasSemana.length === 0 && (
            <p className="muted" style={{ margin: "12px 0 0" }}>
              Nenhuma visita deste visitador nesta janela de 7 dias.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
