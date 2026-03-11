import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MessageCircle, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateOnly, formatDateTime, formatTime } from "@/lib/format";
import { getUpcomingByVisitador, type Visita } from "@/services/visitas";

type Me = { id: string; login: string; role: string };

export default function VisitadorUpcoming() {
  const [loading, setLoading] = useState(true);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const me: Me | null = JSON.parse(localStorage.getItem("me") || "null");

  async function loadData() {
    if (!me?.id) { setLoading(false); return; }
    setLoading(true);
    try { const data = await getUpcomingByVisitador(me.id); setVisitas(data); }
    finally { setLoading(false); }
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

  const visitasHoje    = useMemo(() => visitas.filter(v => isToday(v.data_hora)), [visitas]);
  const proximosDias   = useMemo(() => visitas.filter(v => !isToday(v.data_hora)), [visitas]);
  const nextVisita     = visitas[0] ?? null;
  const totalSemana    = useMemo(() => {
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
                    {visitasHoje.map(v => <VisitaCard key={v.id} visita={v} today getWa={getWhatsAppLink} />)}
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
                    {proximosDias.map(v => <VisitaCard key={v.id} visita={v} today={false} getWa={getWhatsAppLink} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function VisitaCard({ visita, today, getWa }: { visita: Visita; today: boolean; getWa: (p: string) => string }) {
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
      </div>
      {visita.observacoes && (
        <div style={{ marginTop: "0.65rem", background: "#f9f9f9", borderRadius: 8, padding: "0.45rem 0.7rem", fontSize: "0.78rem", color: "#6b7280" }}>
          {visita.observacoes}
        </div>
      )}
    </div>
  );
}
