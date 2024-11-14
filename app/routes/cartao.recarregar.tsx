import { useState } from "react";
import { Link } from "@remix-run/react";
import { supabase } from "~/supabase/supabaseClient";
import { PageHeader, Card } from "./_layout.cartao";
import ProtectedPage from "~/hook/withAuth";

interface Card {
  idCard: string;
  nome: string;
  telefone: string;
  balance: number;
}

export const meta = () => {
  return [
    { title: "Recarga de Cartões" },
    {
      name: "description",
      content: "Página para recarregar cartões no Supabase",
    },
  ];
};

// Função para formatar valores monetários
function formatarValor(valor: number | string): string {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RecarregarCartao() {
  const [idCard, setIdCard] = useState("");
  const [valorRecarga, setValorRecarga] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [confirmarRecarga, setConfirmarRecarga] = useState(false);
  const [nomeCartao, setNomeCartao] = useState("");
  const [saldoAtual, setSaldoAtual] = useState<number>(0);

  async function buscarCartao(): Promise<Card | null> {
    if (!idCard.trim()) {
      setMensagem("Digite o ID do cartão");
      return null;
    }

    const { data, error } = await supabase
      .from("Card")
      .select("*")
      .eq("idCard", idCard)
      .single();

    if (error || !data) {
      setMensagem("Cartão não cadastrado");
      return null;
    }

    return data as Card;
  }

  async function handleConfirmacaoRecarga() {
    const cartao = await buscarCartao();

    if (!cartao) return;

    const valor = parseFloat(valorRecarga);

    if (isNaN(valor) || valor <= 0) {
      setMensagem("Digite um valor válido");
      return;
    }

    const novoSaldo = cartao.balance + valor;

    // Atualizar saldo do cartão
    const { error: updateError } = await supabase
      .from("Card")
      .update({ balance: novoSaldo })
      .eq("idCard", idCard);

    if (updateError) {
      setMensagem("Erro ao recarregar cartão");
      return;
    }

    // Registrar transação com valor positivo
    const { error: transactionError } = await supabase
      .from("Transacoes")
      .insert({
        idCard: cartao.idCard,
        nome: cartao.nome,
        valor: valor,
        saldoAtual: novoSaldo,
      });

    if (transactionError) {
      await supabase
        .from("Card")
        .update({ balance: cartao.balance })
        .eq("idCard", idCard);

      setMensagem("Erro ao registrar transação");
      return;
    }

    setMensagem(
      `Recarga de R$ ${formatarValor(
        valorRecarga
      )} no cartão ${idCard} realizada com sucesso!`
    );
    setIdCard("");
    setValorRecarga("");
    setConfirmarRecarga(false);
    setNomeCartao("");
    setSaldoAtual(0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!valorRecarga || parseFloat(valorRecarga) <= 0) {
      setMensagem("Digite um valor válido");
      return;
    }

    const cartao = await buscarCartao();

    if (cartao) {
      setNomeCartao(cartao.nome);
      setSaldoAtual(cartao.balance);
      setConfirmarRecarga(true);
      setMensagem("");
    }
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Botão Voltar */}
          <div className="mb-8">
            <Link
              to="/cartao"
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

          <PageHeader />

          <Card title="Recarregar Cartão">
            <div className="p-6">
              {!confirmarRecarga ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="idCard"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ID do Cartão
                    </label>
                    <input
                      id="idCard"
                      type="text"
                      value={idCard}
                      onChange={(e) => {
                        setIdCard(e.target.value);
                        setMensagem("");
                      }}
                      placeholder="Digite o ID do cartão"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="valorRecarga"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Valor da Recarga
                    </label>
                    <input
                      id="valorRecarga"
                      type="number"
                      value={valorRecarga}
                      onChange={(e) => {
                        setValorRecarga(e.target.value);
                        setMensagem("");
                      }}
                      placeholder="0,00"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  {mensagem && (
                    <div
                      className={`p-4 rounded-lg ${
                        mensagem.includes("sucesso")
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <p className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {mensagem}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    Verificar Recarga
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      Confirmar Recarga
                    </h3>
                    <div className="space-y-3 text-gray-900">
                      <p>
                        <strong>ID do Cartão:</strong> {idCard}
                      </p>
                      <p>
                        <strong>Nome do Titular:</strong> {nomeCartao}
                      </p>
                      <p>
                        <strong>Valor da Recarga:</strong> R${" "}
                        {formatarValor(valorRecarga)}
                      </p>
                      <p>
                        <strong>Saldo Atual:</strong> R${" "}
                        {formatarValor(saldoAtual)}
                      </p>
                      <p>
                        <strong>Saldo Final:</strong> R${" "}
                        {formatarValor(saldoAtual + parseFloat(valorRecarga))}
                      </p>
                    </div>
                  </div>

                  {/* Botões abaixo do card de informações */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleConfirmacaoRecarga}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                    >
                      Confirmar Recarga
                    </button>
                    <button
                      onClick={() => {
                        setConfirmarRecarga(false);
                        setNomeCartao("");
                        setMensagem("");
                        setSaldoAtual(0);
                      }}
                      className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Mensagem de sucesso/erro */}
                  {mensagem && (
                    <div
                      className={`p-4 rounded-lg ${
                        mensagem.includes("sucesso")
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <p className="flex items-center gap-2">
                        {mensagem.includes("sucesso") ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
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
                        {mensagem}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
}
