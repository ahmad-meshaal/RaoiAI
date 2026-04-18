import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";

import Home from "@/pages/Home";
import Auth from "@/pages/Login";
import NovelDashboard from "@/pages/NovelDashboard";
import Editor from "@/pages/Editor";
import Characters from "@/pages/Characters";
import Export from "@/pages/Export";
import Settings from "@/pages/Settings";
import PublicNovels from "@/pages/PublicNovels";
import Profile from "@/pages/Profile";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Auth} />
      <Route path="/signup" component={Auth} />
      <Route path="/" component={Home} />
      <Route path="/novels" component={PublicNovels} />
      <Route path="/novels/:id" component={NovelDashboard} />
      <Route path="/novels/:id/characters" component={Characters} />
      <Route path="/novels/:novelId/editor/:chapterId" component={Editor} />
      <Route path="/novels/:id/export" component={Export} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile/:username" component={Profile} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background font-body" dir="rtl">
            <Router />
            <Toaster />
          </div>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
