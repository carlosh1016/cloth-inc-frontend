// src/components/ProductDescription.jsx
export default function ProductDescription({ description, details, specs }) {
  return (
    <footer className="p-4 md:p-8 border-t text-left">
      <h3 className="text-xl font-bold text-gray-900">Descripción</h3>
      <p className="mt-4 text-gray-600">{description}</p>
      <div className="mt-4 text-gray-600 space-y-2">
        {details.map((detail, index) => <p key={index}>{detail}</p>)}
      </div>
      <ul className="mt-6 space-y-2">
        <li className="text-gray-700"><span className="font-semibold">Material:</span> {specs.material}</li>
        <li className="text-gray-700"><span className="font-semibold">Cuidado:</span> {specs.care}</li>
        <li className="text-gray-700"><span className="font-semibold">Hecho en:</span> {specs.origin}</li>
      </ul>
    </footer>
  );
}