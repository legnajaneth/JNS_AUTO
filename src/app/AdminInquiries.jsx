import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase/firebaseConfig';
import { doc, updateDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { FiMail, FiTrash2, FiSearch, FiX, FiClock, FiCheckCircle, FiAlertCircle, FiImage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminInquiries.css';

const getStatusConfig = (status) => {
  switch (status) {
    case 'new':
      return {
        label: 'New',
        icon: <FiClock className="status-icon new" />,
      };
    case 'in-progress':
      return {
        label: 'In Progress',
        icon: <FiAlertCircle className="status-icon in-progress" />,
      };
    case 'resolved':
      return {
        label: 'Resolved',
        icon: <FiCheckCircle className="status-icon resolved" />,
      };
    default:
      return {
        label: 'Unknown',
        icon: <FiAlertCircle className="status-icon unknown" />,
      };
  }
};

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'inquiries'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const inquiriesData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const data = doc.data();
            // Convert Firestore timestamp to Date
            const date = data.timestamp?.toDate() || new Date();
            
            // Get image URLs if they exist
            let imageUrls = [];
            if (data.images && data.images.length > 0) {
              imageUrls = data.images; // Already stored as URLs
            }
            
            return {
              id: doc.id,
              ...data,
              date, // Using the timestamp as date for display
              imageUrls,
              status: data.status || 'new' // Default to 'new' if status doesn't exist
            };
          })
        );
        
        setInquiries(inquiriesData);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  // Handler to update inquiry status
  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      const inquiryRef = doc(db, 'inquiries', inquiryId);
      await updateDoc(inquiryRef, { status: newStatus });
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId ? { ...inq, status: newStatus } : inq
        )
      );
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handler to delete an inquiry
  const handleDelete = async (inquiryId) => {
    try {
      await deleteDoc(doc(db, 'inquiries', inquiryId));
      setInquiries((prev) => prev.filter((inq) => inq.id !== inquiryId));
      setSelectedInquiry(null);
    } catch (error) {
      console.error('Error deleting inquiry:', error);
    }
  };

  const handleSelectInquiry = async (inquiry) => {
    setSelectedInquiry(inquiry);
    if (!inquiry.read) {
      try {
        await updateDoc(doc(db, 'inquiries', inquiry.id), { read: true });
        setInquiries(prev => prev.map(i => 
          i.id === inquiry.id ? { ...i, read: true } : i
        ));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  // Filter inquiries based on filter and searchTerm
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesStatus = filter === 'all' || inquiry.status === filter;
    const matchesSearch =
      inquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && (!searchTerm || matchesSearch);
  });

  return (
    <div className="admin-inquiries-container">
      {/* Header Section */}
      <div className="inquiries-header-section">
        <div className="header-content">
          <div className="header-text">
            <h1 className="admin-title">Customer Inquiries</h1>
            <p className="admin-subtitle">
              {filteredInquiries.length} {filter === 'all' ? 'total inquiries' : filter + ' inquiries'}
            </p>
          </div>
          
          <div className="header-controls">
            <div className="search-input-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search inquiries..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="clear-search">
                  <FiX />
                </button>
              )}
            </div>
            
            <div className="filter-container">
              <select
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="inquiries-content-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading inquiries...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="empty-state">
            <FiMail className="empty-icon" />
            <h3>No inquiries found</h3>
            <p>
              {searchTerm 
                ? "Try adjusting your search query"
                : filter !== 'all'
                  ? `No ${filter} inquiries at the moment`
                  : "No inquiries have been submitted yet"}
            </p>
          </div>
        ) : (
          <div className="inquiries-grid">
            {filteredInquiries.map((inquiry) => {
              const statusConfig = getStatusConfig(inquiry.status);
              return (
                <motion.div
                  key={inquiry.id}
                  className={`inquiry-card ${!inquiry.read ? 'unread' : ''}`}
                  onClick={() => handleSelectInquiry(inquiry)}
                >
                  <div className="inquiry-header">
                    <div className="inquiry-meta">
                      <h3 className="inquiry-name">{inquiry.name}</h3>
                      <div className={`status-badge ${inquiry.status}`}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </div>
                    </div>
                    <div className="inquiry-date">
                      {inquiry.date.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="inquiry-content">
                    <div className="contact-info">
                      <div className="contact-item">
                        <span className="contact-label">Email:</span>
                        <span className="contact-value">{inquiry.email}</span>
                      </div>
                      {inquiry.phone && (
                        <div className="contact-item">
                          <span className="contact-label">Phone:</span>
                          <span className="contact-value">{inquiry.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="message-preview">
                      <p>{inquiry.message.substring(0, 100)}...</p>
                    </div>
                    
                    {inquiry.imageUrls?.length > 0 && (
                      <div className="image-attachments">
                        {inquiry.imageUrls.slice(0, 3).map((url, index) => (
                          <div key={index} className="attachment-thumbnail">
                            <img src={url} alt={`Attachment ${index + 1}`} />
                            {index === 2 && inquiry.imageUrls.length > 3 && (
                              <div className="more-attachments">
                                +{inquiry.imageUrls.length - 3}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for inquiry details */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="inquiry-modal-overlay" onClick={() => setSelectedInquiry(null)}>
            <motion.div 
              className="inquiry-modal-container"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h2>Inquiry Details</h2>
                <button className="close-modal" onClick={() => setSelectedInquiry(null)}>
                  <FiX />
                </button>
              </div>
              
              <div className="modal-content">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <div className="detail-value">{selectedInquiry.name}</div>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <div className="detail-value">{selectedInquiry.email}</div>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <div className="detail-value">{selectedInquiry.phone || 'Not provided'}</div>
                  </div>
                  <div className="detail-item">
                    <label>Date Submitted</label>
                    <div className="detail-value">{selectedInquiry.date.toLocaleString()}</div>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <select
                      className="status-select"
                      value={selectedInquiry.status}
                      onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
                
                <div className="message-detail">
                  <label>Message</label>
                  <div className="message-content">{selectedInquiry.message}</div>
                </div>
                
                {selectedInquiry.imageUrls?.length > 0 && (
                  <div className="attachments-section">
                    <label>Attachments ({selectedInquiry.imageUrls.length})</label>
                    <div className="attachments-grid">
                      {selectedInquiry.imageUrls.map((url, index) => (
                        <div 
                          key={index} 
                          className="attachment-item"
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setShowModal(true);
                          }}
                        >
                          <img src={url} alt={`Attachment ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  className="footer-button delete"
                  onClick={() => handleDelete(selectedInquiry.id)}
                >
                  <FiTrash2 /> Delete Inquiry
                </button>
                <button 
                  className="footer-button close"
                  onClick={() => setSelectedInquiry(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showModal && selectedInquiry?.imageUrls?.length > 0 && (
          <div className="image-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
              
              <div className="image-modal-content">
                <img 
                  src={selectedInquiry.imageUrls[currentImageIndex]} 
                  alt={`Inquiry attachment ${currentImageIndex + 1}`} 
                />
              </div>
              
              <div className="image-modal-nav">
                <button 
                  onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentImageIndex === 0}
                >
                  &larr;
                </button>
                <span>
                  Image {currentImageIndex + 1} of {selectedInquiry.imageUrls.length}
                </span>
                <button 
                  onClick={() => setCurrentImageIndex(prev => 
                    Math.min(selectedInquiry.imageUrls.length - 1, prev + 1)
                  )}
                  disabled={currentImageIndex === selectedInquiry.imageUrls.length - 1}
                >
                  &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminInquiries;