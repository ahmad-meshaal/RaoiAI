import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Loader, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  aiPromptHint?: string;
  aiEndpoint?: string;
  aiBody?: Record<string, string>;
  shape?: "circle" | "rect";
};

export function ImageUploadWithAI({
  value,
  onChange,
  label = "الصورة",
  aiPromptHint = "وصف الصورة",
  aiEndpoint = "/api/ai/generate-avatar",
  aiBody = {},
  shape = "rect",
}: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const data = await res.json();
      onChange(data.url);
      setOpen(false);
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch (err) {
      toast({ title: "خطأ", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAiGenerate = async () => {
    if (!aiDescription.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال وصف للصورة", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiDescription, ...aiBody }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const data = await res.json();
      if (data.b64_json) {
        // Save as file and upload
        const blob = await fetch(`data:image/png;base64,${data.b64_json}`).then(r => r.blob());
        const file = new File([blob], "ai-generated.png", { type: "image/png" });
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        onChange(uploadData.url);
      } else if (data.url) {
        onChange(data.url);
      }
      setOpen(false);
      setAiDescription("");
      toast({ title: "تم توليد الصورة بنجاح" });
    } catch (err) {
      toast({ title: "خطأ", description: (err as Error).message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const isCircle = shape === "circle";

  return (
    <div className="space-y-2">
      {label && <Label className="text-right block">{label}</Label>}
      <div className="flex items-center gap-3">
        {value ? (
          <div className={`relative ${isCircle ? "w-20 h-20" : "w-24 h-32"}`}>
            <img
              src={value}
              alt="صورة"
              className={`w-full h-full object-cover ${isCircle ? "rounded-full" : "rounded-lg"} border-2 border-border`}
            />
            <button
              onClick={() => onChange("")}
              className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            className={`${isCircle ? "w-20 h-20 rounded-full" : "w-24 h-32 rounded-lg"} border-2 border-dashed border-border flex items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors`}
            onClick={() => setOpen(true)}
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {value ? "تغيير الصورة" : "إضافة صورة"}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="upload">
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1 gap-2">
                <Upload className="h-4 w-4" />
                رفع ملف
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" />
                توليد بالذكاء الاصطناعي
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">انقر لاختيار صورة</p>
                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP, GIF — حد 5MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-right block">{aiPromptHint}</Label>
                <Textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="مثال: شاب عربي يرتدي ملابس تقليدية في مدينة تاريخية..."
                  className="text-right min-h-[100px]"
                  disabled={generating}
                />
              </div>
              <Button
                type="button"
                onClick={handleAiGenerate}
                disabled={generating || !aiDescription.trim()}
                className="w-full gap-2"
              >
                {generating ? (
                  <><Loader className="h-4 w-4 animate-spin" /> جاري التوليد...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> توليد بالذكاء الاصطناعي</>
                )}
              </Button>
              {generating && (
                <p className="text-xs text-center text-muted-foreground">
                  قد يستغرق التوليد بضع ثوانٍ...
                </p>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
