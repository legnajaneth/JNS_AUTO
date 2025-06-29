import React, { useState } from 'react';
import './homePage.css';
import './reviewSystem.css';
import ReviewsCarousel from './ReviewsCarousel';

function HomePage() {
  const [activeSection, setActiveSection] = useState('reviews');
  
  return (
    <div className="homepage">
      <header className="main-header">
        <div className="title-spot">
          <h1 className="title"><b><i>JNS AUTO SPA</i></b></h1>
          <p className="descr"><b><i>Stay Clean</i></b></p>
        </div>
      </header>
      
      <section className="social-section">
        <div className="section-tabs-glass-card">
          {/*<button 
            className={`tab-button ${activeSection === 'instagram' ? 'active' : ''}`}
            onClick={() => setActiveSection('instagram')}
          >
            Instagram
          </button>*/}
          <button 
            className={`tab-button ${activeSection === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveSection('reviews')}
          >
            Customer Reviews
          </button>
        </div>
        
        <div className="section-content">
          {activeSection === 'reviews' && <ReviewsCarousel />}
        </div>
      </section>
    </div>
  );
}

export default HomePage;