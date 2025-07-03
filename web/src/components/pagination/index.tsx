"use client";

import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PaginationProps = {
  total: number;
  offset?: number;
  value: {
    page: number;
    perPage: number;
  };
  style?: React.CSSProperties;
  showPerPage?: boolean;
  showTotal?: boolean;
  onChange?: (value: { page: number; perPage: number }) => void;
};

function Pagination({
  total,
  offset = 2,
  onChange,
  showPerPage = true,
  showTotal = true,
  ...props
}: PaginationProps) {
  const [{ page, perPage }, setValue] = useState(
    props.value || { page: 1, perPage: 10 }
  );

  const max = Math.ceil(total / perPage);
  const pages = Array.from({ length: max }, (_, i) => i + 1);

  const showPages = pages.slice(
    Math.max(0, page - offset - 1),
    Math.min(page + offset, max)
  );

  const changePage = (p: number) => {
    if (page < 1 || page > max) return;
    setValue({ page: p, perPage });
    if (onChange) onChange({ page: p, perPage });
  };

  const changePerPage = (p: number) => {
    setValue({ page: 1, perPage: p });
    if (onChange) onChange({ page: 1, perPage: p });
  };

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);
  return (
    <div className="flex items-center flex-wrap gap-4 text-sm ">
      {showTotal && (
        <div className="hidden lg:inline-block text-xs">
          Total <b>{total}</b> items
        </div>
      )}
      <div className="flex gap-1 items-center">
        <Button
          variant="ghost"
          className="h-7 px-1 min-w-7"
          disabled={!total || page === 1}
          onClick={() => changePage(page - 1)}
        >
          <ChevronLeftIcon size={18} />
        </Button>
        {page > offset + 1 && (
          <>
            <Button
              className="h-7 px-1 min-w-7"
              variant="ghost"
              onClick={() => changePage(1)}
            >
              1
            </Button>
          </>
        )}

        {page > offset + 2 && (
          <span className="pointer-events-none p-1.5">
            <EllipsisIcon />
          </span>
        )}
        {showPages.map((p, i) => (
          <Button
            key={i}
            onClick={() => changePage(p)}
            variant={p === page ? "default" : "ghost"}
            className={cn("h-7 px-1 min-w-7", {
              "pointer-events-none": p === page,
            })}
          >
            {p}
          </Button>
        ))}
        {page < max - offset - 1 && (
          <span className="pointer-events-none py-1.5">
            <EllipsisIcon />
          </span>
        )}
        {page < max - offset && (
          <>
            <Button
              className="h-7 px-1 min-w-7"
              variant="ghost"
              onClick={() => changePage(max)}
            >
              {max}
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          className="h-7 px-1 min-w-7"
          disabled={!total || page === max}
          onClick={() => changePage(page + 1)}
        >
          <ChevronRightIcon size={18} />
        </Button>
      </div>
      {showPerPage && (
        <Select
          value={perPage.toString()}
          onValueChange={(val) => changePerPage(+val)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select " />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 / page</SelectItem>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export default Pagination;
