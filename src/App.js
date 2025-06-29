import React from 'react';
import './App.css';
import NavigationBar from './components/navigationBar.jsx';
import ServicePage from './components/services.jsx';
import HomePage from './components/homePage.jsx';
import InquirePage from './components/inquire.jsx';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div className="App">
    <main>
      <Router basename="/JNS_AUTO">
        <NavigationBar/>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path= "/services" element={<ServicePage/>} />
            <Route path= "/inquire" element={<InquirePage/>}/>
          </Routes>
      </Router>
    </main>

      <footer>
        <section className="contact-info">
        <h2> Contact Us </h2>
          <p>Email: emailgoeshere@email.com</p>
          <p>Phone: +1-111-111-1111</p>
          <p>Service In the Greater Sacramento Area</p>
          
       
        <div className="social-icons">
          <a href = "https://facebook.com"target="_blank" rel="noopener noreferrer">
            <div className="layer"> 
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span class = "fab fa-facebook-f"></span>
            </div>
          </a>

          <a href= "https://Instagram.com/jns.auto.spa?igsh=MzRIODBiNWFIZA=="target="_blank" rel="noopener noreferrer">
            <div className="layer">
            <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span class = "fab fa-instagram"></span>
            </div>
          </a>
        </div> </section>
      </footer>
     </div>
  );
}

export default App;
