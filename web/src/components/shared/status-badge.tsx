import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status?: string | null;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  const classes: Record<string, string> = {
    AGENDADA: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    CANCELADA: "bg-rose-100 text-rose-700 hover:bg-rose-100",
    REALIZADA: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  };

  return (
    <Badge className={classes[status] ?? "bg-slate-100 text-slate-700 hover:bg-slate-100"}>
      {status}
    </Badge>
  );
}