/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase/firebaseConfig';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './booking.css';

const localizer = momentLocalizer(moment);

// Emoji icon components
const CalendarIcon = () => <span className="card-icon">📅</span>;
const ClockIcon = () => <span className="card-icon">⏱️</span>;
const MagicIcon = () => <span className="card-icon">✨</span>;
const CheckIcon = () => <span className="card-icon">✓</span>;
const CarIcon = () => <span className="card-icon">🚗</span>;
const SizeIcon = () => <span className="card-icon">📏</span>;

const Booking = () => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingComplete, setBookingComplete] = useState(false);
  const totalSteps = 4;

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    vehicleSize: '',
    service: '',
    date: '',
    time: '09:00',
    notes: '',
    addOns: []
  });
  
  const [vehicleImages, setVehicleImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [blackoutDates, setBlackoutDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  // Services data with add-ons and tiered pricing
  const [services] = useState([
    { 
      id: 'exterior',
      name: 'Exterior Detail', 
      prices: {
        sedan: 90,
        largeSuv: 110,
        oversized: 120
      },

      description: ['\n✓Complete exterior cleaning and protection',
          '\n✓Full rims, tires, exhaust cleaning',
          '\n✓Pre-wash and foam bath',
          '\n✓Complete dry',
          '\n✓Ceramic wax application',
          '\n✓Tire shine application'
        ].join('\n'),
      addOns: [
       { name: 'Ceramic Coating', prices: { sedan: 'contact for quote', largeSuv: 'contact for quote', oversized:'contact for quote' }, },
       { name: 'Paint Correction', prices: { sedan: 'contact for quote', largeSuv: 'contact for quote', oversized:'contact for quote' }, },
       { name: 'Clay Bar Treatment', prices: { sedan: 20, largeSuv: 30, oversized: 40 },  }
      ]
    },
    { 
      id: 'interior',
      name: 'Interior Detail', 
      prices: {
        sedan: 120,
        largeSuv: 150,
        oversized: 170
      },
     
      description: [
      ' \n✓Vacuuming on seats and flooring ' ,
      ' \n✓Deep cleaning for your vehicle interior ', 
      ' \n✓Tornador Blast for hard to reach areas ',
      ' \n✓Full steam cleaning ' ,
      ' \n✓Mats cleaned and restored ',
      ' \n✓streakless windows and mirrors '
    ].join('\n'),
      addOns: [
        { name: 'Pet hair removal', prices: { sedan: 30, largeSuv: 30, oversized: 30 }, },
        { name: 'Odor Elimination', prices: { sedan: 20, largeSuv: 20, oversized: 20 }, },
        { name: 'Seat Shampoo and Extraction', prices: { sedan: 50, largeSuv: 50, oversized: 50 }, },
        { name: 'Fabric Protection', prices: { sedan: 20, largeSuv: 25, oversized: 30 },  }
      ]
    },
    { 
      id: 'full',
      name: 'Full Detail', 
      prices: {
        sedan: 199,
        largeSuv: 249,
        oversized: 279
      },
      description: '✓Complete interior and exterior detailing combined',
      addOns: [
        { name: 'Pet hair removal', prices: { sedan: 30, largeSuv: 30, oversized: 30  },},
        { name: 'Odor Elimination', prices: { sedan: 20, largeSuv: 20, oversized: 20 }, },
        { name: 'Fabric Protection', prices: { sedan: 20, largeSuv: 25, oversized: 30 }, },
        { name: 'Seat Shampoo and Extraction', prices: { sedan: ' starts at 50', largeSuv:' starts at 50', oversized:' starts at 50' }, },
        { name: 'Clay Bar Treatment', prices: { sedan: 50, largeSuv: 50, oversized: 50 },},
        { name: 'Paint Correction', prices: { sedan: 'contact for quote', largeSuv: 'contact for quote', oversized:'contact for quote' }, },
        { name: 'Ceramic Coating', prices: { sedan: 'contact for quote', largeSuv: 'contact for quote', oversized:'contact for quote' }, }
      
      ]
    },
    
  ]);

  const [times] = useState([
    '06:00am','07:00am','08:00am','09:00am', '10:00am', '11:00am', '12:00pm',
    '1:00pm', '2:00pm', '3:00pm', '4:00pm', '5:00pm', '6:00pm', '7:00pm'
  ]);

  useEffect(() => {
    const fetchBlackoutDates = async () => {
      try {
        const today = new Date();
        const q = query(
          collection(db, 'bookings'),
          where('date', '>=', moment(today).format('YYYY-MM-DD'))
        );
        const snapshot = await getDocs(q);
        const dates = snapshot.docs.map(doc => new Date(doc.data().date));
        setBlackoutDates(dates);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBlackoutDates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      setStatus({ type: 'error', message: 'Cannot select a date in the past' });
      return;
    }

    if (blackoutDates.some(d => d.toDateString() === date.toDateString())) {
      setStatus({ type: 'error', message: 'This date is unavailable' });
      return;
    }

    setStatus({ type: '', message: '' });
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      date: moment(date).format('YYYY-MM-DD')
    }));
  };

  const toggleAddOn = (addOn) => {
    const newAddOns = selectedAddOns.includes(addOn.name)
      ? selectedAddOns.filter(item => item !== addOn.name)
      : [...selectedAddOns, addOn.name];
    
    setSelectedAddOns(newAddOns);
    setFormData(prev => ({
      ...prev,
      addOns: newAddOns
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const storageRef = ref(storage, `bookings/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }
      setVehicleImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setStatus({ type: 'error', message: 'Failed to upload images' });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleBookingSubmit = async () => {
    setStatus({ type: '', message: '' });

    if (!formData.date) {
      setStatus({ type: 'error', message: 'Please select a date' });
      return;
    }

    try {
      const bookingData = {
        ...formData,
        vehicleImages,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        totalPrice: totalPrice
      };

      await addDoc(collection(db, 'bookings'), bookingData);

      setFormData({
        name: '',
        email: '',
        phone: '',
        vehicle: '',
        vehicleSize: '',
        service: '',
        date: '',
        time: '09:00',
        notes: '',
        addOns: []
      });
      setVehicleImages([]);
      setSelectedDate(null);
      setSelectedAddOns([]);
      
      setBookingComplete(true);
      setTimeout(() => {
        setCurrentStep(1);
        setBookingComplete(false);
      }, 3000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setStatus({ 
        type: 'error', 
        message: 'Booking failed. Please try again.' 
      });
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return formData.service !== '' && formData.vehicleSize !== '';
      case 2: return selectedDate !== null;
      case 3: return formData.time !== '';
      case 4: return formData.name && formData.email && formData.phone;
      default: return false;
    }
  };

  const totalPrice = (services.find(s => s.name === formData.service)?.prices[formData.vehicleSize] || 0) + 
    selectedAddOns.reduce((sum, addOnName) => {
      const service = services.find(s => s.name === formData.service);
      const addOn = service?.addOns.find(a => a.name === addOnName);
      return sum + (addOn?.prices[formData.vehicleSize] || 0);
    }, 0);

  if (bookingComplete) {
    return (
      <div className="booking-container">
        <div className="booking-confirmation">
          <CheckIcon className="confirmation-icon" />
          <h2>Booking Confirmed!</h2>
          <p>Your appointment has been successfully scheduled.</p>
          <div className="confirmation-details">
            <p>Date: {selectedDate && moment(selectedDate).format('MMMM Do YYYY')}</p>
            <p>Time: {formData.time}</p>
            <p>Vehicle Size: {
              formData.vehicleSize === 'sedan' ? 'Sedan/Mid SUV' :
              formData.vehicleSize === 'largeSuv' ? 'Large SUV' : 'Oversized'
            }</p>
            <p>Service: {formData.service}</p>
            {selectedAddOns.length > 0 && (
              <p>Add-Ons: {selectedAddOns.join(', ')}</p>
            )}
            <p>Total: ${totalPrice}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h2>Book Your Service</h2>
        <p>Select a date and time for your appointment</p>
      </div>

      {status.type && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="step-indicator">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`step ${step <= currentStep ? 'active' : ''}`}
          >
            {step}
          </div>
        ))}
      </div>

       <div className="booking-layout">
        <div className="booking-steps">
          {currentStep === 1 && (
            <div className="booking-card">
              <div className="card-header">
                <div className="card-title">
                  <MagicIcon />
                  <span>Select Your Vehicle Type & Service</span>
                  <br></br>
                   <MagicIcon />
                  <p>Scroll To The Bottom For Add-Ons</p>
                </div>
              </div>
              <div className="card-content">
                <div className="vehicle-size-buttons">
                  <button
                    className={`size-btn ${formData.vehicleSize === 'sedan' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({...prev, vehicleSize: 'sedan'}))}
                  >
                    Sedan / Mid SUV
                    <span className="size-examples">(Cars, Crossovers, Small SUVs)</span>
                  </button>
                  <button
                    className={`size-btn ${formData.vehicleSize === 'largeSuv' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({...prev, vehicleSize: 'largeSuv'}))}
                  >
                    Large SUV
                    <span className="size-examples">(Full-size SUVs, Large Vehicles)</span>
                  </button>
                  <button
                    className={`size-btn ${formData.vehicleSize === 'oversized' ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({...prev, vehicleSize: 'oversized'}))}
                  >
                    Oversized
                    <span className="size-examples">(Trucks, Vans, XL Vehicles)</span>
                  </button>
                </div>

                <div className="service-options">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className={`service-option ${formData.service === service.name ? 'selected' : ''}`}
                      onClick={() => {
                        setFormData(prev => ({...prev, service: service.name}));
                        setSelectedAddOns([]);
                      }}
                    >
                      <h3>{service.name}</h3>
                      <div className="service-description">
        {service.description.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
                      <div className="service-price">
                        ${service.prices[formData.vehicleSize]} • {service.duration}
                      </div>
                    </div>
                  ))}
                </div>

                {formData.service && (
                  <div className="add-ons-section">
                    <div className="add-ons-header">
                      <h4>Premium Upgrades</h4>
                      <p>Enhance your service with these premium options</p>
                    </div>
                    <div className="add-ons-grid">
                      {services
                        .find(s => s.name === formData.service)
                        ?.addOns.map((addOn, i) => (
                          <div
                            key={i}
                            className={`add-on-card ${selectedAddOns.includes(addOn.name) ? 'selected' : ''}`}
                            onClick={() => toggleAddOn(addOn)}
                          >
                            <div className="add-on-checkbox">
                              {selectedAddOns.includes(addOn.name) && (
                                <svg viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                              )}
                            </div>
                            <div className="add-on-content">
                              <h5>{addOn.name}</h5>
                              <p className="add-on-desc">{addOn.description}</p>
                              <span className="add-on-price">
                                +${addOn.prices[formData.vehicleSize]}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="booking-card">
              <div className="card-header">
                <div className="card-title">
                  <CalendarIcon />
                  <span>Select Date</span>
                </div>
              </div>
              <div className="card-content">
                <div className="calendar-section">
                  <Calendar
                    localizer={localizer}
                    events={blackoutDates.map(date => ({
                      title: 'Booked',
                      start: date,
                      end: date,
                      allDay: true
                    }))}
                    startAccessor="start"
                    endAccessor="end"
                    selectable
                    onSelectSlot={(slotInfo) => handleDateSelect(slotInfo.start)}
                    defaultView="month"
                    views={['month']}
                    eventPropGetter={() => ({
                      style: {
                        backgroundColor: '#ff6b6b',
                        borderRadius: '4px',
                        opacity: 0.8,
                        color: 'white',
                        border: 'none'
                      }
                    })}
                    dayPropGetter={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (date < today || blackoutDates.some(d => d.toDateString() === date.toDateString())) {
                        return {
                          className: 'rbc-disabled-date',
                          style: {
                            backgroundColor: 'rgba(255, 107, 107, 0.2)',
                            cursor: 'not-allowed'
                          }
                        };
                      }
                      return {};
                    }}
                    style={{ height: 400 }}
                  />
                  {selectedDate && (
                    <div className="selected-date">
                      Selected: {moment(selectedDate).format('dddd, MMMM Do YYYY')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="booking-card">
              <div className="card-header">
                <div className="card-title">
                  <ClockIcon />
                  <span>Select Time</span>
                </div>
              </div>
              <div className="card-content">
                <div className="time-options">
                  {times.map((time) => (
                    <button
                      key={time}
                      className={`time-option ${formData.time === time ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({...prev, time}))}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="booking-card">
              <div className="card-header">
                <div className="card-title">
                  <CarIcon />
                  <span>Your Information</span>
                </div>
              </div>
              <div className="card-content">
                <form className="booking-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="vehicle">Vehicle Make/Model</label>
                    <input
                      type="text"
                      id="vehicle"
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="notes">Special Requests</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="booking-summary">
          <div className="summary-card">
            <div className="summary-header">
              <div className="summary-title">Booking Summary</div>
            </div>
            <div className="summary-content">
              {formData.vehicleSize && (
                <div className="summary-section">
                  <h4>Vehicle Size</h4>
                  <p>
                    {formData.vehicleSize === 'sedan' ? 'Sedan/Mid SUV' :
                     formData.vehicleSize === 'largeSuv' ? 'Large SUV' : 'Oversized'}
                  </p>
                </div>
              )}

              {formData.service && (
                <div className="summary-section">
                  <h4>Service</h4>
                  <div className="service-summary">
                    <span>{formData.service}</span>
                    <span>${services.find(s => s.name === formData.service)?.prices[formData.vehicleSize] || 0}</span>
                  </div>
                </div>
              )}

              {selectedAddOns.length > 0 && (
                <div className="summary-section">
                  <h4>Add-Ons</h4>
                  <ul className="add-ons-list">
                    {selectedAddOns.map((addOnName, i) => {
                      const service = services.find(s => s.name === formData.service);
                      const addOn = service?.addOns.find(a => a.name === addOnName);
                      return (
                        <li key={i}>
                          <span>{addOnName}</span>
                          <span>+${addOn?.prices[formData.vehicleSize] || 0}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {selectedDate && (
                <div className="summary-section">
                  <h4>Date</h4>
                  <p>{selectedDate && moment(selectedDate).format('MMMM Do YYYY')}</p>
                </div>
              )}

              {formData.time && (
                <div className="summary-section">
                  <h4>Time</h4>
                  <p>{formData.time}</p>
                </div>
              )}

              <div className="summary-total">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>

              <div className="navigation-buttons">
                {currentStep < totalSteps ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={!canProceedToNext()}
                    className="continue-button"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleBookingSubmit}
                    disabled={!canProceedToNext()}
                    className="confirm-button"
                  >
                    Confirm Booking
                  </button>
                )}
                
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="back-button"
                  >
                    Back
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;