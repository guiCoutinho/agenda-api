import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CalendarDays, UserPlus, ChevronDown, LogOut, KeyRound, RefreshCw, Menu, X } from "lucide-react";

type Me = { id: string; login: string; role: string };
type NavbarProps = { me: Me; onRefresh?: () => void; loadingRefresh?: boolean };

export function Navbar({ me, onRefresh, loadingRefresh }: NavbarProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [userOpen, setUserOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef   = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("me");
    window.location.href = "/login";
  }

  const isAdmin     = me.role === "ADMIN";
  const isVisitador = me.role === "VISITADOR";
  const initials    = me.login.slice(0, 2).toUpperCase();
  const roleLabel: Record<string, string> = { ADMIN: "Administrador", ATENDENTE: "Atendente", VISITADOR: "Visitador" };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {!isVisitador && (
        <button
          className={`nav-link ${location.pathname === "/agenda" ? "active" : ""}`}
          onClick={() => navigate("/agenda")}
          style={mobile ? { width: "100%", textAlign: "left" } : {}}
        >
          <CalendarDays size={13} />
          Agenda
        </button>
      )}
      {isVisitador && (
        <button
          className={`nav-link ${location.pathname === "/visitador" ? "active" : ""}`}
          onClick={() => navigate("/visitador")}
          style={mobile ? { width: "100%", textAlign: "left" } : {}}
        >
          <CalendarDays size={13} />
          Minhas visitas
        </button>
      )}
      {isAdmin && (
        <button
          className={`nav-link ${location.pathname.startsWith("/usuarios") ? "active" : ""}`}
          onClick={() => navigate("/usuarios")}
          style={mobile ? { width: "100%", textAlign: "left" } : {}}
        >
          <UserPlus size={13} />
          Usuários
        </button>
      )}
      {onRefresh && !isVisitador && (
        <button
          className="nav-link"
          onClick={onRefresh}
          disabled={loadingRefresh}
          style={{ opacity: loadingRefresh ? 0.5 : 1, ...(mobile ? { width: "100%", textAlign: "left" } : {}) }}
        >
          <RefreshCw size={12} style={{ animation: loadingRefresh ? "spin 1s linear infinite" : "none" }} />
          {loadingRefresh ? "Atualizando..." : "Atualizar"}
        </button>
      )}
    </>
  );

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <div className="navbar-brand">Unimobili<span>.</span></div>

          {/* Desktop nav links */}
          <div className="navbar-nav">
            <NavLinks />
          </div>

          {/* Mobile hamburger */}
          <button className="navbar-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* User chip */}
          <div className="navbar-user" ref={dropRef}>
            <button className="user-chip" onClick={() => setUserOpen(o => !o)}>
              <div className="user-avatar">{initials}</div>
              <span className="user-chip-name">{me.login}</span>
              <span className="user-role-badge">{me.role}</span>
              <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.4)", transition: "transform 0.2s", transform: userOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>

            {userOpen && (
              <div className="dropdown">
                <div className="dropdown-info">
                  <div className="dropdown-info-name">{me.login}</div>
                  <div className="dropdown-info-role">{roleLabel[me.role] ?? me.role}</div>
                </div>
                <button className="dropdown-item" onClick={() => { setUserOpen(false); navigate("/trocar-senha"); }}>
                  <KeyRound size={14} /> Trocar senha
                </button>
                <button className="dropdown-item danger" onClick={logout}>
                  <LogOut size={14} /> Sair
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="navbar-mobile-menu">
            <NavLinks mobile />
          </div>
        )}
      </nav>
    </>
  );
}
