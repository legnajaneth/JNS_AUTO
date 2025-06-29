/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// Send inquiry confirmation
exports.sendInquiryConfirmation = functions.firestore
  .document('inquiries/{inquiryId}')
  .onCreate(async (snap, context) => {
    const inquiry = snap.data();
    
    // Send to customer
    const customerMailOptions = {
      from: `JNS Auto Spa <${gmailEmail}>`,
      to: inquiry.email,
      subject: 'We Received Your Inquiry',
      html: `
        <h2>Thank you for contacting JNS Auto Spa!</h2>
        <p>We've received your inquiry and will get back to you shortly.</p>
        <p><strong>Your message:</strong> ${inquiry.message}</p>
        <p>If you have any additional questions, feel free to reply to this email.</p>
      `,
    };

    // Send to admin
    const adminMailOptions = {
      from: `JNS Auto Spa <${gmailEmail}>`,
      to: gmailEmail,
      subject: `New Inquiry from ${inquiry.name}`,
      html: `
        <h2>New Customer Inquiry</h2>
        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Message:</strong> ${inquiry.message}</p>
        <p><strong>Submitted:</strong> ${new Date(inquiry.timestamp?.toDate()).toLocaleString()}</p>
        ${inquiry.imageUrl ? `<p><strong>Image:</strong> <a href="${inquiry.imageUrl}">View Image</a></p>` : ''}
      `,
    };

    try {
      await transporter.sendMail(customerMailOptions);
      await transporter.sendMail(adminMailOptions);
      console.log('Emails sent successfully');
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  });

// Send booking confirmation
exports.sendBookingConfirmation = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    
    const mailOptions = {
      from: `JNS Auto Spa <${gmailEmail}>`,
      to: booking.email,
      subject: 'Your Booking Confirmation',
      html: `
        <h2>Thank you for booking with JNS Auto Spa!</h2>
        <p>Here are your booking details:</p>
        <ul>
          <li><strong>Service:</strong> ${booking.service}</li>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
          <li><strong>Vehicle:</strong> ${booking.vehicle}</li>
        </ul>
        <p>We look forward to serving you!</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Booking confirmation sent');
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
    }
  });