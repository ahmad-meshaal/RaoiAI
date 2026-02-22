import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertNovel, type InsertCharacter, type InsertChapter } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// ==========================================
// NOVELS
// ==========================================

export function useNovels() {
  return useQuery({
    queryKey: [api.novels.list.path],
    queryFn: async () => {
      const res = await fetch(api.novels.list.path);
      if (!res.ok) throw new Error("فشل في جلب الروايات");
      return api.novels.list.responses[200].parse(await res.json());
    },
  });
}

export function useNovel(id: number) {
  return useQuery({
    queryKey: [api.novels.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.novels.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("فشل في جلب الرواية");
      return api.novels.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateNovel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertNovel) => {
      const res = await fetch(api.novels.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل في إنشاء الرواية");
      return api.novels.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.novels.list.path] });
      toast({ title: "تم بنجاح", description: "تم إنشاء الرواية الجديدة" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "تعذر إنشاء الرواية", variant: "destructive" });
    },
  });
}

export function useDeleteNovel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.novels.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل حذف الرواية");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.novels.list.path] });
      toast({ title: "تم الحذف", description: "تم حذف الرواية بنجاح" });
    },
  });
}

// ==========================================
// CHARACTERS
// ==========================================

export function useCharacters(novelId: number) {
  return useQuery({
    queryKey: [api.characters.list.path, novelId],
    queryFn: async () => {
      const url = buildUrl(api.characters.list.path, { novelId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("فشل في جلب الشخصيات");
      return api.characters.list.responses[200].parse(await res.json());
    },
    enabled: !!novelId,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ novelId, ...data }: InsertCharacter) => {
      const url = buildUrl(api.characters.create.path, { novelId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل في إضافة الشخصية");
      return api.characters.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.characters.list.path, variables.novelId] });
      toast({ title: "تم بنجاح", description: "تمت إضافة الشخصية" });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id }: { id: number; novelId: number }) => {
      const url = buildUrl(api.characters.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل حذف الشخصية");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.characters.list.path, variables.novelId] });
      toast({ title: "تم الحذف", description: "تم حذف الشخصية" });
    },
  });
}

// ==========================================
// CHAPTERS
// ==========================================

export function useChapters(novelId: number) {
  return useQuery({
    queryKey: [api.chapters.list.path, novelId],
    queryFn: async () => {
      const url = buildUrl(api.chapters.list.path, { novelId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("فشل في جلب الفصول");
      return api.chapters.list.responses[200].parse(await res.json());
    },
    enabled: !!novelId,
  });
}

export function useChapter(id: number) {
  return useQuery({
    queryKey: [api.chapters.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.chapters.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("فشل في جلب الفصل");
      return api.chapters.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ novelId, ...data }: InsertChapter) => {
      const url = buildUrl(api.chapters.create.path, { novelId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل في إنشاء الفصل");
      return api.chapters.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.chapters.list.path, variables.novelId] });
      toast({ title: "تم بنجاح", description: "تم إنشاء الفصل الجديد" });
    },
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertChapter> & { id: number }) => {
      const url = buildUrl(api.chapters.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل في تحديث الفصل");
      return api.chapters.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate both the list and the specific chapter
      queryClient.invalidateQueries({ queryKey: [api.chapters.get.path, data.id] });
      // We don't easily know the novelId here to invalidate the list without prop drilling, 
      // but usually viewing a single chapter is isolated. 
      // Ideally backend returns novelId so we can invalidate list too.
      toast({ title: "تم الحفظ", description: "تم حفظ التغييرات بنجاح" });
    },
  });
}
