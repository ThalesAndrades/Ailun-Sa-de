import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Beneficiaries from "./pages/Beneficiaries";
import Appointments from "./pages/Appointments";
import Specialties from "./pages/Specialties";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/beneficiaries"} component={Beneficiaries} />
      <Route path={"/appointments"} component={Appointments} />
      <Route path={"/specialties"} component={Specialties} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
