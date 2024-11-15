import React, { useState, useEffect } from 'react';
import { supabase } from '~/supabase/supabaseClient';

const CATEGORIAS = {
  LOJINHA: 'Lojinha',
  LANCHONETE: 'Lanchonete'
} as const;

type CategoriaType = typeof CATEGORIAS[keyof typeof CATEGORIAS] | null;

interface Order {
  id: number;
  cartao: string;
  valorTotal: number;
  Categoria: 'Lojinha' | 'Lanchonete';
  Entregue: boolean;
  nomeCliente: string;
  itens: {
    id: number;
    idProduto: number;
    Produto: {
      nome: string;
    };
  }[];
}

const OrderManagement: React.FC = () => {
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaType>(null);
  const [searchIdCard, setSearchIdCard] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveredOrderId, setDeliveredOrderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from('Venda')
          .select(`
            id, cartao, valorTotal, Categoria, Entregue,
            itens: Item_venda(id, idProduto, Produto(nome))
          `)
          .eq('Entregue', false); // Exibir apenas pedidos não entregues

        if (selectedCategoria) {
          query = query.eq('Categoria', selectedCategoria);
        }

        if (searchIdCard) {
          query = query.eq('cartao', searchIdCard);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching orders:', error);
          return;
        }

        const ordersWithNames = await Promise.all(
          (data || []).map(async (order: any) => {
            const { data: cardData, error: cardError } = await supabase
              .from('Card')
              .select('nome')
              .eq('idCard', order.cartao)
              .single();

            if (cardError) {
              console.error('Error fetching card name:', cardError);
              return {
                ...order,
                nomeCliente: '',
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
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [selectedCategoria, searchIdCard]);

  const markAsDelivered = async (orderId: number) => {
    try {
      const { error } = await supabase
        .from('Venda')
        .update({ Entregue: true })
        .eq('id', orderId);

      if (error) {
        console.error('Error marking order as delivered:', error);
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
      console.error('Error marking order as delivered:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Order Management</h2>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Voltar
            </button>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-900 mb-2">
                Categoria
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedCategoria(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedCategoria === null
                      ? 'bg-white text-indigo-600 border-2 border-indigo-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoria(CATEGORIAS.LOJINHA)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedCategoria === CATEGORIAS.LOJINHA
                      ? 'bg-white text-indigo-600 border-2 border-indigo-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Lojinha
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoria(CATEGORIAS.LANCHONETE)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedCategoria === CATEGORIAS.LANCHONETE
                      ? 'bg-white text-indigo-600 border-2 border-indigo-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Lanchonete
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                id="searchIdCard"
                value={searchIdCard}
                onChange={(e) => setSearchIdCard(e.target.value)}
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
                    <h3 className="text-lg font-medium text-gray-900">Pedido {order.id}</h3>
                    <p className="text-gray-600">
                      Categoria: {order.Categoria} | Cliente: {order.nomeCliente}
                    </p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {order.itens.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <p className="text-gray-900">{item.Produto.nome}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-lg font-medium text-gray-900">
                      Total: {order.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-gray-600">Cartão: {order.cartao}</p>
                    <button
                      type="button"
                      onClick={() => markAsDelivered(order.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Entregar
                    </button>
                  </div>
                  {deliveredOrderId === order.id && (
                    <p className="mt-4 text-green-600 font-medium">Pedido entregue</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedCategoria ? `Não há pedidos pendentes na categoria ${selectedCategoria}` : 'Não há pedidos pendentes'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
