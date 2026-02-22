import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

type GeneratePlotParams = {
  genre: string;
  theme?: string;
};

type GenerateChapterParams = {
  novelId: number;
  chapterTitle: string;
  outline?: string;
  previousChapterContent?: string;
};

export function useGeneratePlot() {
  return useMutation({
    mutationFn: async (data: GeneratePlotParams) => {
      const res = await fetch(api.ai.generatePlot.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل في توليد الحبكة");
      return api.ai.generatePlot.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateChapter() {
  return useMutation({
    mutationFn: async (data: GenerateChapterParams) => {
      const res = await fetch(api.ai.generateChapter.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل في كتابة الفصل");
      return api.ai.generateChapter.responses[200].parse(await res.json());
    },
  });
}
