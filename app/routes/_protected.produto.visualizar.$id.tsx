import { useState } from "react";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import {
  json,
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { PageHeader, Card } from "./_layout.produto";
import { BackButton } from "~/components/BackButton";

type Categoria = "Lojinha" | "Lanchonete" | null;

interface ActionData {
  status: "success" | "error";
  message: string;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;

  try {
    const { data: produto, error } = await supabase
      .from("Produto")
      .select("*, Categoria")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!produto) throw new Error("Produto não encontrado");

    return json({ produto, error: null });
  } catch (error) {
    console.error("Erro ao carregar produto:", error);
    return json({ produto: null, error: "Erro ao carregar produto" });
  }
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  const formData = await request.formData();

  const nome = formData.get("nome") as string;
  const categoria = formData.get("categoria") as Categoria;
  const preco = Number(formData.get("preco"));
  const quantidade = Number(formData.get("quantidade"));
  const disponivel = formData.get("disponivel") === "true";

  if (!nome) {
    return json<ActionData>(
      {
        status: "error",
        message: "Nome do produto é obrigatório.",
      },
      { status: 400 }
    );
  }

  if (preco <= -0.01) {
    return json<ActionData>(
      {
        status: "error",
        message: "Preço deve ser maior ou igual a zero.",
      },
      { status: 400 }
    );
  }

  if (quantidade < 0) {
    return json<ActionData>(
      {
        status: "error",
        message: "Quantidade deve ser maior ou igual a zero.",
      },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase
      .from("Produto")
      .update({
        nome,
        Categoria: categoria,
        preco,
        quantidade,
        disponivel,
      })
      .eq("id", id);

    if (error) throw error;

    return redirect("/produto/visualizar");
  } catch (error) {
    return json<ActionData>(
      {
        status: "error",
        message: "Erro ao atualizar produto. Tente novamente.",
      },
      { status: 500 }
    );
  }
}

export default function ProdutoVisualizarEditar() {
  const { produto, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const [isEditing, setIsEditing] = useState(false);
  const [categoria, setCategoria] = useState<Categoria>(produto?.Categoria);

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco);
  };

  if (error || !produto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="p-6">
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                {error || "Produto não encontrado"}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <BackButton to="/produto/visualizar" />

        <PageHeader
          title="Acutis Data Modos"
          subtitle="Sistema de Gestão de Produtos"
        />
        <Card title={isEditing ? "Editar Produto" : "Visualizar Produto"}>
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
                  defaultValue={produto.nome}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="categoria"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Categoria
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={categoria || ""}
                  onChange={(e) =>
                    setCategoria(
                      e.target.value === ""
                        ? null
                        : (e.target.value as Categoria)
                    )
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Sem categoria</option>
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
                    defaultValue={produto.preco}
                    step="0.50"
                    min="0"
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  />
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
                    defaultValue={produto.quantidade}
                    min="0"
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="valorTotal"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valor Total em Estoque
                </label>
                <div
                  id="valorTotal"
                  className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700"
                  aria-label="Valor total em estoque"
                  role="status"
                >
                  {formatarPreco(produto.preco * produto.quantidade)}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="disponivel"
                  type="checkbox"
                  name="disponivel"
                  value="true"
                  defaultChecked={produto.disponivel}
                  disabled={!isEditing}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="disponivel"
                  className="ml-2 block text-sm text-gray-700"
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

              <div className="flex gap-4">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                    >
                      Salvar Alterações
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    Editar Produto
                  </button>
                )}
              </div>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}
