// src/components/Header.jsx

import { User, Trash2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b w-full bg-white shadow-sm">
      <h1 className="text-xl font-bold text-gray-800">Fashion Hub</h1>
      <div>
        <button className="text-gray-600 hover:text-red-600">
          <Trash2 size={20} />
        </button>
        <button className="text-gray-600 hover:text-blue-600">
          <User size={24} />
        </button>
      </div>
    </header>
  );
}