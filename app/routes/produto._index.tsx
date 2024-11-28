import { Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { ActionCard } from "~/components/ActionCard";
import { PageHeader } from "~/components/PageHeader";
import ProtectedPage from "~/hook/withAuth";

export default function ProdutosDashboard() {
 return (
   <ProtectedPage>
     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
       <PageHeader
         title="Gestão de Produtos"
         subtitle="Gerencie todos os produtos do seu evento de forma simples e eficiente."
       />
       <div className="flex-1 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 w-full">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <ActionCard
             to="/produto/cadastrar"
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
                   d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                 />
               </svg>
             }
             title="Cadastrar Novo Produto"
             description="Adicione novos produtos ao seu sistema."
           />

           <ActionCard
             to="/produto/visualizar"
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
             title="Visualizar e Editar Produtos"
             description="Consulte detalhes do seu catálogo de produtos e atualize detalhamentos."
             iconBgColor="bg-purple-100"
             iconHoverBgColor="group-hover:bg-purple-200"
             iconColor="text-purple-600"
           />
         </div>
       </div>
     </div>
   </ProtectedPage>
 );
}