import React from "react";
import './services.css';

const ServicePage = () => {
    return(
        <div>
            <h1><i>Auto Spa Services</i></h1>
            <p>We provide a variety of services to
                <br></br> keep your car clean 
                <br></br>and you happy</p>
        
            <section>
                <div className = "card-container">
                    <div className="card">
                        <h3>Packet 1</h3>
                        <p> service </p>
                        <p> service</p>
                        <p> service</p>
                        <p> service</p>
                        <p> service </p>
                        <button class= "buttonc">Click Me</button>
                    </div>
                    <div className="card">
                        <h3>Packet 2</h3>
                        <p> service 1</p>
                        <p> service </p>
                        <p> service</p>
                        <p> service</p>
                        <p> service</p>
                        <button class= "buttonc">Click Me</button>
                    </div>
                    <div className="card">
                        <h3>Packet 3</h3>
                        <p> Service 1</p>
                        <p> service </p>
                        <p> service</p>
                        <p> service</p>
                        <p> service</p>
                        <button class= "buttonc">Click Me</button>
                    
                    </div>
                </div>
            </section>
        </div> 
    );
};

export default ServicePage;