"use client";
import Testimonials from '../components/testimonials';
import FAQ from '../components/faq';
import Header from '../components/header';
import Hero from '../components/hero';
import ProductGrid from '../components/productgrid';

interface SelectedProduct {
  id: number;
  name: string;
  price: string; // خلي غير هادي ومسح "price: number"
  originalPrice: number;
}

export default function Home() {
// ... كمل الكود ديالك عادي
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
