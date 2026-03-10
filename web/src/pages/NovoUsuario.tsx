import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, type UserRole } from "@/services/users";

export default function NovoUsuario() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [role, setRole] = useState<UserRole>("ATENDENTE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createUser({ login, role });
      setSuccess('Usuário criado com sucesso. Senha inicial: "123".');
      setLogin("");
      setRole("ATENDENTE");
    } catch {
      setError("Não foi possível criar o usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Novo usuário"
          description="Crie usuários do sistema. A senha inicial será 123 e deverá ser trocada no primeiro acesso."
        />

        <Card className="max-w-xl rounded-3xl">
          <CardHeader>
            <CardTitle>Cadastrar usuário</CardTitle>
            <CardDescription>
              Escolha o login e o tipo de acesso.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login">Login</Label>
                <Input
                  id="login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="ATENDENTE">Atendente</SelectItem>
                    <SelectItem value="VISITADOR">Visitador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar usuário"}
              </Button>

              <Button type="button" variant="outline" onClick={() => navigate("/agenda")}>
                Voltar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}