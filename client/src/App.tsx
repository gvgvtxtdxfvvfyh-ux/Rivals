import { Switch, Route, Redirect } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import ProtectedRoute from "@/components/protected-route";
import SignUp from "@/pages/signup";
import SignIn from "@/pages/signin";
import Dashboard from "@/pages/dashboard";
import PWBattle from "@/pages/pw-battle";
import ProgressPage from "@/pages/progress";
import SchoolPage from "@/pages/school";
import AchievementsPage from "@/pages/achievements";
import AdminDBPage from "@/pages/admin-db";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { loadTheme, applyTheme } from "@/lib/themes";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/signup" component={SignUp} />
      <Route path="/signin" component={SignIn} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/pw-battle">
        <ProtectedRoute>
          <Layout>
            <PWBattle />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/progress">
        <ProtectedRoute>
          <Layout>
            <ProgressPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/school">
        <ProtectedRoute>
          <Layout>
            <SchoolPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/achievements">
        <ProtectedRoute>
          <Layout>
            <AchievementsPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <Layout>
            <AdminDBPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Layout>
            <SettingsPage />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const theme = loadTheme();
    applyTheme(theme);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
