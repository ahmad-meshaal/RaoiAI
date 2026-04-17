import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, User, Settings2, Loader } from "lucide-react";
import { ImageUploadWithAI } from "@/components/ImageUploadWithAI";
import { useToast } from "@/hooks/use-toast";

export function UserMenu() {
  const { user, setUser, logout } = useUser();
  const [, setLocation] = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [username, setUsername] = useState(user?.username || "");
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl, bio, username }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const updated = await res.json();
      setUser(updated);
      setProfileOpen(false);
      toast({ title: "تم حفظ الملف الشخصي" });
    } catch (err) {
      toast({ title: "خطأ", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">دخول</Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">إنشاء حساب</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full hover:bg-muted/50 p-1 pr-3 transition-colors">
            <span className="text-sm font-medium text-foreground hidden sm:block">{user.username}</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
              <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52" dir="rtl">
          <DropdownMenuLabel className="text-right">
            <div className="font-bold">{user.username}</div>
            <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href={`/profile/${user.username}`}>
            <DropdownMenuItem className="cursor-pointer gap-2" data-testid="link-my-profile">
              <User className="h-4 w-4" />
              ملفي الشخصي
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => {
              setAvatarUrl(user.avatarUrl || "");
              setBio(user.bio || "");
              setUsername(user.username);
              setProfileOpen(true);
            }}
            data-testid="button-edit-profile-menu"
          >
            <Settings2 className="h-4 w-4" />
            تعديل الملف الشخصي
          </DropdownMenuItem>
          <Link href="/settings">
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Settings2 className="h-4 w-4" />
              الإعدادات
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>الملف الشخصي</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageUploadWithAI
                value={avatarUrl}
                onChange={setAvatarUrl}
                label="صورة الملف الشخصي"
                aiPromptHint="صف مظهرك أو الأفاتار الذي تريده"
                aiEndpoint="/api/ai/generate-avatar"
                shape="circle"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-right block">اسم المستخدم</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-right block">نبذة عنك</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اكتب نبذة قصيرة عن نفسك..."
                className="text-right min-h-[80px]"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setProfileOpen(false)}>إلغاء</Button>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader className="h-4 w-4 animate-spin ml-2" /> : null}
                {saving ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
