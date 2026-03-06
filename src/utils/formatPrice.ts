/**
 * Formátuje cenu s mezerou jako oddělovačem tisíců.
 * formatPrice(7900) → "7 900 Kč"
 * formatPrice(150)  → "150 Kč"
 */
export const formatPrice = (n: number): string =>
  n.toLocaleString('cs-CZ') + ' Kč';
