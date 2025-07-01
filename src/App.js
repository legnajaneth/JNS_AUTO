import React, { useEffect, useState } from "react";
import "./App.css";
import NavigationBar from "./app/navigationBar.jsx";
import ServicePage from "./app/services.jsx";
import HomePage from "./app/homePage.jsx";
import InquirePage from "./app/inquire.jsx";
import AboutPage from "./app/aboutUs.jsx";
import BookingPage from "./app/booking.jsx";
import AdminPage from "./app/admin.jsx";
import AdminLogin from './app/AdminLogin';
import ProtectedRoute from './app/ProtectedRoute';
import Reviews from './app/Reviews';
import Silk from "./components/SilkBackground.js";  
import Threads from "./components/ThreadBackground.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { getToken, onMessage } from "firebase/messaging";
import { messaging, auth } from "./firebase/firebaseConfig";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Notification permission
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging);
          console.log("FCM Token:", token);
        } else {
          console.warn("Notification permission not granted.");
        }
      } catch (error) {
        console.error("Error retrieving FCM token:", error);
      }
    };

    requestNotificationPermission();
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      alert(`Notification: ${payload.notification.title}`);
    });

    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
     <div className="App">
      {/* Add this wrapper div */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}>
        <Threads />
      </div>
      
      <div className="content-container">
        <Router>
          <NavigationBar isAdmin={isAdmin} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/booking" element={<ServicePage />} />
            <Route path="/inquire" element={<InquirePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<BookingPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/review" element={<Reviews />} />
            <Route
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </div>

      <footer>
  <div className="footer-container">
    {/* Contact Section */}
    <div className="footer-section contact-info">
      <h3>Contact Us</h3>
      <div className="contact-details">
        <div className="contact-item">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
          <p>Greater Sacramento Area</p>
        </div>
        <div className="contact-item">
          <FontAwesomeIcon icon={faPhone} className="icon" />
          <p>+1-530-309-8007</p>
        </div>
        {/*<div className="contact-item">
          <FontAwesomeIcon icon={faEnvelope} className="icon" />
          <p>contact@jnsauto.com</p>
        </div>*/}
      </div>
    </div>

    {/* Quick Links Section */}
    <div className="footer-section quick-links">
      <h3>Quick Links</h3>
      <a href="/">Home</a>
      <a href="/services">Services / Booking</a>
      <a href="/about">About Us</a>
      <a href="/inquire">Get a Quote</a>
    </div>

    {/* Business Hours Section */}
    <div className="footer-section business-hours">
      <h3>Business Hours</h3>
      <p><span>Mon-Fri:</span> <span>8AM - 6PM</span></p>
      <p><span>Saturday:</span> <span>9AM - 4PM</span></p>
      <p><span>Sunday:</span> <span>Closed</span></p>
    </div>

    {/* Social Media Section */}
    <div className="footer-section social-container">
      <h3>Follow Us</h3>
     <div className="social-icons">
       {/*  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
         >
          <div className="layer">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span className ="icon-wrap"><FontAwesomeIcon icon={faFacebookF} /></span>
          </div>
        </a>*/}
        <a href="https://Instagram.com/jns.auto.spa?igsh=MzRIODBiNWFIZA==" target="_blank" rel="noopener noreferrer">
          <div className="layer">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span className ="icon-wrap"> 
            <FontAwesomeIcon icon={faInstagram} fab /></span>
          </div>
        </a>
      </div>
      <p>Connect with us on social media</p>
    </div>

    {/* Copyright Section */}
    <div className="footer-bottom">
      <p className="copyright">© {new Date().getFullYear()} JNS Auto Spa. All rights reserved.</p>
    </div>
  </div>

  {!isAdmin && (
    <a href="/admin/login" className="admin-icon-link" title="Staff Access">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="23" y1="11" x2="17" y2="11"></line>
      </svg>
    </a>
  )}
</footer>
    </div>
  );
}

export default App;