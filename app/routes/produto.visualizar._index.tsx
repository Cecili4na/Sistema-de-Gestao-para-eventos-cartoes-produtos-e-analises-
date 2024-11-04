import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { LuPencilLine } from "react-icons/lu";
import { useState } from "react";

export const loader = async () => {
  try {
    const { data: produtos, error } = await supabase
      .from("Produto")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return json({ produtos, error: null });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return json({ produtos: [], error: "Erro ao carregar produtos" });
  }
};

export default function VisualizarProdutos() {
  const { produtos, error } = useLoaderData<typeof loader>();
  const [busca, setBusca] = useState("");

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco);
  };

  // Filtra os produtos com base na busca
  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // Cálculo das estatísticas com base nos produtos filtrados
  const totalProdutos = produtosFiltrados.length;
  const produtosDisponiveis = produtosFiltrados.filter((p) => p.disponivel).length;
  const quantidadeTotalItens = produtosFiltrados.reduce(
    (acc, p) => acc + p.quantidade,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            Catálogo de Produtos
          </h1>
          <p className="text-gray-600 text-lg">
            Visualização e Análise de Estoque
          </p>
        </header>

        {/* Botão Voltar e Campo de Busca */}
        <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            to="/produto"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar
          </Link>

          {/* Campo de Busca */}
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg
              className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Container Flex para Reordenar em Telas Pequenas */}
        <div className="flex flex-col-reverse sm:flex-col gap-8">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Total de Produtos */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div className="ml-8">
                  <p className="text-sm font-medium text-gray-600">
                    Total de Produtos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalProdutos}
                  </p>
                </div>
              </div>
            </div>

            {/* Produtos Disponíveis */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Produtos Disponíveis
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {produtosDisponiveis}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantidade Total de Itens */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total de Itens
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quantidadeTotalItens}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Produtos */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Lista Completa de Produtos
              </h2>
            </div>

            {error ? (
              <div className="p-6">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                  {error}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {produtosFiltrados.map((produto) => (
                      <tr key={produto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {produto.nome}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatarPreco(produto.preco)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {produto.quantidade}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatarPreco(produto.preco * produto.quantidade)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              produto.disponivel
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {produto.disponivel ? "Disponível" : "Indisponível"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/produto/visualizar/${produto.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <LuPencilLine className="text-lg" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}