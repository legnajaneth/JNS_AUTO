import React from "react";
import { Link } from "react-router-dom";
import "./aboutUs.css";
import profile_pic from "../images/IMG_5.png";

export default function AboutPage() {
  return (
    <div className="about-container">
      {/* Navigation */}
      <nav className="about-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="nav-icon">🚗</span>
            <div>
              <h1 className="nav-title">JNS AUTO SPA</h1>
              <p className="nav-subtitle">Stay Clean</p>
            </div>
          </Link>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/services" className="nav-link">Services</Link>
            <Link to="/about" className="nav-active">About</Link>
            <Link to="/inquire" className="nav-link">Inquire</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="about-header">
        <div className="header-container">
          <div className="back-link">
            <Link to="/" className="back-button">
              <span className="back-icon">←</span>
              Back to Home
            </Link>
          </div>
          
          <div className="header-content">
            <h1 className="header-title">
              Meet Your <span className="header-highlight">Detailers</span>
            </h1>
            <p className="header-subtitle">Juan and Sarah</p>
            <p className="header-description">
              Passionate car enthusiasts dedicated to making your vehicle look and feel like new
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="about-main">
        <div className="main-container">
          <div className="profile-section">
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-image-container">
                <img src={profile_pic} alt="Juan and Sarah" className="profile-image" />
              </div>
              <div className="profile-info">
                <h3 className="profile-name">Juan & Sarah</h3>
                <p className="profile-title">Professional Auto Detailers</p>
              </div>
            </div>

            {/* Story */}
            <div className="story-section">
              <h2 className="section-title">Our Story</h2>
              <div className="story-content">
                <p>
                  At JNS Auto Spa, we take pride in making your car look and feel like new. 
                  Using high-quality products, we offer a complete range of services, from 
                  exterior washes and waxing to detailed interior cleaning.
                </p>
                <p>
                  Every vehicle we work on gets personalized care and attention to ensure 
                  flawless results. Whether it's your daily ride or your weekend cruiser, 
                  we treat every car as if it were our own.
                </p>
                <p>
                  Our commitment to quality means you can trust us to handle your vehicle 
                  with care and precision. Let us show you the difference—bring your car 
                  to JNS Auto Spa and fall in love with it all over again!
                </p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="values-section">
            <h2 className="section-title center">Why Choose Us?</h2>
            <div className="values-grid">
              {[
                {
                  icon: "❤️",
                  title: "Passion for Cars",
                  description: "We're car enthusiasts who understand the pride that comes with a well-maintained vehicle"
                },
                {
                  icon: "🏆",
                  title: "Quality Service",
                  description: "We use only the highest quality products and techniques for superior results"
                },
                {
                  icon: "👥",
                  title: "Personal Touch",
                  description: "Every car receives personalized care and attention to detail"
                },
                {
                  icon: "⏱️",
                  title: "Reliable Service",
                  description: "Professional, timely service you can count on every time"
                }
              ].map((value, index) => (
                <div key={index} className="value-card">
                  <div className="value-icon-container">
                    <span className="value-icon">{value.icon}</span>
                  </div>
                  <h3 className="value-title">{value.title}</h3>
                  <p className="value-description">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mission-section">
            <div className="mission-card">
              <h2 className="section-title center">Our Mission</h2>
              <div className="mission-content">
                <p>
                  Sarah and Juan, the owners of JNS Auto Spa, are car enthusiasts who understand 
                  the pride and passion that comes with owning a well-maintained vehicle. Their goal 
                  is to provide fellow car lovers with top-quality detailing services that make every 
                  car look its best, whether it's for a car meet or daily driving.
                </p>
                <p>
                  With attention to detail and a deep appreciation for all things automotive, 
                  Sarah and Juan are committed to delivering results that keep your ride looking show-ready.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <h2 className="section-title center">Ready to Experience the Difference?</h2>
            <p className="cta-description">
              Let us show you why car enthusiasts throughout the Greater Sacramento Area trust JNS Auto Spa
            </p>
            <div className="cta-buttons">
              <Link to="/services" className="cta-button primary">
                Book Your Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}