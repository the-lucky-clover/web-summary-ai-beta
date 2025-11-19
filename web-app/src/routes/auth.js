import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/smtp.js';

const auth = new Hono();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const magicLinkSchema = z.object({
  email: z.string().email()
});

// Signup endpoint
auth.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = signupSchema.parse(body);

    // Check if user exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    // Create user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, verification_token) VALUES (?, ?, ?)'
    ).bind(email, passwordHash, verificationToken).run();

    // Send verification email
    const verificationUrl = `https://ytldr.com/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your YTLDR account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff6b6b;">Welcome to YTLDR</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${verificationUrl}" style="background: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
          <p>This link expires in 24 hours.</p>
        </div>
      `
    });

    return c.json({
      message: 'User created successfully. Please check your email for verification.',
      userId: result.meta.last_row_id
    });

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Signin endpoint
auth.post('/signin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = signinSchema.parse(body);

    // Get user
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Check if email is verified
    if (!user.email_verified) {
      return c.json({ error: 'Please verify your email first' }, 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      c.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(user.id).run();

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscription_status
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Magic link endpoint
auth.post('/magic-link', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = magicLinkSchema.parse(body);

    // Get or create user
    let user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      // Create user without password for magic link auth
      const result = await c.env.DB.prepare(
        'INSERT INTO users (email, email_verified) VALUES (?, TRUE)'
      ).bind(email).run();
      user = { id: result.meta.last_row_id, email };
    }

    // Generate magic link token
    const magicToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await c.env.DB.prepare(
      'UPDATE users SET magic_link_token = ?, magic_link_expires_at = ? WHERE id = ?'
    ).bind(magicToken, expiresAt.toISOString(), user.id).run();

    // Send magic link email
    const magicLinkUrl = `https://ytldr.com/auth/magic-link?token=${magicToken}`;
    await sendEmail({
      to: email,
      subject: 'Your YTLDR Magic Link',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4ecdc4;">YTLDR Magic Link</h1>
          <p>Click the link below to sign in:</p>
          <a href="${magicLinkUrl}" style="background: #4ecdc4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Sign In</a>
          <p>This link expires in 15 minutes.</p>
        </div>
      `
    });

    return c.json({ message: 'Magic link sent to your email' });

  } catch (error) {
    console.error('Magic link error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Verify magic link
auth.post('/verify-magic-link', async (c) => {
  try {
    const body = await c.req.json();
    const { token } = body;

    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE magic_link_token = ? AND magic_link_expires_at > CURRENT_TIMESTAMP'
    ).bind(token).first();

    if (!user) {
      return c.json({ error: 'Invalid or expired magic link' }, 400);
    }

    // Clear magic link token
    await c.env.DB.prepare(
      'UPDATE users SET magic_link_token = NULL, magic_link_expires_at = NULL WHERE id = ?'
    ).bind(user.id).run();

    // Generate JWT
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      c.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return c.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscription_status
      }
    });

  } catch (error) {
    console.error('Magic link verification error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Verify email
auth.post('/verify-email', async (c) => {
  try {
    const body = await c.req.json();
    const { token } = body;

    const result = await c.env.DB.prepare(
      'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE verification_token = ?'
    ).bind(token).run();

    if (result.meta.changes === 0) {
      return c.json({ error: 'Invalid verification token' }, 400);
    }

    return c.json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('Email verification error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { auth as authRoutes };