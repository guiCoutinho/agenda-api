import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { createUser, type UserRole } from "@/services/users";

export default function NovoUsuario() {
  const navigate = useNavigate();
  const [login, setLogin]   = useState("");
  const [role, setRole]     = useState<UserRole>("ATENDENTE");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      await createUser({ login, role });
      setSuccess('Usuário criado com sucesso. Senha inicial: "123".');
      setLogin(""); setRole("ATENDENTE");
    } catch { setError("Não foi possível criar o usuário."); }
    finally { setLoading(false); }
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <p className="page-subtitle">Administração</p>
          <h1 className="page-title">Novo usuário</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => navigate("/agenda")}>
            <ArrowLeft size={15} /> Voltar à agenda
          </button>
        </div>
      </div>

      {/* Two-col on desktop, stacked on mobile */}
      <div className="two-col-form" style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
        {/* Form */}
        <div className="uni-card" style={{ flex: 1, minWidth: 0 }}>
          <div className="uni-card-header">
            <span className="uni-card-title">Dados do usuário</span>
          </div>
          <div className="uni-card-body">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              <div className="form-group">
                <label className="form-label">Login</label>
                <input
                  className="form-input"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="Ex: joao.silva"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Perfil de acesso</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value="ADMIN">Admin</option>
                  <option value="ATENDENTE">Atendente</option>
                  <option value="VISITADOR">Visitador</option>
                </select>
              </div>

              {error   && <div className="alert alert-error">{error}</div>}
              {success && (
                <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Check size={14} /> {success}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <UserPlus size={15} /> {loading ? "Criando..." : "Criar usuário"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate("/agenda")}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info sidebar */}
        <div className="two-col-sidebar" style={{ width: 300, flexShrink: 0 }}>
          <div className="uni-card">
            <div className="uni-card-header">
              <span className="uni-card-title">Informações</span>
            </div>
            <div className="uni-card-body" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="alert alert-info">
                A senha inicial do usuário será <strong>123</strong>. Ele precisará trocá-la no primeiro acesso.
              </div>
              <div style={{ fontSize: "0.81rem", color: "#5a6a7e", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <p style={{ margin: 0 }}><strong style={{ color: "#0d1b2e" }}>Admin</strong> — acesso total, incluindo criação de usuários.</p>
                <p style={{ margin: 0 }}><strong style={{ color: "#0d1b2e" }}>Atendente</strong> — pode criar e visualizar visitas.</p>
                <p style={{ margin: 0 }}><strong style={{ color: "#0d1b2e" }}>Visitador</strong> — visualiza apenas suas próprias visitas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
