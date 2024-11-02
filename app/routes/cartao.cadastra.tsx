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
  const [mensagem, setMensagem] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { error } = await supabase
      .from("Card")
      .insert([{ idCard, nome, telefone, balance: 0 }]);

    if (error) {
      setMensagem("Erro ao cadastrar cartão. Tente novamente.");
    } else {
      setMensagem("Cartão cadastrado com sucesso!");
      setIdCard("");
      setNome("");
      setTelefone("");
    }
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-blue-100">
      <h1 className="text-4xl font-bold text-blue-500 mb-4">
        Acutis Data Modos
      </h1>
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
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="p-3 border rounded-lg bg-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Cadastrar Cartão
          </button>
        </form>
        {mensagem && <p className="text-center text-green-500">{mensagem}</p>}
      </div>
    </div>
  );
}
