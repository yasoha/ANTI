"use client";

import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
interface SelectedProduct {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
}

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);

  return (
    <main className="noise-overlay">
      <Header />
      <Hero />
      <ProductGrid onBuyNow={(product) => setSelectedProduct(product)} />
      <Testimonials />
      <TrustSignals />
      <FAQ />
      <Footer />
      <WhatsAppButton />

      {selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
