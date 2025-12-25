import * as React from "react";
import { cn } from "@/lib/utils"; // Standard shadcn utility
import Image from "next/image";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <Image
      src="/Q.svg"
      alt="Sequence3 Logo"
      width={26}
      height={26}
    />
  );
}
