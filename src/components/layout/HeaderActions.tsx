import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Renders its children into the page header (next to the bell), so a screen's primary action sits on the title row. */
export function HeaderActions({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.getElementById("header-actions")), []);
  return el ? createPortal(children, el) : null;
}
