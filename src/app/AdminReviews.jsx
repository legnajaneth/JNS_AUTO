import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaTimes, FaTrash, FaStar } from 'react-icons/fa';
import './AdminReviews.css';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reviews'));
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const approveReview = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        approved: true
      });
      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, approved: true } : review
      ));
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const rejectReview = async (reviewId) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        approved: false
      });
      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, approved: false } : review
      ));
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(reviews.filter(review => review.id !== reviewId));
      setSelectedReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return review.approved === undefined || review.approved === null;
    if (filter === 'approved') return review.approved === true;
    if (filter === 'rejected') return review.approved === false;
    return true;
  });

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="admin-reviews-container">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        <div className="review-filters">
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="reviews-grid-container">
        <div className="reviews-grid">
      {filteredReviews.length === 0 ? (
        <div className="no-reviews">
          <p>No {filter} reviews found</p>
        </div>
      ) : (
        filteredReviews.map(review => (
          <div 
            key={review.id}
            className={`review-card ${review.approved ? 'approved' : review.approved === false ? 'rejected' : ''}`}
            onClick={() => setSelectedReview(review)}
          >
                <div className="review-header">
                  <h3>{review.name}</h3>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i}
                        className={`star ${i < review.rating ? 'filled' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-footer">
                  <span className="review-date">
                    {review.timestamp.toLocaleDateString()}
                  </span>
                  {review.approved === true && (
                    <span className="review-status approved">Approved</span>
                  )}
                  {review.approved === false && (
                    <span className="review-status rejected">Rejected</span>
                  )}
                  {review.approved === undefined && (
                    <span className="review-status pending">Pending</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedReview && (
          <motion.div 
            className="review-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReview(null)}
          >
            <motion.div 
              className="review-modal-content"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Review Details</h3>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedReview(null)}
                >
                  &times;
                </button>
              </div>
              
              <div className="modal-body">
                <div className="reviewer-info">
                  <h4>{selectedReview.name}</h4>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i}
                        className={`star ${i < selectedReview.rating ? 'filled' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="review-date">
                    {selectedReview.timestamp.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="review-comment">
                  <p>{selectedReview.comment}</p>
                </div>
              </div>
              
              <div className="modal-footer">
                {selectedReview.approved !== true && (
                  <button 
                    className="btn approve-btn"
                    onClick={() => {
                      approveReview(selectedReview.id);
                      setSelectedReview(null);
                    }}
                  >
                    <FaCheck /> Approve
                  </button>
                )}
                
                {selectedReview.approved !== false && (
                  <button 
                    className="btn reject-btn"
                    onClick={() => {
                      rejectReview(selectedReview.id);
                      setSelectedReview(null);
                    }}
                  >
                    <FaTimes /> Reject
                  </button>
                )}
                
                <button 
                  className="btn delete-btn"
                  onClick={() => {
                    deleteReview(selectedReview.id);
                  }}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReviews;