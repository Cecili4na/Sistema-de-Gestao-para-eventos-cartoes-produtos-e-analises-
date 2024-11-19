import { LuMinusCircle, LuPlusCircle } from "react-icons/lu";
import { BackButton } from "~/components/BackButton";
import { MenuCard } from "~/components/MenuCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
        </div>
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-start mb-8">
              <BackButton to="/home" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-8">
              Gestão de Cartões
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              Gerencie todos os cartões do seu evento de forma simples e
              eficiente.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <MenuCard
            to="/cartao/cadastrar"
            icon={
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
            title="Cadastrar Cartão"
            description="Adicione novos cartões ao sistema do seu encontro."
          />

          <MenuCard
            to="/cartao/consultar"
            icon={
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            }
            title="Consultar Cartão"
            description="Consulte saldo e extrato dos cartões do seu encontro."
          />

          <MenuCard
            to="/cartao/debitar"
            icon={<LuMinusCircle className="w-6 h-6 text-red-600" />}
            title="Debitar Cartão"
            description="Realize débitos em cartões existentes."
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
          />

          <MenuCard
            to="/cartao/recarregar"
            icon={<LuPlusCircle className="w-6 h-6 text-green-600" />}
            title="Recarregar Cartão"
            description="Adicione créditos a um cartão existente."
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
        </div>
      </div>
    </div>
  );
}
