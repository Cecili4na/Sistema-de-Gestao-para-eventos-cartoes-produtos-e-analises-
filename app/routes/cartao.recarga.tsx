import { useState } from "react";
import { supabase } from "~/supabase/supabaseClient";

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
    { name: "viewport", content: "width=device-width, initial-scale=1" },
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
        valor: valor, // Valor positivo para indicar recarga
        saldoAtual: novoSaldo,
      });

    if (transactionError) {
      // Reverter o saldo em caso de erro na transação
      await supabase
        .from("Card")
        .update({ balance: cartao.balance })
        .eq("idCard", idCard);

      setMensagem("Erro ao registrar transação");
      return;
    }

    setMensagem(
      `Recarga de R$ ${formatarValor(valorRecarga)} realizada com sucesso!`
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
    <div className="flex flex-col min-h-screen items-center justify-center bg-blue-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 mb-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-500 mb-4">
            Acutis Data Modos
          </h1>
        </div>

        <div className="bg-white shadow-md rounded-lg px-6 py-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
            Recarregar Cartão
          </h2>

          {!confirmarRecarga ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="ID do Cartão"
                value={idCard}
                onChange={(e) => {
                  setIdCard(e.target.value);
                  setMensagem("");
                }}
                className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 text-black 
                          focus:outline-none focus:ring-2 focus:ring-blue-400 
                          text-sm sm:text-base"
                required
              />
              <input
                type="number"
                placeholder="Valor da Recarga"
                value={valorRecarga}
                onChange={(e) => {
                  setValorRecarga(e.target.value);
                  setMensagem("");
                }}
                className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 text-black 
                          focus:outline-none focus:ring-2 focus:ring-blue-400 
                          text-sm sm:text-base"
                min="0.01"
                step="0.01"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 sm:p-3 rounded-lg 
                           hover:bg-blue-600 transition duration-200 
                           text-sm sm:text-base"
              >
                Verificar Recarga
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-center">
                  Confirmar Recarga
                </h3>
                <div className="space-y-2 text-sm sm:text-base">
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
                    <strong>Saldo Atual:</strong> R$ {formatarValor(saldoAtual)}
                  </p>
                  <p>
                    <strong>Saldo Final:</strong> R${" "}
                    {formatarValor(saldoAtual + parseFloat(valorRecarga))}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={handleConfirmacaoRecarga}
                  className="w-full bg-green-500 text-white p-2 sm:p-3 rounded-lg 
                             hover:bg-green-600 transition duration-200 
                             text-sm sm:text-base"
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
                  className="w-full bg-red-500 text-white p-2 sm:p-3 rounded-lg 
                             hover:bg-red-600 transition duration-200 
                             text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {mensagem && (
            <p
              className={`text-center text-sm sm:text-base ${
                mensagem.includes("sucesso") ? "text-green-500" : "text-red-500"
              }`}
            >
              {mensagem}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
