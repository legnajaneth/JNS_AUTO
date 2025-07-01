import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './services.css';

const ServicePage = () => {
  const navigate = useNavigate();
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const handleBookNow = (packageName) => {
    navigate('/booking', { 
      state: { 
        package: packageName,
        addOns: selectedAddOns 
      } 
    });
  };

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev => 
      prev.includes(addOn) 
        ? prev.filter(item => item !== addOn) 
        : [...prev, addOn]
    );
  };

  const packages = [
    {
      name: "Exterior Wash",
      features: [
        "Hand wash & dry",
        "Wheel cleaning",
        "Tire dressing",
        "Window cleaning"
      ],
      price: "$99",
      addOns: [
        "Ceramic Coating +$150",
        "Paint Correction +$200",
        "Headlight Restoration +$75"
      ]
    },
    {
      name: "Interior Service",
      features: [
        "Complete vacuuming",
        "Dashboard cleaning",
        "Door panel cleaning",
        "Seat cleaning"
      ],
      price: "$129",
      addOns: [
        "Leather Conditioning +$60",
        "Odor Removal +$45",
        "Steam Cleaning +$75"
      ]
    },
    {
      name: "Full Detail",
      features: [
        "Everything in Exterior Wash",
        "Everything in Interior Service",
        "Clay bar treatment",
        "Carpet shampoo"
      ],
      price: "$199",
      addOns: [
        "Engine Bay Cleaning +$60",
        "Undercarriage Wash +$45",
        "Fabric Protection +$85"
      ]
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
              
              {/* Add-ons section */}
              <div className="add-ons-section">
                <h4>Available Add-Ons:</h4>
                <ul className="add-ons-list">
                  {pkg.addOns.map((addOn, i) => (
                    <li 
                      key={i}
                      className={selectedAddOns.includes(addOn) ? 'selected' : ''}
                      onClick={() => toggleAddOn(addOn)}
                    >
                      {addOn}
                    </li>
                  ))}
                </ul>
              </div>

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