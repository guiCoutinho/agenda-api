import { useEffect, useMemo, useState } from "react";
import { getUpcomingByVisitador, type Visita } from "../services/visitas";
import type { UserRole } from "../services/users";

type Me = {
  id: string;
  login: string;
  role: UserRole;
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
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
      setError("Nao foi possivel carregar suas visitas futuras.");
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
      <div className="page-shell card" style={{ padding: 18 }}>
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
            <h2 style={{ margin: 0 }}>Minhas proximas visitas</h2>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              Logado como <strong>{me.login}</strong> ({me.role})
            </p>
          </div>

          <div className="toolbar">
            <button className="btn btn-ghost" onClick={load} disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
            <button className="btn btn-danger" onClick={logout}>Sair</button>
          </div>
        </header>

        <div style={{ marginTop: 14 }}>
          {error && <p className="error">{error}</p>}
          {loading && <p className="muted">Carregando...</p>}

          {!loading && !error && visitas.length === 0 && <p className="muted">Voce nao tem visitas futuras.</p>}

          {!loading && !error && visitas.length > 0 && (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Cliente</th>
                    <th>Telefone</th>
                    <th>Chaves</th>
                    <th>Status</th>
                    <th>Duracao</th>
                    <th>Obs.</th>
                  </tr>
                </thead>
                <tbody>
                  {visitas.map((v) => (
                    <tr key={v.id}>
                      <td>{formatDateTime(v.data_hora)}</td>
                      <td>{v.nome_cliente}</td>
                      <td>{v.telefone_cliente}</td>
                      <td>{v.chaves}</td>
                      <td>{v.status ? <span className="badge">{v.status}</span> : "-"}</td>
                      <td>{v.duracao_minutos ? `${v.duracao_minutos} min` : "-"}</td>
                      <td>{v.observacoes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
