import React, {useState} from "react";
import { Link } from 'react-router-dom';
import  './navigationBar.css';
import jns_logo from'../images/jns_logo.jpg';


const NavigationBar =() => {

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
};
  return(
    <nav class="navBar">
      <div className="navContainer">
      <img src={jns_logo} alt= "jns logo" className="navbar-logo"/>
       <div class="menu-toggle" id="mobile-menu" onClick={toggleMenu}> 
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
      
        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <li><Link to = "/home" class = "Home" >Home</Link></li>
          <li><Link to = "/services" class = "Services" >Services</Link></li>
          <li><Link to = "/about" class = "About" >About </Link></li>
          <li><Link to = "/inquire" class = "Inquire" >Inquire</Link></li>
        </ul>
  </div> 
   </nav>
    
);
};


export default NavigationBar;
