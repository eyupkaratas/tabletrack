import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-4 py-2.5 sticky top-0 border-b shadow-sm z-50 flex-col sm:flex-row">
      {/* SOL */}
      <div className="w-full sm:w-1/3 flex justify-start ">
        <SidebarTrigger />
      </div>

      {/* ORTA */}
      <div className="w-full sm:w-1/3 flex justify-center">Tabletrack</div>

      {/* SAĞ */}
      <div className="w-full sm:w-1/3 flex justify-end items-center gap-2 cursor-pointer">
        <ThemeToggle />
        <Button variant="destructive" className="cursor-pointer">
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
