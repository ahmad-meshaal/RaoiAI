import { Layout } from "@/components/ui/Layout";
import { ScrollText } from "lucide-react";

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="flex items-center gap-3 mb-8">
          <ScrollText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">شروط الاستخدام</h1>
        </div>

        <div className="space-y-6 leading-relaxed">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-bold mb-3">القبول والموافقة</h2>
            <p className="text-muted-foreground">
              باستخدامك لمنصة راوي، توافق على الالتزام بهذه الشروط والأحكام. يُرجى قراءتها بعناية قبل البدء.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-bold mb-4">التزاماتك كمستخدم</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>عدم استخدام الموقع بشكل غير قانوني أو بما يخالف الأنظمة والقوانين المعمول بها.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>عدم نسخ المحتوى أو إعادة نشره بدون الحصول على إذن صريح من أصحابه.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>احترام حقوق الملكية الفكرية للكتّاب الآخرين على المنصة.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>عدم نشر محتوى مسيء أو مضلل أو يتضمن انتهاكاً لحقوق الآخرين.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-bold mb-3">إخلاء المسؤولية</h2>
            <p className="text-muted-foreground">
              الموقع غير مسؤول عن أي استخدام خاطئ أو ضار للمحتوى المنشور. يتحمل المستخدم المسؤولية الكاملة عن كل ما ينشره على المنصة.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-bold mb-3">التعديلات</h2>
            <p className="text-muted-foreground">
              نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر المنصة.
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
