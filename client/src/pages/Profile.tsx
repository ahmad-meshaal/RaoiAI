import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/ui/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Eye, ThumbsUp, Users, UserCheck, UserPlus, UserMinus } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Novel } from "@shared/schema";

interface ProfileData {
  id: number;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  novels: Novel[];
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useUser();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["/api/users", username, "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${username}/profile`);
      if (!res.ok) throw new Error("المستخدم غير موجود");
      return res.json();
    },
    enabled: !!username,
  });

  const followMutation = useMutation({
    mutationFn: async (action: "follow" | "unfollow") => {
      if (action === "follow") {
        await apiRequest("POST", `/api/users/${username}/follow`);
      } else {
        await apiRequest("DELETE", `/api/users/${username}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", username, "profile"] });
    },
    onError: (err: Error) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const isOwnProfile = user?.username === username;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground text-lg">جاري التحميل...</div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Users className="h-20 w-20 text-muted-foreground/20" />
          <h2 className="text-2xl font-bold">المستخدم غير موجود</h2>
          <Link href="/novels">
            <Button variant="outline">العودة للمكتبة</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-0 sm:px-4 py-0 sm:py-8">
        {/* Cover Banner */}
        <div className="relative mb-0">
          <div className="h-28 sm:h-40 sm:rounded-2xl bg-gradient-to-l from-primary/30 via-primary/10 to-background border-b sm:border border-primary/10" />
          {/* Avatar */}
          <div className="absolute -bottom-10 right-4 sm:right-8">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatarUrl || undefined} alt={profile.username} />
              <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary text-primary-foreground">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 sm:px-0 pt-14 sm:pt-14">
          {/* Name + Follow row */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl sm:text-3xl font-bold text-foreground truncate"
                data-testid="text-profile-username"
              >
                {profile.username}
              </h1>
              {profile.bio && (
                <p
                  className="text-muted-foreground mt-1.5 text-sm sm:text-base max-w-lg leading-relaxed"
                  data-testid="text-profile-bio"
                >
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Follow / Edit Button */}
            <div className="flex gap-2 flex-shrink-0 mt-1">
              {isOwnProfile ? (
                <Link href="/settings">
                  <Button size="sm" variant="outline" data-testid="button-edit-profile">
                    تعديل الملف
                  </Button>
                </Link>
              ) : user ? (
                <Button
                  size="sm"
                  variant={profile.isFollowing ? "outline" : "default"}
                  className="gap-1.5"
                  disabled={followMutation.isPending}
                  data-testid="button-follow"
                  onClick={() =>
                    followMutation.mutate(profile.isFollowing ? "unfollow" : "follow")
                  }
                >
                  {profile.isFollowing ? (
                    <><UserMinus className="h-3.5 w-3.5" />إلغاء المتابعة</>
                  ) : (
                    <><UserPlus className="h-3.5 w-3.5" />متابعة</>
                  )}
                </Button>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="gap-1.5" data-testid="button-login-to-follow">
                    <UserPlus className="h-3.5 w-3.5" />
                    متابعة
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-5 sm:gap-8 mt-4 text-sm border-y border-border/50 py-4">
            <button className="flex flex-col items-center gap-0.5 sm:flex-row sm:items-center sm:gap-1.5 text-muted-foreground">
              <span className="font-bold text-base sm:text-sm text-foreground" data-testid="text-follower-count">
                {profile.followerCount.toLocaleString("ar")}
              </span>
              <span className="text-xs sm:text-sm">متابع</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 sm:flex-row sm:items-center sm:gap-1.5 text-muted-foreground">
              <span className="font-bold text-base sm:text-sm text-foreground" data-testid="text-following-count">
                {profile.followingCount.toLocaleString("ar")}
              </span>
              <span className="text-xs sm:text-sm">يتابع</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 sm:flex-row sm:items-center sm:gap-1.5 text-muted-foreground">
              <span className="font-bold text-base sm:text-sm text-foreground" data-testid="text-novel-count">
                {profile.novels.length}
              </span>
              <span className="text-xs sm:text-sm">رواية</span>
            </button>
          </div>
        </div>

        {/* Published Novels */}
        <div className="px-4 sm:px-0 mt-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            الروايات المنشورة
          </h2>

          {profile.novels.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
              <BookOpen className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isOwnProfile ? "لم تنشر أي رواية بعد" : "لم ينشر هذا الكاتب أي رواية بعد"}
              </p>
              {isOwnProfile && (
                <Link href="/">
                  <Button className="mt-4" variant="outline">
                    اكتب روايتك الأولى
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {profile.novels.map((novel) => (
                <Link key={novel.id} href={`/novels/${novel.id}/export`}>
                  <Card
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-primary/10 overflow-hidden"
                    data-testid={`card-novel-${novel.id}`}
                  >
                    {/* Cover */}
                    <div className="aspect-[2/3] bg-muted relative overflow-hidden">
                      {novel.coverUrl ? (
                        <img
                          src={novel.coverUrl}
                          alt={novel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-white/90 backdrop-blur shadow-sm text-primary"
                        >
                          {novel.genre}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
                        {novel.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />
                          {novel.views || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <ThumbsUp className="h-3 w-3" />
                          {novel.likes || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
