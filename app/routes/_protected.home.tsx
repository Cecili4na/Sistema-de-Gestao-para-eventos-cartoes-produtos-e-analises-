/* eslint-disable @typescript-eslint/no-unused-vars */
import { Form } from "@remix-run/react";
import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { supabase } from "~/supabase/supabaseClient";
import { LogOut } from "lucide-react";
import { MenuCard } from "~/components/MenuCard";

export async function action({ request }: ActionFunctionArgs) {
  try {
    await supabase.auth.signOut();
    return redirect("/login");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return redirect("/login");
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Botão de Logout */}
      <Form method="post">
        <button
          type="submit"
          className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white/90 transition-all duration-300 text-gray-700 hover:text-gray-900 group"
        >
          <span className="font-medium">Sair</span>
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </Form>

      {/* Hero Section com Design Moderno */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
        </div>

        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <img
              src="/logo.png"
              alt="AcutisDataModos Logo"
              className="h-24 mb-8 mx-auto"
            />
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6">
              AcutisDataModos
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Somos uma plataforma de gestão para eventos católicos e buscamos
              ajudar pessoas através da tecnologia, seguindo o nosso baluarte
              beato Carlo&nbsp;Acutis.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 w-full">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0L48 8.85C96 17.7 192 35.4 288 53.1C384 70.8 480 88.5 576 88.5C672 88.5 768 70.8 864 61.95C960 53.1 1056 53.1 1152 61.95C1248 70.8 1344 88.5 1392 97.35L1440 106.2V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V0Z"
              fill="#f0f7ff"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-12">
          Funcionalidades Principais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MenuCard
            to="/produto"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
            title="Produtos"
            description="Adicione, edite e visualize os produtos do seu encontro de forma simples e intuitiva."
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            textColor="text-blue-600"
          />

          <MenuCard
            to="/cartao"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            }
            title="Cartões"
            description="Gerencie cartões do evento: adicione, edite, recarregue, debite e credite com facilidade."
          />

          <MenuCard
            to="/pedido"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            }
            title="Pedidos"
            description="Acompanhe e gerencie todos os pedidos vigentes do seu evento em tempo real."
          />

          <MenuCard
            to="/gestao/auth"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            title="Gestão"
            description="Acesse análises detalhadas: histórico de vendas, lucros e métricas importantes."
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            textColor="text-purple-600"
          />
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 italic">© AcutisDataModos</p>
        </div>
      </div>
    </div>
  );
}
