import { useState, useEffect, useCallback } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { json, ActionFunctionArgs } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { FormCard } from "~/components/FormCard";
import { PostgrestError } from "@supabase/supabase-js";
import { BackButton } from "~/components/BackButton";
import ProtectedPage from "~/hook/withAuth";

const CATEGORIAS = {
  LOJINHA: "Lojinha",
  LANCHONETE: "Lanchonete",
} as const;

type CategoriaType = (typeof CATEGORIAS)[keyof typeof CATEGORIAS] | null;

interface Product {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  disponivel: boolean;
  Categoria: (typeof CATEGORIAS)[keyof typeof CATEGORIAS];
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

// Action function para processar vendas
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const idCard = formData.get("idCard");
    const produtosJson = formData.get("produtos");
    const categoria = formData.get("Categoria");

    if (!idCard || typeof idCard !== "string") {
      throw new Error("ID do cartão é obrigatório");
    }

    if (!produtosJson || typeof produtosJson !== "string") {
      throw new Error("Nenhum produto selecionado");
    }

    if (!categoria || typeof categoria !== "string") {
      throw new Error("Categoria inválida");
    }

    let produtos: CartItem[];
    try {
      produtos = JSON.parse(produtosJson) as CartItem[];
      if (!Array.isArray(produtos) || produtos.length === 0) {
        throw new Error("Lista de produtos inválida");
      }

      for (const produto of produtos) {
        const { data: produtoAtual } = await supabase
          .from("Produto")
          .select("quantidade")
          .eq("id", produto.id)
          .single();

        if (
          !produtoAtual ||
          produto.quantidadeSelecionada > produtoAtual.quantidade
        ) {
          throw new Error(
            `Quantidade indisponível para o produto: ${produto.nome}`
          );
        }
      }
    } catch (e) {
      throw new Error("Formato de produtos inválido");
    }

    // Calcular valor total
    const valorTotal = produtos.reduce(
      (total, item) => total + item.preco * item.quantidadeSelecionada,
      0
    );

    // Verificar cartão e saldo
    const { data: card, error: cardError } = await supabase
      .from("Card")
      .select("balance, nome")
      .eq("idCard", idCard)
      .single();

    if (cardError || !card) throw new Error("Cartão não encontrado");
    if (card.balance < valorTotal) throw new Error("Saldo insuficiente");

    // Criar venda no banco
    const { data: venda, error: vendaError } = await supabase
      .from("Venda")
      .insert([
        {
          cartao: idCard,
          valorTotal,
          Categoria: categoria,
          Entregue: false,
        },
      ])
      .select()
      .single();

    if (vendaError || !venda) throw new Error("Erro ao criar venda");

    // Inserir itens da venda
    const itensVenda = produtos.map((produto) => ({
      vendaId: venda.id,
      idProduto: produto.id,
      quantidade: produto.quantidadeSelecionada,
      precoUnitario: produto.preco,
    }));

    const { error: itemError } = await supabase
      .from("Item_venda")
      .insert(itensVenda);

    if (itemError) throw new Error("Erro ao registrar itens da venda");

    // Atualizar estoque dos produtos
    for (const produto of produtos) {
      const { error: updateError } = await supabase
        .from("Produto")
        .update({
          quantidade: produto.quantidade - produto.quantidadeSelecionada,
        })
        .eq("id", produto.id);

      if (updateError) throw new Error("Erro ao atualizar estoque");
    }

    // Atualizar saldo do cartão e registrar transação
    const novoSaldo = card.balance - valorTotal;

    const { error: transactionError } = await supabase
      .from("Transacoes")
      .insert([
        {
          idCard,
          nome: card.nome,
          valor: -valorTotal,
          saldoAtual: novoSaldo,
        },
      ]);

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
    console.error("Erro na action:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao processar venda";
    return json<ActionData>(
      { status: "error", message: errorMessage },
      { status: 400 }
    );
  }
}

