import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRef, useState } from "react"

const data = [
  {
    name: "Freelance Client",
    image: null,
    text: "He’s easy to work with and very attentive to<br>all the requests I had."
  },
  {
    name: "AMCA",
    image: "/assets/clients/amca.png",
    text: "Thanks so much Loris and team for your excellent work. We'll absolutely be working with you again. So impressed by your work, speed, and understanding of what we're looking for. Couldn't be happier."
  },
  {
    name: "Leading Telecom Provider",
    image: null,
    text: "Thank you for your professionalism, it was a pleasure working with you. You immediately indicated what I was looking for, and you executed it perfectly..."
  },
  {
    name: "ParkBee",
    image: "/assets/clients/parkbee.png",
    text: "Thanks so much! It was great working with you on this project. They look great, I believe it’s a wrap :)"
  }
]

export default function ContactFeedback() {
  const containerRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)

  const [name, setName] = useState(data[0].name)
  const [image, setImage] = useState(data[0].image)
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
          setImage(data[indexRef.current].image)
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
      {image === null && (
        <p className="text-h4 font-intranet text-brightgray leading-[100%]">
          {name}
        </p>
      )}
      {image !== null && (
        <img src={image} alt={name} className="h-[30px] object-contain mb-[16px]" />
      )}
      <p
        className="text-md font-ppregular text-white leading-[130%]"
        dangerouslySetInnerHTML={{ __html: `<span style="color: #888888; margin-right: 2px;">"</span>${text}<span style="color: #888888; margin-left: 2px;">"</span>` }}
      />
    </div>
  )
}
