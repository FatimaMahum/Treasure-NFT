import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Team from "../components/Team"
import Values from "../components/Values"
import TypewriterText from "../components/TypewriterText" 
import styles from "./About.module.css"

const About = () => {
  return (
    <>
      <Navbar />
      <main className={styles.aboutContainer}>
        <section className={`${styles.aboutHero} fade-in`}>
          <h1 className={`${styles.heroTitle} ${styles.animatedTitle}`}>
            Our Vision of <span className={styles.highlight}>AI-Powered NFT Trading</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Democratizing access to profitable NFT investments through artificial intelligence
          </p>
        </section>

        <section className={`${styles.aboutStory} slide-up`}>
          <h2 className={`${styles.storyTitle}`}>
            <TypewriterText text="Our Story" className={styles.typewriterEffect} />
          </h2>
          <p className={styles.storyText}>
            <span className={styles.storyHighlight}>Founded in 2023</span>, NovaEye was created with a simple
            mission: to make NFT investing accessible to everyone, regardless of their technical knowledge or experience
            in the crypto space.
          </p>
          <p className={styles.storyText}>
            Our team of AI researchers and blockchain developers have created a proprietary algorithm that analyzes NFT
            <span className={styles.storyHighlight}> market trends 24/7</span>, identifying the most promising
            investment opportunities.
          </p>
         
        </section>

        <Team />
        <Values />
      </main>
      <Footer />
    </>
  )
}

export default About
