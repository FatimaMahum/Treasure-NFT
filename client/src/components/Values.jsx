import styles from "./Values.module.css";

const staticValues = [
  {
    title: "Transparency",
    description: "We believe in clear communication about how our platform works and our AI's performance.",
    icon: "\uD83D\uDC41\uFE0F",
  },
  {
    title: "Innovation",
    description: "Constantly improving our AI algorithms and platform features for better returns and user experience.",
    icon: "\uD83D\uDCA1",
  },
  {
    title: "Security",
    description: "Your funds and data are protected with enterprise-grade encryption and robust security protocols.",
    icon: "\uD83D\uDEE1\uFE0F",
  },
];

const Values = () => {
  return (
    <section className={`${styles.valuesSection} fade-in`}>
      <div className={styles.sectionContentWrapper}>
        <h2 className={styles.sectionTitle}>Our Values</h2>
        <p className={styles.sectionSubtitle}>The core principles that guide our mission and operations</p>
        <div className={styles.valuesGrid}>
          {staticValues.map((value, index) => (
            <div
              className={`${styles.valueCard} slide-up`}
              key={value.title}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.valueIcon}>{value.icon}</div>
              <h3 className={styles.valueTitle}>{value.title}</h3>
              <p className={styles.valueDescription}>{value.description}</p>
              <div className={styles.cardGlow}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;
