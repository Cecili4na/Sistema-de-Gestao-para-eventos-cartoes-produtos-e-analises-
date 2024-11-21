import { ActionCard } from "~/components/ActionCard";
import { PageHeader } from "~/components/PageHeader";

export default function PedidosDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <PageHeader
        title="Gestão de Pedidos"
        subtitle="Gerencie todos os pedidos do seu evento de forma simples e
              eficiente."
      />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card de Realizar Venda */}
          <ActionCard
            to="/pedido/venda"
            icon={
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            }
            title="Realizar Nova Venda"
            description="Registre uma nova venda no sistema."
          />

          {/* Card de Visualização de Pedidos */}
          <ActionCard
            to="/pedido/visualizar"
            icon={
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            }
            title="Visualizar Pedidos"
            description="Consulte detalhes e entregue os pedidos realizados."
            iconBgColor="bg-purple-100"
            iconHoverBgColor="group-hover:bg-purple-200"
            iconColor="text-purple-600"
          />
        </div>
      </div>
    </div>
  );
}
