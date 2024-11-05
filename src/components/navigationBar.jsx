import React from "react";
import { Link } from 'react-router-dom';
import  './navigationBar.css';
import jns_logo from'../images/jns_logo.jpg';


const NavigationBar =() => {
  return(
    <nav class="navBar">
        <ul>
          <img src={jns_logo} alt= "jns logo" className="navbar-logo"/>
          <li><Link to = "/home" class = "Home" >Home</Link></li>
          <li><Link to = "/services" class = "Services" >Services</Link></li>
          <li><Link to = "/about" class = "About" >About </Link></li>
          <li><Link to = "/inquire" class = "Inquire" >Inquire</Link></li>
        </ul>
    </nav>
);
};


export default NavigationBar;
