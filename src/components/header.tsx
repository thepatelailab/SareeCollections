'use client';
import Link from 'next/link';
import { ShoppingBag, User, LogOut, Search, Settings, Package, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/components/providers/cart-provider';
import { useAppContext } from '@/components/providers/app-provider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from '@/lib/utils';
import React from 'react';

export function Header() {
  const { cartCount } = useCartContext();
  const { isAdmin, isWholesaler, sareeVarieties } = useAppContext();
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 md:h-24 items-center justify-between px-4">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center flex-1 justify-center px-4">
          <NavigationMenu>
            <NavigationMenuList className="gap-2 lg:gap-4">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-1.5 h-auto rounded-full transition-all font-headline text-[9px] font-black border-none shadow-sm uppercase tracking-[0.2em]">
                  SAREE
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {sareeVarieties.map((variety) => (
                      <ListItem
                        key={variety.id}
                        title={variety.name.toUpperCase()}
                        href="/#collection"
                      >
                        {variety.description || 'Traditional handloom masterpiece.'}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent font-headline text-primary text-[9px] font-bold opacity-70 hover:opacity-100 px-4 transition-opacity uppercase tracking-[0.2em]")}>
                  <Link href="/crochet">CROCHET HUB</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent font-headline text-primary text-[9px] font-bold opacity-70 hover:opacity-100 px-4 transition-opacity uppercase tracking-[0.2em]")}>
                  <Link href="/lehenga">LEHENGA</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent font-headline text-primary text-[9px] font-bold opacity-70 hover:opacity-100 px-4 transition-opacity uppercase tracking-[0.2em]")}>
                  <Link href="/about">ABOUT US</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-1 md:gap-3">
          <div className="hidden lg:flex items-center relative mr-1">
            <Input placeholder="Search..." className="pr-8 h-8 w-32 rounded-full bg-muted/30 border-none focus-visible:ring-primary/10 text-[9px]" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          </div>

          {isAdmin && (
             <Button variant="outline" size="sm" asChild className="hidden md:flex h-9 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase text-[8px] tracking-[0.1em] px-4 gap-2">
                <Link href="/admin/settings">
                  <Settings className="h-3 w-3" /> Admin
                </Link>
             </Button>
          )}

          {isWholesaler && (
             <Button variant="outline" size="sm" asChild className="hidden md:flex h-9 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase text-[8px] tracking-[0.1em] px-4 gap-2">
                <Link href="/partner/dashboard">
                  <LayoutDashboard className="h-3 w-3" /> Dashboard
                </Link>
             </Button>
          )}
          
          <Button variant="ghost" size="icon" asChild className="relative rounded-full h-9 w-9 text-primary hover:bg-primary/5">
            <Link href="/cart">
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full p-0 flex items-center justify-center text-[7px] font-bold">
                  {cartCount}
                </Badge>
              )}
            </Link>
          </Button>

          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-primary/20">
                  <User className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && !user.isAnonymous ? (
                  <>
                    <DropdownMenuLabel className="flex flex-col p-3">
                      <span className="font-headline text-base">Account</span>
                      {isAdmin && <span className="text-[9px] text-primary font-bold uppercase tracking-wider mt-0.5">Store Admin</span>}
                      {isWholesaler && <span className="text-[9px] text-accent-foreground font-bold uppercase tracking-wider mt-0.5">Partner Wholesaler</span>}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="p-2.5">
                      <Link href="/my-account/orders"><Package className="mr-2.5 h-4 w-4" />My Orders</Link>
                    </DropdownMenuItem>
                    {isWholesaler && (
                      <DropdownMenuItem asChild className="p-2.5">
                        <Link href="/partner/dashboard"><LayoutDashboard className="mr-2.5 h-4 w-4" />Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem asChild className="p-2.5">
                        <Link href="/admin/settings"><Settings className="mr-2.5 h-4 w-4" />Settings</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="p-2.5 text-[9px] text-muted-foreground overflow-hidden text-ellipsis">{user.email}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="p-2.5 text-destructive focus:text-destructive">
                      <LogOut className="mr-2.5 h-4 w-4" />Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild className="p-2.5">
                    <Link href="/login"><User className="mr-2.5 h-4 w-4" />Login / Sign Up</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a ref={ref} className={cn("block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground", className)} {...props}>
          <div className="text-[10px] font-black leading-none uppercase tracking-wider">{title}</div>
          <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground mt-1">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"