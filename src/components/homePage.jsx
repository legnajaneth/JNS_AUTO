import React from "react";
import "./homePage.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

function HomePage() {
    return (
      <div className="homepage">
        <header className="main-header">
          <div className="left-content">
            <h1 className="title" ><i>JNS AUTO</i></h1>
              <p className="descr"> The sites moto goes here</p>
          </div>
          <div className="right-content">
            <p>here will go an image</p>
      </div>
      </header>

      <section className="contact-info">
        <h2> Contact Us </h2>
          <p>Email: emailgoeshere</p>
          <p>Phone: +1-111-111-1111</p>
          <p>Service In the Greater Sacramento Area</p>
      </section>

      <footer>
        <div className="social-icons">
          <a href = "https://facebook.com"target="_blank" rel="noopener noreferrer">
            <div className="layer"> 
              <span class = "fab fa-facebook-f"></span>
            </div>
          </a>

          <a href= "https://Instagram.com"target="_blank" rel="noopener noreferrer">
            <div className="layer">
              <span class = "fab fa-instagram"></span>
            </div>
          </a>
        </div>
      </footer>
      </div>
    );
  };
  export default HomePage;