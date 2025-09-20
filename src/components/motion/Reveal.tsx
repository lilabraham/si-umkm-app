// LOKASI FILE: src/components/motion/Reveal.tsx
import React from "react";
import { motion, type MotionProps } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "fade";

interface RevealProps extends MotionProps {
  /** Elemen/komponen target (default: 'div') */
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;

  /** Opsi animasi umum */
  delay?: number;        // default 0
  duration?: number;     // default 0.6
  distance?: number;     // default 24 (dipakai bila x/y tidak diberikan)
  once?: boolean;        // animasi hanya sekali saat masuk viewport
  direction?: Direction; // default 'up'
  viewportAmount?: number; // default 0.2 (seberapa banyak elemen masuk viewport sebelum animasi jalan)

  /** Offset manual (opsional). Jika diberikan, override 'direction' */
  x?: number;
  y?: number;
}

const Reveal: React.FC<RevealProps> = ({
  as: Component = "div",
  className,
  children,
  delay = 0,
  duration = 0.6,
  distance = 24,
  once = true,
  direction = "up",
  viewportAmount = 0.2,
  x,
  y,
  ...rest
}) => {
  const from: any = { opacity: 0 };
  const to: any = {
    opacity: 1,
    transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
  };

  if (typeof x === "number" || typeof y === "number") {
    if (typeof x === "number") from.x = x;
    if (typeof y === "number") from.y = y;
    to.x = 0;
    to.y = 0;
  } else {
    switch (direction) {
      case "up":
        from.y = distance;
        to.y = 0;
        break;
      case "down":
        from.y = -distance;
        to.y = 0;
        break;
      case "left":
        from.x = distance;
        to.x = 0;
        break;
      case "right":
        from.x = -distance;
        to.x = 0;
        break;
      case "fade":
      default:
        // hanya fade (tanpa translasi)
        break;
    }
  }

  // Buat komponen motion dari elemen dinamis
  const MotionEl: any = (motion as any)(Component as any);

  return (
    <MotionEl
      initial={from}
      whileInView={to}
      viewport={{ once, amount: viewportAmount }}
      className={className}
      {...rest}
    >
      {children}
    </MotionEl>
  );
};

export type { RevealProps };
export default Reveal;
