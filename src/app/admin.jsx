/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase/firebaseConfig';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCcw, FiMenu, FiImage, FiX, FiBell, FiMail, FiSun, FiMoon, FiHome, FiCalendar, FiUsers, FiDollarSign, FiPieChart, FiSettings, FiChevronRight, FiStar, FiClock, FiCheckCircle, FiAlertCircle, FiTrash2, FiSearch } from 'react-icons/fi';
import { FaCar, FaWater, FaSprayCan, FaShieldAlt } from 'react-icons/fa';
import AdminReviews from './AdminReviews';
import AdminInquiries from './AdminInquiries';
import './admin.css';
import AdminCalendar from '../components/AdminCalendar';

const localizer = momentLocalizer(moment);

const TABS = {
  DASHBOARD: 'dashboard',
  APPOINTMENTS: 'appointments',
  INQUIRIES: 'inquiries',
  REVIEWS: 'reviews',
  REPORTS: 'reports'
};

const AdminPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [theme, setTheme] = useState('dark');
  const [stats, setStats] = useState({
    revenue: 0,
    appointments: 0,
    customers: 0,
    satisfaction: 94
  });
  const [predictions, setPredictions] = useState({
    nextWeek: 0,
    trend: 'up',
    confidence: 0
  });
  const [customerSegments, setCustomerSegments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [calendarView, setCalendarView] = useState('month');
  const [inquiries, setInquiries] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    service: 'Exterior Wash',
    date: '',
    time: '09:00',
    notes: '',
    status: 'confirmed'
  });

  // Fetch bookings and inquiries from Firebase
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'bookings'));
        const bookingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          start: new Date(doc.data().date),
          end: new Date(doc.data().date),
          title: `${doc.data().service} - ${doc.data().name}`
        }));
        setBookings(bookingsData);
        calculateStats(bookingsData);
        calculatePredictions(bookingsData);
        analyzeCustomerSegments(bookingsData);
        generateRecommendations(bookingsData);
        generateRevenueData(bookingsData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

     const fetchInquiries = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'inquiries'));
      const inquiriesData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const status = data.status || 'new';
          
          // First try to use imageUrls if they exist
          let imageUrls = data.imageUrls || [];
          
          // If no imageUrls but we have images paths, try to get URLs
          if (imageUrls.length === 0 && data.images && data.images.length > 0) {
              imageUrls = await Promise.all(
                data.images.map(async (imagePath) => {
                  try {
                    const imageRef = ref(storage, imagePath);
                    return await getDownloadURL(imageRef);
                  } catch (error) {
                    console.error("Error loading image:", error);
                    return null;
                  }
                })
              );
              imageUrls = imageUrls.filter(url => url !== null);
          }
          
          return {
            id: doc.id,
            ...data,
            status,
            imageUrls,
            date: data.timestamp?.toDate() || new Date()
          };
        })
      );
      setInquiries(inquiriesData.sort((a, b) => b.date - a.date));
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

    fetchBookings();
    fetchInquiries();
  }, []);

  // Data processing functions
  const calculateStats = (bookings) => {
    const revenue = bookings.reduce((sum, booking) => sum + getServicePrice(booking.service), 0);
    const uniqueCustomers = new Set(bookings.map(b => b.email)).size;
    
    setStats({
      revenue,
      appointments: bookings.length,
      customers: uniqueCustomers,
      satisfaction: calculateSatisfaction(bookings)
    });
  };

  const getServicePrice = (serviceName) => {
    const servicePrices = {
      'Exterior Wash': 30,
      'Interior Service': 50,
      'Full Detail': 75,
      'Ceramic Coating': 100
    };
    return servicePrices[serviceName] || 0;
  };

  const calculateSatisfaction = (bookings) => {
    const totalReviews = bookings.filter(b => b.review).length;
    if (totalReviews === 0) return 94;
    
    const totalRating = bookings.reduce((sum, booking) => sum + (booking.review?.rating || 0), 0);
    return Math.round((totalRating / totalReviews) * 20);
  };

const [reviews, setReviews] = useState([]);
const fetchReviews = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'reviews'));
    const reviewsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().timestamp?.toDate() || new Date()
    }));
    setReviews(reviewsData.sort((a, b) => b.date - a.date));
  } catch (error) {
    console.error('Error fetching reviews:', error);
  }
};

