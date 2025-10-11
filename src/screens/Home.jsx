import Header from "../components/HomeScreen/Header";
import ImageCarousel from "../components/HomeScreen/ImageCarousel";
import Section from "../components/HomeScreen/Section";

const producto = "/fotoProductosEjemplo/Sintitulo.png";

export default function Home() {
  const newArrivals = [
    { title: "Urban Chic", image: producto },
    { title: "Boho Bliss", image: producto },
    { title: "Athletic Edge", image: producto },
    { title: "Classic Tailored", image: producto },
  ];

  const sale = [
    { title: "Summer Dresses", image: producto },
    { title: "Men's Casual", image: producto },
    { title: "Kids' Collection", image: producto },
    { title: "Accessories", image: producto },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <Header />
      <ImageCarousel />
      <Section title="New Arrivals" products={newArrivals} />
      <Section title="Sale" products={sale} />
    </div>
  );
}
