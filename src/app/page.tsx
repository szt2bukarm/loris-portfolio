'use client'
import Awards from '@/components/Awards/Awards'
import ContactCTA from '@/components/ContactCTA/ContactCTA'
import ContactForm from '@/components/ContactCTA/ContactForm'
import ContactWrapper from '@/components/ContactCTA/ContactWrapper'
import Experience from '@/components/Experience/Experience'
import Footer from '@/components/Footer/Footer'
import Hero from '@/components/Hero/Hero'
import WorksMarquee from '@/components/WorksMarquee/WorksMarquee'
import { useEffect, useState } from 'react'

export default function Home() {
  const [renderkey,setRenderkey] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setRenderkey(renderkey + 1);
    }, 500);
  },[])

  return (
    <main className='w-full h-full'>
      <Hero />
      <WorksMarquee />
      <div className='w-full h-full' key={renderkey}>
        <Awards />
        <Experience />
        <ContactCTA />
        <Footer />
      </div>

    </main>
  )
}