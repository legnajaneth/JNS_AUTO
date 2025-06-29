import React, { useState } from 'react';
import "./inquire.css"

const InquirePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null); // for success or error messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionStatus(null); // Reset status before submission

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('description', formData.description);

    for (let i = 0; i < files.length; i++) {
      data.append('files', files[i]);
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_GATEWAY_URL}/submit-inquiry`, {
        method: 'POST',
        body: data,
    
      });

      if (!response.ok) {
        throw new Error('Error submitting form');
      }

      setSubmissionStatus('success');
      alert('Inquiry submitted successfully!');
      setFormData({ name: '', email: '', description: '' });
      setFiles([]);
    } catch (error) {
      setSubmissionStatus('error');
      console.error('Error:', error);
      alert('Failed to submit inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-info">
      <h1>Inquire with Us</h1>
      <div className="form-container">
        {submissionStatus === 'success' && (
          <div className="submission-message success">
            <p>Your inquiry has been submitted successfully!</p>
          </div>
        )}
        {submissionStatus === 'error' && (
          <div className="submission-message error">
            <p>There was an error submitting your inquiry. Please try again later.</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Upload Images:</label>
            <input
              type="file"
              name="files"
              multiple
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
          <button
            type="submit"
            className="form-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InquirePage;
