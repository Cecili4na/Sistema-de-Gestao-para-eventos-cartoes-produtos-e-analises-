import { useState } from "react";
import { supabase } from "~/supabase/supabaseClient";
import { FormCard } from "~/components/FormCard";
import { BackButton } from "~/components/BackButton";

interface Card {
  idCard: string;
  nome: string;
  telefone: string;
  balance: number;
}

export const meta = () => {
  return [
    { title: "Débito de Cartões" },
    {
      name: "description",
      content: "Página para debitar cartões no Supabase",
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

export default function DebitarCartao() {
  const [idCard, setIdCard] = useState<string>("");
  const [valorDebito, setValorDebito] = useState<string>("");
  const [mensagem, setMensagem] = useState<string>("");
  const [confirmarDebito, setConfirmarDebito] = useState<boolean>(false);
  const [nomeCartao, setNomeCartao] = useState<string>("");
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

  async function handleConfirmarDebito() {
    const cartao = await buscarCartao();

    if (!cartao) return;

    const valor = parseFloat(valorDebito);

    if (isNaN(valor) || valor <= 0) {
      setMensagem("Digite um valor válido");
      return;
    }

    const novoSaldo = cartao.balance - valor;

    if (novoSaldo < 0) {
      setMensagem("Saldo insuficiente");
      return;
    }

    // Atualizar saldo do cartão
    const { error: updateError } = await supabase
      .from("Card")
      .update({ balance: novoSaldo })
      .eq("idCard", idCard);

    if (updateError) {
      setMensagem("Erro ao atualizar saldo");
      return;
    }

    // Registrar transação
    const { error: transactionError } = await supabase
      .from("Transacoes")
      .insert({
        idCard: cartao.idCard,
        nome: cartao.nome,
        valor: -valor,
        saldoAtual: novoSaldo,
      });

    if (transactionError) {
      // Reverter o saldo em caso de erro
      await supabase
        .from("Card")
        .update({ balance: cartao.balance })
        .eq("idCard", idCard);

      setMensagem("Erro ao registrar transação");
      return;
    }

    setMensagem("Débito realizado com sucesso!");
    setIdCard("");
    setValorDebito("");
    setConfirmarDebito(false);
    setNomeCartao("");
    setSaldoAtual(0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!valorDebito || parseFloat(valorDebito) <= 0) {
      setMensagem("Digite um valor válido");
      return;
    }

    const cartao = await buscarCartao();

    if (cartao) {
      const valor = parseFloat(valorDebito);
      const novoSaldo = cartao.balance - valor;

      if (novoSaldo < 0) {
        setMensagem("Saldo insuficiente");
        return;
      }

      setNomeCartao(cartao.nome);
      setSaldoAtual(cartao.balance);
      setConfirmarDebito(true);
      setMensagem("");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <BackButton to="/cartao" />

        <FormCard title="Debitar do Cartão">
          <div className="p-6">
            {!confirmarDebito ? (
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
                    htmlFor="valorDebito"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Valor a Debitar
                  </label>
                  <input
                    id="valorDebito"
                    type="number"
                    value={valorDebito}
                    onChange={(e) => {
                      setValorDebito(e.target.value);
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

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  Verificar Débito
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Confirmar Débito
                  </h3>
                  <div className="space-y-3 text-gray-900">
                    <p>
                      <strong>ID do Cartão:</strong> {idCard}
                    </p>
                    <p>
                      <strong>Nome do Titular:</strong> {nomeCartao}
                    </p>
                    <p>
                      <strong>Valor do Débito:</strong> R${" "}
                      {formatarValor(valorDebito)}
                    </p>
                    <p>
                      <strong>Saldo Atual:</strong> R${" "}
                      {formatarValor(saldoAtual)}
                    </p>
                    <p>
                      <strong>Saldo Final:</strong> R${" "}
                      {formatarValor(saldoAtual - parseFloat(valorDebito))}
                    </p>
                  </div>
                </div>

                {/* Botões abaixo do card de informações */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleConfirmarDebito}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    Confirmar Débito
                  </button>
                  <button
                    onClick={() => {
                      setConfirmarDebito(false);
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
        </FormCard>
      </div>
    </div>
  );
}
