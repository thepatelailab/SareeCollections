'use client';
import Link from 'next/link';
import { Home, Search, Heart, User, Menu, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAppContext } from '@/components/providers/app-provider';
import { Logo } from './logo';
import { useUser } from '@/firebase';

export function BottomNav() {
  const pathname = usePathname();
  const { sareeVarieties } = useAppContext();
  const { user } = useUser();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '#' },
    { icon: Heart, label: 'Wishlist', href: '#' },
    { icon: User, label: 'Profile', href: '/login' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-primary/5 px-6 pb-6 pt-3 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              isActive ? "text-primary scale-110" : "text-primary/40"
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        );
      })}
      
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center gap-1 text-primary/40">
            <Menu className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[75vh] rounded-t-[2.5rem] p-8">
          <SheetHeader className="mb-8">
            <SheetTitle className="flex justify-center">
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="saree" className="border-none">
                <AccordionTrigger className="text-xl font-headline tracking-widest text-primary py-4 uppercase border-b border-primary/5 hover:no-underline">
                  Saree Collection
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="flex flex-col gap-4 pl-4 pt-4">
                    {sareeVarieties.map((variety) => (
                      <li key={variety.id}>
                        <Link 
                          href="/#collection" 
                          className="block text-sm text-muted-foreground hover:text-primary tracking-widest font-bold uppercase"
                        >
                          {variety.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Link href="/crochet" className="text-xl font-headline tracking-widest text-primary py-4 uppercase border-b border-primary/5 flex items-center justify-between group">
              Crochet Hub <Sparkles className="h-5 w-5 text-accent-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link href="/lehenga" className="text-xl font-headline tracking-widest text-primary py-4 uppercase border-b border-primary/5">Lehenga</Link>
            <Link href="/about" className="text-xl font-headline tracking-widest text-primary py-4 uppercase border-b border-primary/5">About Us</Link>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}