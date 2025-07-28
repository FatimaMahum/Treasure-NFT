import React from "react";
import styles from "./Hero.module.css";
import nftImage from "../assets/nft.png"; // 

const Hero = () => (
  <header className={styles.hero}>
    <div className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Invest in NFTs with
            <span className={styles.highlight}> AI-Driven Profits!</span>
          </h1>
          <p className={styles.heroDescription}>
            Our advanced AI algorithm maximizes your returns by analyzing the NFT market 24/7, identifying the most
            profitable opportunities with precision and speed.
          </p>
          <div className={styles.ctaButtons}>
            <a href="/register" className={styles.btnPrimary}>
              <span>Join Now</span>
              <div className={styles.btnGlow}></div>
            </a>
            <a href="/invest" className={styles.btnSecondary}>
              <span>Learn More</span>
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>99.9%</span>
              <span className={styles.statLabel}>Success Rate</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>$2M+</span>
              <span className={styles.statLabel}>Total Invested</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>5000+</span>
              <span className={styles.statLabel}>Happy Investors</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.heroVisual}>
        <div className={styles.heroImageContainer}>
          <img src={nftImage} alt="NFT Investment Dashboard" className={styles.heroImage} />
          <div className={styles.floatingCard}>
            <div className={styles.cardIcon}>🤖</div>
            <div className={styles.cardText}>
              <span>AI Analysis</span>
              <span>+24.5% Today</span>
            </div>
          </div>
          <div className={styles.floatingCard2}>
            <div className={styles.cardIcon}>💰</div>
            <div className={styles.cardText}>
              <span>Daily Profit</span>
              <span>$1,247.50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default Hero;
