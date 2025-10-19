import ProductCard from "./ProductCard";

export default function Section({ title, products }) {
  return (
    <section className="mb-12 text-left"> {/* text-left agregado */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-black mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>
    </section>
  );
}
