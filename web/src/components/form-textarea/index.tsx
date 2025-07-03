"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import FormErrors from "../form-errors";
import { useFormStatus } from "react-dom";
import { TextareaProps, Textarea } from "../ui/textarea";

interface FormInputProps extends TextareaProps {
  errors?: string[];
  label?: string;
  icon?: React.ReactNode;
}
export default function FormTextarea({
  errors,
  label,
  className,
  icon,
  disabled,
  ...props
}: FormInputProps) {
  const { pending } = useFormStatus();
  return (
    <div
      className={cn(
        "label space-y-2 from-input font-[500] [&>.label]:text-sm",
        {
          "[&_.input]:pl-12": icon,
        },
        className
      )}
    >
      {label && <Label className="label">{label}</Label>}
      <div className="relative">
        <Textarea
          className="w-full input "
          {...props}
          disabled={pending || disabled}
        />
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
