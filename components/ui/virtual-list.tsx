"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 60,
  className,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  estimateSize?: number;
  className?: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalSize = items.length * estimateSize;
  const overscan = 3;
  const startIndex = Math.max(0, Math.floor(scrollTop / estimateSize) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + viewportHeight) / estimateSize) + overscan,
  );

  return (
    <div
      ref={parentRef}
      className={className ?? "h-full overflow-auto"}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: totalSize, position: "relative", width: "100%" }}>
        {items.slice(startIndex, endIndex).map((item, offset) => {
          const index = startIndex + offset;
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: estimateSize,
                transform: `translateY(${index * estimateSize}px)`,
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
