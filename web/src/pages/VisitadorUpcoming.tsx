import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MessageCircle, RefreshCw, ArrowRightLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateOnly, formatDateTime, formatTime } from "@/lib/format";
import { getUpcomingByVisitador, transferirVisita, type Visita } from "@/services/visitas";
import { getVisitadores, type Visitador } from "@/services/visitadores";
import { getApiErrorMessage } from "@/services/api";

type Me = { id: string; login: string; role: string };

export default function VisitadorUpcoming() {
  const [loading, setLoading] = useState(true);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [visitadores, setVisitadores] = useState<Visitador[]>([]);
  const [transferModal, setTransferModal] = useState<Visita | null>(null);
  const me: Me | null = JSON.parse(localStorage.getItem("me") || "null");

  async function loadData() {
    if (!me?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const [data, visitadoresList] = await Promise.all([
        getUpcomingByVisitador(me.id),
        getVisitadores().catch(() => [] as Visitador[]),
      ]);
      setVisitas(data);
      setVisitadores(visitadoresList.filter(v => v.id !== me.id));
    } finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  function isToday(ds: string) {
    const d = new Date(ds), now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }

  function getWhatsAppLink(phone: string) {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return "#";
    const cc = digits.startsWith("55") ? digits : `55${digits}`;
    return `https://wa.me/${cc}?text=${encodeURIComponent("Olá! Estou entrando em contato sobre a visita agendada.")}`;
  }

  const visitasHoje   = useMemo(() => visitas.filter(v => isToday(v.data_hora)), [visitas]);
  const proximosDias  = useMemo(() => visitas.filter(v => !isToday(v.data_hora)), [visitas]);
  const nextVisita    = visitas[0] ?? null;
  const totalSemana   = useMemo(() => {
    const now = new Date(), in7 = new Date(); in7.setDate(now.getDate() + 7);
    return visitas.filter(v => { const d = new Date(v.data_hora); return d >= now && d <= in7; }).length;
  }, [visitas]);

  return (
    <AppLayout onRefresh={loadData} loadingRefresh={loading}>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <p className="page-subtitle">Bem-vindo de volta</p>
          <h1 className="page-title">Olá, {me?.login ?? "visitador"}</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline btn-sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><CalendarDays size={17} /></div>
          <div className="stat-label">Total agendado</div>
          <div className="stat-value">{visitas.length}</div>
          <div className="stat-sub">visitas futuras</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Clock3 size={17} /></div>
          <div className="stat-label">Próximos 7 dias</div>
          <div className="stat-value">{totalSemana}</div>
          <div className="stat-sub">visitas na semana</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CalendarDays size={17} /></div>
          <div className="stat-label">Próximo horário</div>
          <div className="stat-value" style={{ fontSize: "1.05rem", lineHeight: 1.3, marginTop: "0.3rem" }}>
            {nextVisita ? formatDateTime(nextVisita.data_hora) : "—"}
          </div>
        </div>
      </div>

      {/* Visits */}
      <div className="uni-card">
        <div className="uni-card-header">
          <span className="uni-card-title">Agenda</span>
          {!loading && (
            <span style={{ fontSize: "0.76rem", color: "#5a6a7e" }}>
              {visitas.length} visita{visitas.length !== 1 ? "s" : ""} agendada{visitas.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="uni-card-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: "2.5rem 0", color: "#aaa", fontSize: "0.88rem" }}>Carregando...</div>
          ) : visitas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
              <CalendarDays size={34} style={{ color: "#ddd", margin: "0 auto 0.75rem", display: "block" }} />
              <p style={{ fontSize: "0.88rem", color: "#999", margin: 0 }}>Nenhuma visita agendada.</p>
              <p style={{ fontSize: "0.8rem", color: "#bbb", marginTop: "0.4rem" }}>Quando houver novos agendamentos, eles aparecerão aqui.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {visitasHoje.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span className="section-label" style={{ color: "#b8912a" }}>Hoje</span>
                    <span style={{ background: "#fdf8ee", color: "#b8912a", border: "1px solid #e0d0a8", borderRadius: 100, padding: "0.13rem 0.62rem", fontSize: "0.7rem", fontWeight: 700 }}>
                      {visitasHoje.length} visita{visitasHoje.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    {visitasHoje.map(v => (
                      <VisitaCard
                        key={v.id}
                        visita={v}
                        today
                        getWa={getWhatsAppLink}
                        onTransferir={() => setTransferModal(v)}
                        hasVisitadores={visitadores.length > 0}
                      />
                    ))}
                  </div>
                </div>
              )}
              {proximosDias.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span className="section-label">Próximos dias</span>
                    <span style={{ background: "#f3f4f6", color: "#6b7280", borderRadius: 100, padding: "0.13rem 0.62rem", fontSize: "0.7rem", fontWeight: 700 }}>
                      {proximosDias.length} visita{proximosDias.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    {proximosDias.map(v => (
                      <VisitaCard
                        key={v.id}
                        visita={v}
                        today={false}
                        getWa={getWhatsAppLink}
                        onTransferir={() => setTransferModal(v)}
                        hasVisitadores={visitadores.length > 0}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {transferModal && (
        <TransferirModal
          visita={transferModal}
          visitadores={visitadores}
          onClose={() => setTransferModal(null)}
          onSuccess={() => { setTransferModal(null); loadData(); }}
        />
      )}
    </AppLayout>
  );
}

function VisitaCard({
  visita, today, getWa, onTransferir, hasVisitadores
}: {
  visita: Visita; today: boolean; getWa: (p: string) => string;
  onTransferir: () => void; hasVisitadores: boolean;
}) {
  return (
    <div className={`visita-card ${today ? "today-card" : ""}`}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0d1b2e" }}>{visita.nome_cliente}</span>
            <StatusBadge status={visita.status ?? null} />
          </div>
          <div style={{ fontSize: "0.8rem", color: "#5a6a7e", display: "flex", flexDirection: "column", gap: "0.18rem" }}>
            <span>📅 {formatDateOnly(visita.data_hora)} às {formatTime(visita.data_hora)}{visita.duracao_minutos ? ` · ${visita.duracao_minutos} min` : ""}</span>
            <span>🔑 Chaves: {visita.chaves}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <span>📞 {visita.telefone_cliente}</span>
              <a
                href={getWa(visita.telefone_cliente)}
                target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#059669", textDecoration: "none", flexShrink: 0 }}
                title="WhatsApp"
              >
                <MessageCircle size={12} />
              </a>
            </div>
            {visita.endereco_imovel && <span>📍 {visita.endereco_imovel}</span>}
          </div>
        </div>
        {hasVisitadores && (
          <button
            className="btn btn-outline btn-sm"
            onClick={onTransferir}
            title="Transferir visita para outro visitador"
            style={{ flexShrink: 0, alignSelf: "flex-start" }}
          >
            <ArrowRightLeft size={12} /> Transferir
          </button>
        )}
      </div>
      {visita.observacoes && (
        <div style={{ marginTop: "0.65rem", background: "#f9f9f9", borderRadius: 8, padding: "0.45rem 0.7rem", fontSize: "0.78rem", color: "#6b7280" }}>
          {visita.observacoes}
        </div>
      )}
    </div>
  );
}

function TransferirModal({
  visita, visitadores, onClose, onSuccess
}: {
  visita: Visita;
  visitadores: Visitador[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedId, setSelectedId] = useState(visitadores[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!selectedId) return;
    setLoading(true); setError("");
    try {
      await transferirVisita(visita.id, selectedId);
      onSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível transferir a visita. O horário pode estar ocupado."));
    } finally { setLoading(false); }
  }

  const { formatDateOnly, formatTime } = { formatDateOnly: (s: string) => new Date(s).toLocaleDateString("pt-BR"), formatTime: (s: string) => new Date(s).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ArrowRightLeft size={18} color="#2563eb" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0d1b2e" }}>Transferir visita</h3>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#5a6a7e" }}>
              {visita.nome_cliente} · {formatDateOnly(visita.data_hora)} às {formatTime(visita.data_hora)}
            </p>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <label className="form-label">Transferir para</label>
          <select
            className="form-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            {visitadores.length === 0
              ? <option value="">Nenhum visitador disponível</option>
              : visitadores.map(v => <option key={v.id} value={v.id}>{v.login}</option>)
            }
          </select>
          <p style={{ marginTop: "0.5rem", fontSize: "0.77rem", color: "#5a6a7e" }}>
            A transferência só será realizada se o visitador de destino estiver com o horário vago.
          </p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        <div style={{ display: "flex", gap: "0.65rem", justifyContent: "flex-end" }}>
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={loading || !selectedId || visitadores.length === 0}
          >
            <ArrowRightLeft size={14} /> {loading ? "Transferindo..." : "Confirmar transferência"}
          </button>
        </div>
      </div>
    </div>
  );
}
