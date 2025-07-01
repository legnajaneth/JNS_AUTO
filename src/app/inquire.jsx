/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { db, storage } from '../firebase/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './inquire.css';

const Inquire = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported image type (JPEG, PNG, GIF)`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large (max 5MB)`);
        return false;
      }
      
      return true;
    });

    setImages(validFiles);
  };

  const uploadImages = async () => {
    const imageUrls = [];
    setUploadProgress(0); // Reset progress when starting new upload

    try {
      for (const image of images) {
        const storagePath = `inquiries/${Date.now()}_${image.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, image);

        // Create a promise for each upload
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              // Calculate progress for this single file
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              // Calculate overall progress across all files
              setUploadProgress(prev => {
                const newProgress = prev + (progress / images.length);
                return Math.min(newProgress, 100); // Cap at 100%
              });
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                imageUrls.push({
                  path: storagePath, // Store full storage path
                  url: url           // Store download URL
                });
                resolve();
              } catch (error) {
                console.error('Error getting download URL:', error);
                reject(error);
              }
            }
          );
        });
      }
      return imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      let imageData = [];
      if (images.length > 0) {
        imageData = await uploadImages();
      }

      const inquiryData = {
        ...formData,
        images: imageData.map(img => img.path), // Store paths in 'images' field
        imageUrls: imageData.map(img => img.url), // Store URLs in 'imageUrls' field
        status: 'new',
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'inquiries'), inquiryData);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setImages([]);
      setUploadProgress(0);
      setStatus({ type: 'success', message: 'Thank you! We will respond soon.' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setStatus({ 
        type: 'error', 
        message: error.message || 'Submission failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inquire-container">
      <div className="inquire-header">
        <h2>Get a Free Quote</h2>
        <p>Fill out the form below and we'll get back to you within 24 hours</p>
      </div>

      {status.type && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="inquire-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
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
          <label htmlFor="email">Email</label>
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
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">How Can We Help?</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows="5"
            required
          />
        </div>

        {/*<div className="form-group">
          <label htmlFor="images">Upload Vehicle Photos (Optional)</label>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          {images.length > 0 && (
            <div className="image-preview">
              <p>{images.length} image(s) selected</p>
              <div className="preview-grid">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="preview-thumbnail"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
  */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            <span>Uploading: {Math.round(uploadProgress)}%</span>
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
        </button>
      </form>
    </div>
  );
};

export default Inquire;