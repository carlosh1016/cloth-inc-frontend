import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-b-primary/20 dark:border-b-primary/30 px-10 py-4 bg-background-light dark:bg-background-dark">
      
      {/* Logo y buscador */}
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3 text-black dark:text-black">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 48 48">
            <path
              d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
              fill="currentColor"
            />
          </svg>
          <h2 className="text-2xl font-bold text-black dark:text-black">
            Trendify
          </h2>
        </div>

        {/* Buscador */}
        <div className="relative w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            search
          </span>
          <input
            type="text"
            placeholder="Search products and brands"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark py-2.5 pl-10 pr-4 text-black dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Botones y avatar */}
      <div className="flex items-center gap-4">
        <button className="flex items-center justify-center rounded-lg h-10 w-10 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors">
          <span className="material-symbols-outlined">location_on</span>
        </button>
        <button className="flex items-center justify-center rounded-lg h-10 w-10 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors">
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>
        <Link
          to="/profile"
          className="h-10 w-10 rounded-full overflow-hidden cursor-pointer transition-all ring-0 hover:ring-2 hover:ring-blue-500"
        >
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAG5GHn17NmCWoKfE5n839aJR4_fpQ2r5pKfVvVF3it8vqyIKw-O0Wp2ilktVTHNDDsigQnbzP4NQ-UuYYxjUX7uQo0foWP2LWDw_-Ryt1spfNoxCjMBj339d7rRvJJNm5QZUFR5sCtYyOYTNhlingEHU47nh-duBrOH_uNWy-OI76R9L4ZP2OgYdh3l6MVR_-8AoX8nj5oQ6VlV4RUhBjrErEvbUbW7c_d9lFu5WPxs17eXzqe074jhbTqMvlIfEe9Js_9oel9tO0")',
            }}
          ></div>
        </Link>
      </div>
    </header>
  );
}
