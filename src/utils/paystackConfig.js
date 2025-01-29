const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
import PaystackPop from "@paystack/inline-js";

export const initializePaystack = (data) => {
  return new Promise((resolve, reject) => {
    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: data.email,
      amount: data.amount * 100, // Paystack expects amount in kobo
      ref: data.reference,
      callback: (response) => {
        resolve(response);
      },
      onClose: () => {
        reject(new Error("Payment cancelled"));
      },
    });
    handler.openIframe();
  });
};
