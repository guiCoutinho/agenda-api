// web/src/pages/Agenda.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVisitadores, type Visitador } from "../services/visitadores";
import { getUpcomingByVisitador, type Visita } from "../services/visitas";
import type { UserRole } from "../services/users";

type Me = {
  id: string;
  login: string;
  role: UserRole;
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
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

  async function loadVisitadores() {
    setLoadingVisitadores(true);
    setError(null);
    try {
      const data = await getVisitadores();
      setVisitadores(data);
      if (data.length > 0) setSelectedId((prev) => prev || data[0].id);
    } catch {
      setError("Não foi possível carregar a lista de visitadores.");
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
    } catch {
      setError("Não foi possível carregar as visitas do visitador.");
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

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    window.location.href = "/login";
  }

  const selected = visitadores.find((v) => v.id === selectedId);

  if (!me) {
    return (
      <div style={{ padding: 24 }}>
        <p>Você não está autenticado.</p>
        <a href="/login">Ir para login</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Agenda</h2>
          <small>
            Logado como <b>{me.login}</b> ({me.role})
          </small>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(`/visitas/nova?visitadorId=${selectedId}`)}
            disabled={!selectedId}
          >
            Criar visita
          </button>

          <button onClick={loadVisitadores} disabled={loadingVisitadores}>
            {loadingVisitadores ? "Atualizando..." : "Atualizar visitadores"}
          </button>

          <button onClick={logout}>Sair</button>
        </div>
      </header>

      <section style={{ marginTop: 16 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Selecionar visitador
        </label>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={loadingVisitadores || visitadores.length === 0}
          style={{ padding: 10, minWidth: 320 }}
        >
          {visitadores.length === 0 && <option value="">Nenhum visitador</option>}
          {visitadores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.login}
            </option>
          ))}
        </select>

        <div style={{ marginTop: 16 }}>
          {error && <p style={{ color: "crimson" }}>{error}</p>}
          {loadingVisitas && <p>Carregando visitas...</p>}

          {!loadingVisitas && !error && selected && (
            <p style={{ marginTop: 0 }}>
              Mostrando visitas futuras de: <b>{selected.login}</b>
            </p>
          )}

          {!loadingVisitas && !error && visitas.length === 0 && selected && (
            <p>Este visitador não tem visitas futuras.</p>
          )}

          {!loadingVisitas && !error && visitas.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Data/Hora</th>
                    <th style={th}>Cliente</th>
                    <th style={th}>Telefone</th>
                    <th style={th}>Chaves</th>
                    <th style={th}>Status</th>
                    <th style={th}>Duração</th>
                    <th style={th}>Obs.</th>
                  </tr>
                </thead>
                <tbody>
                  {visitas.map((v) => (
                    <tr key={v.id}>
                      <td style={td}>{formatDateTime(v.data_hora)}</td>
                      <td style={td}>{v.nome_cliente}</td>
                      <td style={td}>{v.telefone_cliente}</td>
                      <td style={td}>{v.chaves}</td>
                      <td style={td}>{v.status}</td>
                      <td style={td}>
                        {v.duracao_minutos ? `${v.duracao_minutos} min` : "-"}
                      </td>
                      <td style={td}>{v.observacoes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid #ddd",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "10px 8px",
  borderBottom: "1px solid #eee",
  verticalAlign: "top",
};