import { Logo } from './logo';
import Link from 'next/link';
import { Handshake, BookOpen, Users } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2 space-y-4">
            <Logo />
            <p className="text-muted-foreground max-w-sm mt-4 italic font-body">
              Preserving the timeless craft of handloom textiles, connecting authentic weavers with global style enthusiasts.
            </p>
          </div>
          <div>
            <h4 className="font-headline text-lg mb-6 text-primary">Explore</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <li><Link href="/#collection" className="hover:text-primary transition-colors">Collections</Link></li>
              <li><Link href="/crochet" className="hover:text-primary transition-colors">Crochet Hub</Link></li>
              <li><Link href="/lehenga" className="hover:text-primary transition-colors">Lehenga</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-lg mb-6 text-primary">Partnership</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <li>
                <Link href="/partners" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                  <Users className="h-4 w-4" /> Artisan Partners
                </Link>
              </li>
              <li>
                <Link href="/become-a-partner" className="flex items-center gap-2 text-accent-foreground hover:opacity-80 transition-opacity">
                  <Handshake className="h-4 w-4" /> Become a Partner
                </Link>
              </li>
              <li>
                <Link href="/partner/sop" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <BookOpen className="h-4 w-4" /> Partner SOP
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            &copy; {new Date().getFullYear()} SareeDukan.Com. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/50">
            <Link href="#" className="hover:text-primary">Privacy</Link>
            <Link href="#" className="hover:text-primary">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
