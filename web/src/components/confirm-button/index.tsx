"use client";
import { ButtonProps } from "../ui/button";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import React, { useEffect, useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import { toast } from "sonner";

export interface ConfirmButtonProps extends ButtonProps {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  toastMessage: string;
  action?: () => void | Promise<void>;
}

export function ConfirmButton({
  title = "Confirm",
  message = "this action is irreversible, are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  action = () => {},
  toastMessage,
  ...props
}: ConfirmButtonProps) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [disabled, setDisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen((p) => !p);
  };
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (open) {
      setDisabled(true);
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        setDisabled(false);
        clearInterval(interval);
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [open]);
  const handleSubmit: any = async (formData: FormData) => {
    try {
      await action();
      handleClose();
      toast.success(toastMessage);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button {...props} />
      </DialogTrigger>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle className="mb-4 flex items-center gap-2">
            <span>{title}</span>
            <CircleAlertIcon />
          </DialogTitle>
          <DialogDescription className=" mt-4">{message}</DialogDescription>
        </DialogHeader>
        <form
          action={handleSubmit}
          className="flex flex-1 flex-col gap-4 py-4 "
        >
          <div className="mt-auto flex items-center justify-end gap-4">
            {/* <DialogClose asChild> */}
            <Button type="button" variant="outline" onClick={handleClose}>
              {cancelText}
            </Button>
            {/* </DialogClose> */}
            <Button
              type="submit"
              className="flex items-center gap-2"
              disabled={disabled}
            >
              {disabled ? `Wait ${countdown} seconds` : confirmText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
