/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLoaderData, Link, Form } from "@remix-run/react";
import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { FormCard } from "~/components/FormCard";
import { BackButton } from "~/components/BackButton";
import { useState } from "react";
import ProtectedPage from "~/hook/withAuth";

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

  try {
    const { error } = await supabase.from("Produto").delete().eq("id", id);

    if (error) throw error;

    return redirect("/produto/visualizar");
  } catch (error) {
    return json({ error: "Erro ao deletar produto" });
  }
}

export default function VisualizarProduto() {
  const { produto, error } = useLoaderData<typeof loader>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco);
  };

  if (error || !produto) {
    return (
      <ProtectedPage>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <FormCard>
              <div className="p-6">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                  {error || "Produto não encontrado"}
                </div>
              </div>
            </FormCard>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <BackButton to="/produto/visualizar" />

          <FormCard title="Visualizar Produto">
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="nome"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nome do Produto
                  </label>
                  <div
                    id="nome"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700"
                  >
                    {produto.nome}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="categoria"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Categoria
                  </label>
                  <div
                    id="categoria"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700"
                  >
                    {produto.Categoria || "Sem categoria"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="preco"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Preço (R$)
                    </label>
                    <div
                      id="preco"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700"
                    >
                      {formatarPreco(produto.preco)}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="quantidade"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantidade
                    </label>
                    <div
                      id="quantidade"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700"
                    >
                      {produto.quantidade}
                    </div>
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700"
                  >
                    {formatarPreco(produto.preco * produto.quantidade)}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={produto.disponivel}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded cursor-default"
                    disabled
                    readOnly
                  />
                  <span className="ml-2 block text-sm text-gray-700">
                    {produto.disponivel
                      ? "Disponível para venda"
                      : "Indisponível para venda"}
                  </span>
                </div>

                <div className="flex gap-4">
                  <Link
                    to={`/produto/editar/${produto.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] text-center"
                  >
                    Editar Produto
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    Excluir Produto
                  </button>
                </div>
              </div>
            </div>
          </FormCard>
        </div>

        {/* Modal de Confirmação */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Confirmar Exclusão
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Tem certeza que deseja excluir este produto? Esta ação não
                    pode ser desfeita.
                  </p>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <Form method="post">
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Excluir
                    </button>
                  </Form>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
