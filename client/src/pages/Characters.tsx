import { useCharacters, useCreateCharacter, useDeleteCharacter } from "@/hooks/use-novels";
import { Layout } from "@/components/ui/Layout";
import { LoadingPage } from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useParams } from "wouter";
import { ArrowRight, Plus, User, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Characters() {
  const { id } = useParams();
  const novelId = parseInt(id!);
  const { data: characters, isLoading } = useCharacters(novelId);
  const deleteCharacter = useDeleteCharacter();

  if (isLoading) return <LoadingPage />;

  return (
    <Layout>
      <div className="py-6 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/novels/${novelId}`}>
              <Button variant="ghost" size="icon">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold font-heading">شخصيات الرواية</h1>
          </div>
          <CreateCharacterDialog novelId={novelId} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters?.map((char) => (
            <Card key={char.id} className="relative group hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-xl">{char.name}</CardTitle>
                <Badge variant={char.role === 'protagonist' ? 'default' : 'secondary'} className="ui-font">
                  {char.role === 'protagonist' ? 'بطل' : char.role === 'antagonist' ? 'خصم' : 'داعم'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                    {char.description || "لا يوجد وصف..."}
                  </p>
                  
                  {char.traits && (
                    <div className="flex flex-wrap gap-2">
                      {char.traits.split(',').map((trait, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground ui-font">
                          {trait.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if(confirm("حذف هذه الشخصية؟")) {
                      deleteCharacter.mutate({ id: char.id, novelId });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {characters?.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl bg-card/30">
              <User className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">لا توجد شخصيات</h3>
              <p className="text-muted-foreground mb-6">
                أضف أبطال قصتك لتبدأ في بناء عالمك.
              </p>
              <CreateCharacterDialog novelId={novelId} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function CreateCharacterDialog({ novelId }: { novelId: number }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateCharacter();
  const [formData, setFormData] = useState({ 
    name: "", 
    role: "protagonist", 
    description: "",
    traits: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ ...formData, novelId }, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ name: "", role: "protagonist", description: "", traits: "" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          شخصية جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="ui-font sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة شخصية</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-right block">الاسم</Label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block">الدور</Label>
              <Select 
                value={formData.role} 
                onValueChange={val => setFormData({...formData, role: val})}
              >
                <SelectTrigger className="flex-row-reverse">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protagonist">بطل (Protagonist)</SelectItem>
                  <SelectItem value="antagonist">خصم (Antagonist)</SelectItem>
                  <SelectItem value="supporting">شخصية داعمة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-right block">سمات الشخصية (افصل بفاصلة)</Label>
            <Input 
              value={formData.traits}
              onChange={e => setFormData({...formData, traits: e.target.value})}
              placeholder="ذكي, شجاع, غامض..."
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-right block">الوصف والخلفية</Label>
            <Textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="text-right min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "جاري الإضافة..." : "حفظ الشخصية"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