// Componente principal - Estados e funções auxiliares
export default function RealizarVenda() {
  const { produtos, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [idCard, setIdCard] = useState("");
  const [selectedCategoria, setSelectedCategoria] =
    useState<CategoriaType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const isProcessing = navigation.state === "submitting";

  // Previne submissões durante o processamento
  useEffect(() => {
    if (isProcessing) {
      setIsSubmitting(true);
    } else {
      // Reseta o estado após um delay para melhor UX
      const timer = setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing]);

  // Reset do formulário após venda bem-sucedida
  useEffect(() => {
    if (actionData?.status === "success") {
      setCartItems([]);
      setIdCard("");
      setSearchTerm("");
      setSelectedCategoria(null);
      setSubmitCount(0);
    }
  }, [actionData]);

  // Funções de manipulação do carrinho
  const handleQuantityChange = useCallback(
    (produto: Product, quantidade: number) => {
      if (quantidade < 0) return;
      if (quantidade > produto.quantidade) {
        alert(`Quantidade máxima disponível: ${produto.quantidade}`);
        return;
      }

      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.id === produto.id);

        if (quantidade === 0) {
          return prev.filter((item) => item.id !== produto.id);
        }

        if (existingItem) {
          return prev.map((item) =>
            item.id === produto.id
              ? { ...item, quantidadeSelecionada: quantidade }
              : item
          );
        }

        return [...prev, { ...produto, quantidadeSelecionada: quantidade }];
      });
    },
    []
  );

  const handleSubmit = useCallback(
    (e: { preventDefault: () => void }) => {
      if (!selectedCategoria) {
        e.preventDefault();
        alert("Selecione uma categoria");
        return;
      }

      if (isSubmitting || isProcessing) {
        e.preventDefault();
        return;
      }

      setSubmitCount((prev) => prev + 1);

      if (submitCount > 0) {
        e.preventDefault();
        return;
      }

      setIsSubmitting(true);
    },
    [selectedCategoria, isSubmitting, isProcessing, submitCount]
  );

  // Filtro de produtos baseado na busca e categoria
  const produtosFiltrados = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategoria === null || produto.Categoria === selectedCategoria)
  );

  const formatarMoeda = useCallback((valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }, []);

  const totalValue = cartItems.reduce(
    (total, item) => total + item.preco * item.quantidadeSelecionada,
    0
  );

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BackButton to="/pedido" />

          {error && (
            <div className="mb-6 flex items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro ao Carregar Produtos
                </h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FormCard title="Produtos Disponíveis">
              <div className="p-6">
                <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-96">
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedCategoria === null
                          ? "bg-white text-indigo-600 border-2 border-indigo-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => setSelectedCategoria(null)}
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedCategoria === CATEGORIAS.LOJINHA
                          ? "bg-white text-indigo-600 border-2 border-indigo-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() => setSelectedCategoria(CATEGORIAS.LOJINHA)}
                    >
                      Lojinha
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedCategoria === CATEGORIAS.LANCHONETE
                          ? "bg-white text-indigo-600 border-2 border-indigo-600"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      onClick={() =>
                        setSelectedCategoria(CATEGORIAS.LANCHONETE)
                      }
                    >
                      Lanchonete
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {produtosFiltrados.length > 0 ? (
                    produtosFiltrados.map((produto) => (
                      <div
                        key={produto.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {produto.nome}
                          </h3>
                          <p className="text-sm text-gray-900">
                            {formatarMoeda(produto.preco)} - Disponível:{" "}
                            {produto.quantidade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const currentItem = cartItems.find(
                                (item) => item.id === produto.id
                              );
                              const currentQty =
                                currentItem?.quantidadeSelecionada || 0;
                              handleQuantityChange(
                                produto,
                                Math.max(0, currentQty - 1)
                              );
                            }}
                            className="px-3 py-1 bg-white text-gray-900 rounded-lg hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-gray-900">
                            {cartItems.find((item) => item.id === produto.id)
                              ?.quantidadeSelecionada || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentItem = cartItems.find(
                                (item) => item.id === produto.id
                              );
                              const currentQty =
                                currentItem?.quantidadeSelecionada || 0;
                              if (currentQty < produto.quantidade) {
                                handleQuantityChange(produto, currentQty + 1);
                              }
                            }}
                            className="px-3 py-1 bg-white text-gray-900 rounded-lg hover:bg-gray-200"
                            disabled={
                              cartItems.find((item) => item.id === produto.id)
                                ?.quantidadeSelecionada === produto.quantidade
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm
                        ? "Nenhum produto encontrado"
                        : "Carregando produtos..."}
                    </div>
                  )}
                </div>
              </div>
            </FormCard>

            <FormCard title="Carrinho">
              <div className="p-6">
                <Form
                  method="post"
                  className="space-y-6"
                  onSubmit={handleSubmit}
                >
                  {/* Apenas UM bloco de mensagens aqui em cima */}
                  {actionData?.status && (
                    <div
                      className={`mb-6 flex items-center p-4 ${
                        actionData.status === "success"
                          ? "bg-green-50 border-l-4 border-green-500"
                          : "bg-red-50 border-l-4 border-red-500"
                      } rounded-lg`}
                    >
                      <div className="flex-shrink-0">
                        {actionData.status === "success" ? (
                          <svg
                            className="h-5 w-5 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-red-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            actionData.status === "success"
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {actionData.status === "success"
                            ? "Venda Realizada com Sucesso"
                            : (() => {
                                switch (actionData.message) {
                                  case "Saldo insuficiente":
                                    return "Saldo Insuficiente no Cartão";
                                  case "Cartão não encontrado":
                                    return "Cartão Não Encontrado";
                                  case "ID do cartão é obrigatório":
                                    return "Número do Cartão Obrigatório";
                                  case "Nenhum produto selecionado":
                                    return "Carrinho Vazio";
                                  default:
                                    return "Erro na Venda";
                                }
                              })()}
                        </h3>
                        <div
                          className={`mt-2 text-sm ${
                            actionData.status === "success"
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {actionData.status === "success"
                            ? actionData.message
                            : (() => {
                                switch (actionData.message) {
                                  case "Saldo insuficiente":
                                    return "O cartão não possui saldo suficiente para realizar esta compra. Por favor, recarregue o cartão.";
                                  case "Cartão não encontrado":
                                    return "O número do cartão informado não foi encontrado. Verifique se digitou corretamente.";
                                  case "ID do cartão é obrigatório":
                                    return "Por favor, insira o número do cartão antes de continuar com a venda.";
                                  case "Nenhum produto selecionado":
                                    return "Adicione pelo menos um produto ao carrinho antes de finalizar a venda.";
                                  default:
                                    return actionData.message;
                                }
                              })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resto do formulário... */}
                  <div>
                    <label
                      htmlFor="idCard"
                      className="block text-sm font-medium text-gray-900 mb-1"
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
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <input
                    type="hidden"
                    name="Categoria"
                    value={selectedCategoria || ""}
                  />

                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg group"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.nome}
                          </h4>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(
                                    item,
                                    item.quantidadeSelecionada - 1
                                  )
                                }
                                className="px-2 py-1 text-sm bg-white text-gray-900 rounded hover:bg-gray-200"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm text-gray-900">
                                {item.quantidadeSelecionada}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(
                                    item,
                                    item.quantidadeSelecionada + 1
                                  )
                                }
                                className="px-2 py-1 text-sm bg-white text-gray-900 rounded hover:bg-gray-200"
                                disabled={
                                  item.quantidadeSelecionada >= item.quantidade
                                }
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm text-gray-900">
                              x {formatarMoeda(item.preco)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium text-gray-900">
                            {formatarMoeda(
                              item.preco * item.quantidadeSelecionada
                            )}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, 0)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                            title="Remover item"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">
                        Total:
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatarMoeda(totalValue)}
                      </span>
                    </div>
                  </div>

                  <input
                    type="hidden"
                    name="produtos"
                    value={JSON.stringify(cartItems)}
                  />

                  <button
                    type="submit"
                    disabled={
                      cartItems.length === 0 ||
                      !idCard ||
                      !selectedCategoria ||
                      isSubmitting ||
                      isProcessing
                    }
                    className={`w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium 
                  ${
                    !isSubmitting && !isProcessing
                      ? "hover:from-indigo-700 hover:to-blue-700 hover:scale-[1.02]"
                      : ""
                  }
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                  transform transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  relative
                `}
                  >
                    {isSubmitting || isProcessing ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processando...
                      </div>
                    ) : (
                      "Finalizar Venda"
                    )}
                  </button>
                </Form>
              </div>
            </FormCard>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
