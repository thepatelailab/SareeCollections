import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center transition-all hover:opacity-90 active:scale-95"
    >
      <Image 
        src="/SareeDukan.png" 
        alt="SareeDukan.Com Logo" 
        width={400} 
        height={133} 
        className="h-10 sm:h-14 md:h-18 lg:h-20 w-auto object-contain"
        priority
      />
    </Link>
  );
}
