import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">Juntaro</h1>
      <div className="relative">
        <Hero />
        <Footer className="absolute inset-x-0 bottom-0 z-20" />
      </div>
    </main>
  );
}
