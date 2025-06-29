import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './services.css';

const ServicePage = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleBookNow = (packageName) => {
    setSelectedPackage(packageName);
    navigate('/booking', { state: { package: packageName } });
  };

  const packages = [
    {
      name: "Exterior Wash",
      features: [
        "Polishing",
        "Wax Coat",
        "Ceramic Coat",
        "Black Trim Restore",
        "Tire Shine"
      ],
      price: "$99"
    },
    {
      name: "Interior Service",
      features: [
        "Complete detail(deep clean & Vaccum)",
        "Carpet Shampoo",
        "Seat Treatment",
        "Steam treatment",
        "Pet Hair Removal",
        "Degreasing(Panels, Doors, Dash)"
      ],
      price: "$129"
    },
    {
      name: "Add Ons",
      features: [
        "Leather Treatment",
        "UV Protection(Panels, Doors, Dash)",
        "Synthetic Wax Coat",
        "Hydrophobic Treatment",
        "(Carpet & Seats)"
      ],
      price: "$49+"
    }
  ];

  return (
    <div className="services">
      <h1><i>Auto Spa Services</i></h1>
      <p>We provide a variety of services to keep your car clean and you happy</p>
    
      <section>
        <div className="card-container">
          {packages.map((pkg, index) => (
            <div className="card" key={index}>
              <h3>{pkg.name}</h3>
              <ul>
                {pkg.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <div className="price">{pkg.price}</div>
              <button 
                className="book-now-btn" 
                onClick={() => handleBookNow(pkg.name)}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </section>
    </div> 
  );
};

export default ServicePage;