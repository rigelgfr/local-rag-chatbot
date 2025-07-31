import { Loader2 } from "lucide-react";
import React from "react";
import clsx from "clsx";

type LoadingProps = {
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export const Loading: React.FC<LoadingProps> = ({ size = "md" }) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader2
        className={clsx(
          "animate-spin",
          "text-black-2 dark:text-aquamarine",
          sizeMap[size]
        )}
      />
    </div>
  );
};

export function DotLoading() {
  return (
    <div className="flex gap-1 py-2">
      <div className="w-3 h-3 rounded-full animate-pulse bg-black-2 dark:bg-aquamarine"></div>
      <div className="w-3 h-3 rounded-full animate-pulse bg-black-2 dark:bg-aquamarine"></div>
      <div className="w-3 h-3 rounded-full animate-pulse bg-black-2 dark:bg-aquamarine"></div>
    </div>
  );
}
