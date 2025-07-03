import React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export interface FormErrorsProps {
  errors?: string[];
  className?: string;
}

export default function FormErrors({ errors, ...props }: FormErrorsProps) {
  if (!errors?.length) return null;
  return (
    <Alert variant="destructive" {...props}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-inside list-disc">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
