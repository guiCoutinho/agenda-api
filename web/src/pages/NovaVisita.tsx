// web/src/pages/NovaVisita.tsx
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createVisita } from "../services/visitas";
import type { UserRole } from "../services/users";

type Me = {
  id: string;
  login: string;
  role: UserRole;
};

function toBackendOffsetDateTime(date: string, time: string) {
  // date: "YYYY-MM-DD"
  // time: "HH:mm"
  // Retorna: "YYYY-MM-DDTHH:mm:00-03:00" (offset do navegador)
  const [hh, mm] = time.split(":").map(Number);

  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);

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

  const [data, setData] = useState(""); // YYYY-MM-DD
  const [hora, setHora] = useState(""); // HH:mm

  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [chaves, setChaves] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState("AGENDADA");
  const [ativa, setAtiva] = useState(true);
  const [duracaoMinutos, setDuracaoMinutos] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI guards (pra não deixar a tela quebrar)
  if (!me) {
    return (
      <div style={{ padding: 24 }}>
        <p>Você não está autenticado.</p>
        <a href="/login">Ir para login</a>
      </div>
    );
  }

  if (!visitadorId) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "crimson" }}>
          Nenhum visitador selecionado. Volte para a Agenda e selecione um visitador.
        </p>
        <button onClick={() => navigate("/agenda")}>Voltar</button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Guard EXTRA (resolve o erro do TS e deixa mais seguro)
    const meSafe = me;
    if (!meSafe) {
      setError("Sessão inválida. Faça login novamente.");
      return;
    }

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
    } catch {
      setError("Não foi possível criar a visita. Verifique os campos e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Criar visita</h2>
          <small>
            Criado por: <b>{me.login}</b> | Visitador selecionado: <b>{visitadorId}</b>
          </small>
        </div>

        <button onClick={() => navigate(-1)} disabled={loading}>
          Voltar
        </button>
      </header>

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <div style={grid}>
          <div>
            <label>Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={input}
              required
            />
          </div>

          <div>
            <label>Hora (HH:mm)</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              style={input}
              required
            />
          </div>

          <div>
            <label>Duração (minutos)</label>
            <input
              type="number"
              min={0}
              value={duracaoMinutos}
              onChange={(e) =>
                setDuracaoMinutos(e.target.value === "" ? "" : Number(e.target.value))
              }
              style={input}
              placeholder="Ex: 30"
            />
          </div>

          <div>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
              <option value="AGENDADA">AGENDADA</option>
              <option value="REALIZADA">REALIZADA</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Nome do cliente</label>
            <input
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              style={input}
              required
            />
          </div>

          <div>
            <label>Telefone do cliente</label>
            <input
              value={telefoneCliente}
              onChange={(e) => setTelefoneCliente(e.target.value)}
              style={input}
              required
            />
          </div>

          <div>
            <label>Chaves</label>
            <input value={chaves} onChange={(e) => setChaves(e.target.value)} style={input} required />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              style={{ ...input, minHeight: 90 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} />
            <label style={{ margin: 0 }}>Ativa</label>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: 16, padding: 12 }}>
          {loading ? "Criando..." : "Criar visita"}
        </button>

        <p style={{ marginTop: 10, fontSize: 13, color: "#555" }}>
          Envio de <code>data_hora</code> para o backend:{" "}
          {data && hora ? <code>{toBackendOffsetDateTime(data, hora)}</code> : <code>—</code>}
        </p>
      </form>
    </div>
  );
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 12,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginTop: 6,
  borderRadius: 8,
  border: "1px solid #ddd",
  boxSizing: "border-box",
};