import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { BackButton } from "~/components/BackButton";
import { useState } from "react";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  disponivel: boolean;
  Categoria: string;
}

interface ProdutoComVendas extends Produto {
  totalVendido: number;
  valorTotalVendas: number;
}

export const loader = async () => {
  // Buscar produtos
  const { data: produtos, error: produtosError } = await supabase
    .from("Produto")
    .select("*");

  if (produtosError) {
    throw new Error("Erro ao carregar produtos");
  }

  // Buscar todos os itens de venda
  const { data: itensVenda, error: itensError } = await supabase.from(
    "Item_venda"
  ).select(`
      idProduto,
      quantidade,
      precoUnitario
    `);

  if (itensError) {
    throw new Error("Erro ao carregar itens de venda");
  }

  // Calcular vendas por produto
  const vendasPorProduto = itensVenda?.reduce(
    (acc: { [key: string] }, item) => {
      if (!acc[item.idProduto]) {
        acc[item.idProduto] = {
          totalVendido: 0,
          valorTotal: 0,
        };
      }
      acc[item.idProduto].totalVendido += item.quantidade || 0;
      acc[item.idProduto].valorTotal +=
        item.quantidade * item.precoUnitario || 0;
      return acc;
    },
    {}
  );

  const produtosProcessados = produtos?.map((produto) => ({
    ...produto,
    totalVendido: vendasPorProduto?.[produto.id]?.totalVendido || 0,
    valorTotalVendas: vendasPorProduto?.[produto.id]?.valorTotal || 0,
  }));

  return json({ produtos: produtosProcessados || [] });
};

export default function EstatisticasProdutos() {
  const { produtos } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(preco);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredProdutos = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!produtos || produtos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              Estatísticas do Catálogo
            </h1>
          </header>

          <div className="mb-8 flex justify-start">
            <BackButton to="/gestao" />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-gray-800 text-lg font-medium">
              Nenhum produto encontrado no momento.
            </h3>
            <p className="text-gray-600 mt-2">
              Verifique se existem produtos cadastrados ou tente novamente mais
              tarde.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalProdutos = produtos.length;
  const produtosDisponiveis = produtos.filter((p) => p.disponivel).length;
  const valorEstoqueTotal = produtos.reduce(
    (acc: number, produto: ProdutoComVendas) =>
      acc + produto.preco * produto.quantidade,
    0
  );

  const totalProdutosVendidos = produtos.reduce(
    (acc: number, produto: ProdutoComVendas) => acc + produto.totalVendido,
    0
  );

  const valorTotalVendido = produtos.reduce(
    (acc: number, produto: ProdutoComVendas) => acc + produto.valorTotalVendas,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-start">
          <BackButton to="/gestao/home" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 -mt-10">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Total de Produtos
            </h3>
            <p className="text-2xl font-bold text-gray-900">{totalProdutos}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Produtos Vendidos
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {totalProdutosVendidos}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Produtos Disponíveis
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {produtosDisponiveis}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Valor em Estoque
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatarPreco(valorEstoqueTotal)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Buscar Produto
          </h2>
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Digite o nome do produto"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Em Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Vendas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProdutos.map((produto) => (
                  <tr key={produto.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {produto.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produto.totalVendido} unidades
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {produto.quantidade} unidades
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarPreco(produto.valorTotalVendas)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Top Produtos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Em Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Vendas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {produtos
                  .sort((a, b) => b.totalVendido - a.totalVendido)
                  .slice(0, 5)
                  .map((produto) => (
                    <tr key={produto.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {produto.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produto.totalVendido} unidades
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {produto.quantidade} unidades
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarPreco(produto.valorTotalVendas)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Valor Total Vendido
          </h2>
          <p className="text-2xl font-bold text-gray-900">
            {formatarPreco(valorTotalVendido)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Alertas de Estoque
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtos
              .filter((p) => p.quantidade < 10 && p.disponivel)
              .map((produto) => (
                <div key={produto.id} className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-medium text-red-800">{produto.nome}</h3>
                  <p className="text-sm text-red-600">
                    Estoque baixo: {produto.quantidade} unidades
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
