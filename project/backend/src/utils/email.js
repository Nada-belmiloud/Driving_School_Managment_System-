// backend/src/utils/email.js
import nodemailer from 'nodemailer';
import { config } from '../config/env.config.js';

// Create reusable transporter
const createTransporter = () => {
    // Check if using Gmail (simple setup)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Use SMTP config from env.config if available
    if (config.smtpHost && config.smtpEmail && config.smtpPassword) {
        return nodemailer.createTransport({
            host: config.smtpHost,
            port: config.smtpPort,
            secure: config.smtpPort === 465,
            auth: {
                user: config.smtpEmail,
                pass: config.smtpPassword
            }
        });
    }

    // Fallback: Use Ethereal for testing (fake SMTP that captures emails)
    console.warn('No email configuration found. Using Ethereal test account.');
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ethereal.user@ethereal.email',
            pass: 'ethereal.pass'
        }
    });
};

// Generate HTML email template for password reset
const generatePasswordResetEmail = (resetUrl, userName = 'User') => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Driving School</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 40px 0;">
                    <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header with Logo -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 40px; text-align: center;">
                                <div style="display: inline-block; background-color: rgba(255,255,255,0.2); border-radius: 50%; padding: 15px; margin-bottom: 15px;">
                                    <img src="https://img.icons8.com/fluency/96/car.png" alt="Driving School Logo" style="width: 50px; height: 50px;" />
                                </div>
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                    Driving School
                                </h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
                                    Management System
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 50px 40px;">
                                <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                    Password Reset Request
                                </h2>
                                
                                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                    Hello <strong style="color: #1f2937;">${userName}</strong>,
                                </p>
                                
                                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                    We received a request to reset your password for your Driving School Management account. Click the button below to create a new password:
                                </p>
                                
                                <!-- Reset Button -->
                                <div style="text-align: center; margin: 35px 0;">
                                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                                        🔐 Reset My Password
                                    </a>
                                </div>
                                
                                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                                    Or copy and paste this link into your browser:
                                </p>
                                
                                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; word-break: break-all; margin-bottom: 25px;">
                                    <a href="${resetUrl}" style="color: #2563eb; font-size: 13px; text-decoration: none;">
                                        ${resetUrl}
                                    </a>
                                </div>
                                
                                <!-- Warning Box -->
                                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 15px 20px; margin-bottom: 25px;">
                                    <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                                        ⚠️ This link will expire in <strong>1 hour</strong> for security reasons.
                                    </p>
                                </div>
                                
                                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                                    If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                                <table role="presentation" style="width: 100%;">
                                    <tr>
                                        <td style="text-align: center;">
                                            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                                                © ${new Date().getFullYear()} Driving School Management System
                                            </p>
                                            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 15px 0;">
                                                This is an automated message. Please do not reply to this email.
                                            </p>
                                            <div style="margin-top: 15px;">
                                                <span style="display: inline-block; background-color: #e5e7eb; color: #6b7280; padding: 5px 12px; border-radius: 20px; font-size: 11px; margin: 0 5px;">
                                                    🚗 Training
                                                </span>
                                                <span style="display: inline-block; background-color: #e5e7eb; color: #6b7280; padding: 5px 12px; border-radius: 20px; font-size: 11px; margin: 0 5px;">
                                                    📋 Exams
                                                </span>
                                                <span style="display: inline-block; background-color: #e5e7eb; color: #6b7280; padding: 5px 12px; border-radius: 20px; font-size: 11px; margin: 0 5px;">
                                                    🎓 Success
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

// Send password reset email
export const sendPasswordResetEmail = async (to, resetUrl, userName = 'User') => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Driving School" <${process.env.EMAIL_USER || 'noreply@drivingschool.com'}>`,
            to: to,
            subject: '🔐 Password Reset Request - Driving School',
            html: generatePasswordResetEmail(resetUrl, userName),
            text: `
Password Reset Request

Hello ${userName},

We received a request to reset your password for your Driving School Management account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email.

© ${new Date().getFullYear()} Driving School Management System
            `.trim()
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('Email configuration error:', error);
        return false;
    }
};

export default {
    sendPasswordResetEmail,
    verifyEmailConfig
};

