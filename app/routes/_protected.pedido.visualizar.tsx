/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { BackButton } from "~/components/BackButton";
import { supabase } from "~/supabase/supabaseClient";
import { useSearchParams } from "@remix-run/react";

const CATEGORIAS = {
  LOJINHA: "Lojinha",
  LANCHONETE: "Lanchonete",
} as const;

type CategoriaType = (typeof CATEGORIAS)[keyof typeof CATEGORIAS];

interface Order {
  id: number;
  cartao: string;
  valorTotal: number;
  Categoria: "Lojinha" | "Lanchonete";
  Entregue: boolean;
  nomeCliente: string;
  itens: {
    id: number;
    idProduto: number;
    quantidade: number;
    Produto: {
      nome: string;
    };
  }[];
}

const OrderManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategoria =
    (searchParams.get("categoria") as CategoriaType) || CATEGORIAS.LOJINHA;
  const [selectedCategoria, setSelectedCategoria] =
    useState<CategoriaType>(initialCategoria);
  const [searchIdCard, setSearchIdCard] = useState(
    searchParams.get("idCard") || ""
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveredOrderId, setDeliveredOrderId] = useState<number | null>(null);

  const handleCategoriaChange = (categoria: CategoriaType) => {
    setSelectedCategoria(categoria);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("categoria", categoria);
    setSearchParams(newSearchParams);
  };

  const handleSearchIdChange = (value: string) => {
    setSearchIdCard(value);
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set("idCard", value);
    } else {
      newSearchParams.delete("idCard");
    }
    setSearchParams(newSearchParams);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from("Venda")
          .select(
            `
            id, cartao, valorTotal, Categoria, Entregue,
            itens: Item_venda(id, idProduto, quantidade, Produto(nome))
          `
          )
          .eq("Entregue", false)
          .eq("Categoria", selectedCategoria);

        if (searchIdCard) {
          query = query.eq("cartao", searchIdCard);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching orders:", error);
          return;
        }

        const ordersWithNames = await Promise.all(
          (data || []).map(async (order: any) => {
            const { data: cardData, error: cardError } = await supabase
              .from("Card")
              .select("nome")
              .eq("idCard", order.cartao)
              .single();

            if (cardError) {
              console.error("Error fetching card name:", cardError);
              return {
                ...order,
                nomeCliente: "",
              };
            }

            return {
              ...order,
              nomeCliente: cardData.nome,
            };
          })
        );

        setOrders(ordersWithNames);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [selectedCategoria, searchIdCard]);

  const markAsDelivered = async (orderId: number) => {
    try {
      const { error } = await supabase
        .from("Venda")
        .update({ Entregue: true })
        .eq("id", orderId);

      if (error) {
        console.error("Error marking order as delivered:", error);
        return;
      }

      setDeliveredOrderId(orderId);
      setTimeout(() => {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== orderId)
        );
        setDeliveredOrderId(null);
      }, 2000);
    } catch (error) {
      console.error("Error marking order as delivered:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BackButton to="/pedido" />

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleCategoriaChange(CATEGORIAS.LOJINHA)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedCategoria === CATEGORIAS.LOJINHA
                    ? "bg-white text-indigo-600 border-2 border-indigo-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Lojinha
              </button>
              <button
                type="button"
                onClick={() => handleCategoriaChange(CATEGORIAS.LANCHONETE)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedCategoria === CATEGORIAS.LANCHONETE
                    ? "bg-white text-indigo-600 border-2 border-indigo-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Lanchonete
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                id="searchIdCard"
                value={searchIdCard}
                onChange={(e) => handleSearchIdChange(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Digite o idCard"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow p-6 flex flex-col justify-between h-full"
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-2xl font-bold text-indigo-600">
                        {order.nomeCliente}
                      </h3>
                      <span className="text-lg font-semibold text-indigo-600">
                        Cartão: {order.cartao}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Pedido {order.id} | {order.Categoria}
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {order.itens.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-1 border-b border-gray-100"
                      >
                        <p className="text-gray-900">{item.Produto.nome}</p>
                        <span className="font-medium text-gray-700">
                          x{item.quantidade}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-medium text-gray-900">
                      Total:{" "}
                      {order.valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    <button
                      type="button"
                      onClick={() => markAsDelivered(order.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Entregar
                    </button>
                  </div>
                  {deliveredOrderId === order.id && (
                    <p className="mt-4 text-green-600 font-medium">
                      Pedido entregue
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Não há pedidos pendentes na categoria {selectedCategoria}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
