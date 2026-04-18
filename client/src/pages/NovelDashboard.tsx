import { useNovel, useChapters, useCharacters, useCreateChapter, useDeleteNovel, useUpdateChapter, useUpdateNovel } from "@/hooks/use-novels";
import { useGeneratePlot } from "@/hooks/use-ai";
import { Layout } from "@/components/ui/Layout";
import { ImageUploadWithAI } from "@/components/ImageUploadWithAI";
import { LoadingPage, LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, Users, Wand2, FileText, ChevronLeft, Trash2, 
  Printer, PenTool, MoreVertical, Globe, Eye, ThumbsUp, ThumbsDown 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function NovelDashboard({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const { data: novel, isLoading: isNovelLoading } = useNovel(id);
  const { data: chapters, isLoading: isChaptersLoading } = useChapters(id);
  const { data: characters } = useCharacters(id);
  const [, setLocation] = useLocation();
  const deleteNovel = useDeleteNovel();
  const updateNovel = useUpdateNovel();
  const { toast } = useToast();

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishData, setPublishData] = useState({
    title: "",
    synopsis: "",
    coverUrl: ""
  });

  // Use useEffect to sync publishData when novel data is loaded
  useEffect(() => {
    if (novel) {
      setPublishData({
        title: novel.title,
        synopsis: novel.synopsis || "",
        coverUrl: novel.coverUrl || ""
      });
    }
  }, [novel]);

  if (isNovelLoading || isChaptersLoading) return <LoadingPage />;
  if (!novel) return <div className="p-8 text-center">الرواية غير موجودة</div>;

  const handlePublish = () => {
    updateNovel.mutate({ 
      id: novel.id, 
      novel: { 
        ...publishData,
        status: "published" 
      } 
    }, {
      onSuccess: () => {
        setPublishDialogOpen(false);
        toast({
          title: "تم نشر الرواية بنجاح",
          description: "يمكن للجميع الآن رؤية روايتك في صفحة الروايات",
        });
      }
    });
  };

  const handleUnpublish = () => {
    updateNovel.mutate({ 
      id: novel.id, 
      novel: { status: "draft" } 
    }, {
      onSuccess: () => {
        toast({
          title: "تم إلغاء النشر",
          description: "الرواية الآن في وضع المسودة",
        });
      }
    });
  };

  return (
    <Layout>
      <div className="min-h-screen pb-20">
        {/* Hero Header */}
        <header className="bg-card border-b py-6 md:py-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 px-4 sm:px-6 lg:px-8">
            <div className="flex gap-3 md:gap-6 items-start">
              {novel.coverUrl && (
                <img 
                  src={novel.coverUrl} 
                  alt={novel.title} 
                  className="w-20 h-28 md:w-32 md:h-48 object-cover rounded-lg shadow-md border bg-muted flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-2 md:mb-4">
                  <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm ui-font">
                    الرئيسية <ChevronLeft className="h-3 w-3" />
                  </Link>
                  <Badge variant="outline" className="ui-font bg-background/50">{novel.genre}</Badge>
                  {novel.status === "published" && (
                    <Badge className="bg-green-500 hover:bg-green-600 border-none gap-1">
                      <Globe className="h-3 w-3" />
                      منشور
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-foreground mb-2 md:mb-4 leading-tight">{novel.title}</h1>
                <p className="text-muted-foreground max-w-2xl text-sm md:text-lg leading-relaxed opacity-90 line-clamp-2 md:line-clamp-none">
                  {novel.synopsis}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              {novel.status === "published" ? (
                <Button 
                  onClick={handleUnpublish}
                  variant="outline"
                  className="gap-2 shadow-sm border-green-200 text-green-700 hover:bg-green-50"
                  disabled={updateNovel.isPending}
                >
                  <Globe className="h-4 w-4" />
                  إلغاء النشر
                </Button>
              ) : (
                <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 shadow-sm">
                      <Globe className="h-4 w-4" />
                      نشر الرواية
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="ui-font sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-right text-2xl">نشر الرواية</DialogTitle>
                      <DialogDescription className="text-right">
                        أكمل بيانات الرواية لتظهر بشكل احترافي في المكتبة العامة.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label className="text-right block">اسم الرواية</Label>
                        <Input 
                          value={publishData.title} 
                          onChange={e => setPublishData(prev => ({ ...prev, title: e.target.value }))}
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-right block">وصف الرواية (السينوبسيس)</Label>
                        <Textarea 
                          value={publishData.synopsis} 
                          onChange={e => setPublishData(prev => ({ ...prev, synopsis: e.target.value }))}
                          className="text-right min-h-[120px]"
                          placeholder="اكتب نبذة مشوقة عن روايتك هنا..."
                        />
                      </div>
                      <ImageUploadWithAI
                        value={publishData.coverUrl}
                        onChange={(url) => setPublishData(prev => ({ ...prev, coverUrl: url }))}
                        label="غلاف الرواية"
                        aiPromptHint="صف الغلاف الذي تريده للرواية"
                        aiEndpoint="/api/ai/generate-cover"
                        aiBody={{ title: publishData.title, genre: novel?.genre || "", synopsis: publishData.synopsis }}
                        shape="rect"
                      />
                    </div>
                    <DialogFooter className="sm:justify-start gap-2">
                      <Button 
                        onClick={handlePublish} 
                        disabled={updateNovel.isPending || !publishData.title || !publishData.synopsis}
                        className="w-full sm:w-auto"
                      >
                        {updateNovel.isPending ? "جاري النشر..." : "تأكيد النشر"}
                      </Button>
                      <Button variant="ghost" onClick={() => setPublishDialogOpen(false)}>إلغاء</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <Link href={`/novels/${id}/export`}>
                <Button variant="outline" className="gap-2 shadow-sm">
                  <Printer className="h-4 w-4" />
                  تصدير PDF
                </Button>
              </Link>
              
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => {
                  if(confirm("هل أنت متأكد من حذف هذه الرواية؟ لا يمكن التراجع عن هذا الإجراء.")) {
                    deleteNovel.mutate(id, { onSuccess: () => setLocation("/") });
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="py-4 md:py-8">
          <Tabs defaultValue="chapters" className="w-full">
            <div className="flex items-center justify-between mb-4 md:mb-8 overflow-x-auto pb-1 px-4 md:px-0">
              <TabsList className="bg-muted/50 p-1 h-auto flex-shrink-0">
                <TabsTrigger value="chapters" className="px-3 md:px-6 py-2 md:py-2.5 ui-font data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs md:text-sm">
                  <FileText className="h-3.5 w-3.5 md:h-4 md:w-4 ml-1 md:ml-2" />
                  الفصول
                </TabsTrigger>
                <TabsTrigger value="characters" className="px-3 md:px-6 py-2 md:py-2.5 ui-font data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs md:text-sm">
                  <Users className="h-3.5 w-3.5 md:h-4 md:w-4 ml-1 md:ml-2" />
                  الشخصيات
                </TabsTrigger>
                <TabsTrigger value="plot" className="px-3 md:px-6 py-2 md:py-2.5 ui-font data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs md:text-sm">
                  <Wand2 className="h-3.5 w-3.5 md:h-4 md:w-4 ml-1 md:ml-2" />
                  التخطيط الذكي
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chapters" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 px-4 md:px-0">
                {/* Chapter List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      فصول الرواية
                    </h2>
                    <CreateChapterDialog novelId={id} nextSequence={(chapters?.length || 0) + 1} />
                  </div>

                  <div className="space-y-3">
                    {chapters?.sort((a, b) => a.sequenceNumber - b.sequenceNumber).map((chapter) => (
                      <Link key={chapter.id} href={`/novels/${id}/editor/${chapter.id}`}>
                        <Card className="hover:border-primary/50 transition-all cursor-pointer group bg-card/50 hover:bg-card">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold font-mono text-sm">
                                {chapter.sequenceNumber}
                              </span>
                              <div>
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                  {chapter.title}
                                </h3>
                                <p className="text-xs text-muted-foreground ui-font mt-1">
                                  {chapter.content ? `${chapter.content.length} حرف` : "مسودة فارغة"}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary">
                              <PenTool className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    
                    {chapters?.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                        <p className="text-muted-foreground mb-4">لم تقم بإضافة أي فصل بعد</p>
                        <CreateChapterDialog novelId={id} nextSequence={1} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">إحصائيات الرواية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground ui-font">المشاهدات</span>
                        <span className="font-bold font-mono flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {novel.views || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground ui-font">الإعجابات</span>
                        <span className="font-bold font-mono flex items-center gap-1 text-green-600">
                          <ThumbsUp className="h-3 w-3" />
                          {novel.likes || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground ui-font">عدم الإعجاب</span>
                        <span className="font-bold font-mono flex items-center gap-1 text-destructive">
                          <ThumbsDown className="h-3 w-3" />
                          {novel.dislikes || 0}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-primary/10 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground ui-font text-xs">عدد الفصول</span>
                          <span className="font-bold font-mono text-xs">{chapters?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground ui-font text-xs">عدد الشخصيات</span>
                          <span className="font-bold font-mono text-xs">{characters?.length || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 dark:from-indigo-950/20 dark:to-purple-950/20 dark:border-indigo-900/50">
                    <h3 className="font-bold mb-2 text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      مساعد الذكاء الاصطناعي
                    </h3>
                    <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mb-4 ui-font leading-relaxed">
                      هل تواجه صعوبة في الاستمرار؟ دع الذكاء الاصطناعي يقترح عليك أحداث الفصل القادم.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full bg-white/50 border-indigo-200 text-indigo-700 hover:bg-white hover:text-indigo-800 ui-font"
                      onClick={() => document.querySelector<HTMLElement>('[value="plot"]')?.click()}
                    >
                      توليد أفكار
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="characters" className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-0">
              <CharactersView novelId={id} />
            </TabsContent>

            <TabsContent value="plot" className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-0">
              <AiPlotGenerator novel={novel} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

// Sub-components for better organization

function CreateChapterDialog({ novelId, nextSequence }: { novelId: number, nextSequence: number }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateChapter();
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ novelId, title, sequenceNumber: nextSequence }, {
      onSuccess: () => {
        setOpen(false);
        setTitle("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-md">
          <Plus className="h-4 w-4" />
          فصل جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="ui-font">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة فصل جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-right block">عنوان الفصل</Label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder={`الفصل ${nextSequence}`}
              required 
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-right block">الترتيب</Label>
            <Input value={nextSequence} disabled className="bg-muted text-center font-mono w-16" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "جاري الإضافة..." : "إنشاء"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CharactersView({ novelId }: { novelId: number }) {
  const { data: characters } = useCharacters(novelId);
  // Implementation of character CRUD would go here - simplified for this output
  return (
    <div className="bg-card rounded-xl border p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
      <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-bold mb-2">شخصيات الرواية</h3>
      <p className="text-muted-foreground mb-6">يمكنك إدارة ملفات الشخصيات وصفاتهم هنا.</p>
      <Link href={`/novels/${novelId}/characters`}>
        <Button>إدارة الشخصيات</Button>
      </Link>
    </div>
  );
}

function AiPlotGenerator({ novel }: { novel: any }) {
  const { mutate, isPending, data } = useGeneratePlot();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            مولد الحبكة الذكي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground ui-font">
            دع الذكاء الاصطناعي يقترح عليك هيكلاً كاملاً للرواية بناءً على العنوان والتصنيف.
          </p>
          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">العنوان:</span>
              <span className="font-bold">{novel.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">التصنيف:</span>
              <span className="font-bold">{novel.genre}</span>
            </div>
          </div>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
            onClick={() => mutate({ genre: novel.genre, theme: novel.synopsis })}
            disabled={isPending}
          >
            {isPending ? <LoadingSpinner text="" /> : <Wand2 className="h-4 w-4" />}
            {isPending ? "جاري التفكير..." : "توليد مقترح كامل"}
          </Button>
        </CardContent>
      </Card>

      {data && (
        <Card className="bg-purple-50/50 border-purple-100">
          <CardHeader>
            <CardTitle>المقترح المولد</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pl-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-purple-800 mb-2">الحبكة العامة</h4>
                  <p className="text-sm leading-relaxed">{data.plot}</p>
                </div>
                <div>
                  <h4 className="font-bold text-purple-800 mb-2">الشخصيات المقترحة</h4>
                  <ul className="space-y-2 text-sm">
                    {data.characters.map((char: any, i: number) => (
                      <li key={i} className="bg-white p-2 rounded border border-purple-100">
                        <span className="font-bold block">{char.name} ({char.role})</span>
                        <span className="text-muted-foreground">{char.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Plus } from "lucide-react";
