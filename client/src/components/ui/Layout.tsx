import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Feather, Home, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/UserMenu";
import { useUser } from "@/context/UserContext";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useUser();

  const navItems = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/novels", label: "المكتبة", icon: BookOpen },
    {
      href: user ? `/profile/${user.username}` : "/login",
      label: "ملفي",
      icon: User,
      active: location.startsWith("/profile"),
    },
    { href: "/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row paper-texture-container">
      {/* Paper texture overlay */}
      <div className="paper-texture" />

      {/* ── Mobile Header ── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card/95 backdrop-blur-sm relative z-20 sticky top-0">
        <Link href="/" className="font-heading text-xl font-bold flex items-center gap-2 text-primary">
          <Feather className="h-5 w-5" />
          <span>راوي</span>
        </Link>
        <UserMenu />
      </div>

      {/* ── Desktop Sidebar ── */}
      {showSidebar && (
        <aside className="hidden md:flex flex-col w-64 border-l bg-card/50 backdrop-blur-sm relative z-10 sticky top-0 h-screen">
          <div className="p-8">
            <Link href="/" className="font-heading text-3xl font-bold flex items-center gap-3 text-primary mb-2">
              <Feather className="h-8 w-8" />
              <span>راوي</span>
            </Link>
            <p className="text-muted-foreground text-sm ui-font">مساعدك في الكتابة الإبداعية</p>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ui-font font-medium",
                location === "/"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Home className="h-5 w-5" />
              <span>الرئيسية</span>
            </Link>
            <Link
              href="/novels"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ui-font font-medium",
                location === "/novels"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <BookOpen className="h-5 w-5" />
              <span>المكتبة</span>
            </Link>
            {user && (
              <Link
                href={`/profile/${user.username}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ui-font font-medium",
                  location.startsWith("/profile")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <User className="h-5 w-5" />
                <span>ملفي الشخصي</span>
              </Link>
            )}
            <div className="px-4 py-2 mt-4 text-xs font-bold text-muted-foreground uppercase tracking-wider ui-font">
              أدوات الكاتب
            </div>
            <div className="text-sm px-4 text-muted-foreground ui-font italic">
              اختر رواية للبدء
            </div>
          </nav>

          <div className="p-4 border-t space-y-2">
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ui-font",
                location === "/settings"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </Link>
            <div className="px-2 py-1">
              <UserMenu />
            </div>
          </div>
        </aside>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 relative z-10 w-full overflow-x-hidden flex flex-col">
        <div className="flex-1 w-full pb-24 md:pb-0">
          {children}
        </div>

        {/* Desktop Footer */}
        <footer className="hidden md:block border-t border-border/50 mt-auto py-5 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="font-heading text-primary font-semibold">راوي © 2026</span>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                شروط الاستخدام
              </Link>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 right-0 left-0 z-30 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl">
        <div className="flex items-center justify-around py-2 px-1 safe-area-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active !== undefined
              ? item.active
              : (item.href === "/" ? location === "/" : location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[60px]",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-xl transition-all duration-200",
                    isActive ? "bg-primary/15" : ""
                  )}>
                    <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-all",
                    isActive ? "font-bold" : ""
                  )}>
                    {item.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>

        {/* Mobile Footer links */}
        <div className="flex items-center justify-center gap-4 pb-2 text-[10px] text-muted-foreground/60">
          <Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-primary transition-colors">شروط الاستخدام</Link>
        </div>
      </nav>
    </div>
  );
}
