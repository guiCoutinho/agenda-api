import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginRequest } from "@/services/auth";
import { getMe } from "@/services/users";

export default function Login() {
  const navigate = useNavigate();

  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authResponse = await loginRequest({
        login: loginValue,
        password,
      });

      localStorage.setItem("token", authResponse.token);

      const me = await getMe();
      localStorage.setItem("me", JSON.stringify(me));

      if (me.role === "VISITADOR") {
        navigate("/visitador");
      } else {
        navigate("/agenda");
      }
    } catch {
      setError("Login ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <div className="hidden bg-[linear-gradient(135deg,#0f766e,#1d4ed8)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Plataforma interna
            </div>

            <h1 className="max-w-md text-4xl font-semibold leading-tight">
              Agenda de visitas com aparência mais profissional e fluxo mais claro.
            </h1>

            <p className="mt-4 max-w-md text-sm text-white/85">
              Centralize os agendamentos, acompanhe visitadores e mantenha a operação organizada em um só lugar.
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-white/85">
              Acesso restrito para administradores, atendentes e visitadores.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center bg-slate-50 p-6 md:p-10">
          <Card className="w-full max-w-md rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Entrar</CardTitle>
              <CardDescription>
                Use suas credenciais para acessar o sistema.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login">Login</Label>
                  <Input
                    id="login"
                    value={loginValue}
                    onChange={(e) => setLoginValue(e.target.value)}
                    placeholder="Seu login"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}