import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, KeyRound, Trash2, ArrowLeft, ShieldCheck, UserRound, Briefcase } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getAllUsers, resetUserPassword, deleteUser, type UserListItem, type UserRole } from "@/services/users";
import { createUser } from "@/services/users";
import { getApiErrorMessage } from "@/services/api";

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  ATENDENTE: "Atendente",
  VISITADOR: "Visitador",
};

const ROLE_ICON: Record<UserRole, React.ReactNode> = {
  ADMIN: <ShieldCheck size={13} />,
  ATENDENTE: <Briefcase size={13} />,
  VISITADOR: <UserRound size={13} />,
};

const ROLE_COLOR: Record<UserRole, { bg: string; color: string; border: string }> = {
  ADMIN:     { bg: "#fdf8ee", color: "#b8912a", border: "#e0d0a8" },
  ATENDENTE: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  VISITADOR: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
};

type Me = { id: string; login: string; role: string };

export default function GerenciarUsuarios() {
  const navigate = useNavigate();
  const me: Me | null = JSON.parse(localStorage.getItem("me") || "null");

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create user form
  const [showForm, setShowForm] = useState(false);
  const [newLogin, setNewLogin] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("ATENDENTE");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Confirm dialog
  const [confirmAction, setConfirmAction] = useState<null | {
    type: "reset" | "delete";
    user: UserListItem;
  }>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadUsers() {
    setLoading(true); setError(null);
    try { const data = await getAllUsers(); setUsers(data); }
    catch (err) { setError(getApiErrorMessage(err, "Não foi possível carregar usuários.")); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadUsers(); }, []);

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  }

  async function handleConfirm() {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === "reset") {
        await resetUserPassword(confirmAction.user.id);
        flash(`Senha de "${confirmAction.user.login}" redefinida para 123.`);
      } else {
        await deleteUser(confirmAction.user.id);
        flash(`Usuário "${confirmAction.user.login}" excluído.`);
        setUsers(prev => prev.filter(u => u.id !== confirmAction.user.id));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível concluir a ação."));
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setCreateError(""); setCreating(true);
    try {
      await createUser({ login: newLogin, role: newRole });
      flash(`Usuário "${newLogin}" criado com senha 123.`);
      setNewLogin(""); setNewRole("ATENDENTE"); setShowForm(false);
      await loadUsers();
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Não foi possível criar o usuário."));
    } finally { setCreating(false); }
  }

  const roleFilter = users.reduce<Record<string, number>>(
    (acc, u) => { acc[u.role] = (acc[u.role] ?? 0) + 1; return acc; }, {}
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <p className="page-subtitle">Administração</p>
          <h1 className="page-title">Gerenciar usuários</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/agenda")}>
            <ArrowLeft size={13} /> Voltar
          </button>
          <button className="btn btn-gold" onClick={() => setShowForm(s => !s)}>
            <UserPlus size={15} /> {showForm ? "Cancelar" : "Novo usuário"}
          </button>
        </div>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: "0.5rem" }}>{successMsg}</div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "0.5rem" }}>{error}</div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="uni-card" style={{ marginBottom: "0.25rem" }}>
          <div className="uni-card-header">
            <span className="uni-card-title">Criar novo usuário</span>
          </div>
          <div className="uni-card-body">
            <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div className="form-group" style={{ flex: "1 1 180px" }}>
                <label className="form-label">Login</label>
                <input
                  className="form-input"
                  value={newLogin}
                  onChange={e => setNewLogin(e.target.value)}
                  placeholder="Ex: joao.silva"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: "0 0 180px" }}>
                <label className="form-label">Perfil</label>
                <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value as UserRole)}>
                  <option value="ADMIN">Admin</option>
                  <option value="ATENDENTE">Atendente</option>
                  <option value="VISITADOR">Visitador</option>
                </select>
              </div>
              <div style={{ paddingBottom: "0.05rem" }}>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  <UserPlus size={14} /> {creating ? "Criando..." : "Criar"}
                </button>
              </div>
            </form>
            {createError && <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>{createError}</div>}
            <p style={{ fontSize: "0.78rem", color: "#5a6a7e", margin: "0.75rem 0 0" }}>
              A senha inicial será <strong>123</strong> e o usuário precisará trocá-la no primeiro acesso.
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat-card">
          <div className="stat-icon"><Users size={17} /></div>
          <div className="stat-label">Total</div>
          <div className="stat-value">{users.length}</div>
        </div>
        {(["ADMIN","ATENDENTE","VISITADOR"] as UserRole[]).map(r => (
          <div className="stat-card" key={r}>
            <div className="stat-icon">{ROLE_ICON[r]}</div>
            <div className="stat-label">{ROLE_LABEL[r]}s</div>
            <div className="stat-value">{roleFilter[r] ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="uni-card">
        <div className="uni-card-header">
          <span className="uni-card-title">Usuários cadastrados</span>
          <span style={{ fontSize: "0.76rem", color: "#5a6a7e" }}>{users.length} usuário{users.length !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "0.88rem" }}>
              Carregando...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "0.88rem" }}>
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                    {["Usuário", "Perfil", "Ações"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontWeight: 600, fontSize: "0.75rem", color: "#5a6a7e", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const isSelf = u.id === me?.id;
                    const rc = ROLE_COLOR[u.role];
                    return (
                      <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none", background: isSelf ? "rgba(184,145,42,0.04)" : "transparent" }}>
                        <td style={{ padding: "0.85rem 1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0d1b2e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>
                              {u.login.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600, color: "#0d1b2e" }}>{u.login}</span>
                              {isSelf && <span style={{ marginLeft: "0.4rem", fontSize: "0.7rem", color: "#b8912a", fontWeight: 600 }}>(você)</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "0.85rem 1.25rem" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: 100, fontSize: "0.73rem", fontWeight: 600, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                            {ROLE_ICON[u.role]} {ROLE_LABEL[u.role]}
                          </span>
                        </td>
                        <td style={{ padding: "0.85rem 1.25rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-outline btn-sm"
                              disabled={isSelf}
                              title={isSelf ? "Use 'Trocar senha' para alterar sua própria senha" : "Resetar senha para 123"}
                              onClick={() => setConfirmAction({ type: "reset", user: u })}
                              style={{ opacity: isSelf ? 0.4 : 1 }}
                            >
                              <KeyRound size={13} /> Resetar senha
                            </button>
                            <button
                              className="btn btn-sm"
                              disabled={isSelf}
                              title={isSelf ? "Você não pode excluir sua própria conta" : "Excluir usuário"}
                              onClick={() => setConfirmAction({ type: "delete", user: u })}
                              style={{ background: isSelf ? "#f3f4f6" : "#fff0f0", color: isSelf ? "#aaa" : "#dc2626", border: `1px solid ${isSelf ? "#e5e7eb" : "#fecaca"}`, opacity: isSelf ? 0.4 : 1 }}
                            >
                              <Trash2 size={13} /> Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {confirmAction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              {confirmAction.type === "delete"
                ? <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={18} color="#dc2626" /></div>
                : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fdf8ee", display: "flex", alignItems: "center", justifyContent: "center" }}><KeyRound size={18} color="#b8912a" /></div>
              }
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0d1b2e" }}>
                  {confirmAction.type === "delete" ? "Excluir usuário" : "Resetar senha"}
                </h3>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#5a6a7e" }}>{confirmAction.user.login}</p>
              </div>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#374151", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
              {confirmAction.type === "delete"
                ? <>Tem certeza que deseja <strong>excluir permanentemente</strong> o usuário <strong>{confirmAction.user.login}</strong>? Esta ação não pode ser desfeita.</>
                : <>A senha de <strong>{confirmAction.user.login}</strong> será redefinida para <strong>123</strong>. O usuário deverá trocá-la no próximo acesso.</>
              }
            </p>
            <div style={{ display: "flex", gap: "0.65rem", justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setConfirmAction(null)} disabled={actionLoading}>
                Cancelar
              </button>
              <button
                className="btn"
                onClick={handleConfirm}
                disabled={actionLoading}
                style={{ background: confirmAction.type === "delete" ? "#dc2626" : "#b8912a", color: "#fff", border: "none" }}
              >
                {actionLoading ? "Aguarde..." : confirmAction.type === "delete" ? "Excluir" : "Confirmar reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
