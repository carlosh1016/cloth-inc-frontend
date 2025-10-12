import { Link } from "react-router-dom";
import { ShirtIcon, LogInIcon, LogOutIcon, SearchIcon } from "lucide-react";

export default function Header() {
  const token = localStorage.getItem("cloth-inc-token");
  return (
    <header className="flex items-center justify-between border-b border-b-primary/20 dark:border-b-primary/30 px-10 py-4 bg-background-light dark:bg-background-dark">
      
      {/* Logo y buscador */}
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3 text-black">
          <Link to="/" className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-rose-600">
              Cloth Inc
            </h2>
          </Link>
        </div>

        {/* Buscador */}
        <div className="relative w-96">
          <SearchIcon className="h-8 w-8 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos y marcas"
            className="w-full rounded-lg border border-gray-300 bg-background-light py-2.5 pl-10 pr-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      
      {/* Botones y avatar */}
      {token ? (
      <div className="flex items-center gap-4">
        <button className="flex items-center justify-center rounded-lg h-10 w-10 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors">
          <span className="material-symbols-outlined">location_on</span>
        </button>
        <button className="flex items-center justify-center rounded-lg h-10 w-10 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors">
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>
        <button className="flex items-center justify-center rounded-lg h-10 w-10 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors">
          <Link to="/login"><LogOutIcon className="h-8 w-8" onClick={() => localStorage.removeItem("cloth-inc-token")} /></Link>
        </button>
      </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            
            <Link to="/login"><LogInIcon className="h-8 w-8" /></Link>
          </div>
        </div>
      )}
    </header>
  );
}
