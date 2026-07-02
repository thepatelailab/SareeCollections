import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutUsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-headline text-primary text-center mb-8">
            About SareeDukan.Com
          </h1>
          <p className="text-lg text-center text-muted-foreground mb-12">
            Weaving stories of tradition and elegance, one saree at a time. Our mission is to bring you the finest collection of sarees that blend timeless craftsmanship with contemporary style.
          </p>

          <div className="relative aspect-video mb-12">
            <img 
              src="https://picsum.photos/seed/team/1200/600" 
              alt="Our team working"
              className="object-cover w-full h-full rounded-lg shadow-lg"
              data-ai-hint="team collaboration"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <h2 className="text-3xl font-headline text-primary mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded in 2024, SareeDukan.Com started with a simple idea: to make the rich heritage of Indian textiles accessible to everyone. We traveled across the country, from the silk weavers of Kanchipuram to the block printers of Jaipur, to curate a collection that celebrates the artistry and diversity of the saree.
                <br/><br/>
                We believe that every saree has a story, and we are dedicated to preserving these stories while empowering the artisans who create them.
              </p>
            </div>
             <div>
              <img 
                src="https://picsum.photos/seed/weaving/600/400" 
                alt="Traditional weaving"
                className="object-cover w-full h-full rounded-lg shadow-lg"
                data-ai-hint="traditional weaving"
              />
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl font-headline text-primary mb-8">Meet the Team</h2>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src="https://picsum.photos/seed/person1/200" data-ai-hint="woman portrait" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">Jane Doe</h3>
                <p className="text-muted-foreground text-sm">Founder & CEO</p>
              </div>
               <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src="https://picsum.photos/seed/person2/200" data-ai-hint="man portrait" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">John Smith</h3>
                <p className="text-muted-foreground text-sm">Head of Design</p>
              </div>
               <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src="https://picsum.photos/seed/person3/200" data-ai-hint="woman smiling" />
                  <AvatarFallback>AP</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">Anjali Patel</h3>
                <p className="text-muted-foreground text-sm">Curation Lead</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
