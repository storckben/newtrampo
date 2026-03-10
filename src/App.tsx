import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cookies from "./pages/Cookies";
import Index from "./pages/Index";
import Agendamento from "./pages/Agendamento";
import Licenciamento from "./pages/Licenciamento";
import Confirmacao from "./pages/Confirmacao";
import Pagamento from "./pages/Pagamento";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Cookies />} />
          <Route path="/servicos" element={<Index />} />
          <Route path="/agendamento/:servico" element={<Agendamento />} />
          <Route path="/licenciamento" element={<Licenciamento />} />
          <Route path="/pagamento/:protocolo" element={<Pagamento />} />
          <Route path="/confirmacao/:protocolo" element={<Confirmacao />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
