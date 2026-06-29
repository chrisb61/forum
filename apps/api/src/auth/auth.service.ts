import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await argon2.hash(dto.password);
    const emailVerifyToken = nanoid(32);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
        emailVerifyToken,
        displayName: dto.username,
      },
    });

    await this.mail.sendEmailVerification(user.email, emailVerifyToken);

    const { passwordHash: _, emailVerifyToken: __, ...safeUser } = user;
    return { user: safeUser, message: 'Registration successful. Please verify your email.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { username: dto.identifier }],
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.isBanned) throw new UnauthorizedException('Account is banned');
    if (user.isSuspended && user.suspendedUntil && user.suspendedUntil > new Date()) {
      throw new UnauthorizedException(`Account is suspended until ${user.suspendedUntil.toISOString()}`);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date(), isSuspended: user.suspendedUntil && user.suspendedUntil <= new Date() ? false : user.isSuspended },
    });

    const token = this.jwt.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    const { passwordHash, emailVerifyToken, passwordResetToken, ...safeUser } = user;
    return { access_token: token, user: safeUser };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) throw new BadRequestException('Invalid verification token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If this email is registered, you will receive a reset link.' };

    const resetToken = nanoid(32);
    const expiry = new Date(Date.now() + 3600 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpiry: expiry },
    });

    await this.mail.sendPasswordReset(user.email, resetToken);
    return { message: 'If this email is registered, you will receive a reset link.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
    });

    return { message: 'Password reset successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        reputation: true,
        postCount: true,
        isEmailVerified: true,
        createdAt: true,
        badges: {
          include: { badge: true },
          take: 10,
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
