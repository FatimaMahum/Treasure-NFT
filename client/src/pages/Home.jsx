import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import styles from './Home.module.css';

const Home = () => (
  <div className={styles.homeWrapper}>
    <Navbar />
    <Hero />
    <Features />
    <Testimonials />
    <Footer />
  </div>
);

export default Home;
