import { useState } from "react";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { FormCard } from "~/components/FormCard";

enum Categoria {
  Lojinha = "Lojinha",
  Lanchonete = "Lanchonete",
}

interface Venda {
  id: string;
  created_at: string;
  cartao: number;
  nome: string;
  Categoria: Categoria;
  valorTotal: number;
  Entregue: boolean;
  Card: {
    idCard: number;
  };
}

interface LoaderData {
  vendas: Venda[] | null;
  error: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const idCard = url.searchParams.get("idCard");
  const categoria = url.searchParams.get("categoria");

  try {
    let query = supabase
      .from("Venda")
      .select(
        `
        *,
        Card (
          nome,
          idCard
        )
      `
      )
      .order("created_at", { ascending: false });

    if (idCard) {
      query = query.eq("cartao", idCard);
    }
    if (categoria && categoria !== "all") {
      query = query.eq("Categoria", categoria);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const vendas: Venda[] | null = data
      ? data.map((venda) => ({
          ...venda,
          nome: venda.Card.nome,
        }))
      : null;

    return json<LoaderData>({ vendas, error: null });
  } catch (err) {
    console.error("Erro ao carregar vendas:", err);
    return json<LoaderData>({ vendas: null, error: "Erro ao carregar vendas" });
  }
};

export default function ListarVendas() {
  const { vendas, error } = useLoaderData<LoaderData>();
  const [searchId, setSearchId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Categoria | "all">(
    "all"
  );

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-8">
          <Link
            to="/gestao/home"
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
        </div>

        <FormCard title="Listagem de Vendas">
          <div className="p-6">
            {/* Formulário de Filtros */}
            <Form method="get" className="mb-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="idCard"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ID do Cartão
                  </label>
                  <input
                    type="text"
                    id="idCard"
                    name="idCard"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Digite o ID do cartão"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="categoria"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Categoria
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as Categoria | "all")
                    }
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="all">Todas</option>
                    <option value={Categoria.Lojinha}>Lojinha</option>
                    <option value={Categoria.Lanchonete}>Lanchonete</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  Filtrar
                </button>
              </div>
            </Form>

            {/* Mensagem de Erro */}
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Lista de Vendas */}
            {vendas !== null && vendas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Card
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendas.map((venda) => (
                      <tr key={venda.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatarData(venda.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {venda.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {venda.Card.idCard}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {venda.Categoria}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                            venda.valorTotal < 0
                              ? "text-red-600 font-medium"
                              : "text-green-600 font-medium"
                          }`}
                        >
                          {formatarValor(venda.valorTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {error ? error : "Não há vendas cadastradas."}
              </div>
            )}
          </div>
        </FormCard>
      </div>
    </div>
  );
}
