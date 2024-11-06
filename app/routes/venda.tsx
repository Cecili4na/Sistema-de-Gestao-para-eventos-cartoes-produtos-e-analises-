import { useState, useEffect, useCallback } from "react";
import { Form, useActionData, useLoaderData} from "@remix-run/react";
import { json, ActionFunctionArgs} from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { PageHeader, Card } from "./_layout.produto";
import { PostgrestError } from "@supabase/supabase-js";

interface Product {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  disponivel: boolean;
}

interface CartItem extends Product {
  quantidadeSelecionada: number;
}

interface LoaderData {
  produtos: Product[];
  error: string | null;
}

interface ActionData {
  status: "success" | "error";
  message: string;
}

export const loader = async () => {
  try {
    const { data: produtos, error: supabaseError } = await supabase
      .from("Produto")
      .select("*")
      .eq("disponivel", true)
      .gt("quantidade", 0)
      .order("nome");

    if (supabaseError) throw supabaseError;

    return json<LoaderData>({ produtos: produtos || [], error: null });
  } catch (error) {
    const err = error as PostgrestError;
    console.error("Erro ao carregar produtos:", err);
    return json<LoaderData>({ produtos: [], error: err.message });
  }
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const idCard = formData.get("idCard");
    const produtosJson = formData.get("produtos");

    if (!idCard || typeof idCard !== 'string') {
      throw new Error("ID do cartão é obrigatório");
    }

    if (!produtosJson || typeof produtosJson !== 'string') {
      throw new Error("Nenhum produto selecionado");
    }

    let produtos: CartItem[];
    try {
      produtos = JSON.parse(produtosJson) as CartItem[];
      if (!Array.isArray(produtos) || produtos.length === 0) {
        throw new Error("Lista de produtos inválida");
      }
      
      for (const produto of produtos) {
        if (produto.quantidadeSelecionada > produto.quantidade) {
          throw new Error(`Quantidade indisponível para o produto: ${produto.nome}`);
        }
      }
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error("Formato de produtos inválido");
    }

    const valorTotal = produtos.reduce(
      (total, item) => total + (item.preco * item.quantidadeSelecionada),
      0
    );

    const { data: card, error: cardError } = await supabase
      .from("Card")
      .select("balance, nome")
      .eq("idCard", idCard)
      .single();

    if (cardError) throw new Error("Erro ao verificar cartão");
    if (!card) throw new Error("Cartão não encontrado");
    if (card.balance < valorTotal) throw new Error("Saldo insuficiente");

    const { data: venda, error: vendaError } = await supabase
      .from("Venda")
      .insert([{ cartao: idCard, valorTotal }])
      .select()
      .single();

    if (vendaError || !venda) throw new Error("Erro ao criar venda");

    const itensVenda = produtos.map(produto => ({
      vendaId: venda.id,
      idProduto: produto.id,
      quantidade: produto.quantidadeSelecionada,
      precoUnitario: produto.preco
    }));

    const { error: itemError } = await supabase
      .from("Item_venda")
      .insert(itensVenda);

    if (itemError) throw new Error("Erro ao registrar itens da venda");

    for (const produto of produtos) {
      const { error: updateError } = await supabase
        .from("Produto")
        .update({
          quantidade: produto.quantidade - produto.quantidadeSelecionada
        })
        .eq("id", produto.id);

      if (updateError) throw new Error("Erro ao atualizar estoque");
    }

    const novoSaldo = card.balance - valorTotal;

    const { error: transactionError } = await supabase
      .from("Transacoes")
      .insert([{
        idCard,
        nome: card.nome,
        valor: -valorTotal,
        saldoAtual: novoSaldo
      }]);

    if (transactionError) throw new Error("Erro ao registrar transação");

    const { error: updateCardError } = await supabase
      .from("Card")
      .update({ balance: novoSaldo })
      .eq("idCard", idCard);

    if (updateCardError) throw new Error("Erro ao atualizar saldo do cartão");

    return json<ActionData>(
      { status: "success", message: "Venda realizada com sucesso!" },
      { status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro ao processar venda";
    return json<ActionData>(
      { status: "error", message: errorMessage },
      { status: 400 }
    );
  }
}
export default function RealizarVenda() {

    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [idCard, setIdCard] = useState("");
  
    const produtos = loaderData?.produtos || [];
    const error = loaderData?.error || null;
  
    useEffect(() => {
      if (actionData?.status === "success") {
        setCartItems([]);
        setIdCard("");
        setSearchTerm("");
      }
    }, [actionData]);
  
    const handleQuantityChange = useCallback((produto: Product, quantidade: number) => {
      if (quantidade < 0) return;
      if (quantidade > produto.quantidade) {
        alert(`Quantidade máxima disponível: ${produto.quantidade}`);
        return;
      }
  
      setCartItems(prev => {
        const existingItem = prev.find(item => item.id === produto.id);
        
        if (quantidade === 0) {
          return prev.filter(item => item.id !== produto.id);
        }
        
        if (existingItem) {
          return prev.map(item =>
            item.id === produto.id
              ? { ...item, quantidadeSelecionada: quantidade }
              : item
          );
        }
        
        return [...prev, { ...produto, quantidadeSelecionada: quantidade }];
      });
    }, []);
  
    const updateCartItemQuantity = useCallback((itemId: number, newQuantidade: number) => {
      const produto = produtos.find(p => p.id === itemId);
      if (produto) {
        handleQuantityChange(produto, newQuantidade);
      }
    }, [produtos, handleQuantityChange]);
  
    const removeFromCart = useCallback((itemId: number) => {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    }, []);
  
    const filteredProducts = produtos.filter(produto =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const totalValue = cartItems.reduce(
      (total, item) => total + item.preco * item.quantidadeSelecionada,
      0
    );
  
    const formatarMoeda = useCallback((valor: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
    }, []);
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Acutis Data Modos"
            subtitle="Sistema de Vendas"
          />
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="Produtos Disponíveis">
              <div className="p-6">
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(produto => (
                      <div
                        key={produto.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                      >
                        <div>
                          <h3 className="font-medium">{produto.nome}</h3>
                          <p className="text-sm text-gray-600">
                            {formatarMoeda(produto.preco)} - Disponível: {produto.quantidade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const currentItem = cartItems.find(item => item.id === produto.id);
                              const currentQty = currentItem?.quantidadeSelecionada || 0;
                              handleQuantityChange(produto, Math.max(0, currentQty - 1));
                            }}
                            className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">
                            {cartItems.find(item => item.id === produto.id)?.quantidadeSelecionada || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentItem = cartItems.find(item => item.id === produto.id);
                              const currentQty = currentItem?.quantidadeSelecionada || 0;
                              if (currentQty < produto.quantidade) {
                                handleQuantityChange(produto, currentQty + 1);
                              }
                            }}
                            className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
                            disabled={cartItems.find(item => item.id === produto.id)?.quantidadeSelecionada === produto.quantidade}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? "Nenhum produto encontrado" : "Carregando produtos..."}
                    </div>
                  )}
                </div>
              </div>
            </Card>
            <Card title="Carrinho">
              <div className="p-6">
                <Form 
                  method="post" 
                  action="/venda"
                  className="space-y-6"
                >
                  <div>
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
                      value={idCard}
                      onChange={(e) => setIdCard(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {cartItems.length > 0 ? (
                      cartItems.map(item => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-4 bg-gray-50 rounded-lg group"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{item.nome}</h4>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateCartItemQuantity(item.id, item.quantidadeSelecionada - 1)}
                                  className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm">
                                  {item.quantidadeSelecionada}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartItemQuantity(item.id, item.quantidadeSelecionada + 1)}
                                  className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                                  disabled={item.quantidadeSelecionada >= item.quantidade}
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-sm text-gray-600">
                                x {formatarMoeda(item.preco)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-medium">
                              {formatarMoeda(item.preco * item.quantidadeSelecionada)}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                              title="Remover item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Carrinho vazio
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total:</span>
                      <span className="text-lg font-bold">
                        {formatarMoeda(totalValue)}
                      </span>
                    </div>
                  </div>
                  {actionData?.message && (
                    <div
                      className={`p-4 rounded-lg ${
                        actionData.status === "success"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {actionData.message}
                    </div>
                  )}
                  <input
                    type="hidden"
                    name="produtos"
                    value={JSON.stringify(cartItems)}
                  />
                  <button
                    type="submit"
                    disabled={cartItems.length === 0 || !idCard}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Finalizar Venda
                  </button>
                </Form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }