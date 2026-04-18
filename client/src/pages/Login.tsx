import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Feather, Loader, BookOpen, Users, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";

type Tab = "login" | "signup";

export default function Auth() {
  const [location] = useLocation();
  const [tab, setTab] = useState<Tab>(location === "/signup" ? "signup" : "login");

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setUser } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      if (!res.ok) {
        const error = await res.json();
        toast({ title: "خطأ في الدخول", description: error.message, variant: "destructive" });
        return;
      }
      const user = await res.json();
      setUser(user);
      toast({ title: `مرحباً ${user.username}!`, description: "تم تسجيل الدخول بنجاح" });
      setLocation("/");
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ في الاتصال", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      toast({ title: "خطأ", description: "كلمات المرور غير متطابقة", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signupData.username, email: signupData.email, password: signupData.password }),
      });
      if (!res.ok) {
        const error = await res.json();
        toast({ title: "خطأ في التسجيل", description: error.message, variant: "destructive" });
        return;
      }
      const user = await res.json();
      setUser(user);
      toast({ title: `أهلاً ${user.username}!`, description: "تم إنشاء حسابك بنجاح" });
      setLocation("/");
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ في الاتصال", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row" dir="rtl">

      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/90 to-primary/60 flex-col items-center justify-center p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 paper-texture" />
        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Feather className="h-12 w-12" />
            <span className="font-heading text-5xl font-bold">راوي</span>
          </div>
          <p className="text-xl opacity-90 leading-relaxed">منصتك لكتابة الروايات العربية بمساعدة الذكاء الاصطناعي</p>

          <div className="space-y-4 pt-4 text-right">
            {[
              { icon: BookOpen, title: "إدارة الروايات والفصول", desc: "نظّم مشروعك الأدبي بكل سهولة" },
              { icon: Users, title: "شخصيات حية ومعمّقة", desc: "ابن شخصياتك بتفاصيل غنية" },
              { icon: Wand2, title: "مساعد ذكي للكتابة", desc: "اقتراحات وأفكار بالذكاء الاصطناعي" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">{title}</p>
                  <p className="text-xs opacity-75 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 mb-8 text-primary">
          <Feather className="h-7 w-7" />
          <span className="font-heading text-3xl font-bold">راوي</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ui-font",
                tab === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ui-font",
                tab === "signup"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              إنشاء حساب
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5" autoComplete="on">
              <div className="space-y-1.5">
                <Label htmlFor="login-username" className="text-right block ui-font font-medium">
                  اسم المستخدم
                </Label>
                <Input
                  id="login-username"
                  name="username"
                  autoComplete="username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="أدخل اسم المستخدم"
                  disabled={isLoading}
                  required
                  className="text-right h-11"
                  data-testid="input-login-username"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-right block ui-font font-medium">
                  كلمة المرور
                </Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="أدخل كلمة المرور"
                  disabled={isLoading}
                  required
                  className="text-right h-11"
                  data-testid="input-login-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-bold shadow-md shadow-primary/20 mt-2"
                disabled={isLoading}
                data-testid="button-login-submit"
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin ml-2" /> : null}
                {isLoading ? "جاري الدخول..." : "دخول"}
              </Button>

              <p className="text-center text-sm text-muted-foreground ui-font pt-2">
                ليس لديك حساب؟{" "}
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className="text-primary font-semibold hover:underline"
                >
                  أنشئ حساباً الآن
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4" autoComplete="on">
              <div className="space-y-1.5">
                <Label htmlFor="signup-username" className="text-right block ui-font font-medium">
                  اسم المستخدم
                </Label>
                <Input
                  id="signup-username"
                  name="username"
                  autoComplete="username"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  placeholder="اختر اسماً فريداً"
                  disabled={isLoading}
                  required
                  className="text-right h-11"
                  data-testid="input-signup-username"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-right block ui-font font-medium">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  placeholder="example@email.com"
                  disabled={isLoading}
                  required
                  className="text-right h-11"
                  data-testid="input-signup-email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-right block ui-font font-medium">
                  كلمة المرور
                </Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="8 أحرف على الأقل"
                  disabled={isLoading}
                  required
                  minLength={6}
                  className="text-right h-11"
                  data-testid="input-signup-password"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-confirm" className="text-right block ui-font font-medium">
                  تأكيد كلمة المرور
                </Label>
                <Input
                  id="signup-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  placeholder="أعد كتابة كلمة المرور"
                  disabled={isLoading}
                  required
                  className={cn(
                    "text-right h-11",
                    signupData.confirmPassword && signupData.confirmPassword !== signupData.password
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  )}
                  data-testid="input-signup-confirm"
                />
                {signupData.confirmPassword && signupData.confirmPassword !== signupData.password && (
                  <p className="text-destructive text-xs ui-font text-right">كلمتا المرور غير متطابقتين</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-bold shadow-md shadow-primary/20 mt-1"
                disabled={isLoading}
                data-testid="button-signup-submit"
              >
                {isLoading ? <Loader className="h-4 w-4 animate-spin ml-2" /> : null}
                {isLoading ? "جاري الإنشاء..." : "إنشاء الحساب"}
              </Button>

              <p className="text-center text-sm text-muted-foreground ui-font">
                لديك حساب؟{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="text-primary font-semibold hover:underline"
                >
                  سجّل الدخول
                </button>
              </p>

              <p className="text-center text-xs text-muted-foreground ui-font pt-1">
                بالتسجيل، أنت توافق على{" "}
                <Link href="/terms" className="text-primary hover:underline">شروط الاستخدام</Link>
                {" "}و{" "}
                <Link href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
