import React from 'react';
import { FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="star-rating-container">
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <motion.label 
            key={i} 
            className="star-label"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <input 
              type="radio" 
              name="rating" 
              value={ratingValue} 
              onClick={() => setRating(ratingValue)}
              className="star-input"
            />
            <FaStar 
              className="star-icon" 
              color={ratingValue <= rating ? '#FFD700' : '#e0e0e0'} 
              size={28}
            />
          </motion.label>
        );
      })}
    </div>
  );
};

export default StarRating;