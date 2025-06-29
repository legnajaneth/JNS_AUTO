import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import './ReviewsCarousel.css';

const ReviewsCarousel = () => {
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
const getVisibleReviews = () => {
    const visibleReviews = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % approvedReviews.length;
      visibleReviews.push(approvedReviews[index]);
    }
    return visibleReviews;
  };

  useEffect(() => {
    const fetchApprovedReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Starting to fetch reviews..."); 
        
      
        try {
          const q = query(
            collection(db, 'reviews'),
            where('approved', '==', true),
            orderBy('timestamp', 'desc')
          );
          const querySnapshot = await getDocs(q);
          console.log("Query with timestamp successful", querySnapshot.docs.length);
          
          if (querySnapshot.empty) {
            console.log("No approved reviews found");
            setApprovedReviews([]);
            return;
          }
          
          const reviewsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          }));
          
          setApprovedReviews(reviewsData);
          return;
        } catch (orderError) {
          console.log("Timestamp order failed, trying without ordering:", orderError);
          
          // Fallback query without ordering if timestamp fails
          const q = query(
            collection(db, 'reviews'),
            where('approved', '==', true)
          );
          const querySnapshot = await getDocs(q);
          
          const reviewsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          }));
          
          setApprovedReviews(reviewsData);
        }
      } catch (err) {
        console.error("Full fetch error:", err);
        setError(`Error loading reviews: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedReviews();

    // Refresh every 2 minutes
    const intervalId = setInterval(fetchApprovedReviews, 120000);
    return () => clearInterval(intervalId);
  }, []);

  const nextReview = () => {
    setDirection(1);
    setCurrentIndex(prev => 
      prev === approvedReviews.length - 1 ? 0 : prev + 1
    );
  };

  const prevReview = () => {
    setDirection(-1);
    setCurrentIndex(prev => 
      prev === 0 ? approvedReviews.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-error">
        <p>{error}</p>
      </div>
    );
  }

  if (approvedReviews.length === 0) {
    return (
      <div className="no-reviews">
        <p>No approved reviews yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="reviews-carousel-container">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={approvedReviews[currentIndex]?.id || 'empty'}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
          transition={{ duration: 0.5 }}
          className="review-card-container"
        >
          <div className="reviews-group">
            {getVisibleReviews().map((review, i) => (
              <div key={`${review.id}-${i}`} className="review-card">
                <FaQuoteLeft className="quote-icon" />
                <p className="review-text">
                  "{review?.comment || 'No review text available'}"
                </p>
                <div className="review-footer">
                  <div className="reviewer-info">
                    <h4>{review?.name || 'Anonymous'}</h4>
                    <div className="review-stars">
                      {[...Array(5)].map((_, starIdx) => (
                        <FaStar 
                          key={starIdx}
                          className={starIdx < (review?.rating || 0) ? 'filled' : ''}
                        />
                      ))}
                    </div>
                    <span className="review-date">
                      {review?.timestamp?.toLocaleDateString() || ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {approvedReviews.length > 1 && (
        <div className="carousel-controls">
          <button 
            className="nav-button" 
            onClick={prevReview}
            aria-label="Previous review"
          >
            <FaChevronLeft />
          </button>
          
          <div className="carousel-dots">
            {approvedReviews.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            className="nav-button" 
            onClick={nextReview}
            aria-label="Next review"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewsCarousel;