import { useNovel, useChapters } from "@/hooks/use-novels";
import { LoadingPage } from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "wouter";
import { ArrowRight, Printer, FileText } from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";

export default function Export() {
  const { id } = useParams();
  const novelId = parseInt(id!);
  const { data: novel, isLoading: isNovelLoading } = useNovel(novelId);
  const { data: chapters, isLoading: isChaptersLoading } = useChapters(novelId);

  if (isNovelLoading || isChaptersLoading || !novel) return <LoadingPage />;

  const sortedChapters = chapters?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) || [];

  const downloadPDF = async () => {
    const element = document.getElementById('printable-content');
    if (!element) return;

    // Temporarily remove fixed positioning and high z-index during capture
    const header = document.querySelector('.no-print') as HTMLElement;
    if (header) header.style.display = 'none';

    const opt = {
      margin: [15, 15],
      filename: `${novel.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 1.5, // Reduced scale for very large files to prevent memory issues
        useCORS: true, 
        letterRendering: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200,
        logging: false,
        onclone: (clonedDoc: Document) => {
          const clonedElement = clonedDoc.getElementById('printable-content');
          if (clonedElement) {
            // Force reset styles on the clone to ensure visibility
            clonedElement.style.paddingTop = '20px';
            clonedElement.style.marginTop = '0px';
            clonedElement.style.position = 'relative';
            clonedElement.style.display = 'block';
            clonedElement.style.backgroundColor = 'white';
            clonedElement.style.width = '1200px';
            clonedElement.style.color = 'black';
            clonedElement.style.visibility = 'visible';
            clonedElement.style.opacity = '1';
            
            clonedDoc.body.style.backgroundColor = 'white';
            
            // Helper to make element and all children visible and black
            const makeVisible = (el: HTMLElement) => {
              el.style.setProperty('color', 'black', 'important');
              el.style.setProperty('fill', 'black', 'important');
              el.style.setProperty('background-color', 'white', 'important');
              el.style.setProperty('visibility', 'visible', 'important');
              el.style.setProperty('opacity', '1', 'important');
              
              const style = window.getComputedStyle(el);
              if (style.display === 'none') {
                el.style.setProperty('display', 'block', 'important');
              }
              
              for (let i = 0; i < el.children.length; i++) {
                makeVisible(el.children[i] as HTMLElement);
              }
            };
            
            makeVisible(clonedElement);

            const images = clonedElement.getElementsByTagName('img');
            for (let i = 0; i < images.length; i++) {
              images[i].style.setProperty('display', 'block', 'important');
              images[i].style.setProperty('visibility', 'visible', 'important');
            }
          }
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      await html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf: any) => {
        // Optional: extra processing if needed
      }).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      if (header) header.style.display = 'flex';
    }
  };

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
          <Button onClick={downloadPDF} variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
            <FileText className="h-4 w-4 ml-2" />
            تحميل PDF
          </Button>
          <Button onClick={() => window.print()} className="bg-white text-slate-900 hover:bg-white/90">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Printable Content */}
      <div id="printable-content" className="max-w-[21cm] mx-auto bg-white pt-24 pb-12 print:pt-0 print:pb-0">
        
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
