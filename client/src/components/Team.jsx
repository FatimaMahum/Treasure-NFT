import React from "react";
import styles from "./Team.module.css";

import johnImg from "../assets/john.jpg";
import sarahImg from "../assets/sarah.jpg";
import mikeImg from "../assets/mike.jpg";
import emilyImg from "../assets/emily.png";

const teamMembers = [
  {
    name: "John Smith",
    role: "CEO & Founder",
    description: "Blockchain expert with 10+ years in crypto",
    image: johnImg,
  },
  {
    name: "Sarah Johnson",
    role: "AI Research Lead",
    description: "PhD in Machine Learning",
    image: sarahImg,
  },
  {
    name: "Mike Chen",
    role: "CTO",
    description: "Former lead developer at a major exchange",
    image: mikeImg,
  },
  {
    name: "Emily Wilson",
    role: "Head of Security",
    description: "Cybersecurity specialist",
    image: emilyImg,
  },
];

const Team = () => (
  <section className={`${styles.teamSection} fade-in`}>
    <div className={styles.sectionContentWrapper}>
      <h2 className={styles.sectionTitle}>Meet The Team</h2>
      <p className={styles.sectionSubtitle}>
        Our dedicated experts driving innovation in NFT investments
      </p>
      <div className={styles.teamGrid}>
        {teamMembers.map((member, index) => (
          <div
            className={`${styles.teamMember} slide-up`}
            key={member.name}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <img
              src={member.image}
              alt={member.name}
              className={styles.memberImage}
            />
            <h3 className={styles.memberName}>{member.name}</h3>
            <p className={styles.memberRole}>{member.role}</p>
            <p className={styles.memberDescription}>{member.description}</p>
            <div className={styles.cardGlow}></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Team;