const getRecentReviews = () => {
  return [...reviews]
    .filter(review => review && (review.rating || review.comment)) // Filter out invalid reviews
    .sort((a, b) => (b.date || 0) - (a.date || 0))
    .slice(0, 4)
    .map(review => ({
      id: review.id || Math.random().toString(),
      name: review.name || 'Anonymous',
      rating: review.rating || 0,
      comment: review.comment,
      service: review.service,
      date: review.date || new Date()
    }));
};

  const generateRevenueData = (bookings) => {
    const monthlyData = {};
    const weeklyData = {};
    const dailyData = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const weekKey = `${date.getFullYear()}-${moment(date).week()}`;
      const dayKey = date.toISOString().split('T')[0];
      
      // Monthly
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          revenue: 0,
          bookings: 0
        };
      }
      monthlyData[monthKey].revenue += getServicePrice(booking.service);
      monthlyData[monthKey].bookings += 1;
      
      // Weekly
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          date: moment(date).startOf('week').toDate(),
          revenue: 0,
          bookings: 0
        };
      }
      weeklyData[weekKey].revenue += getServicePrice(booking.service);
      weeklyData[weekKey].bookings += 1;
      
      // Daily
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: new Date(dayKey),
          revenue: 0,
          bookings: 0
        };
      }
      dailyData[dayKey].revenue += getServicePrice(booking.service);
      dailyData[dayKey].bookings += 1;
    });
    
    setRevenueData({
      month: Object.values(monthlyData).sort((a, b) => a.date - b.date),
      week: Object.values(weeklyData).sort((a, b) => a.date - b.date),
      day: Object.values(dailyData).sort((a, b) => a.date - b.date)
    });
  };

  const calculatePredictions = (bookingsData) => {
    const last4Weeks = groupByWeek(bookingsData).slice(-4);
    const x = last4Weeks.map((_, i) => i);
    const y = last4Weeks.map(week => week.count);
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const nextWeekPrediction = slope * 4 + intercept;
    const trend = slope > 0 ? 'up' : 'down';
    const confidence = Math.min(95, Math.abs(slope) * 10);
    
    setPredictions({
      nextWeek: Math.round(nextWeekPrediction),
      trend,
      confidence
    });
  };

  const groupByWeek = (bookings) => {
    const weeks = {};
    bookings.forEach(booking => {
      const date = new Date(booking.date);
      const year = date.getFullYear();
      const weekNum = moment(date).week();
      const key = `${year}-${weekNum}`;
      
      if (!weeks[key]) {
        weeks[key] = { week: weekNum, year, count: 0, revenue: 0 };
      }
      
      weeks[key].count++;
      weeks[key].revenue += getServicePrice(booking.service);
    });
    
    return Object.values(weeks).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.week - b.week;
    });
  };

  const analyzeCustomerSegments = (bookingsData) => {
    const customers = {};
    bookingsData.forEach(booking => {
      if (!customers[booking.email]) {
        customers[booking.email] = {
          name: booking.name,
          count: 0,
          services: {},
          lastVisit: new Date(booking.date)
        };
      }
      customers[booking.email].count++;
      customers[booking.email].services[booking.service] = 
        (customers[booking.email].services[booking.service] || 0) + 1;
      if (new Date(booking.date) > customers[booking.email].lastVisit) {
        customers[booking.email].lastVisit = new Date(booking.date);
      }
    });
    
    const segments = Object.values(customers).map(customer => {
      const daysSinceLastVisit = Math.floor(
        (new Date() - customer.lastVisit) / (1000 * 60 * 60 * 24)
      );
      
      let segment = 'New';
      if (customer.count > 5) segment = 'VIP';
      else if (customer.count > 2) segment = 'Regular';
      else if (daysSinceLastVisit > 90) segment = 'Lapsed';
      
      return { ...customer, segment, daysSinceLastVisit };
    });
    
    setCustomerSegments(segments);
  };

  const generateRecommendations = (bookingsData) => {
    const servicePairs = {};
    bookingsData.forEach((booking, i) => {
      const nextBooking = bookingsData[i + 1];
      if (nextBooking && booking.email === nextBooking.email) {
        const pair = `${booking.service}+${nextBooking.service}`;
        servicePairs[pair] = (servicePairs[pair] || 0) + 1;
      }
    });
    
    const topPairs = Object.entries(servicePairs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    setRecommendations(topPairs.map(([pair, count]) => {
      const [service1, service2] = pair.split('+');
      return {
        from: service1,
        to: service2,
        confidence: Math.min(100, Math.round((count / bookingsData.length) * 1000))
      };
    }));
  };

  // UI Helpers
  const getServiceColor = (serviceName) => {
    const colors = {
      'Exterior Wash': '#3b82f6',
      'Interior Service': '#8b5cf6',
      'Full Detail': '#10b981',
      'Ceramic Coating': '#f59e0b'
    };
    return colors[serviceName] || '#4f46e5';
  };

  const getServiceIcon = (serviceName) => {
    const icons = {
      'Exterior Wash': <FaWater />,
      'Interior Service': <FaCar />,
      'Full Detail': <FaSprayCan />,
      'Ceramic Coating': <FaShieldAlt />
    };
    return icons[serviceName] || <FaCar />;
  };

  const getRecentAppointments = () => {
    return [...bookings]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const getPopularServices = () => {
    const serviceCounts = {};
    bookings.forEach(booking => {
      serviceCounts[booking.service] = (serviceCounts[booking.service] || 0) + 1;
    });

    const total = bookings.length;
    return Object.entries(serviceCounts)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / total) * 100),
        color: getServiceColor(name),
        icon: getServiceIcon(name)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  };

  const getCustomerSegmentsData = () => {
    const segmentCounts = {};
    customerSegments.forEach(customer => {
      segmentCounts[customer.segment] = (segmentCounts[customer.segment] || 0) + 1;
    });

    return Object.entries(segmentCounts).map(([name, value]) => ({
      name,
      value,
      color: name === 'VIP' ? '#f59e0b' : 
             name === 'Regular' ? '#3b82f6' : 
             name === 'New' ? '#10b981' : '#8b5cf6'
    }));
  };

  // Event Handlers
  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      vehicle: booking.vehicle,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      notes: booking.notes || '',
      status: booking.status || 'confirmed'
    });
    setModalType('view');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveBooking = async () => {
    try {
      const bookingRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bookingRef, formData);
      
      const updatedBookings = bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, ...formData } : b
      );
      setBookings(updatedBookings);
      calculateStats(updatedBookings);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };
