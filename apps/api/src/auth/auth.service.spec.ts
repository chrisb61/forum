import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const mockUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: null,
  emailVerifyToken: null,
  passwordResetToken: null,
  passwordResetExpiry: null,
  role: 'MEMBER',
  isBanned: false,
  isSuspended: false,
  suspendedUntil: null,
  reputation: 0,
  postCount: 0,
  displayName: 'Test User',
  avatar: null,
  bio: null,
  isEmailVerified: false,
  lastSeenAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  oauthProvider: null,
  oauthProviderId: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('test-token') } },
        { provide: MailService, useValue: { sendEmailVerification: jest.fn(), sendPasswordReset: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      (prisma.user!.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user!.create as jest.Mock).mockResolvedValue({ ...mockUser, emailVerifyToken: 'tok' });

      const result = await service.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password1',
      });

      expect(result.message).toContain('Registration successful');
    });

    it('should throw if email already exists', async () => {
      (prisma.user!.findFirst as jest.Mock).mockResolvedValue(mockUser);
      await expect(
        service.register({ username: 'other', email: 'test@example.com', password: 'Password1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should reject unknown user', async () => {
      (prisma.user!.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(
        service.login({ identifier: 'nobody', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
