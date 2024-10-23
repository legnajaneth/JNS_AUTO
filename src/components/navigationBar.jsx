import React from "react";
import { Link } from 'react-router-dom';
import  './navigationBar.css';


const NavigationBar =() => {
  return(
    <nav class="navBar">
        <ul>
          <li><Link to = "/home" class = "Home" >Home</Link></li>
          <li><Link to = "/services" class = "Services" >services</Link></li>
          <li><Link to = "/about" class = "About" >about </Link></li>
        </ul>
    </nav>
);
};


export default NavigationBar;
