import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import Premium from '@/components/Premium'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'
import WaitlistSection from '@/components/WaitlistSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Premium />
      <WaitlistSection />
      <Newsletter />
      <Footer />
    </main>
  )
}