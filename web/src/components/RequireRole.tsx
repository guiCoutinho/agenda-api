import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
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

  const me = JSON.parse(meRaw) as { role: UserRole };
  if (!allowed.includes(me.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
}