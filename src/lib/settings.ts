// src/lib/settings.ts

export function getSettings() {
  if (typeof window === "undefined") {
    return { currency: "TND", symbol: "د.ت", language: "ar", usdRate: 3.1 };
  }
  const saved = localStorage.getItem("mizan_settings");
  if (saved) {
    return JSON.parse(saved);
  }
  return { currency: "TND", symbol: "د.ت", language: "ar", usdRate: 3.1 };
}

export function formatCurrency(amount: number): string {
  const settings = getSettings();
  return `${amount.toLocaleString("ar-TN")} ${settings.symbol}`;
}