const handleSelectSlot = (slotInfo) => {
  setModalType('add');
  setFormData({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    service: 'Exterior Wash',
    date: slotInfo.start,
    time: '09:00',
    notes: '',
    status: 'confirmed'
  });
  setShowModal(true);
};

const handleDateClick = (date) => {
  setModalType('add');
  setFormData({
    name: '',
    email: '',
    phone: '',
    vehicle: '',
    service: 'Exterior Wash',
    date: date,
    time: '09:00',
    notes: '',
    status: 'confirmed'
  });
  setShowModal(true);
};

  const handleDeleteBooking = async () => {
    try {
      await deleteDoc(doc(db, 'bookings', selectedBooking.id));
      
      const updatedBookings = bookings.filter(b => b.id !== selectedBooking.id);
      setBookings(updatedBookings);
      calculateStats(updatedBookings);
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Render different tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.DASHBOARD:
        return (
          <>
            {/* Stats Cards */}
            <div className="dashboard-grid">
              <motion.div 
                className="stats-card"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stats-content">
                  <p className="stats-label">
                    <span>💰</span> Total Revenue
                  </p>
                  <h3 className="stats-value">${stats.revenue.toLocaleString()}</h3>
                  <p className="stats-change positive">
                    <span className="arrow">↑</span> 12% from last month
                  </p>
                </div>
                <div className="stats-icon">💰</div>
              </motion.div>
              
              <motion.div 
                className="stats-card"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stats-content">
                  <p className="stats-label">
                    <span>📅</span> Appointments
                  </p>
                  <h3 className="stats-value">{stats.appointments}</h3>
                  <p className="stats-change positive">
                    <span className="arrow">↑</span> 3 from yesterday
                  </p>
                </div>
                <div className="stats-icon">📅</div>
              </motion.div>
              
              <motion.div 
                className="stats-card"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stats-content">
                  <p className="stats-label">
                    <span>👥</span> Customers
                  </p>
                  <h3 className="stats-value">{stats.customers}</h3>
                  <p className="stats-change positive">
                    <span className="arrow">↑</span> 2 from last week
                  </p>
                </div>
                <div className="stats-icon">👥</div>
              </motion.div>
              
              <motion.div 
                className="stats-card"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="stats-content">
                  <p className="stats-label">
                    <span>⭐</span> Satisfaction
                  </p>
                  <h3 className="stats-value">{stats.satisfaction}%</h3>
                  <p className="stats-change negative">
                    <span className="arrow">↓</span> 2% from last month
                  </p>
                </div>
                <div className="stats-icon">⭐</div>
              </motion.div>
            
              {/* Revenue Chart */}
              <div className="chart-container">
                <div className="chart-header">
                  <h2 className="chart-title">Revenue Trends</h2>
                  <div className="chart-actions">
                    <button 
                      className={`btn btn-outline ${timeRange === 'day' ? 'active' : ''}`}
                      onClick={() => setTimeRange('day')}
                    >
                      Day
                    </button>
                    <button 
                      className={`btn btn-outline ${timeRange === 'week' ? 'active' : ''}`}
                      onClick={() => setTimeRange('week')}
                    >
                      Week
                    </button>
                    <button 
                      className={`btn btn-outline ${timeRange === 'month' ? 'active' : ''}`}
                      onClick={() => setTimeRange('month')}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData[timeRange]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return timeRange === 'month' ? 
                            d.toLocaleString('default', { month: 'short' }) :
                            timeRange === 'week' ? 
                            `Week ${moment(d).week()}` :
                            d.getDate();
                        }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Revenue']}
                        labelFormatter={(date) => {
                          const d = new Date(date);
                          return timeRange === 'month' ? 
                            d.toLocaleString('default', { month: 'long', year: 'numeric' }) :
                            timeRange === 'week' ? 
                            `Week ${moment(d).week()}, ${d.getFullYear()}` :
                            d.toLocaleDateString();
                        }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#4f46e5" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          

              {/* Recent Appointments */}
              <div className="recent-appointments">
                <div className="appointments-header">
                  <h2 className="appointments-title">Recent Appointments</h2>
                  <button className="btn btn-text" onClick={() => setActiveTab(TABS.APPOINTMENTS)}>View All</button>
                </div>
                <div className="appointments-list">
                  {getRecentAppointments().map((appointment, index) => (
                    <motion.div
                      key={index}
                      className="appointment-item"
                      whileHover={{ x: 5 }}
                      onClick={() => handleSelectBooking(appointment)}
                    >
                      <div className="appointment-avatar">
                        {appointment.name.charAt(0)}
                      </div>
                      <div className="appointment-details">
                        <div className="appointment-header">
                          <h3 className="appointment-name">{appointment.name}</h3>
                          <span className="appointment-time">
                            {moment(appointment.date).format('h:mm A')}
                          </span>
                        </div>
                        <p className="appointment-service">{appointment.service}</p>
                      </div>
                      <FiChevronRight className="appointment-arrow" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div className="calendar-container">
  <div className="calendar-header">
    <h2 className="calendar-title">Admin Calendar</h2>
    <div className="calendar-actions">
      <div className="calendar-view-toggle">
        <button 
          className={`btn btn-outline ${calendarView === 'month' ? 'active' : ''}`}
          onClick={() => setCalendarView('month')}
        >
          Month
        </button>
        <button 
          className={`btn btn-outline ${calendarView === 'week' ? 'active' : ''}`}
          onClick={() => setCalendarView('week')}
        >
          Week
        </button>
        <button 
          className={`btn btn-outline ${calendarView === 'day' ? 'active' : ''}`}
          onClick={() => setCalendarView('day')}
        >
          Day
        </button>
      </div>
      <button 
        className="btn btn-primary"
        onClick={() => {
          setModalType('add');
          setFormData({
            name: '',
            email: '',
            phone: '',
            vehicle: '',
            service: 'Exterior Detail',
            date: new Date(),
            time: '09:00',
            notes: '',
            status: 'confirmed'
          });
          setShowModal(true);
        }}
      >
        + Add Appointment
      </button>
    </div>
  </div>

  <div className="calendar-wrapper">
    <AdminCalendar
      events={bookings}
      onSelectEvent={handleSelectBooking}
      onSelectSlot={handleSelectSlot}
      view={calendarView}
      onView={setCalendarView}
      onNavigate={(date, view) => {
        setCalendarView(view);
      }}
    />
  </div>
</div>

{/* Recent Reviews Preview */}
<div className="recent-reviews-preview">
  <div className="recent-reviews-header">
  <h3 className="recent-reviews-title">
    <FiStar /> Recent Reviews
  </h3>
  <div style={{ display: 'flex', gap: '10px' }}>
    <button 
      onClick={fetchReviews}
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
    >
      <FiRefreshCcw className="refresh-icon" />
    </button>
    <div 
      className="recent-reviews-view-all"
      onClick={() => setActiveTab(TABS.REVIEWS)}
    >
      View All <FiChevronRight />
    </div>
  </div>
</div>
  
  <div className="recent-reviews-grid">
    {getRecentReviews().map((review) => (
      <div 
        key={review.id}
        className="recent-review-card"
        onClick={() => setActiveTab(TABS.REVIEWS)}
      >
        <div className="recent-review-header">
          <div className="recent-review-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar 
                key={i} 
                className={`star ${i < (review.rating || 0) ? 'filled' : ''}`}
              />
            ))}
          </div>
          <span className="recent-review-date">
            {new Date(review.date).toLocaleDateString()}
          </span>
        </div>
        
        <h4 className="recent-review-name">{review.name}</h4>
        
        <p className="recent-review-comment">
          {review.comment || 'No comment provided'}
        </p>
        
        {review.service && (
          <div className="recent-review-service">
            <span className="service-tag">
              {review.service}
            </span>
          </div>
        )}
      </div>
    ))}
    
    {reviews.length === 0 && (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        No recent reviews
      </div>
    )}
  </div>
</div>
              {/* Popular Services */}
              <div className="popular-services">
                <div className="services-header">
                  <h2 className="services-title">Popular Services</h2>
                </div>
                <div className="services-list">
                  {getPopularServices().map((service, index) => (
                    <div key={index} className="service-item">
                      <div className="service-header">
                        <div className="service-icon">{service.icon}</div>
                        <span className="service-name">{service.name}</span>
                        <div className="service-stats">
                          <span className="service-percentage">{service.percentage}%</span>
                          <span className="service-count">
                            {Math.round((service.percentage / 100) * bookings.length)}
                          </span>
                        </div>
                      </div>
                      <div className="progress-container">
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${service.percentage}%`,
                            backgroundColor: service.color
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Week Forecast */}
              <div className="forecast-card">
                <div className="forecast-header">
                  <h2 className="forecast-title">Next Week Forecast</h2>
                  <div className={`forecast-trend ${predictions.trend}`}>
                    {predictions.trend === 'up' ? '↑' : '↓'} {predictions.confidence}% Confidence
                  </div>
                </div>
                <div className="forecast-value">{predictions.nextWeek} Appointments</div>
                <div className="forecast-description">
                  Based on recent booking trends and historical data
                </div>
                <div className="forecast-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { day: 'Mon', appointments: 5 },
                        { day: 'Tue', appointments: 8 },
                        { day: 'Wed', appointments: 6 },
                        { day: 'Thu', appointments: 9 },
                        { day: 'Fri', appointments: 7 },
                        { day: 'Sat', appointments: 12 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Bar 
                        dataKey="appointments" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Inquiries Preview */}
              <div className="recent-inquiries-preview">
                <div className="recent-inquiries-header">
                  <h3 className="recent-inquiries-title">
                    <FiMail /> Recent Inquiries
                  </h3>
                  <div 
                    className="recent-inquiries-view-all"
                    onClick={() => setActiveTab(TABS.INQUIRIES)}
                  >
                    View All <FiChevronRight />
                  </div>
                </div>
                
                <div className="recent-inquiries-grid">
                  {inquiries.slice(0, 4).map((inquiry) => {
                    const statusClass = `recent-inquiry-status-${inquiry.status.replace(' ', '-')}`;
                    return (
                      <div 
                        key={inquiry.id}
                        className="recent-inquiry-card"
                        onClick={() => setActiveTab(TABS.INQUIRIES)}
                      >
                        <div className="recent-inquiry-header">
                          <h4 className="recent-inquiry-name">{inquiry.name}</h4>
                          <span className={`recent-inquiry-status ${statusClass}`}>
                            {inquiry.status}
                          </span>
                        </div>
                        
                        <p className="recent-inquiry-message">
                          {inquiry.message}
                        </p>
                        
                        <div className="recent-inquiry-footer">
                          <span className="recent-inquiry-date">
                            {new Date(inquiry.date).toLocaleDateString()}
                          </span>
                          {inquiry.imageUrls?.length > 0 && (
                            <span className="recent-inquiry-images">
                              <FiImage /> {inquiry.imageUrls.length}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {inquiries.length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No recent inquiries
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Segments */}
              <div className="chart-container">
                <div className="chart-header">
                  <h2 className="chart-title">Customer Segments</h2>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCustomerSegmentsData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getCustomerSegmentsData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Customers']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Service Recommendations */}
              <div className="chart-container">
                <div className="chart-header">
                  <h2 className="chart-title">Service Recommendations</h2>
                </div>
                <div className="services-list">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="service-item">
                      <div className="service-header">
                        <span className="service-name">
                          {rec.from} → {rec.to}
                        </span>
                        <span className="service-percentage">{rec.confidence}%</span>
                      </div>
                      <div className="progress-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${rec.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </>
        );
        
      case TABS.APPOINTMENTS:
        return (
          <div className="tab-content">
            <h2>Appointments Management</h2>
            {/* Appointments table will go here */}
          </div>
        );
        
      case TABS.INQUIRIES:
        return <AdminInquiries inquiries={inquiries} setInquiries={setInquiries} />;
        
      case TABS.REVIEWS:
        return <AdminReviews />;
        
      case TABS.REPORTS:
        return (
          <div className="tab-content">
            <h2>Reports & Analytics</h2>
            {/* Reports content will go here */}
          </div>
        );
        
      default:
        return <div className="tab-content">Select a tab</div>;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Mobile Sidebar Toggle need to be fixed*/}
      <div className="mobile-sidebar-toggle" onClick={toggleMobileSidebar}>
        <FiMenu />
      </div>

      {/* Sidebar here needs to be fixed*/}
      <div 
        className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}
        onClick={() => mobileSidebarOpen && setMobileSidebarOpen(false)}
      >
        <div className="sidebar-header">
          <div className="logo-icon">🚗</div>
          <span className="logo-text">AutoShine Pro</span>
          <button className="sidebar-collapse-btn" onClick={toggleSidebar}>
            <FiChevronRight />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Main</h3>
            <ul>
              <li 
                className={`nav-item ${activeTab === TABS.DASHBOARD ? 'active' : ''}`}
                onClick={() => setActiveTab(TABS.DASHBOARD)}
              >
                <span className="nav-icon"><FiHome /></span>
                <span className="nav-text">Dashboard</span>
              </li>
              <li 
                className={`nav-item ${activeTab === TABS.APPOINTMENTS ? 'active' : ''}`}
                onClick={() => setActiveTab(TABS.APPOINTMENTS)}
              >
                <span className="nav-icon"><FiCalendar /></span>
                <span className="nav-text">Appointments</span>
                <span className="notification-badge">{stats.appointments}</span>
              </li>
              <li 
                className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                <span className="nav-icon"><FiUsers /></span>
                <span className="nav-text">Customers</span>
              </li>
              <li 
                className={`nav-item ${activeTab === TABS.INQUIRIES ? 'active' : ''}`}
                onClick={() => setActiveTab(TABS.INQUIRIES)}
              >
                <span className="nav-icon"><FiMail /></span>
                <span className="nav-text">Inquiries</span>
              </li>
              <li 
                className={`nav-item ${activeTab === TABS.REVIEWS ? 'active' : ''}`}
                onClick={() => setActiveTab(TABS.REVIEWS)}
              >
                <span className="nav-icon"><FiStar /></span>
                <span className="nav-text">Reviews</span>
              </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h3 className="nav-section-title">Analytics</h3>
            <ul>
              <li 
                className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
                onClick={() => setActiveTab('revenue')}
              >
                <span className="nav-icon"><FiDollarSign /></span>
                <span className="nav-text">Revenue</span>
              </li>
              <li 
                className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
                onClick={() => setActiveTab('insights')}
              >
                <span className="nav-icon"><FiPieChart /></span>
                <span className="nav-text">Insights</span>
              </li>
              <li 
                className={`nav-item ${activeTab === TABS.REPORTS ? 'active' : ''}`}
                onClick={() => setActiveTab(TABS.REPORTS)}
              >
                <span className="nav-icon"><FiPieChart /></span>
                <span className="nav-text">Reports</span>
              </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h3 className="nav-section-title">Settings</h3>
            <ul>
              <li 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="nav-icon"><FiSettings /></span>
                <span className="nav-text">Settings</span>
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <img 
            src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff" 
            alt="User" 
            className="user-avatar" 
          />
          <div className="user-info">
            <div className="user-name">Admin User</div>
            <div className="user-email">admin@autoshine.com</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`content ${sidebarCollapsed ? 'content-expanded' : ''}`}>
        <header className="header">
          <div className="header-left">
            <h1 className="header-title">
              {activeTab === TABS.DASHBOARD && 'Dashboard Overview'}
              {activeTab === TABS.APPOINTMENTS && 'Appointments Management'}
              {activeTab === TABS.REPORTS && 'Reports & Analytics'}
              {activeTab === TABS.INQUIRIES && 'Customer Inquiries'}
              {activeTab === TABS.REVIEWS && 'Customer Reviews'}
            </h1>
          </div>
          <div className="header-right">
            <button className="header-action" onClick={toggleTheme}>
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
            <button className="header-action">
              <FiBell />
              <span className="notification-badge">3</span>
            </button>
            <button className="header-action">
              <FiMail />
              <span className="notification-badge">7</span>
            </button>
            <div className="user-menu">
              <img 
                src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff" 
                alt="User" 
                className="user-avatar-sm" 
              />
            </div>
          </div>
        </header>

        <main className="main-content">
          {renderTabContent()}
        </main>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  {modalType === 'add' && 'Add New Appointment'}
                  {modalType === 'view' && 'Appointment Details'}
                  {modalType === 'edit' && 'Edit Appointment'}
                  {modalType === 'delete' && 'Confirm Deletion'}
                </h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <FiX />
                </button>
              </div>
              
              {modalType !== 'delete' ? (
                <div className="modal-body">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={modalType === 'view'}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Vehicle</label>
                    <input
                      type="text"
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleInputChange}
                      disabled={modalType === 'view'}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Service</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                      >
                        <option value="Exterior Wash">Exterior Wash ($30)</option>
                        <option value="Interior Service">Interior Service ($50)</option>
                        <option value="Full Detail">Full Detail ($75)</option>
                        <option value="Ceramic Coating">Ceramic Coating ($100)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        disabled={modalType === 'view'}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={modalType === 'view'}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      disabled={modalType === 'view'}
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="modal-body">
                  <p>Are you sure you want to delete this appointment?</p>
                  <div className="booking-details">
                    <p><strong>Customer:</strong> {formData.name}</p>
                    <p><strong>Service:</strong> {formData.service}</p>
                    <p><strong>Date:</strong> {formData.date} at {formData.time}</p>
                  </div>
                </div>
              )}
              
              <div className="modal-footer">
                {modalType === 'view' && (
                  <>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setModalType('edit')}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => setModalType('delete')}
                    >
                      Delete
                    </button>
                  </>
                )}
                
                {modalType === 'edit' && (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSaveBooking}
                    >
                      Save Changes
                    </button>
                    <button 
                      className="btn btn-text"
                      onClick={() => setModalType('view')}
                    >
                      Cancel
                    </button>
                  </>
                )}
                
                {modalType === 'delete' && (
                  <>
                    <button 
                      className="btn btn-danger"
                      onClick={handleDeleteBooking}
                    >
                      Confirm Delete
                    </button>
                    <button 
                      className="btn btn-text"
                      onClick={() => setModalType('view')}
                    >
                      Cancel
                    </button>
                  </>
                )}
                
                {modalType === 'add' && (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={async () => {
                        try {
                          await addDoc(collection(db, 'bookings'), {
                            ...formData,
                            createdAt: serverTimestamp()
                          });
                          setShowModal(false);
                          // Refresh data
                          const snapshot = await getDocs(collection(db, 'bookings'));
                          const bookingsData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            start: new Date(doc.data().date),
                            end: new Date(doc.data().date),
                            title: `${doc.data().service} - ${doc.data().name}`
                          }));
                          setBookings(bookingsData);
                          calculateStats(bookingsData);
                        } catch (error) {
                          console.error('Error adding booking:', error);
                        }
                      }}
                    >
                      Create Appointment
                    </button>
                    <button 
                      className="btn btn-text"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;