import { Layout } from "@/components/ui/Layout";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">سياسة الخصوصية</h1>
        </div>

        <div className="prose prose-lg max-w-none text-foreground space-y-6 leading-relaxed">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-xl font-bold text-primary">التزامنا بخصوصيتك</h2>
            <p className="text-muted-foreground">
              نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. تصف هذه السياسة كيفية تعاملنا مع المعلومات التي نجمعها.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-xl font-bold">المعلومات التي نجمعها</h2>
            <p className="text-muted-foreground">
              قد نجمع معلومات مثل عنوان IP ونوع المتصفح لتحسين الخدمة وتقديم تجربة أفضل لمستخدمينا.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-xl font-bold">مشاركة البيانات</h2>
            <p className="text-muted-foreground">
              لا نشارك بياناتك مع أي طرف ثالث. بياناتك محمية وتُستخدم فقط لتحسين خدماتنا داخل المنصة.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-xl font-bold">الموافقة</h2>
            <p className="text-muted-foreground">
              باستخدامك لموقع راوي فأنت توافق على هذه السياسة وعلى طريقة تعاملنا مع بياناتك كما هو موضح أعلاه.
            </p>
          </div>

          <p className="text-sm text-muted-foreground text-center pt-4">
            آخر تحديث: أبريل 2026
          </p>
        </div>
      </div>
    </Layout>
  );
}
