'use client'
import Awards from '@/components/Awards/Awards'
import ContactCTA from '@/components/ContactCTA/ContactCTA'
import ContactForm from '@/components/ContactCTA/ContactForm'
import ContactWrapper from '@/components/ContactCTA/ContactWrapper'
import Experience from '@/components/Experience/Experience'
import Footer from '@/components/Footer/Footer'
import Hero from '@/components/Hero/Hero'
import WorksMarquee from '@/components/WorksMarquee/WorksMarquee'

export default function Home() {
  return (
    <main className='w-full h-full'>
      <Hero />
      <WorksMarquee />
      <Awards />
      <Experience />
      <ContactCTA />
      <Footer />
    </main>
  )
}