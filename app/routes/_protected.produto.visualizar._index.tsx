import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { LuPencilLine } from "react-icons/lu";
import { useState } from "react";
import { BackButton } from "~/components/BackButton";

export const loader = async () => {
  try {
    const { data: produtos, error } = await supabase
      .from("Produto")
      .select("*, Categoria")
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
  const [categoria, setCategoria] = useState<string | null>(null);

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco);
  };

  // Filtra os produtos com base na busca e categoria
  const produtosFiltrados = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(busca.toLowerCase()) &&
      (categoria === null || produto.Categoria === categoria)
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
          <BackButton to="/produto" />

          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            {/* ... */}
          </div>

          {/* Tabela de Produtos */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Lista Completa de Produtos
              </h2>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    categoria === null
                      ? "bg-white text-indigo-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setCategoria(null)}
                >
                  Todas as Categorias
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    categoria === "Lojinha"
                      ? "bg-white text-indigo-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setCategoria("Lojinha")}
                >
                  Lojinha
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    categoria === "Lanchonete"
                      ? "bg-white text-indigo-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setCategoria("Lanchonete")}
                >
                  Lanchonete
                </button>
              </div>
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
                        Categoria
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
                        Editar
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
                            {produto.Categoria || "Sem categoria"}
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
