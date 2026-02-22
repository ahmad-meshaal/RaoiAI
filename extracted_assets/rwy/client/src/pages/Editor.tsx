import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useChapter, useUpdateChapter, useChapters } from "@/hooks/use-novels";
import { useGenerateChapter } from "@/hooks/use-ai";
import { LoadingPage, LoadingSpinner } from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Save, Wand2, ArrowRight, ArrowLeft, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Editor() {
  const { novelId, chapterId } = useParams();
  const nId = parseInt(novelId!);
  const cId = parseInt(chapterId!);
  
  const { data: chapter, isLoading } = useChapter(cId);
  const { data: allChapters } = useChapters(nId);
  const updateChapter = useUpdateChapter();
  const generateChapter = useGenerateChapter();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [outline, setOutline] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => {
    if (chapter) {
      setContent(chapter.content || "");
      setOutline(chapter.outline || "");
    }
  }, [chapter]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (content !== chapter?.content) {
        handleSave(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [content, chapter]);

  const handleSave = (silent = false) => {
    updateChapter.mutate(
      { id: cId, content, outline }, 
      {
        onSuccess: () => {
          if (!silent) toast({ title: "تم الحفظ", description: "تم حفظ المسودة بنجاح" });
        }
      }
    );
  };

  const handleAiGenerate = () => {
    if (!chapter) return;
    generateChapter.mutate({
      novelId: nId,
      chapterTitle: chapter.title,
      outline: outline,
      previousChapterContent: "" // In a real app, fetch previous chapter content
    }, {
      onSuccess: (data) => {
        setContent(prev => prev + "\n\n" + data.content);
        setShowAiPanel(false);
        toast({ title: "تم التوليد", description: "تمت إضافة النص المولد إلى المحرر" });
      }
    });
  };

  if (isLoading || !chapter) return <LoadingPage />;

  const sortedChapters = allChapters?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) || [];
  const currentIndex = sortedChapters.findIndex(c => c.id === cId);
  const prevChapter = sortedChapters[currentIndex - 1];
  const nextChapter = sortedChapters[currentIndex + 1];

  return (
    <div className="h-screen flex flex-col bg-[#FDFBF7]">
      {/* Top Bar */}
      <header className="h-16 border-b flex items-center justify-between px-4 bg-white/80 backdrop-blur sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/novels/${nId}`}>
            <Button variant="ghost" size="sm" className="ui-font text-muted-foreground hover:text-primary">
              <ChevronRight className="h-4 w-4 ml-1" />
              العودة للوحة التحكم
            </Button>
          </Link>
          <div className="h-6 w-px bg-border/50 mx-2" />
          <h1 className="font-heading font-bold text-lg text-foreground truncate max-w-[200px] md:max-w-md">
            {chapter.title}
          </h1>
          <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground ui-font">
            فصل {chapter.sequenceNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:inline-block ui-font ml-4">
            {updateChapter.isPending ? "جاري الحفظ..." : "تم الحفظ"}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="ui-font border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Wand2 className="h-4 w-4 ml-2" />
            مساعد AI
          </Button>
          <Button onClick={() => handleSave()} disabled={updateChapter.isPending} className="ui-font min-w-[100px]">
            <Save className="h-4 w-4 ml-2" />
            حفظ
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Editor Area */}
        <main className="flex-1 overflow-y-auto relative bg-[#FDFBF7] w-full">
          <div className="max-w-3xl mx-auto py-12 px-4 sm:px-8 min-h-full bg-white shadow-sm border-x border-dashed border-stone-200 w-full box-border">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ابدأ الكتابة هنا..."
              className="w-full h-full min-h-[calc(100vh-200px)] resize-none border-none focus-visible:ring-0 p-0 text-lg md:text-xl leading-loose font-body bg-transparent placeholder:text-stone-300 block box-border"
              spellCheck={false}
            />
          </div>
          
          {/* Navigation Footer */}
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between gap-4 py-8 px-4 sm:px-8">
            {prevChapter ? (
              <Link href={`/novels/${nId}/editor/${prevChapter.id}`}>
                <Button variant="ghost" className="text-muted-foreground hover:text-primary ui-font">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  الفصل السابق: {prevChapter.title}
                </Button>
              </Link>
            ) : <div />}
            
            {nextChapter ? (
              <Link href={`/novels/${nId}/editor/${nextChapter.id}`}>
                <Button variant="ghost" className="text-muted-foreground hover:text-primary ui-font">
                  الفصل التالي: {nextChapter.title}
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" disabled className="text-muted-foreground/30 ui-font">
                نهاية الفصول
              </Button>
            )}
          </div>
        </main>

        {/* AI Assistant Sidebar */}
        {showAiPanel && (
          <aside className="w-80 border-r bg-white shadow-xl z-20 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b bg-purple-50/50">
              <h3 className="font-bold flex items-center gap-2 text-purple-900">
                <Wand2 className="h-4 w-4" />
                المساعد الذكي
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium ui-font">مخطط الفصل (Outline)</label>
                <Textarea 
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  placeholder="اكتب نقاطاً رئيسية لهذا الفصل ليساعدك الذكاء الاصطناعي..."
                  className="h-32 text-sm bg-stone-50"
                />
              </div>

              <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                <h4 className="font-bold text-sm mb-2">اقتراحات الكتابة</h4>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  سيقوم الذكاء الاصطناعي بقراءة المخطط ومحاولة كتابة مشهد بناءً عليه.
                </p>
                <Button 
                  onClick={handleAiGenerate} 
                  disabled={generateChapter.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {generateChapter.isPending ? <LoadingSpinner text="" /> : "توليد نص"}
                </Button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
