import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { LuPlusCircle, LuMinusCircle } from "react-icons/lu";
import { ActionCard } from "~/components/ActionCard";

export const loader = async () => {
  try {
    const { data: cartoes, error } = await supabase
      .from("Card")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    return json({ cartoes, error: null });
  } catch (error) {
    console.error("Erro ao carregar cartões:", error);
    return json({ cartoes: [], error: "Erro ao carregar cartões" });
  }
};

export default function CartaoDashboard() {
  const navigate = useNavigate();
  const { cartoes, error } = useLoaderData<typeof loader>();

  const formatarSaldo = (saldo: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(saldo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Botão Voltar */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/home")}
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
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            Acutis Data Modos
          </h1>
          <p className="text-gray-600 text-lg">Sistema de Gestão de Cartões</p>
        </header>

        {/* Cards de Ação Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <ActionCard
            to="/cartao/cadastrar"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
            title="Cadastrar Novo Cartão"
            description="Adicione novos cartões ao sistema."
          />

          <ActionCard
            to="/cartao/recarregar"
            icon={<LuPlusCircle className="w-6 h-6 text-green-600" />}
            title="Recarregar Cartão"
            description="Adicione créditos a um cartão existente."
            iconBgColor="bg-green-100"
            iconHoverBgColor="group-hover:bg-green-200"
            iconColor="text-green-600"
          />

          <ActionCard
            to="/cartao/debitar"
            icon={<LuMinusCircle className="w-6 h-6 text-red-600" />}
            title="Debitar Cartão"
            description="Realize débitos em cartões existentes."
            iconBgColor="bg-red-100"
            iconHoverBgColor="group-hover:bg-red-200"
            iconColor="text-red-600"
          />
        </div>

        {/* Seção de Últimos Cartões */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Últimos Cartões Cadastrados
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
                    <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número do Cartão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartoes.map((cartao) => (
                    <tr key={cartao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cartao.idCard}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {cartao.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatarSaldo(cartao.balance)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Rodapé da Tabela com Link para Ver Todos */}
              <div className="bg-gray-50 px-6 py-4">
                <Link
                  to="/cartao/visualizar"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center"
                >
                  Ver todos os cartões
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
