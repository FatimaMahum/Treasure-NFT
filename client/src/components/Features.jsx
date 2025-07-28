import styles from "./Features.module.css"

const features = [
  {
    icon: "🤖",
    title: "AI Trading",
    desc: "Proprietary AI analyzes thousands of NFTs to find the most profitable opportunities.",
    gradient: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
  },
  {
    icon: "🔒",
    title: "Secure Wallets",
    desc: "Military-grade encryption protects your digital assets at all times.",
    gradient: "linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)",
  },
  {
    icon: "💰",
    title: "Daily Rewards",
    desc: "Earn passive income with our daily profit distribution system.",
    gradient: "linear-gradient(135deg, #cd7f32 0%, #e6a85c 100%)",
  },
  {
    icon: "👥",
    title: "Referral Program",
    desc: "Earn 5% commission on all investments made by your referrals.",
    gradient: "linear-gradient(135deg, #ffd700 0%, #c0c0c0 100%)",
  },
]

const Features = () => (
  <section className={styles.features}>
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Why Choose NovaEye?</h2>
        <p className={styles.sectionSubtitle}>Experience the future of NFT investing with our cutting-edge platform</p>
      </div>
      <div className={styles.featureGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.featureCard}>
            <div className={styles.cardHeader}>
              <div className={styles.featureIcon} style={{ background: feature.gradient }}>
                {feature.icon}
              </div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.desc}</p>
            </div>
            <div className={styles.cardGlow}></div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default Features
