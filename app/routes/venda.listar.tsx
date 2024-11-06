import { useState } from "react";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { PageHeader, Card } from "./_layout.produto";

interface CardInfo {
  idCard: string;
  nome: string;
  balance: number;
}

interface VendaItem {
  id: number;
  quantidade: number;
  precoUnitario: number;
  Produto: {
    nome: string;
  };
}

interface Venda {
  id: number;
  created_at: string;
  valorTotal: number;
  Item_venda: VendaItem[];
}

interface LoaderData {
  card: CardInfo | null;
  vendas: Venda[];
  error: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const idCard = url.searchParams.get("idCard");

  if (!idCard) {
    return json<LoaderData>({ card: null, vendas: [], error: null });
  }

  try {
    const { data: card, error: cardError } = await supabase
      .from("Card")
      .select("*")
      .eq("idCard", idCard)
      .single();

    if (cardError) throw cardError;
    if (!card) throw new Error("Cartão não encontrado");

    const { data: vendas, error: vendasError } = await supabase
      .from("Venda")
      .select(`
        *,
        Item_venda (
          *,
          Produto (
            nome
          )
        )
      `)
      .eq("cartao", idCard)
      .order("created_at", { ascending: false });

    if (vendasError) throw vendasError;

    return json<LoaderData>({ card, vendas: vendas || [], error: null });

  } catch (error) {
    return json<LoaderData>({ 
      card: null, 
      vendas: [], 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
};

export default function HistoricoCompras() {
  const navigate = useNavigate();
  const { card, vendas, error } = useLoaderData<typeof loader>();
  const [searchId, setSearchId] = useState("");

  const formatarMoeda = (valor: number) => {
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
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Acutis Data Modos"
          subtitle="Histórico de Compras"
        />

        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50"
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

        <Card>
          <div className="p-6">
            <Form method="get" className="flex gap-4">
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o ID do cartão"
                  required
                />
              </div>
              <button
                type="submit"
                className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700"
              >
                Buscar
              </button>
            </Form>
          </div>
        </Card>

        {error && (
          <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {card && (
          <div className="mt-8 space-y-6">
            {vendas.map((venda: Venda) => (
              <Card key={venda.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Compra #{venda.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatarData(venda.created_at)}
                      </p>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      {formatarMoeda(venda.valorTotal)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {venda.Item_venda.map((item: VendaItem) => (
                      <div
                        key={item.id}
                        className="flex justify-between py-2 border-t border-gray-100"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.Produto.nome}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantidade} x {formatarMoeda(item.precoUnitario)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatarMoeda(item.quantidade * item.precoUnitario)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}

            {vendas.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">Nenhuma compra encontrada para este cartão.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}