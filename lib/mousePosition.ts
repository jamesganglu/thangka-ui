// Tracks the last known cursor position across client-side navigations.
// Next.js App Router swaps page content without a full reload, so this
// module-level listener (attached once, on first load) keeps working
// across route changes — unlike a per-page effect, which only starts
// listening after that page has already mounted.
let x = -1;
let y = -1;

if (typeof window !== "undefined") {
  window.addEventListener(
    "mousemove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
    },
    { passive: true }
  );
}

export function getLastMousePosition() {
  return { x, y };
}
