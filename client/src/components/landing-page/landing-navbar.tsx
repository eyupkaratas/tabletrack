"use client";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const LandingNavbar = () => {
  const router = useRouter();
  const handleLoginButton = () => {
    router.push("/login");
  };
  return (
    <nav className="flex h-16 items-center justify-between fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur border-b-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.7)]">
      <div className="ml-4">
        Made by{" "}
        <a
          href="https://www.eyupkaratas.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-400 hover:underline "
        >
          Eyüp Karataş
        </a>
      </div>
      <div className="mr-4">
        <Button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-yellow-500/60 sm:text-base"
          onClick={handleLoginButton}
        >
          Login
          <LogIn />
        </Button>
      </div>
    </nav>
  );
};

export default LandingNavbar;
