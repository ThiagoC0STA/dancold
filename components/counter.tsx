"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

export function Counter({
  to,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => {
        node.textContent = `${prefix}${Math.round(value).toLocaleString()}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
