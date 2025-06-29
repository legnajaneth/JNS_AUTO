import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './navigationBar.css';
import jns_logo from '../images/jns_logo.jpg';
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";

const NavigationBar = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = isOpen ? 'auto' : 'hidden';
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navBar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navContainer">
        <Link to="/" className="logo-link">
          <img 
            src={jns_logo} 
            alt="JNS Auto Spa Logo" 
            className="navbar-logo"
          />
        </Link>

        <div 
          className={`menu-toggle ${isOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <li><Link to="/home" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/services" onClick={() => setIsOpen(false)}>Services</Link></li>
          <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
          <li><Link to="/inquire" onClick={() => setIsOpen(false)}>Inquire</Link></li>
          <li><Link to="/review" onClick={() => setIsOpen(false)}>Review</Link></li>
          
          {isAdmin && (
          <>
          <li>
            <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="nav-link">
                Dashboard
            </Link>
          </li>
          <li>
            <button onClick={handleSignOut} className="sign-out-btn nav-link">
              Sign Out
            </button>
          </li>
          </>
        )}
        </ul>
      </div>
    </nav>
  );
};

export default NavigationBar;