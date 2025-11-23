const EmptyShop = ({ onOpenCreate }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Aún no tienes una tienda</h2>
      <p className="text-gray-600 mb-6 max-w-md">Crea una tienda para empezar a vender tus productos y gestionar tu catálogo.</p>
      <button onClick={onOpenCreate} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Crear tienda</button>
    </div>
  );
};

export default EmptyShop;
