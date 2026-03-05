/**
 * Převede křestní jméno do 5. pádu (vokativu) pro oslovení.
 * Portováno z public/js/common.js → toVocative()
 */
export function toVocative(jmeno: string | null | undefined): string {
  if (!jmeno) return '';
  const name = jmeno.trim();
  if (name.length < 2) return name;
  const lower = name.toLowerCase();
  const isVowel = (c: string) => 'aeiouáéíóúěůyý'.includes(c);

  // Ženská jména: -a → -o  (Jana→Jano, Eva→Evo, Markéta→Markéto)
  if (lower.endsWith('a')) return name.slice(0, -1) + 'o';

  // Jména na -e / -ie (Marie, Lucie) → beze změny
  if (lower.endsWith('e')) return name;

  // Pohyblivé e: -[C]el → -[C]le  (Pavel→Pavle, Karel→Karle)
  // ale Daniel (i-el) → Daniele  (před 'el' je samohláska)
  if (lower.endsWith('el')) {
    const beforeEl = lower[lower.length - 3];
    return (beforeEl && !isVowel(beforeEl))
      ? name.slice(0, -2) + 'le'   // Pavel→Pavle
      : name + 'e';                 // Daniel→Daniele
  }

  // Pohyblivé e: -[C]ek → -[C]ku  (Marek→Marku, Radek→Radku)
  if (lower.endsWith('ek')) {
    const beforeEk = lower[lower.length - 3];
    return (beforeEk && !isVowel(beforeEk))
      ? name.slice(0, -2) + 'ku'   // Marek→Marku
      : name + 'u';
  }

  // Mužská jména dle poslední hlásky
  const last = lower.slice(-1);
  if (last === 'k') return name + 'u';
  if (last === 'l') return name + 'e';
  if (last === 'n') return name + 'e';
  if (last === 'm') return name + 'e';
  if (last === 'b') return name + 'e';
  if (last === 'd') return name + 'e';
  if (last === 'p') return name + 'e';
  if (last === 'r') return name + 'e';
  if (last === 't') return name + 'e';
  if (last === 'f') return name + 'e';
  if (last === 'j') return name + 'i';
  if (['š', 'ž', 'č', 'ř'].includes(last)) return name + 'i';

  return name; // fallback (Jiří, cizí jména…)
}
