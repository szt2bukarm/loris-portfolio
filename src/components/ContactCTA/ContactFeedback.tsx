import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRef, useState } from "react"

const data = [
  {
    name: "Freelance Client",
    text: "He’s easy to work with and very attentive to<br>all the requests I had."
  },
  {
    name: "AVIATION COMPANY",
    text: "Thanks so much Loris and team for your excellent work. We'll absolutely be working with you again. So impressed by your work, speed, and understanding of what we're looking for. Couldn't be happier."
  },
  {
    name: "Leading Telecom Provider",
    text: "Thank you for your professionalism, it was a pleasure working with you. You immediately indicated what I was looking for, and you executed it perfectly..."
  }
]

export default function ContactFeedback() {
  const containerRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)

  const [name, setName] = useState(data[0].name)
  const [text, setText] = useState(data[0].text)

  useGSAP(() => {
    const el = containerRef.current
    if (!el) return

    const tl = gsap.timeline({ repeat: -1 })

    tl
      .fromTo(
        el,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power1.out" }
      )
      .to(el, { duration: 5 })
      .to(el, {
        opacity: 0,
        duration: 0.8,
        ease: "power1.in",
        onComplete: () => {
          indexRef.current = (indexRef.current + 1) % data.length
          setName(data[indexRef.current].name)
          setText(data[indexRef.current].text)
        }
      })
  }, [])

  return (
    <div
        data-gsap="contact-feedback"
      ref={containerRef}
      className="flex flex-col gap-[10px] w-[500px] text-center opacity-0 mx-auto xl:translate-x-[-50px] 2xl:translate-x-0 mt-[50px] min-h-[120px] scale-[0.75] sm:scale-100"
    >
      <p className="text-h4 font-intranet text-brightgray leading-[100%]">
        {name}
      </p>
      <p
        className="text-md font-ppregular text-white leading-[130%]"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  )
}
