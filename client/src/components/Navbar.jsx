import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false); // Close menu after logout
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the navbar
      const navbar = event.target.closest('nav');
      if (isMenuOpen && !navbar) {
        setIsMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <span className={styles.treasure}>Nova</span>
          <span className={styles.nft}>Eye</span>
        </div>
        
        {/* Hamburger Menu Button */}
        <button 
          className={styles.mobileToggle} 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={isMenuOpen ? styles.bar1Open : ''}></span>
          <span className={isMenuOpen ? styles.bar2Open : ''}></span>
          <span className={isMenuOpen ? styles.bar3Open : ''}></span>
        </button>

        <ul className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksOpen : ''}`}>
          <li>
            <Link to="/" className={styles.navLink} onClick={closeMenu}>
              Home
            </Link>
          </li>
          {user ? (
            user.role === "admin" ? (
              // Admin navigation - Home and Admin Dashboard
              <>
                <li>
                  <Link to="/admin" className={styles.navLink} onClick={closeMenu}>
                    Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/withdrawals" className={styles.navLink} onClick={closeMenu}>
                    Withdrawal Requests
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className={styles.loginBtn}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // Regular user navigation - Home, Dashboard, Referrals
              <>
                <li>
                  <Link to="/dashboard" className={styles.navLink} onClick={closeMenu}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/wallet-topup" className={styles.navLink} onClick={closeMenu}>
                    Top Up Wallet
                  </Link>
                </li>
                <li>
                  <Link to="/referrals" className={styles.navLink} onClick={closeMenu}>
                    Referrals
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className={styles.loginBtn}>
                    Logout
                  </button>
                </li>
              </>
            )
          ) : (
            // Non-logged users - Home, About, Invest, FAQ, Login
            <>
              <li>
                <Link to="/about" className={styles.navLink} onClick={closeMenu}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/invest" className={styles.navLink} onClick={closeMenu}>
                  Invest
                </Link>
              </li>
              <li>
                <Link to="/faq" className={styles.navLink} onClick={closeMenu}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/login" className={styles.loginBtn} onClick={closeMenu}>
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
