import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger } from "./ui/sidebar";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-4 py-2 sticky top-0 border-b shadow-sm z-50 flex-col sm:flex-row">
      {/* SOL */}
      <div className="w-full sm:w-1/3 text-left mb-2 sm:mb-0">
        <SidebarTrigger />
      </div>

      {/* ORTA */}
      <div className="w-full sm:w-1/3 text-center mb-2 sm:mb-0">Tabletrack</div>

      {/* SAĞ */}
      <div className="w-full sm:w-1/3 text-right">
        <ThemeToggle />
        Sağ
      </div>
    </nav>
  );
};

export default Navbar;
