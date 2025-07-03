import { cn } from "@/lib/utils";
import React from "react";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}
export function Table({ className, children, ...props }: TableProps) {
  return (
    <table
      className={cn(
        "table [&_*]:whitespace-nowrap table-auto [&_td]:py-2 [&_td]:px-2 md:[&_td]:px-4 [&_th]:p-4 [&_th]:text-left [&_th]:first-letter:uppercase [&_th]:font-semibold divide-y  even:[&>tbody>tr]:bg-foreground/5 ",
        className
      )}
      {...props}
    >
      {children}
    </table>
  );
}
