import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>
        
        <nav className="flex items-center gap-6">
          <a 
            href="#" 
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Início
          </a>
          <a 
            href="#servicos" 
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Serviços
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
