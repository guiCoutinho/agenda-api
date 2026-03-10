import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "../services/users";

export default function RequireRole({
  allowed,
  children,
}: {
  allowed: UserRole[];
  children: ReactNode;
}) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const meRaw = localStorage.getItem("me");
  if (!meRaw) return <Navigate to="/login" replace />;

  const me = JSON.parse(meRaw) as { role: UserRole; mustChangePassword?: boolean };
  const location = useLocation();

  if (me.mustChangePassword && location.pathname !== "/trocar-senha") {
    return <Navigate to="/trocar-senha" replace />;
  }

  if (!allowed.includes(me.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
}