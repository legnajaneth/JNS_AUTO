import React from "react";
import  './navigationBar.css';


const NavigationBar =() => {
  return(
    <nav class="navBar">
        <ul>
          <li><a href = "#" class = "Home" >Home</a></li>
          <li><a href = "#" class = "Services" >services</a></li>
          <li><a href = "#" class = "About" >about </a></li>
        </ul>
    </nav>
);
};


export default NavigationBar;
