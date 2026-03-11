import type { ReactNode } from "react";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { Navbar } from "./Navbar";

type AppLayoutProps = {
  children: ReactNode;
  onRefresh?: () => void;
  loadingRefresh?: boolean;
};

export function AppLayout({ children, onRefresh, loadingRefresh }: AppLayoutProps) {
  const me = useMemo(() => {
    const raw = localStorage.getItem("me");
    return raw ? JSON.parse(raw) : null;
  }, []);

  if (!me) return <Navigate to="/login" replace />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar me={me} onRefresh={onRefresh} loadingRefresh={loadingRefresh} />
      <div className="page-content" style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
