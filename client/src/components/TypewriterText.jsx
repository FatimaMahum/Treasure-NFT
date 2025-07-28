"use client"

import { useState, useEffect } from "react"

const TypewriterText = ({ text, delay = 70, className = "" }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, delay)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, delay, text])

  return <span className={className}>{displayedText}</span>
}

export default TypewriterText
