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
    service: 'Exterior Wash',
    date: '',
    time: '09:00',
    notes: ''
  });
  
  const [vehicleImages, setVehicleImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [blackoutDates, setBlackoutDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Services data
  const [services] = useState([
    { 
      id: 'exterior',
      name: 'Exterior Wash', 
      price: 30, 
      duration: '1 hour',
      description: 'Complete exterior cleaning and protection'
    },
    { 
      id: 'interior',
      name: 'Interior Service', 
      price: 50, 
      duration: '2 hours',
      description: 'Deep cleaning for your vehicle interior'
    },
    { 
      id: 'full',
      name: 'Full Detail', 
      price: 75, 
      duration: '3 hours',
      description: 'Complete interior and exterior detailing'
    },
    { 
      id: 'ceramic',
      name: 'Ceramic Coating', 
      price: 100, 
      duration: '1 day',
      description: 'Premium long-lasting paint protection'
    }
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
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'bookings'), bookingData);

      setFormData({
        name: '',
        email: '',
        phone: '',
        vehicle: '',
        service: 'Exterior Wash',
        date: '',
        time: '09:00',
        notes: ''
      });
      setVehicleImages([]);
      setSelectedDate(null);
      
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
      case 1: return formData.service !== '';
      case 2: return selectedDate !== null;
      case 3: return formData.time !== '';
      case 4: return formData.name && formData.email && formData.phone;
      default: return false;
    }
  };

  const totalPrice = services.find(s => s.name === formData.service)?.price || 0;

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
                  <span>Select Services</span>
                </div>
              </div>
              <div className="card-content">
                <div className="service-options">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className={`service-option ${formData.service === service.name ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({...prev, service: service.name}))}
                    >
                      <h3>{service.name}</h3>
                      <p>{service.description}</p>
                      <div className="service-price">
                        ${service.price} • {service.duration}
                      </div>
                    </div>
                  ))}
                </div>
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

                  {/*<div className="form-group">
                    <label htmlFor="images">Upload Vehicle Photos (Optional)</label>
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                    />
                    {uploadingImages && <p>Uploading images...</p>}
                    {vehicleImages.length > 0 && (
                      <div className="vehicle-images">
                        {vehicleImages.map((img, index) => (
                          <img key={index} src={img} alt={`Vehicle ${index}`} />
                        ))}
                      </div>
                    )}
                  </div>*/}
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
              {formData.service && (
                <div className="summary-section">
                  <h4>Service</h4>
                  <div className="service-summary">
                    <span>{formData.service}</span>
                    <span>${totalPrice}</span>
                  </div>
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