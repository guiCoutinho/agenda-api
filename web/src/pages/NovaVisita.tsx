import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Save, UserRound, Clock, MapPin } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getApiErrorMessage } from "@/services/api";
import { createVisita } from "@/services/visitas";
import { getVisitadores } from "@/services/visitadores";
import type { UserRole } from "@/services/users";

type Me = { id: string; login: string; role: UserRole };

function toBackendOffsetDateTime(date: string, time: string) {
  const [yyyy, mm, dd] = date.split("-").map(Number);
  const [hh, min] = time.split(":").map(Number);
  const d = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${pad(Math.floor(abs/60))}:${pad(abs%60)}`;
}

export default function NovaVisita() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const me = useMemo(() => {
    const raw = localStorage.getItem("me");
    return raw ? (JSON.parse(raw) as Me) : null;
  }, []);

  const visitadorId = params.get("visitadorId") ?? "";
  const [visitadorNome, setVisitadorNome] = useState("Carregando...");
  const [loadingVisitador, setLoadingVisitador] = useState(false);

  const [data, setData]                   = useState("");
  const [hora, setHora]                   = useState("");
  const [nomeCliente, setNomeCliente]     = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [chaves, setChaves]               = useState("");
  const [observacoes, setObservacoes]     = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState<number | "">("");
  const [enderecoImovel, setEnderecoImovel] = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!visitadorId) return;
      setLoadingVisitador(true);
      try {
        const vs = await getVisitadores();
        const found = vs.find(v => v.id === visitadorId);
        setVisitadorNome(found?.login ?? "Visitador selecionado");
      } catch { setVisitadorNome("Visitador selecionado"); }
      finally { setLoadingVisitador(false); }
    }
    load();
  }, [visitadorId]);

  if (!me || !visitadorId) {
    return (
      <AppLayout>
        <div className="alert alert-error">
          {!me ? "Você não está autenticado." : "Nenhum visitador selecionado. Volte para a Agenda."}
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/agenda")} style={{ marginTop: "1rem" }}>
          <ArrowLeft size={15} /> Voltar
        </button>
      </AppLayout>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!data || !hora) { setError("Preencha a data e a hora."); return; }
    if (!nomeCliente.trim() || !telefoneCliente.trim() || !chaves.trim()) { setError("Preencha nome, telefone e chaves."); return; }
    setLoading(true);
    try {
      await createVisita({
        data_hora: toBackendOffsetDateTime(data, hora),
        designado_a_id: visitadorId,
        nome_cliente: nomeCliente.trim(),
        telefone_cliente: telefoneCliente.trim(),
        chaves: chaves.trim(),
        observacoes: observacoes.trim() || undefined,
        duracao_minutos: duracaoMinutos === "" ? undefined : duracaoMinutos,
        endereco_imovel: enderecoImovel.trim() || undefined,
      });
      navigate("/agenda");
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível criar a visita."));
    } finally { setLoading(false); }
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <p className="page-subtitle">Agenda</p>
          <h1 className="page-title">Nova visita</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => navigate(-1)} disabled={loading}>
            <ArrowLeft size={15} /> Voltar
          </button>
        </div>
      </div>

      {/* Two-column layout — collapses on mobile via class */}
      <form onSubmit={handleSubmit} className="two-col-form" style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
        {/* Main fields */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Agendamento */}
          <div className="uni-card">
            <div className="uni-card-header">
              <span className="uni-card-title">
                <Clock size={12} style={{ display: "inline", marginRight: "0.35rem", verticalAlign: "middle" }} />
                Dados do agendamento
              </span>
            </div>
            <div className="uni-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Data</label>
                  <input className="form-input" type="date" value={data} onChange={e => setData(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <input className="form-input" type="time" value={hora} onChange={e => setHora(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Duração (minutos)</label>
                  <input className="form-input" type="number" min={0} value={duracaoMinutos}
                    onChange={e => setDuracaoMinutos(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Ex: 30" />
                </div>
                <div className="form-group">
                  <label className="form-label">Chaves</label>
                  <input className="form-input" value={chaves} onChange={e => setChaves(e.target.value)} required />
                </div>
                <div className="form-group form-grid-full">
                  <label className="form-label">
                    <MapPin size={11} style={{ display: "inline", marginRight: "0.3rem", verticalAlign: "middle" }} />
                    Endereço do imóvel
                  </label>
                  <input className="form-input" value={enderecoImovel} onChange={e => setEnderecoImovel(e.target.value)}
                    placeholder="Ex: Rua das Flores, 123, Apto 4, São Paulo - SP" />
                </div>
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="uni-card">
            <div className="uni-card-header">
              <span className="uni-card-title">
                <UserRound size={12} style={{ display: "inline", marginRight: "0.35rem", verticalAlign: "middle" }} />
                Dados do cliente
              </span>
            </div>
            <div className="uni-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nome do cliente</label>
                <input className="form-input" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} required />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input className="form-input" value={telefoneCliente} onChange={e => setTelefoneCliente(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Visitador</label>
                  <input className="form-input" value={loadingVisitador ? "Carregando..." : visitadorNome} disabled />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea className="form-textarea" rows={4} value={observacoes} onChange={e => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais da visita" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="two-col-sidebar" style={{ width: 300, flexShrink: 0, position: "sticky", top: "74px" }}>
          <div className="uni-card">
            <div className="uni-card-header">
              <span className="uni-card-title">
                <CalendarPlus size={12} style={{ display: "inline", marginRight: "0.35rem", verticalAlign: "middle" }} />
                Resumo
              </span>
            </div>
            <div className="uni-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="alert alert-info" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <div><span style={{ fontWeight: 600, color: "#0d1b2e" }}>Criado por:</span> {me.login}</div>
                <div><span style={{ fontWeight: 600, color: "#0d1b2e" }}>Visitador:</span> {loadingVisitador ? "..." : visitadorNome}</div>
                {data && hora && (
                  <div><span style={{ fontWeight: 600, color: "#0d1b2e" }}>Data/hora:</span> {data} às {hora}</div>
                )}
                {enderecoImovel && (
                  <div><span style={{ fontWeight: 600, color: "#0d1b2e" }}>Endereço:</span> {enderecoImovel}</div>
                )}
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button type="submit" className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                <Save size={15} />
                {loading ? "Criando..." : "Criar visita"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
