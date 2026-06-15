"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type ComponentProps } from "react";

type PrefetchLinkProps = ComponentProps<typeof Link>;

export function PrefetchLink({ href, children, className, onMouseEnter, onTouchStart, ...rest }: PrefetchLinkProps) {
  const router = useRouter();
  const prefetched = useRef(false);
  const hrefStr = typeof href === "string" ? href : href.pathname ?? "";

  function prefetch() {
    if (prefetched.current || !hrefStr) return;
    router.prefetch(hrefStr);
    prefetched.current = true;
  }

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={(e) => {
        prefetch();
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        prefetch();
        onTouchStart?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
