import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-0">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-transparent">
        <Image
          src="/logo.png"
          alt="Collybrix"
          width={64}
          height={64}
          // style={{ display: "var(--display-light)" }}
          className="object-contain bg-transparent"
        />
        {/* <Image
            src="/logo-dark.png"
            alt="Collybrix"
            width={64}
            height={64}
            style={{ display: "var(--display-dark)" }}
            className="object-contain bg-transparent"
          /> */}
      </div>
    </Link>
  );
};
