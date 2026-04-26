"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n/context";

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      createPayment: (
        paymentData: { amount: number; memo: string; metadata: Record<string, unknown> },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: unknown) => void;
        }
      ) => void;
    };
  }
}

interface CheckoutModalProps {
  product: { id: number; name: string; price: number } | null;
  onClose: () => void;
}

const WHATSAPP_NUMBER = "212600000000";
const WEBHOOK_URL = "https://your-automation-server.com/webhook/pi-payment";

export default function CheckoutModal({ product, onClose }: CheckoutModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [formData, setFormData] = useState({ name: "", email: "", card: "", expiry: "", cvc: "" });

  if (!product) return null;

  const handlePiPayment = () => {
    if (typeof window !== "undefined" && window.Pi) {
      try {
        window.Pi.init({ version: "2.0", sandbox: true });
        window.Pi.createPayment(
          { amount: product.price, memo: `DigiBoct: ${product.name}`, metadata: { productId: product.id, productName: product.name } },
          {
            onReadyForServerApproval: (paymentId: string) => {
              setStep("processing");
              fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, productId: product.id, productName: product.name, amount: product.price, action: "approve" }),
              }).catch(console.error);
            },
            onReadyForServerCompletion: (paymentId: string, txid: string) => {
              fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, txid, productId: product.id, action: "complete" }),
              }).then(() => setStep("success")).catch(console.error);
            },
            onCancel: () => setStep("form"),
            onError: (error: Error) => { console.error("Pi payment error:", error); setStep("form"); },
          }
        );
      } catch {
        alert("Pi SDK not available. Please open this site in Pi Browser.");
      }
    } else {
      alert("Pi SDK not available. Please open this site in Pi Browser.");
    }
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    setTimeout(() => setStep("success"), 2500);
  };

  const whatsAppLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello DigiBoct, I'm interested in ${product.name}`)}`;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-filter backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg glass-card p-6 sm:p-8 overflow-y-auto max-h-[90vh]"
        >
          <button onClick={onClose} className="absolute top-4 end-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" id="checkout-close">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-white mb-2">{t.checkout.title}</h2>
                <p className="text-sm text-slate-400 mb-6">{t.checkout.subtitle}</p>

                {/* Order summary */}
                <div className="glass rounded-xl p-4 mb-6">
                  <div className="text-sm text-slate-400 mb-2">{t.checkout.orderSummary}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{product.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <span className="font-semibold text-slate-300">{t.checkout.total}</span>
                    <span className="text-2xl font-bold gradient-text">{product.price} {t.products.currency}</span>
                  </div>
                </div>

                {/* Pi Payment Button */}
                <button
                  onClick={handlePiPayment}
                  className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl font-semibold text-black hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 mb-4"
                  id="pay-with-pi"
                >
                  <span className="text-2xl font-bold">π</span>
                  {t.checkout.payWithPi}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-slate-500 uppercase">{t.checkout.orDivider}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Card Form */}
                <form onSubmit={handleCardPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">{t.checkout.nameLabel}</label>
                    <input type="text" required placeholder={t.checkout.namePlaceholder} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">{t.checkout.emailLabel}</label>
                    <input type="email" required placeholder={t.checkout.emailPlaceholder} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm transition-all duration-300" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">{t.checkout.cardLabel}</label>
                    <input type="text" required placeholder={t.checkout.cardPlaceholder} value={formData.card} onChange={(e) => setFormData({ ...formData, card: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm transition-all duration-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1.5">{t.checkout.expiryLabel}</label>
                      <input type="text" required placeholder={t.checkout.expiryPlaceholder} value={formData.expiry} onChange={(e) => setFormData({ ...formData, expiry: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm transition-all duration-300" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1.5">{t.checkout.cvcLabel}</label>
                      <input type="text" required placeholder={t.checkout.cvcPlaceholder} value={formData.cvc} onChange={(e) => setFormData({ ...formData, cvc: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm transition-all duration-300" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                    {t.checkout.payButton} — {product.price} {t.products.currency}
                  </button>
                </form>

                {/* WhatsApp Fallback */}
                <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-3 glass rounded-xl text-sm text-[#25D366] hover:bg-[#25D366]/10 transition-all duration-300 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  {t.checkout.whatsappFallback}
                </a>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="py-16 text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
                  <div className="absolute inset-3 rounded-full border-4 border-yellow-500 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t.checkout.processing}</h3>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="py-12 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">{t.checkout.successTitle}</h3>
                <p className="text-slate-400 mb-8 max-w-sm mx-auto">{t.checkout.successMessage}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-green-500/25 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2" id="checkout-download">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    {t.checkout.downloadButton}
                  </button>
                  <button onClick={() => { onClose(); setStep("form"); setFormData({ name: "", email: "", card: "", expiry: "", cvc: "" }); }} className="px-8 py-3 glass rounded-xl font-semibold text-slate-300 hover:text-white transition-all duration-300" id="checkout-back">
                    {t.checkout.backToStore}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
