import { useNovels } from "@/hooks/use-novels";
import { Layout } from "@/components/ui/Layout";
import { LoadingPage } from "@/components/ui/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function PublicNovels() {
  const { data: novels, isLoading } = useNovels();

  if (isLoading) return <LoadingPage />;

  const publishedNovels = novels?.filter(n => n.status === "published") || [];

  const handleAction = async (id: number, action: 'view' | 'like' | 'dislike', increment = true) => {
    await apiRequest("POST", `/api/novels/${id}/${action}`, { increment });
    queryClient.invalidateQueries({ queryKey: ["/api/novels"] });
  };

  return (
    <Layout>
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">مكتبة الروايات</h1>
            <p className="text-muted-foreground text-lg">استكشف أحدث الروايات المنشورة من قبل كتابنا.</p>
          </div>
        </div>

        {publishedNovels.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border-2 border-dashed">
            <BookOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">لا توجد روايات منشورة بعد</h2>
            <p className="text-muted-foreground">كن أول من ينشر روايته في المنصة!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedNovels.map((novel) => (
              <Card key={novel.id} className="group hover:shadow-xl transition-all duration-300 border-primary/10 overflow-hidden flex flex-col">
                <div className="aspect-[2/3] w-full bg-muted relative overflow-hidden">
                  {novel.coverUrl ? (
                    <img 
                      src={novel.coverUrl} 
                      alt={novel.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                      <BookOpen className="h-20 w-20" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur shadow-sm text-primary hover:bg-white transition-colors">
                      {novel.genre}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight line-clamp-1">
                    {novel.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed h-20">
                    {novel.synopsis || "لا يوجد ملخص متاح لهذه الرواية."}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{novel.views || 0}</span>
                    </div>
                    <button 
                      onClick={() => handleAction(novel.id, 'like')}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{novel.likes || 0}</span>
                    </button>
                    <button 
                      onClick={() => handleAction(novel.id, 'dislike')}
                      className="flex items-center gap-1 hover:text-destructive transition-colors"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>{novel.dislikes || 0}</span>
                    </button>
                  </div>

                  <div className="mt-auto pt-4 border-t border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>كاتب مجهول</span>
                    </div>
                    <Link href={`/novels/${novel.id}/export`} onClick={() => handleAction(novel.id, 'view')}>
                      <Button variant="ghost" className="text-primary hover:bg-primary/5 gap-2">
                        قراءة الرواية
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
