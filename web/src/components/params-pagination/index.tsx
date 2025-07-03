"use client";
import React from "react";
import Pagination, { PaginationProps } from "../pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ParamsPagination({ total }: { total: number }) {
  const router = useRouter();
  const query = useSearchParams();
  const pathname = usePathname();

  const page = parseInt(query.get("page") || "1");
  const perPage = parseInt(query.get("perPage") || "10");
  const changePage = ({ page, perPage }: { page: number; perPage: number }) => {
    const params = new URLSearchParams(query.toString());
    params.set("page", page.toString());
    params.set("perPage", perPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <Pagination
      total={total}
      value={{
        page,
        perPage,
      }}
      onChange={changePage}
    />
  );
}
