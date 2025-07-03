"use client";
import React, { useEffect } from "react";
import FormErrors from "../form-errors";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { SelectContentProps } from "@radix-ui/react-select";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

interface FormSelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "children" | "value"
  > {
  errors?: string[];
  label?: string;
  icon?: React.ReactNode;
  optional?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  noOptionValue?: string;
  noOptionLabel?: React.ReactNode;
  children?: SelectContentProps["children"];
  onValueChange?: (value: string) => void;
}
export function FormSelect({
  errors,
  label,
  className,
  icon,
  optional,
  disabled,
  placeholder,
  value = "",
  defaultValue,
  noOptionValue = "none",
  noOptionLabel = "No options available",
  children,
  onValueChange,
  ...props
}: FormSelectProps) {
  const { pending } = useFormStatus();
  const [v, setV] = React.useState(value || defaultValue);

  return (
    <div
      className={cn(
        "label space-y-1 from-input font-[500] [&>.label]:text-sm",
        {
          "[&_.input]:pl-12": icon,
        },
        className
      )}
    >
      {label && (
        <Label className="label space-x-1">
          {label}
          {optional && (
            <span className="opacity-60 text-xs">{"(Optional)"}</span>
          )}
        </Label>
      )}
      <input value={v} name={props.name} onChange={() => {}} hidden />
      <Select
        onValueChange={(v) => {
          setV(v);
          onValueChange?.(v);
        }}
        disabled={disabled || pending}
        value={v}
      >
        <SelectTrigger>
          <SelectValue className="w-full" placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {!children || (Array.isArray(children) && !children.length) ? (
            <SelectItem value={noOptionValue} disabled>
              {noOptionLabel}
            </SelectItem>
          ) : (
            children
          )}
        </SelectContent>
      </Select>
      <div className="relative">
        {icon && (
          <span className="  absolute inset-y-0 left-0 grid w-12 place-content-center">
            {icon}
          </span>
        )}
      </div>
      <FormErrors errors={errors} />
    </div>
  );
}
