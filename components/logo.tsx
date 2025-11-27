import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const Logo = ({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) => {
  return (
    <Link href="/" className={cn("flex items-center gap-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-transparent",
          className
        )}
      >
        <Image
          src="/logo.png"
          alt="Collybrix"
          width={size}
          height={size}
          className="object-contain bg-transparent"
        />
      </div>
    </Link>
  );
};
