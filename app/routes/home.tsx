import { Link, useNavigate } from "@remix-run/react";
import ProtectedPage from "~/hook/withAuth";
import { supabase } from "~/supabase/supabaseClient";
import { LogOut } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white/90 transition-all duration-300 text-gray-700 hover:text-gray-900 group"
        >
          <span className="font-medium">Sair</span>
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </button>

        {/* Hero Section com Design Moderno */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAzMGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptLTE4LTZjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTYtNiAyLjY4Ni02IDYgMi42ODYgNiA2IDZ6Ii8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
          </div>

          <div className="relative px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="AcutisDataModos Logo"
                  className="h-16 mb-4 mx-auto transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -inset-0.5 bg-white/30 blur rounded-full opacity-50"></div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                AcutisDataModos
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-6 leading-relaxed font-light">
                Somos uma plataforma de gestão para eventos católicos,
                desenvolvida com base no legado digital do nosso baluarte beato
                Carlos Acutis.
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-blue-200 opacity-20"></div>
          <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-blue-200 opacity-20"></div>
        </div>

        {/* Seção de Funcionalidades */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
            {/* Card Produtos */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="h-7 w-7 text-blue-600"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Produtos
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                Adicione, edite e visualize os produtos do seu encontro aqui.
              </p>
              <Link
                to="/produto"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-lg group-hover:translate-x-2 transition-transform duration-300"
              >
                Acessar
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Card Cartões */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="h-7 w-7 text-indigo-600"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cartões</h3>
              <p className="text-gray-600 text-lg mb-6">
                Gerencie cartões: adicione, edite, recarregue, debite e
                acompanhe saldos.
              </p>
              <Link
                to="/cartao"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-lg group-hover:translate-x-2 transition-transform duration-300"
              >
                Acessar
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Card Pedidos */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="h-7 w-7 text-purple-600"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pedidos</h3>
              <p className="text-gray-600 text-lg mb-6">
                Visualize e gerencie os pedidos vigentes com facilidade.
              </p>
              <Link
                to="/pedidos"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 text-lg group-hover:translate-x-2 transition-transform duration-300"
              >
                Acessar
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Card Gestão */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="h-14 w-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="h-7 w-7 text-green-600"
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
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestão</h3>
              <p className="text-gray-600 text-lg mb-6">
                Acompanhe lucros, histórico de vendas e analise métricas
                importantes.
              </p>
              <Link
                to="/produto/visualizar"
                className="inline-flex items-center text-green-600 hover:text-green-700 text-lg group-hover:translate-x-2 transition-transform duration-300"
              >
                Acessar
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
