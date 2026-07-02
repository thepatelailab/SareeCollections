import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/providers/app-provider';
import { CartProvider } from '@/components/providers/cart-provider';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Saree Dukan',
  description: 'An online exclusive Saree store.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col pb-20 md:pb-0">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <BottomNav />
              </div>
              <Toaster />
            </CartProvider>
          </AppProvider>
        </FirebaseClientProvider>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}