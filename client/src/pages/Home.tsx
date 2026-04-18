import { useNovels, useCreateNovel } from "@/hooks/use-novels";
import { Layout } from "@/components/ui/Layout";
import { LoadingPage } from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Book, Calendar, ChevronLeft, Trash2, Settings as SettingsIcon } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Home() {
  const { data: novels, isLoading } = useNovels();
  
  if (isLoading) return <LoadingPage />;

  return (
    <Layout>
      <div className="py-4 md:py-12 px-4 md:px-0 space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">مكتبة الروايات</h1>
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="mt-[-8px]">
                  <SettingsIcon className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-muted-foreground text-lg">كل القصص العظيمة تبدأ بفكرة.</p>
          </div>
          <CreateNovelDialog />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels?.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}

          {novels?.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl bg-card/30">
              <Book className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">لا توجد روايات بعد</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                لم تقم بكتابة أي رواية حتى الآن. ابدأ رحلتك الأدبية بإنشاء روايتك الأولى.
              </p>
              <CreateNovelDialog />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function NovelCard({ novel }: { novel: any }) {
  return (
    <Link href={`/novels/${novel.id}`} className="group block">
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 overflow-hidden bg-card border-border/60">
        <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full ui-font font-medium">
              {novel.genre}
            </div>
            {novel.status === "completed" && (
              <span className="text-green-600 text-xs font-bold ui-font">مكتملة</span>
            )}
          </div>
          <CardTitle className="text-2xl mt-2 group-hover:text-primary transition-colors line-clamp-1 leading-normal">
            {novel.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {novel.synopsis || "لا يوجد ملخص..."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground border-t bg-muted/20 p-4">
          <div className="flex items-center gap-1 ui-font">
            <Calendar className="h-3 w-3" />
            <span>{novel.createdAt ? format(new Date(novel.createdAt), "PPP", { locale: ar }) : ""}</span>
          </div>
          <div className="flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
            <span>فتح الرواية</span>
            <ChevronLeft className="h-3 w-3" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

function CreateNovelDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateNovel();
  const [formData, setFormData] = useState({ title: "", genre: "", synopsis: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ title: "", genre: "", synopsis: "" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="ui-font font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <Plus className="h-5 w-5 ml-2" />
          رواية جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] ui-font">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-right">مشروع أدبي جديد</DialogTitle>
          <DialogDescription className="text-right">
            املأ البيانات الأساسية لروايتك. يمكنك تعديلها لاحقاً.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-right block">عنوان الرواية</Label>
            <Input 
              id="title" 
              required
              placeholder="مثال: أرض زيكولا" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genre" className="text-right block">التصنيف الأدبي</Label>
            <Input 
              id="genre" 
              required
              placeholder="مثال: خيال، تاريخي، دراما..." 
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="synopsis" className="text-right block">ملخص قصير</Label>
            <Textarea 
              id="synopsis" 
              placeholder="عن ماذا تدور القصة؟" 
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="text-right min-h-[100px]"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "جاري الإنشاء..." : "بدء الكتابة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
