import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ShirtIcon, LogInIcon, LogOutIcon, SearchIcon, ShoppingCartIcon, StoreIcon, XIcon } from "lucide-react";
import { useCart } from "./CartContext";
import { toast } from "react-toastify";
import { logout as logoutAction } from "../redux/loginSlice";

export default function Header({ searchQuery = "", onSearchChange, showSearchSuggestions = false }) {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const userRole = user?.role;
  const navigate = useNavigate();
  const location = useLocation();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cart = useCart();
  const count = cart?.count ?? 0;

  const handleCartClick = (e) => {
    if (!token) {
      e.preventDefault();
      toast.info("Iniciá sesión para ver tu carrito");
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?next=${next}`);
      return;
    }
    navigate("/cart");
  };

  const logout = () => {
    localStorage.removeItem("cloth-inc-token");
    localStorage.removeItem("cloth-inc-role");
    localStorage.removeItem("cloth-inc-user-id");
    localStorage.removeItem("cloth-inc-shop-id");
    navigate("/login");
  }

  const handleSearchChange = useCallback((value) => {
    setLocalSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  }, [onSearchChange]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      // Si ya estamos en /search, solo actualizar filtros
      if (location.pathname === '/search' && onSearchChange) {
        onSearchChange(localSearchQuery.trim());
      } else {
        // Si estamos en otra página, navegar a /search
        navigate(`/search?q=${encodeURIComponent(localSearchQuery.trim())}`);
      }
      setShowSuggestions(false);
    }
  }, [localSearchQuery, navigate, location.pathname, onSearchChange]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  const clearSearch = useCallback(() => {
    setLocalSearchQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
    setShowSuggestions(false);
  }, [onSearchChange]);

  const handleSearchFocus = useCallback(() => {
    if (showSearchSuggestions && localSearchQuery.trim()) {
      setShowSuggestions(true);
    }
  }, [showSearchSuggestions, localSearchQuery]);

  const handleSearchBlur = useCallback(() => {
    // Delay para permitir clicks en sugerencias
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

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
          <form onSubmit={handleSearchSubmit} className="relative">
            <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos, marcas y categorías..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="w-full rounded-lg border border-gray-300 bg-background-light py-2.5 pl-10 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {localSearchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </form>
          
          {/* Sugerencias de búsqueda (placeholder para futuras implementaciones) */}
          {showSuggestions && showSearchSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              <div className="p-3 text-sm text-gray-500">
                Sugerencias de búsqueda próximamente...
              </div>
            </div>
          )}
        </div>
      </div>

      
      {/* Botones y avatar */}
      {token ? (
      <div className="flex items-center gap-4">
        {userRole === "ROLE_SELLER" && (
          <button className="flex items-center justify-center rounded-lg h-10 w-10 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors">
            <Link to="/shop">
              <StoreIcon className="h-8 w-8" />
            </Link>
          </button>
        )}
                <button
          type="button"
          onClick={handleCartClick}
          className="relative flex items-center justify-center rounded-lg h-10 w-10 text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors"
          aria-label="Ir al carrito"
        >
          <ShoppingCartIcon className="h-8 w-8" />
          {token && count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center rounded-lg h-10 w-10 text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOutIcon className="h-8 w-8" />
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
