import styles from "./Testimonials.module.css"

const testimonials = [
  {
    text: "I made 300% returns in just 3 months! This platform is absolutely amazing and the AI really works.",
    author: "John D.",
    role: "Crypto Investor",
    rating: 5,
    profit: "+$15,420",
  },
  {
    text: "The AI really works. I'm earning passive income while I sleep. Best investment decision I've ever made!",
    author: "Sarah K.",
    role: "Digital Artist",
    rating: 5,
    profit: "+$8,750",
  },
  {
    text: "Professional platform with incredible results. The daily profits are consistent and reliable.",
    author: "Mike R.",
    role: "Business Owner",
    rating: 5,
    profit: "+$22,100",
  },
]

const Testimonials = () => (
  <section className={styles.testimonials}>
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>What Our Investors Say</h2>
        <p className={styles.sectionSubtitle}>
          Join thousands of satisfied investors who are already earning with our AI
        </p>
      </div>
      <div className={styles.testimonialGrid}>
        {testimonials.map((testimonial, index) => (
          <div key={index} className={styles.testimonialCard}>
            <div className={styles.cardHeader}>
              <div className={styles.stars}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className={styles.star}>
                    ⭐
                  </span>
                ))}
              </div>
              <div className={styles.profit}>{testimonial.profit}</div>
            </div>
            <blockquote className={styles.testimonialText}>"{testimonial.text}"</blockquote>
            <div className={styles.author}>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{testimonial.author}</span>
                <span className={styles.authorRole}>{testimonial.role}</span>
              </div>
            </div>
            <div className={styles.cardGlow}></div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default Testimonials
