import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import JHSLogo from "~/components/JHSLogo";
import { json } from "@remix-run/node";

const phrases = [
"Todos nascemos originais, mas muitos de nós morremos como fotocópias.",
"A única coisa que devemos pedir a Deus em oração é o desejo de ser santos.",
"Estar sempre unido a Jesus, esse é o meu projeto de vida.",
];

export async function loader() {
return json({ ok: true });
}

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
  <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center opacity-5">
      <JHSLogo width="w-4/5 sm:w-2/3" height="h-4/5 sm:h-2/3" />
    </div>

    <div className="z-10 text-center p-4 sm:p-8">
      <div className="mb-8 sm:mb-12">
        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
          AcutisDataModos
        </h1>
        <div className="h-16 flex items-center justify-center">
          <h2
            className={`text-lg sm:text-xl md:text-2xl text-gray-600 transition-opacity duration-1000 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            {phrases[currentPhraseIndex]}
          </h2>
        </div>
      </div>

      <Link
        to="/login"
        className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
      >
        Entrar
      </Link>
    </div>

    <div className="absolute top-8 left-8 w-16 sm:w-24 h-16 sm:h-24 border-l-2 border-t-2 border-blue-200 opacity-40" />
    <div className="absolute top-8 right-8 w-16 sm:w-24 h-16 sm:h-24 border-r-2 border-t-2 border-blue-200 opacity-40" />
    <div className="absolute bottom-8 left-8 w-16 sm:w-24 h-16 sm:h-24 border-l-2 border-b-2 border-blue-200 opacity-40" />
    <div className="absolute bottom-8 right-8 w-16 sm:w-24 h-16 sm:h-24 border-r-2 border-b-2 border-blue-200 opacity-40" />

    <div className="absolute bottom-4 text-center text-gray-600 text-xs sm:text-sm">
      <p>© AcutisDataModos</p>
    </div>
  </div>
);
};

export default LandingPage;