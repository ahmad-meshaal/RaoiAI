import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import NovelDashboard from "@/pages/NovelDashboard";
import Editor from "@/pages/Editor";
import Characters from "@/pages/Characters";
import Export from "@/pages/Export";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/novels/:id" component={NovelDashboard} />
      <Route path="/novels/:id/characters" component={Characters} />
      <Route path="/novels/:novelId/editor/:chapterId" component={Editor} />
      <Route path="/novels/:id/export" component={Export} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background font-body" dir="rtl">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
