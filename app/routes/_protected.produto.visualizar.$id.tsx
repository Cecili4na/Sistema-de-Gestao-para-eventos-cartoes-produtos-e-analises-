/* eslint-disable jsx-a11y/label-has-associated-control */
import { useLoaderData, Link } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { PageHeader, Card } from "./_layout.produto";
import { BackButton } from "~/components/BackButton";

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

export default function VisualizarProduto() {
  const { produto, error } = useLoaderData<typeof loader>();

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

        <Card title="Visualizar Produto">
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700">
                  {produto.nome}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700">
                  {produto.Categoria || "Sem categoria"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$)
                  </label>
                  <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700">
                    {formatarPreco(produto.preco)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700">
                    {produto.quantidade}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total em Estoque
                </label>
                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700">
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
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
