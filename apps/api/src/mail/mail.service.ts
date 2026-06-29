import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }

  private get fromAddress() {
    return process.env.MAIL_FROM || 'noreply@forum.local';
  }

  private get appUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  async sendEmailVerification(email: string, token: string) {
    const url = `${this.appUrl}/auth/verify-email?token=${token}`;
    await this.send(email, 'Verify your email', `Click to verify your email: ${url}`);
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${this.appUrl}/auth/reset-password?token=${token}`;
    await this.send(email, 'Reset your password', `Click to reset your password: ${url}`);
  }

  async sendNotification(email: string, subject: string, body: string) {
    await this.send(email, subject, body);
  }

  private async send(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({ from: this.fromAddress, to, subject, text });
    } catch (err) {
      this.logger.warn(`Failed to send email to ${to}: ${err.message}`);
    }
  }
}
