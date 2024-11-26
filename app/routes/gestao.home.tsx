import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { MenuCard } from "~/components/MenuCard";
import { PageHeader } from "~/components/PageHeader";
import ProtectedPage from "~/hook/withAuth";

export function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("Cookie");
  if (!cookie?.includes("gestao_auth=true")) {
    return redirect("/gestao/auth");
  }
  return null;
}

export default function GestaoHome() {
  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <PageHeader
          title="Área de Gestão"
          subtitle="Visualize relatórios e análises detalhadas do seu evento"
        />

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MenuCard
              to="/gestao/operacoes"
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
              title="Transações"
              description="Histórico completo de todas as transações realizadas no evento."
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
              textColor="text-blue-600"
            />

            <MenuCard
              to="/gestao/vendas/visualizar"
              icon={
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              title="Vendas"
              description="Acompanhe o desempenho de vendas e receita do evento."
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              textColor="text-blue-600"
            />

            <MenuCard
              to="/gestao/produtos/visualizar"
              icon={
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              title="Análise de Produtos"
              description="Métricas detalhadas sobre o desempenho de cada produto."
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
              textColor="text-blue-600"
            />
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
