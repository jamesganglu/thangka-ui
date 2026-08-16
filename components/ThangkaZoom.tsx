"use client";

import { useEffect, useRef } from "react";
import ImageZoom from "js-image-zoom";

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

    function setup() {
      if (!container) return;
      zoom?.kill();
      zoom = new ImageZoom(container, {
        width: container.offsetWidth,
        height: container.offsetHeight,
        zoomPosition: "original",
        // Slightly larger than the container so the zoomed overlay always
        // fully covers it, while keeping the lens (and therefore the
        // pannable range) as large as possible.
        zoomWidth: container.offsetWidth * 1.05,
      });
    }

    setup();

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
