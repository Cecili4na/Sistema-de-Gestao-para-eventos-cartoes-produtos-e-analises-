import { useState, useEffect } from "react";
import { useActionData, Form } from "@remix-run/react";
import { json, ActionFunctionArgs } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { FormCard } from "~/components/FormCard";
import { BackButton } from "~/components/BackButton";

type Categoria = "Lojinha" | "Lanchonete" | null;

interface ActionData {
  status: "success" | "error";
  message: string;
}

export const meta = () => {
  return [
    { title: "Cadastro de Produto" },
    {
      name: "description",
      content: "Página para cadastrar produtos",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const nome = formData.get("nome") as string;
  const preco = Number(formData.get("preco"));
  const quantidade = Number(formData.get("quantidade"));
  const disponivel = formData.get("disponivel") === "true";
  const categoriaValue = formData.get("Categoria") as string;
  const categoria =
    categoriaValue === "" ? null : (categoriaValue as Categoria);

  if (!nome || !preco || !quantidade || preco <= -0.01 || quantidade < 0) {
    return json<ActionData>(
      {
        status: "error",
        message: "Dados inválidos. Verifique o formulário e tente novamente.",
      },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.from("Produto").insert([
      {
        nome,
        preco,
        quantidade,
        disponivel,
        Categoria: categoria,
      },
    ]);

    if (error) throw error;

    return json<ActionData>({
      status: "success",
      message: "Produto cadastrado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    return json<ActionData>(
      {
        status: "error",
        message: "Erro ao cadastrar produto. Tente novamente.",
      },
      { status: 400 }
    );
  }
}

export default function Produto() {
  const actionData = useActionData<typeof action>();
  const [precoError, setPrecoError] = useState<string | null>(null);
  const [quantidadeError, setQuantidadeError] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<Categoria>("Lojinha");
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [disponivel, setDisponivel] = useState(true);

  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (actionData?.status === "success") {
      setIsResetting(true);
      setTimeout(() => {
        setNome("");
        setPreco("");
        setQuantidade("");
        setCategoria("Lojinha");
        setDisponivel(true);
        setPrecoError(null);
        setQuantidadeError(null);
        setIsResetting(false);
      }, 1000);
    }
  }, [actionData]);

  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPreco(value);
    const valueFloat = parseFloat(value);
    if (valueFloat < 0) {
      setPrecoError("O valor deve ser maior ou igual a 0.");
    } else {
      setPrecoError(null);
    }
  };

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuantidade(value);
    const valueInt = parseInt(value);
    if (valueInt < 0) {
      setQuantidadeError("A quantidade deve ser maior ou igual a 0.");
    } else {
      setQuantidadeError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <BackButton to="/produto" />

        <FormCard title="Cadastrar Novo Produto">
          <div className="p-6">
            <Form method="post" className="space-y-6">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome do Produto
                </label>
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome do produto"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="Categoria"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Categoria
                </label>
                <select
                  id="Categoria"
                  name="Categoria"
                  value={categoria ?? ""}
                  onChange={(e) => setCategoria(e.target.value as Categoria)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                >
                  <option value="Lojinha">Lojinha</option>
                  <option value="Lanchonete">Lanchonete</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="preco"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Preço (R$)
                  </label>
                  <input
                    id="preco"
                    type="number"
                    name="preco"
                    value={preco}
                    onChange={handlePrecoChange}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                    required
                  />
                  {precoError && (
                    <p className="mt-1 text-sm text-red-600">{precoError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="quantidade"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantidade
                  </label>
                  <input
                    id="quantidade"
                    type="number"
                    name="quantidade"
                    value={quantidade}
                    onChange={handleQuantidadeChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                    required
                  />
                  {quantidadeError && (
                    <p className="mt-1 text-sm text-red-600">
                      {quantidadeError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="disponivel"
                  type="checkbox"
                  name="disponivel"
                  value="true"
                  checked={disponivel}
                  onChange={(e) => setDisponivel(e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="disponivel"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Disponível para venda
                </label>
              </div>

              {actionData?.message && (
                <div
                  aria-live="polite"
                  className={`p-4 rounded-lg ${
                    actionData.status === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <p className="flex items-center gap-2">
                    {actionData.status === "success" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {actionData.message}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isResetting}
                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium 
                  ${
                    !isResetting
                      ? "hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02]"
                      : "opacity-50 cursor-not-allowed"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200`}
              >
                {isResetting ? "Cadastrando..." : "Cadastrar Produto"}
              </button>
            </Form>
          </div>
        </FormCard>
      </div>
    </div>
  );
}
