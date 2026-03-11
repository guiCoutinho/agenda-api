import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import RequireRole from "./components/RequireRole";
import Agenda from "./pages/Agenda";
import Login from "./pages/Login";
import NovaVisita from "./pages/NovaVisita";
import VisitadorUpcoming from "./pages/VisitadorUpcoming";
import NovoUsuario from "./pages/NovoUsuario";
import TrocarSenha from "./pages/TrocarSenha";

type UserRole = "ADMIN" | "ATENDENTE" | "VISITADOR";

function IndexRedirect() {
  const token = localStorage.getItem("token");
  const meRaw = localStorage.getItem("me");
  if (!token || !meRaw) return <Navigate to="/login" replace />;
  const me = JSON.parse(meRaw) as { role: UserRole; mustChangePassword?: boolean };
  if (me.mustChangePassword) return <Navigate to="/trocar-senha" replace />;
  return <Navigate to={me.role === "VISITADOR" ? "/visitador" : "/agenda"} replace />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<IndexRedirect />} />
        <Route path="/visitador" element={<RequireRole allowed={["VISITADOR"]}><VisitadorUpcoming /></RequireRole>} />
        <Route path="/agenda" element={<RequireRole allowed={["ADMIN", "ATENDENTE"]}><Agenda /></RequireRole>} />
        <Route path="/visitas/nova" element={<RequireRole allowed={["ADMIN", "ATENDENTE"]}><NovaVisita /></RequireRole>} />
        <Route path="/usuarios/novo" element={<RequireRole allowed={["ADMIN"]}><NovoUsuario /></RequireRole>} />
        <Route path="/trocar-senha" element={<TrocarSenha />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
