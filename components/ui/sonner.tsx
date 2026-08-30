"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-lg !border !border-border !bg-card !text-foreground !shadow-md",
          title: "!text-sm !font-semibold",
          description: "!text-sm !text-muted-foreground",
          actionButton: "!bg-brand-800 !text-white",
          cancelButton: "!bg-muted !text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
