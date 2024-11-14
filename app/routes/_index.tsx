import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";

const phrases = [
  "Todos nascemos originais, mas muitos de nós morremos como fotocópias.",
  "A única coisa que devemos pedir a Deus em oração é o desejo de ser santos.",
  "Estar sempre unido a Jesus, esse é o meu projeto de vida.",
];

const LandingPage = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsTransitioning(false);
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <svg className="w-4/5 h-4/5" viewBox="0 0 100 100">
          <path
            d="M50 10 L50 90 M30 50 L70 50"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-blue-600"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-blue-600"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="z-10 text-center p-8">
        <div className="mb-12">
          <div className="w-40 h-40 mx-auto flex items-center justify-center mb-6">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
            AcutisDataModos
          </h1>
          <div className="h-16 flex items-center justify-center">
            <h2
              className={`text-xl md:text-2xl text-gray-600 transition-opacity duration-1000 ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {phrases[currentPhraseIndex]}
            </h2>
          </div>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
        >
          Entrar
        </Link>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-100 to-transparent opacity-60" />

      {/* Decorative Corners */}
      <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-blue-200 opacity-40" />
      <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-blue-200 opacity-40" />
      <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-blue-200 opacity-40" />
      <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-blue-200 opacity-40" />

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-gray-600 text-sm">
        <p>© AcutisDataModos</p>
      </div>
    </div>
  );
};

export default LandingPage;

