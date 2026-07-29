/**
 * Premium unlock state.
 *
 * Premium templates render exactly like the free ones — the user can pick any
 * of them and see their own CV in that design — but exporting is blocked until
 * the template is unlocked.
 *
 * The USDT checkout is not built yet, so nothing ever unlocks in practice.
 * Everything the rest of the app needs already goes through `isUnlocked`, so
 * wiring the payment later means making `unlockTemplate` reachable from a
 * verified transaction instead of touching the editor.
 */

const STORAGE_KEY = "genecv:unlocked";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function isUnlocked(templateId: string): boolean {
  return read().includes(templateId);
}

/**
 * Not called from anywhere yet. It will be the callback of the payment flow,
 * and must only ever run after a confirmed transaction — storing the unlock in
 * localStorage is a convenience for the browser that paid, not a security
 * boundary.
 */
export function unlockTemplate(templateId: string) {
  if (typeof window === "undefined") return;
  try {
    const current = read();
    if (current.includes(templateId)) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...current, templateId]),
    );
  } catch {
    // Storage unavailable — the template simply stays locked.
  }
}
