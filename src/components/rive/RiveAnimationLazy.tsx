"use client";

import dynamic from "next/dynamic";
import type { RiveAnimationProps } from "./RiveAnimation";

export const RiveAnimationLazy = dynamic<RiveAnimationProps>(
  () => import("./RiveAnimation").then((mod) => mod.RiveAnimation),
  {
    ssr: false,
    loading: () => null,
  }
);
