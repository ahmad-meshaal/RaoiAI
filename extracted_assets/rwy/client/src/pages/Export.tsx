import { useNovel, useChapters } from "@/hooks/use-novels";
import { LoadingPage } from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "wouter";
import { ArrowRight, Printer, Download } from "lucide-react";

export default function Export() {
  const { id } = useParams();
  const novelId = parseInt(id!);
  const { data: novel, isLoading: isNovelLoading } = useNovel(novelId);
  const { data: chapters, isLoading: isChaptersLoading } = useChapters(novelId);

  if (isNovelLoading || isChaptersLoading || !novel) return <LoadingPage />;

  const sortedChapters = chapters?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) || [];

  return (
    <div className="bg-white min-h-screen">
      {/* UI Controls - Hidden when printing */}
      <div className="no-print fixed top-0 w-full bg-slate-900 text-white p-4 flex justify-between items-center z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <Link href={`/novels/${novelId}`}>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <span className="font-bold">{novel.title} - معاينة الطباعة</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.print()} className="bg-white text-slate-900 hover:bg-white/90">
            <Printer className="h-4 w-4 ml-2" />
            طباعة / حفظ PDF
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="max-w-[21cm] mx-auto bg-white pt-24 pb-12 print:pt-0 print:pb-0">
        
        {/* Title Page */}
        <div className="min-h-[29.7cm] flex flex-col items-center justify-center text-center p-12 mb-8 print-break-before">
          <h1 className="text-6xl font-heading font-bold mb-8">{novel.title}</h1>
          <p className="text-2xl text-gray-600 mb-12">{novel.genre}</p>
          <div className="w-24 h-1 bg-black mb-12"></div>
          <p className="text-lg italic max-w-lg text-gray-500">{novel.synopsis}</p>
        </div>

        {/* Chapters */}
        <div className="print-content">
          {sortedChapters.map((chapter) => (
            <div key={chapter.id} className="mb-12 print-break-before px-12 py-8">
              <div className="text-center mb-12">
                <span className="text-sm uppercase tracking-widest text-gray-500 block mb-2 font-ui">
                  الفصل {chapter.sequenceNumber}
                </span>
                <h2 className="text-4xl font-heading font-bold">{chapter.title}</h2>
              </div>
              
              <div className="prose prose-lg prose-p:text-justify max-w-none font-body leading-loose text-gray-900 text-xl">
                {chapter.content ? (
                  chapter.content.split('\n').map((paragraph, i) => (
                    paragraph.trim() && <p key={i} className="indent-8 mb-4">{paragraph}</p>
                  ))
                ) : (
                  <p className="text-center text-gray-400 italic">[فصل فارغ]</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* End Page */}
        <div className="min-h-[50vh] flex items-center justify-center print-break-before mt-24">
          <p className="text-xl font-bold">تمت</p>
        </div>
      </div>
    </div>
  );
}
