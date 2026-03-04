import { useNovels } from "@/hooks/use-novels";
import { Layout } from "@/components/ui/Layout";
import { LoadingPage } from "@/components/ui/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, User } from "lucide-react";
import { Link } from "wouter";

export default function PublicNovels() {
  const { data: novels, isLoading } = useNovels();

  if (isLoading) return <LoadingPage />;

  const publishedNovels = novels?.filter(n => n.status === "published") || [];

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
              <Card key={novel.id} className="group hover:shadow-xl transition-all duration-300 border-primary/10 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      {novel.genre}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                    {novel.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed h-20">
                    {novel.synopsis || "لا يوجد ملخص متاح لهذه الرواية."}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>كاتب مجهول</span>
                    </div>
                    <Link href={`/novels/${novel.id}/export`}>
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
