import { useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { FormCard } from "~/components/FormCard";
import { BackButton } from "~/components/BackButton";
import ProtectedPage from "~/hook/withAuth";

interface Transaction {
  id: string;
  created_at: string;
  idCard: string;
  nome: string;
  valor: number;
  saldoAtual: number;
}

interface LoaderData {
  transactions: Transaction[];
  error: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const idCard = url.searchParams.get("idCard");

  if (!idCard) {
    return json<LoaderData>({ transactions: [], error: null });
  }

  try {
    const { data: transactions, error } = await supabase
      .from("Transacoes")
      .select("*")
      .eq("idCard", idCard)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return json<LoaderData>({ transactions: transactions || [], error: null });
  } catch (error) {
    console.error("Erro ao carregar transações:", error);
    return json<LoaderData>({
      transactions: [],
      error: "Erro ao carregar transações",
    });
  }
};

export default function VisualizarTransacoes() {
  const [searchId, setSearchId] = useState("");
  const { transactions, error } = useLoaderData<LoaderData>();

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
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <BackButton to="/gestao/home" />

          <FormCard title="Consultar Transações">
            <div className="p-6">
              {/* Formulário de Busca */}
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
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    Buscar
                  </button>
                </div>
              </Form>

              {/* Mensagem de Erro */}
              {error && (
                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {/* Lista de Transações */}
              {transactions && transactions.length > 0 ? (
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
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Saldo Atual
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatarData(transaction.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.nome}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                              transaction.valor < 0
                                ? "text-red-600 font-medium"
                                : "text-green-600 font-medium"
                            }`}
                          >
                            {formatarValor(transaction.valor)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            {formatarValor(transaction.saldoAtual)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : searchId ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma transação encontrada para este cartão.
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Digite um ID de cartão para visualizar suas transações.
                </div>
              )}
            </div>
          </FormCard>
        </div>
      </div>
    </ProtectedPage>
  );
}
