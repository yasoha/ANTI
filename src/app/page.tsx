"use client";
import { useState } from "react";
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import TrustSignals from '../components/TrustSignals';
import CheckoutModal from '../components/CheckoutModal';
import WhatsAppButton from '../components/WhatsAppButton';
import Footer from '../components/Footer';

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
