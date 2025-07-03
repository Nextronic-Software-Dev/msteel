"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input, InputProps } from "@/components/ui/input";
import FormErrors from "../form-errors";
import { useFormStatus } from "react-dom";
import { Checkbox } from "../ui/checkbox";

interface FormInputProps extends InputProps {
  errors?: string[];
  label?: string;
  icon?: React.ReactNode;
  optional?: boolean;
}
export default function FormCheckbox({
  errors,
  label,
  className,
  icon,
  optional,
  disabled,
  ...props
}: FormInputProps) {
  const { pending } = useFormStatus();
  return (
    <div
      className={cn(
        "label space-y-1 from-input font-[500] [&>.label]:text-sm transition-[grid-template-rows]",
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
      <div className="relative">
        <Checkbox />
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
