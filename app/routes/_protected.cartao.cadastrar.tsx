import { useState } from "react";
import { supabase } from "~/supabase/supabaseClient";
import { FormCard } from "~/components/FormCard";
import { BackButton } from "~/components/BackButton";

export const meta = () => {
  return [
    { title: "Cadastro de Cartões" },
    {
      name: "description",
      content: "Página para cadastrar cartões no Supabase",
    },
  ];
};

export default function CadastrarCartao() {
  const [idCard, setIdCard] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [saldo, setSaldo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setErro(false);

    const { data: existingCard } = await supabase
      .from("Card")
      .select()
      .eq("idCard", idCard)
      .single();

    if (existingCard) {
      setMensagem("Já existe um cartão com esse id cadastrado no sistema!");
      setErro(true);
      return;
    }

    const balanceValue = saldo ? parseFloat(saldo) : 0;

    const { error } = await supabase
      .from("Card")
      .insert([{ idCard, nome, telefone, balance: balanceValue }]);

    if (error) {
      setMensagem(
        error.message || "Erro ao cadastrar cartão. Tente novamente."
      );
      setErro(true);
    } else {
      setMensagem(`Cartão ${idCard} cadastrado com sucesso para ${nome}!`);
      setErro(false);
      setIdCard("");
      setNome("");
      setTelefone("");
      setSaldo("");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <BackButton to="/cartao" />

        <FormCard title="Consultar Cartão">
          <div className="p-6">
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
                  onChange={(e) => setIdCard(e.target.value)}
                  placeholder="Digite o ID do cartão"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome do Titular
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome do titular"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="telefone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Telefone
                </label>
                <input
                  id="telefone"
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Digite o telefone"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="saldo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Saldo Inicial (opcional)
                </label>
                <input
                  id="saldo"
                  type="number"
                  value={saldo}
                  onChange={(e) => setSaldo(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Mensagem de Status */}
              {mensagem && (
                <div
                  className={`p-4 rounded-lg ${
                    erro
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  <p className="flex items-center gap-2">
                    {erro ? (
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
                    ) : (
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
                    )}
                    {mensagem}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
              >
                Cadastrar Cartão
              </button>
            </form>
          </div>
        </FormCard>
      </div>
    </div>
  );
}
