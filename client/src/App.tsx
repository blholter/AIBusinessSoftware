import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminRoute } from "@/lib/admin-route";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Marketplace from "@/pages/marketplace";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import Blog from "@/pages/blog";
import AdminWorkflowConverter from "@/pages/admin-workflow-converter";
import Admin from "@/pages/admin";
import AdminAppManager from "@/pages/admin-app-manager";
import AdminBlogManager from "@/pages/admin-blog-manager";
import GeneratedAppDemo from "@/pages/generated-app-demo";
import AppRunner from "@/pages/app-runner";
import WorkflowDemo from "@/pages/workflow-demo";
import MyWorkflows from "@/pages/my-workflows";
import SubmitApp from "@/pages/submit-app";

function Router() {
  return (
    <Switch>
      {/* TEMPORARY: Skip authentication for development */}
      <Route path="/" component={Marketplace} />
      <Route path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={Blog} />
      <Route path="/submit-app" component={SubmitApp} />
      <AdminRoute path="/admin" component={() => <Admin />} />
      <AdminRoute path="/admin/workflow-converter" component={() => <AdminWorkflowConverter />} />
      <AdminRoute path="/admin/app-manager" component={() => <AdminAppManager />} />
      <AdminRoute path="/admin/blog-manager" component={() => <AdminBlogManager />} />
      <Route path="/generated-app-demo" component={GeneratedAppDemo} />
      <Route path="/app-runner/:id" component={AppRunner} />
      <Route path="/workflow-demo" component={WorkflowDemo} />
      <Route path="/my-workflows" component={MyWorkflows} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
