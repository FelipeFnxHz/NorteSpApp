import { LandingNavbar } from "@/pages/landing/LandingNavbar"
import { Hero } from "@/pages/landing/Hero"
import { About } from "@/pages/landing/About"
import { Features } from "@/pages/landing/Features"
import { Stats } from "@/pages/landing/Stats"
import { Developers } from "@/pages/landing/Developers"
import { Gallery } from "@/pages/landing/Gallery"
import { Faq } from "@/pages/landing/Faq"
import { BotShowcase } from "@/pages/landing/BotShowcase"
import { CtaSection } from "@/pages/landing/CtaSection"
import { Footer } from "@/pages/landing/Footer"
import logoImg from "@/assets/hero.png"
import { useGallery } from "@/hooks/useGallery"

// Placeholder gallery images — swap for real server screenshots.
const GALLERY_IMAGES = Array.from({ length: 6 }, (_, index) => ({
  src: logoImg,
  alt: `Screenshot do servidor Norte SP ${index + 1}`,
}))

export function LandingPage() {
  const uploaded = useGallery()
  // Enquanto carrega (null) ou se a staff ainda não enviou nada, mantém os placeholders.
  const images = uploaded && uploaded.length > 0 ? uploaded.map(item => ({ src: item.src, alt: item.alt })) : GALLERY_IMAGES

  return (
    <>
      <LandingNavbar />
      <Hero />
      <About />
      <BotShowcase />
      <Features />
      <Stats />
      <Developers />
      <Gallery images={images} />
      <Faq />
      <CtaSection />
      <Footer />
    </>
  )
}
