import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../services/api";
import { createVisita } from "../services/visitas";
import type { UserRole } from "../services/users";

type Me = {
  id: string;
  login: string;
  role: UserRole;
};

function toBackendOffsetDateTime(date: string, time: string) {
  const [yyyy, mm, dd] = date.split("-").map(Number);
  const [hh, min] = time.split(":").map(Number);

  // Build local date from numeric parts to avoid timezone shifts from `new Date("YYYY-MM-DD")`.
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

  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [chaves, setChaves] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!visitadorId) {
    return (
      <div className="page-bg">
        <div className="page-shell card" style={{ padding: 24 }}>
          <p className="error" style={{ marginTop: 0 }}>
            Nenhum visitador selecionado. Volte para a Agenda e selecione um visitador.
          </p>
          <button className="btn btn-ghost" onClick={() => navigate("/agenda")}>Voltar</button>
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

    const data_hora = toBackendOffsetDateTime(data, hora);

    setLoading(true);
    try {
      await createVisita({
        data_hora,
        designado_a_id: visitadorId,
        nome_cliente: nomeCliente.trim(),
        telefone_cliente: telefoneCliente.trim(),
        chaves: chaves.trim(),
        observacoes: observacoes.trim() ? observacoes.trim() : undefined,
        duracao_minutos: duracaoMinutos === "" ? undefined : duracaoMinutos,
      });

      navigate("/agenda");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Nao foi possivel criar a visita. Verifique os campos e tente novamente.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-bg">
      <div className="page-shell" style={{ display: "grid", gap: 14 }}>
        <section className="card" style={{ padding: 18 }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>Nova visita</h2>
              <p className="muted" style={{ margin: "4px 0 0" }}>
                Criador: <strong>{me.login}</strong> | Visitador ID: <strong>{visitadorId}</strong>
              </p>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate(-1)} disabled={loading}>Voltar</button>
          </header>
        </section>

        <section className="card" style={{ padding: 18 }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            {error && <p className="error" style={{ margin: 0 }}>{error}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <label>
                Data
                <input className="input" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
              </label>

              <label>
                Hora
                <input className="input" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
              </label>

              <label>
                Duracao (minutos)
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={duracaoMinutos}
                  onChange={(e) => setDuracaoMinutos(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Ex: 30"
                />
              </label>
            </div>

            <label>
              Nome do cliente
              <input className="input" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} required />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <label>
                Telefone do cliente
                <input
                  className="input"
                  value={telefoneCliente}
                  onChange={(e) => setTelefoneCliente(e.target.value)}
                  required
                />
              </label>

              <label>
                Chaves
                <input className="input" value={chaves} onChange={(e) => setChaves(e.target.value)} required />
              </label>
            </div>

            <label>
              Observacoes
              <textarea
                className="textarea"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <p className="muted" style={{ margin: 0 }}>
                data_hora enviado: {data && hora ? <code>{toBackendOffsetDateTime(data, hora)}</code> : <code>-</code>}
              </p>

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar visita"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
