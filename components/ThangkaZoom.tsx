"use client";

import { useEffect, useRef } from "react";
import ImageZoom from "js-image-zoom";
import { getLastMousePosition } from "@/lib/mousePosition";

interface Props {
  src: string;
  alt: string;
}

export default function ThangkaZoom({ src, alt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let zoom: ImageZoom | null = null;
    let lastWidth = 0;
    let lastHeight = 0;

    function setup() {
      if (!container) return;
      const { offsetWidth: width, offsetHeight: height } = container;
      // ResizeObserver fires once immediately on observe() even when
      // nothing has actually changed, and can also fire from our own
      // DOM churn below — skip re-creating the zoom instance unless the
      // size genuinely moved, otherwise it tears down and rebuilds the
      // overlay mid-interaction (visible as a jump/shake on first hover).
      if (Math.abs(width - lastWidth) < 1 && Math.abs(height - lastHeight) < 1) return;
      lastWidth = width;
      lastHeight = height;

      zoom?.kill();
      zoom = new ImageZoom(container, {
        width,
        height,
        zoomPosition: "original",
        // Slightly larger than the container so the zoomed overlay always
        // fully covers it, while keeping the lens (and therefore the
        // pannable range) as large as possible.
        zoomWidth: width * 1.05,
      });

      // "mouseenter" only fires on an actual crossing of the boundary —
      // if the cursor was already resting over the image before this
      // component mounted (e.g. it was over the thumbnail that linked
      // here), it never fires, so the overlay stays hidden until the
      // user moves out and back in. Detect that case using the last
      // tracked cursor position and kick the library into the right
      // state, including the correct initial pan position.
      const { x, y } = getLastMousePosition();
      if (x >= 0 && y >= 0 && container.contains(document.elementFromPoint(x, y))) {
        container.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false, clientX: x, clientY: y }));
        container.dispatchEvent(new MouseEvent("mousemove", { bubbles: false, clientX: x, clientY: y }));
      }
    }

    const observer = new ResizeObserver(() => setup());
    observer.observe(container);

    return () => {
      observer.disconnect();
      zoom?.kill();
    };
  }, [src]);

  return (
    <div ref={containerRef} className="thangka-zoom">
      <img src={src} alt={alt} className="thangka-zoom-img" />
    </div>
  );
}
