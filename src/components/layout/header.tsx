import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/common/logo";
import { UserNav } from "@/components/layout/user-nav";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        
        {/* Mobile Sidebar Trigger and Logo */}
        <div className="flex items-center md:hidden">
          <SidebarTrigger className="mr-2" />
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
