import { cn } from "@/lib/utils";
import Link from "next/link";

export function LinkItem({
  href,
  icon,
  className,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  // const pathname = usePathname();
  // const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cn(
        "flex gap-3 items-center  px-2 py-1 rounded-sm transition-colors duration-300",
        className
      )}
    >
      <span>{icon}</span>
      {children}
    </Link>
  );
}
