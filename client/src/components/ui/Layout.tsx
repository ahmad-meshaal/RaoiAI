import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Feather, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/UserMenu";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row paper-texture-container">
      {/* Paper texture overlay */}
      <div className="paper-texture" />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card relative z-10">
        <Link href="/" className="font-heading text-xl font-bold flex items-center gap-2 text-primary">
          <Feather className="h-5 w-5" />
          <span>راوي</span>
        </Link>
        <UserMenu />
      </div>

      {/* Sidebar - Desktop */}
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

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
