import { MotionButton } from "@/components/motion/MotionButton";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof MotionButton>;

export function Button(props: ButtonProps) {
  return <MotionButton {...props} />;
}
