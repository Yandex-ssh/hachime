import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`; // Web reset URL
    const appResetUrl = `tmccareer://reset-password?token=${token}`; // Deep link for mobile

    const mailOptions = {
      from: '"TMC Career" <no-reply@tmccareer.com>',
      to: email,
      subject: 'Your Password Reset OTP Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
          <h2 style="color: #4f46e5;">Password Reset</h2>
          <p>You requested a password reset. Use the following 6-digit code to reset your password:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0; border-radius: 8px;">
            ${token}
          </div>
          <p>Or you can click the button below to reset directly:</p>
          <a href="${resetUrl}" style="display: block; background: #4f46e5; color: white; padding: 12px; text-align: center; text-decoration: none; border-radius: 6px; font-weight: bold; margin-bottom: 10px;">Reset Password (Web)</a>
          <a href="${appResetUrl}" style="display: block; text-align: center; color: #4f46e5; text-decoration: none; font-size: 14px;">Open in Mobile App</a>
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">This code will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
      console.log('--- PASSWORD RESET OTP ---');
      console.log(`Email: ${email}`);
      console.log(`OTP Code: ${token}`);
      console.log(`Web Link: ${resetUrl}`);
      console.log('---------------------------');
    }
  }
}
