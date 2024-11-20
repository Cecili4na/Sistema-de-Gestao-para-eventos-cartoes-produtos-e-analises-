import { useState } from "react";
import { BackButton } from "~/components/BackButton";
import { supabase } from "~/supabase/supabaseClient";

interface Card {
  idCard: string;
  nome: string;
  telefone: string;
  balance: number;
}

export default function ConsultarCartao() {
  const [termoBusca, setTermoBusca] = useState<string>("");
  const [tipoBusca, setTipoBusca] = useState<"idCard" | "nome" | "telefone">(
    "idCard"
  );
  const [cartaoEncontrado, setCartaoEncontrado] = useState<Card | null>(null);
  const [mensagem, setMensagem] = useState<string>("");
  const [modoEdicao, setModoEdicao] = useState<boolean>(false);
  const [nomeEdicao, setNomeEdicao] = useState<string>("");
  const [telefoneEdicao, setTelefoneEdicao] = useState<string>("");

  async function buscarCartao() {
    // Validação de campos vazios com mensagem específica por tipo
    if (!termoBusca.trim()) {
      switch (tipoBusca) {
        case "idCard":
          setMensagem("Digite o ID do cartão");
          break;
        case "nome":
          setMensagem("Digite o nome");
          break;
        case "telefone":
          setMensagem("Digite o telefone");
          break;
      }
      return;
    }

    let query = supabase.from("Card").select("*");

    switch (tipoBusca) {
      case "idCard":
        query = query.eq("idCard", termoBusca);
        break;
      case "nome":
        query = query.ilike("nome", `%${termoBusca}%`);
        break;
      case "telefone":
        query = query.eq("telefone", termoBusca);
        break;
    }

    const { data, error } = await query;

    if (error) {
      setMensagem("Erro ao buscar cartão. Tente novamente");
      return;
    }

    if (!data || data.length === 0) {
      switch (tipoBusca) {
        case "idCard":
          setMensagem("Cartão não cadastrado");
          break;
        case "nome":
          setMensagem("Nenhum cartão encontrado com este nome");
          break;
        case "telefone":
          setMensagem("Nenhum cartão encontrado com este telefone");
          break;
      }
      setCartaoEncontrado(null);
      return;
    }

    const cartao: Card = data[0];
    setCartaoEncontrado(cartao);
    setNomeEdicao(cartao.nome);
    setTelefoneEdicao(cartao.telefone);
    setMensagem("");
  }

  async function handleEditar() {
    if (!cartaoEncontrado) return;

    // Validações específicas para cada campo
    if (!nomeEdicao.trim()) {
      setMensagem("Digite o nome do titular");
      return;
    }

    if (!telefoneEdicao.trim()) {
      setMensagem("Digite o telefone do titular");
      return;
    }

    const { error } = await supabase
      .from("Card")
      .update({
        nome: nomeEdicao.trim(),
        telefone: telefoneEdicao.trim(),
      })
      .eq("idCard", cartaoEncontrado.idCard);

    if (error) {
      setMensagem("Erro ao atualizar cartão. Tente novamente");
      return;
    }

    setMensagem("Cartão atualizado com sucesso!");
    setModoEdicao(false);

    setCartaoEncontrado({
      ...cartaoEncontrado,
      nome: nomeEdicao.trim(),
      telefone: telefoneEdicao.trim(),
    });
  }

  function resetarBusca() {
    setTermoBusca("");
    setCartaoEncontrado(null);
    setMensagem("");
    setModoEdicao(false);
    setNomeEdicao("");
    setTelefoneEdicao("");
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-blue-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 mb-8">
        <div className="text-center">
          <div className="flex justify-start mb-8">
            <BackButton to="/cartao" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-500 mb-4">
            Consultar Cartão
          </h1>
        </div>

        <div className="bg-white shadow-md rounded-lg px-6 py-8 space-y-6">
          {/* Área de busca permanece igual */}
          <div className="space-y-4">
            <select
              value={tipoBusca}
              onChange={(e) => {
                setTipoBusca(e.target.value as "idCard" | "nome" | "telefone");
                setMensagem("");
                setTermoBusca("");
              }}
              className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 text-black 
                        focus:outline-none focus:ring-2 focus:ring-blue-400 
                        text-sm sm:text-base"
            >
              <option value="idCard">ID do Cartão</option>
              <option value="nome">Nome</option>
              <option value="telefone">Telefone</option>
            </select>

            <input
              type="text"
              placeholder={`Digite o ${tipoBusca}`}
              value={termoBusca}
              onChange={(e) => {
                setTermoBusca(e.target.value);
                setMensagem("");
              }}
              className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 text-black 
                        focus:outline-none focus:ring-2 focus:ring-blue-400 
                        text-sm sm:text-base"
            />

            <button
              onClick={buscarCartao}
              className="w-full bg-blue-500 text-white p-2 sm:p-3 rounded-lg 
                         hover:bg-blue-600 transition duration-200 
                         text-sm sm:text-base"
            >
              Buscar Cartão
            </button>
          </div>

          {cartaoEncontrado && (
            <div className="bg-green-50 p-4 rounded-lg space-y-4 text-black">
              <h3 className="text-lg sm:text-xl font-bold text-center">
                Cartão Encontrado
              </h3>

              {!modoEdicao ? (
                <div className="space-y-2 text-sm sm:text-base">
                  <p>
                    <strong>ID do Cartão:</strong> {cartaoEncontrado.idCard}
                  </p>
                  <p>
                    <strong>Nome:</strong> {cartaoEncontrado.nome}
                  </p>
                  <p>
                    <strong>Telefone:</strong> {cartaoEncontrado.telefone}
                  </p>
                  <p>
                    <strong>Saldo:</strong> R${" "}
                    {cartaoEncontrado.balance.toFixed(2)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setModoEdicao(true)}
                      className="w-full bg-blue-700 text-white p-2 rounded-lg 
                                 hover:bg-blue-800 transition duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={resetarBusca}
                      className="w-full bg-gray-500 text-white p-2 rounded-lg 
                                 hover:bg-gray-600 transition duration-200"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={nomeEdicao}
                    onChange={(e) => {
                      setNomeEdicao(e.target.value);
                      setMensagem("");
                    }}
                    placeholder="Nome"
                    className="w-full p-2 border rounded-lg bg-gray-100"
                  />
                  <input
                    type="text"
                    value={telefoneEdicao}
                    onChange={(e) => {
                      setTelefoneEdicao(e.target.value);
                      setMensagem("");
                    }}
                    placeholder="Telefone"
                    className="w-full p-2 border rounded-lg bg-gray-100"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleEditar}
                      className="w-full bg-green-500 text-white p-2 rounded-lg 
                                 hover:bg-green-600 transition duration-200"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setModoEdicao(false);
                        setNomeEdicao(cartaoEncontrado.nome);
                        setTelefoneEdicao(cartaoEncontrado.telefone);
                      }}
                      className="w-full bg-red-500 text-white p-2 rounded-lg 
                                 hover:bg-red-600 transition duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mensagem && (
            <p
              className={`text-center text-sm sm:text-base ${
                mensagem === "Cartão atualizado com sucesso!"
                  ? "text-green-500"
                  : "text-red-500"
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
