import { useState } from "react";
import { supabase } from "~/supabase/supabaseClient";

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

    // Verifica se o cartão já existe
    const { data: existingCard } = await supabase
      .from("Card")
      .select()
      .eq("idCard", idCard)
      .single();

    if (existingCard) {
      setMensagem("Já existe um cartão com essse id cadastrado no sistema!");
      setErro(true);
      return;
    }

    // Converte o saldo para número ou usa 0 como padrão
    const balanceValue = saldo ? parseFloat(saldo) : 0;

    const { error } = await supabase
      .from("Card")
      .insert([{ idCard, nome, telefone, balance: balanceValue }]);

    if (error) {
      setMensagem(error.message || "Erro ao cadastrar cartão. Tente novamente.");
      setErro(true);
    } else {
      setMensagem("Cartão cadastrado com sucesso!");
      setErro(false);
      setIdCard("");
      setNome("");
      setTelefone("");
      setSaldo("");
    }
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-blue-100">
        <div className="flex flex-col items-center mb-8">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="w-40 h-40 object-contain"
        />
        <h1 className="text-3xl font-bold text-blue-600 -mt-4">AcutisDataModos</h1>
      </div>
      <div className="flex flex-col items-center gap-8 p-8 rounded-lg shadow-lg bg-white w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-800">
          Cadastrar Cartão
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            placeholder="ID do Cartão"
            value={idCard}
            onChange={(e) => setIdCard(e.target.value)}
            className="p-3 border rounded-lg bg-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            placeholder="Nome do Titular"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="p-3 border rounded-lg bg-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="p-3 border rounded-lg bg-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            placeholder="Saldo Inicial (opcional)"
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
            className="p-3 border rounded-lg bg-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            step="0.01"
            min="0"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Cadastrar Cartão
          </button>
        </form>
        {mensagem && (
          <p className={`text-center ${erro ? 'text-red-500' : 'text-green-500'}`}>
            {mensagem}
          </p>
        )}
      </div>
    </div>
  );
}