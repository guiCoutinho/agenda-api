type Props = { status?: string | null };

export function StatusBadge({ status }: Props) {
  if (!status) return <span style={{ color: "#bbb", fontSize: "0.8rem" }}>—</span>;

  const map: Record<string, string> = {
    AGENDADA: "status-agendada",
    CANCELADA: "status-cancelada",
    REALIZADA: "status-realizada",
  };

  return (
    <span className={`status-badge ${map[status] ?? "status-default"}`}>
      {status}
    </span>
  );
}
