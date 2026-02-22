import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sun, Languages, Bell, Shield } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="py-6 max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold font-heading">الإعدادات</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sun className="h-5 w-5" /> المظهر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>الوضع الليلي</Label>
                <p className="text-sm text-muted-foreground">تبديل بين الوضع الفاتح والمظلم</p>
              </div>
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Languages className="h-5 w-5" /> اللغة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label>لغة الواجهة</Label>
              <Button variant="outline">العربية</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5" /> الخصوصية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">إدارة البيانات</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsContent />
    </ThemeProvider>
  );
}
