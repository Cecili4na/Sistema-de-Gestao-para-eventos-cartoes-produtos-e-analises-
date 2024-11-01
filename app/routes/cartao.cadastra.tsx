import { useActionData, Form } from "@remix-run/react";
import { json, ActionFunctionArgs } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";

export const meta = () => {
  return [
    { title: "Cadastro de Cartão" },
    {
      name: "description",
      content: "Página para cadastrar cartão no Supabase",
    },
  ];
};

interface ActionData {
  status: "success" | "error";
  message: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const idCard = formData.get("idCard") as string;
  const nome = formData.get("nome") as string;
  const telefone = formData.get("telefone") as string;

  try {
    const { error } = await supabase
      .from("Card")
      .insert([{ idCard, nome, telefone, balance: 0 }]);

    if (error) throw error;

    return json<ActionData>({
      status: "success",
      message: "Cartão cadastrado com sucesso!",
    });
  } catch (error) {
    return json<ActionData>(
      {
        status: "error",
        message: "Erro ao cadastrar cartão. Tente novamente.",
      },
      { status: 400 }
    );
  }
}

export default function CartaoCadastra() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-blue-100">
      <h1 className="text-4xl font-bold text-blue-500 mb-4">
        Acutis Data Modos
      </h1>
      <div className="flex flex-col items-center gap-8 p-8 rounded-lg shadow-lg bg-white w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-800">
          Cadastrar Cartão
        </h2>
        <Form method="post" className="flex flex-col gap-4 w-full">
          <input
            type="text"
            name="idCard"
            placeholder="ID do Cartão"
            className="p-3 border rounded-lg bg-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            name="nome"
            placeholder="Nome do Titular"
            className="p-3 border rounded-lg bg-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="tel"
            name="telefone"
            placeholder="Telefone"
            className="p-3 border rounded-lg bg-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Cadastrar Cartão
          </button>
        </Form>
        {actionData?.message && (
          <p
            className={`text-center ${
              actionData.status === "success"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {actionData.message}
          </p>
        )}
      </div>
    </div>
  );
}
