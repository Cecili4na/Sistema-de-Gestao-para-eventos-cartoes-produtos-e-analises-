import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { BackButton } from "~/components/BackButton";
import ProtectedPage from "~/hook/withAuth";

const SENHA_GESTAO = "acutis2024";

interface ActionData {
  error?: string;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const senha = formData.get("senha");

  if (senha === SENHA_GESTAO) {
    return redirect("/gestao/home", {
      headers: {
        "Set-Cookie":
          "gestao_auth=true; Path=/; HttpOnly; Max-Age=3600; SameSite=Lax",
      },
    });
  }

  return json<ActionData>({ error: "Senha incorreta" });
};

export default function GestaoAuth() {
  const actionData = useActionData<typeof action>();
  const [senha, setSenha] = useState("");

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <BackButton to="/home" />
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Área de Gestão
              </h2>
              <p className="mt-2 text-gray-600">
                Digite a senha para acessar a área administrativa
              </p>
            </div>

            <Form method="post" className="space-y-6">
              <div>
                <label
                  htmlFor="senha"
                  className="block text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="mt-1 block w-full px-4 py-2 bg-white border border-gray-900 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite a senha de acesso"
                />
              </div>

              {actionData?.error && (
                <div className="text-red-600 text-sm">{actionData.error}</div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-[1.02]"
              >
                Acessar
              </button>
            </Form>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
