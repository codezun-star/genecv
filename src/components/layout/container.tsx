import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentProps<"div"> & {
  size?: "narrow" | "default" | "wide";
};

const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-[88rem]",
};

export function Container({
  className,
  size = "default",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size], className)}
      {...props}
    />
  );
}
