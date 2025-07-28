"use client"

import { useState, useEffect } from "react"
import Navbar from "../components/Navbar" // Import Navbar
import Footer from "../components/Footer" // Import Footer
import styles from "./FAQ.module.css"

const faqs = [
  {
    question: "How does the AI NFT trading work?",
    answer:
      "Our proprietary AI algorithm analyzes thousands of NFT transactions daily, identifying undervalued assets with high growth potential. It automatically buys and sells based on market trends, ensuring optimal returns for our investors.",
  },
  {
    question: "When will I get withdrawals?",
    answer:
      "Withdrawals are processed within 24 hours after verification 😅. For VIP members, withdrawals are instant.",
  },
  {
    question: "Is this platform legal?",
    answer:
      "Yes! We are backed by an AI engine and operate in full compliance with all applicable regulations. However, please note this is an academic project only.",
  },
  {
    question: "What's the minimum investment?",
    answer: "The minimum investment is $10 for our Bronze Plan. Higher tiers offer better daily returns.",
  },
  {
    question: "How are daily profits calculated?",
    answer:
      "Profits are calculated based on your investment plan (3%, 5%, or 8% daily) and credited to your account every 24 hours.",
  },
  {
    question: "Can I lose money?",
    answer:
      "Our AI has a 99.9% success rate, so losses are extremely rare. However, all investments carry some risk. Remember, this is just an academic project.",
  },
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    console.log("FAQ page loaded successfully");
    console.log("Current URL:", window.location.href);
    console.log("FAQ component mounted");
  }, []);

  const toggleFAQ = (index) => {
    console.log("FAQ toggle clicked:", index);
    setOpenIndex(openIndex === index ? null : index)
  }

  console.log("FAQ component rendering");

  return (
    <>
      <Navbar /> {/* Render Navbar */}
      <main className={`${styles.faqContainer} fade-in`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <p className={styles.sectionSubtitle}>Find answers to the most common questions about TreasureNFT</p>
        </div>

        <div className={styles.faqSection}>
          {faqs.map((faq, index) => (
            <div className={`${styles.faqItem} slide-up`} key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.faqQuestion} onClick={() => toggleFAQ(index)}>
                <h3 className={styles.faqQuestionTitle}>{faq.question}</h3>
                <span className={`${styles.toggleIcon} ${openIndex === index ? styles.open : ""}`}>
                  {openIndex === index ? "-" : "+"}
                </span>
              </div>
              {openIndex === index && (
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              )}
              <div className={styles.cardGlow}></div>
            </div>
          ))}
        </div>

        <div className={`${styles.supportSection} slide-up`} style={{ animationDelay: `${faqs.length * 0.1}s` }}>
          <h3>Need more help?</h3>
          <p>
            Contact our support team at <a href="mailto:support@treasurenft.com">support@treasurenft.com</a> (not a real
            email)
          </p>
          <div className={styles.cardGlow}></div>
        </div>
      </main>
      <Footer /> {/* Render Footer */}
    </>
  )
}

export default FAQ
