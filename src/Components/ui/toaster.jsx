import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/Components/ui/toast.jsx";
import { CopyCheck } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} className="bg-white font-mono text-black">
          <div className="grid gap-1">
            {title && (
              <div className="flex gap-2 text-green-600">
                <ToastTitle >{title}</ToastTitle>
                <CopyCheck className="text-sm" />
              </div>
            )}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
