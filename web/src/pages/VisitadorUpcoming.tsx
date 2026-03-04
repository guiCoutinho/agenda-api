import { useEffect, useMemo, useState } from "react";
import { getUpcomingByVisitador, type Visita } from "../services/visitas";
import type { UserRole } from "../services/users";

type Me = {
  id: string;
  login: string;
  role: UserRole;
};

function formatDateTime(iso: string) {
  // Mostra em pt-BR com fuso local do navegador
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default function VisitadorUpcoming() {
  const me = useMemo(() => {
    const raw = localStorage.getItem("me");
    return raw ? (JSON.parse(raw) as Me) : null;
  }, []);

  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!me) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUpcomingByVisitador(me.id);
      setVisitas(data);
    } catch {
      setError("Não foi possível carregar suas visitas futuras.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!me) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    window.location.href = "/login";
  }

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
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Minhas visitas futuras</h2>
          <small>
            Logado como <b>{me.login}</b> ({me.role})
          </small>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
          <button onClick={logout}>Sair</button>
        </div>
      </header>

      <div style={{ marginTop: 16 }}>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        {loading && <p>Carregando...</p>}

        {!loading && !error && visitas.length === 0 && (
          <p>Você não tem visitas futuras.</p>
        )}

        {!loading && !error && visitas.length > 0 && (
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
                    <td style={td}>{v.duracao_minutos ? `${v.duracao_minutos} min` : "-"}</td>
                    <td style={td}>{v.observacoes ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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