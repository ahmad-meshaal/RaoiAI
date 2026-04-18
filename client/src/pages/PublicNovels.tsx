import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/ui/Layout";
import { LoadingPage } from "@/components/ui/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Eye, ThumbsUp, ThumbsDown, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Novel } from "@shared/schema";

type PublishedNovel = Novel & { authorUsername: string | null; authorAvatarUrl: string | null };

export default function PublicNovels() {
  const { data: novels, isLoading } = useQuery<PublishedNovel[]>({
    queryKey: ["/api/novels/published"],
  });

  if (isLoading) return <LoadingPage />;

  const handleAction = async (id: number, action: "view" | "like" | "dislike", increment = true) => {
    await apiRequest("POST", `/api/novels/${id}/${action}`, { increment });
    queryClient.invalidateQueries({ queryKey: ["/api/novels/published"] });
  };

  return (
    <Layout>
      <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">مكتبة الروايات</h1>
          <p className="text-muted-foreground text-sm md:text-lg">استكشف أحدث الروايات المنشورة من قبل كتابنا.</p>
        </div>

        {!novels || novels.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border-2 border-dashed">
            <BookOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">لا توجد روايات منشورة بعد</h2>
            <p className="text-muted-foreground">كن أول من ينشر روايته في المنصة!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {novels.map((novel) => (
              <Card
                key={novel.id}
                className="group hover:shadow-xl transition-all duration-300 border-primary/10 overflow-hidden flex flex-col"
                data-testid={`card-novel-${novel.id}`}
              >
                {/* Cover Image */}
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
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur shadow-sm text-primary text-xs">
                      {novel.genre}
                    </Badge>
                  </div>
                </div>

                <CardContent className="flex-1 flex flex-col p-2 md:p-4 gap-2 md:gap-3">
                  {/* Author */}
                  {novel.authorUsername ? (
                    <Link href={`/profile/${novel.authorUsername}`}>
                      <div
                        className="flex items-center gap-1.5 group/author"
                        data-testid={`link-author-${novel.id}`}
                      >
                        <Avatar className="h-6 w-6 md:h-8 md:w-8 border border-primary/20 flex-shrink-0">
                          <AvatarImage src={novel.authorAvatarUrl || undefined} />
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {novel.authorUsername.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs font-medium text-muted-foreground group-hover/author:text-primary transition-colors truncate">
                          {novel.authorUsername}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-6 w-6 md:h-8 md:w-8 border border-muted flex-shrink-0">
                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">؟</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground">مجهول</p>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-sm md:text-lg font-bold group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    {novel.title}
                  </h3>

                  {/* Synopsis — hidden on mobile */}
                  <p className="hidden md:block text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
                    {novel.synopsis || "لا يوجد ملخص متاح لهذه الرواية."}
                  </p>

                  {/* Stats & Read */}
                  <div className="flex items-center justify-between pt-1 md:pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 md:gap-3 text-[10px] md:text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5" data-testid={`text-views-${novel.id}`}>
                        <Eye className="h-3 w-3" />
                        {novel.views || 0}
                      </span>
                      <button
                        onClick={() => handleAction(novel.id, "like")}
                        className="flex items-center gap-0.5 hover:text-primary transition-colors"
                        data-testid={`button-like-${novel.id}`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {novel.likes || 0}
                      </button>
                    </div>

                    <Link href={`/novels/${novel.id}/export`} onClick={() => handleAction(novel.id, "view")}>
                      <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/5 gap-0.5 h-7 px-1.5 text-[10px] md:text-xs" data-testid={`button-read-${novel.id}`}>
                        <BookOpen className="h-3 w-3" />
                        اقرأ
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
