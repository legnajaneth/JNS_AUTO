import React, { useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import StarRating from './StarRating';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';
import './reviewSystem.css';

const Reviews = () => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !comment || rating === 0) return;
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'reviews'), {
        name,
        rating,
        comment,
        timestamp: serverTimestamp(),
        approved: null 
      });
      
      setSubmitted(true);
      setName('');
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        className="review-thank-you glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="checkmark-circle">
          <svg className="checkmark" viewBox="0 0 52 52">
            <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h3>Thank you for your review!</h3>
        <p>Your feedback will be visible after approval.</p>
        <button 
          className="back-button" 
          onClick={() => setSubmitted(false)}
        >
          Leave another review
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="review-form-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card">
        <div className="form-header">
          <h3>Share Your Experience</h3>
          <p>How was your service at JNS Auto Spa?</p>
        </div>
        
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group floating">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
              className="form-input"
              id="name"
            />
            <label htmlFor="name">Your Name</label>
          </div>
          
          <div className="form-group">
            <label>Your Rating</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          
          <div className="form-group floating">
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              required
              className="form-textarea"
              id="comment"
              rows="3"
            />
            <label htmlFor="comment">Your Review</label>
          </div>
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <span className="spinner"></span>
            ) : (
              <>
                <FaPaperPlane className="icon" />
                Submit Review
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Reviews;