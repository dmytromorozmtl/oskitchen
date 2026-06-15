import { useRouter } from "next/navigation";
import { useRef } from "react";

export function usePrefetchData(url: string) {
  const router = useRouter();
  const prefetched = useRef(false);

  function prefetch() {
    if (prefetched.current) return;
    router.prefetch(url);
    prefetched.current = true;
  }

  return {
    onMouseEnter: prefetch,
    onTouchStart: prefetch,
  };
}
