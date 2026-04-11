import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export const Container = ({
  children,
  className,
  as: Component = "div",
  ...props
}: ContainerProps) => {
  return (
    <Component
      className={cn(
        "max-w-7xl mx-auto px-6 sm:px-10 lg:px-16",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
