import type * as React from "react";
import { cn } from "@/lib/utils";

const LOGO_SIZES = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
} as const;

type LogoSize = keyof typeof LOGO_SIZES;

export interface LogoProps extends Omit<
  React.SVGProps<SVGSVGElement>,
  "color"
> {
  size?: LogoSize | number;
  strokeColor?: string;
  strokeWidth?: number;
}

export default function Logo({
  size = "md",
  strokeColor = "currentColor",
  strokeWidth = 59.4403,
  className,
  style,
  ...props
}: LogoProps) {
  const numericSizeStyle =
    typeof size === "number" ? { width: size, height: size } : undefined;

  return (
    <svg
      className={cn(
        "shrink-0 text-foreground",
        typeof size === "string" ? LOGO_SIZES[size] : undefined,
        className,
      )}
      clipRule="evenodd"
      fillRule="nonzero"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      viewBox="0 0 1024 1024"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      style={{ ...numericSizeStyle, ...style }}
      {...props}
    >
      <title>Priko logo</title>
      <g id="Layer-2">
        <g opacity={1}>
          <path
            d="M296.439 775.299C283.658 654.493 269.489 533.826 258.096 412.882C246.157 286.147 364.935 223.838 473.74 257.928C516.247 271.245 567.271 303.019 573.793 352.006C588.81 464.812 464.818 531.901 368.674 525.713C214.653 515.799 124.762 439.454 32.6095 323.336"
            fill="none"
            opacity={1}
            stroke={strokeColor}
            strokeLinecap="butt"
            strokeWidth={strokeWidth}
          />
          <path
            d="M337.298 587.699C337.298 587.699 420.67 698.895 570.012 735.955"
            fill="none"
            opacity={1}
            stroke={strokeColor}
            strokeLinecap="butt"
            strokeWidth={strokeWidth}
          />
          <path
            d="M591.12 575.925C591.12 511.236 643.561 458.795 708.25 458.795C772.939 458.795 825.38 511.236 825.38 575.925C825.38 640.614 772.939 693.055 708.25 693.055C643.561 693.055 591.12 640.614 591.12 575.925Z"
            fill="none"
            opacity={1}
            stroke={strokeColor}
            strokeLinecap="butt"
            strokeWidth={strokeWidth}
          />
          <path
            d="M754.742 392.879C754.742 369.852 765.757 347.036 765.757 324.717"
            fill="none"
            opacity={1}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <path
            d="M843.825 430.91C841.565 426.39 899.34 363.785 908.125 354.848"
            fill="none"
            opacity={1}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <path
            d="M908.125 512C935.664 504.461 963.866 486.32 993.139 486.32"
            fill="none"
            opacity={1}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </g>
      </g>
    </svg>
  );
}
