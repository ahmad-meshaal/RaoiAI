import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "جاري التحميل..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] h-full w-full animate-in fade-in duration-300">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground ui-font animate-pulse">{text}</p>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <LoadingSpinner text="جاري تجهيز المرسم..." />
    </div>
  );
}
