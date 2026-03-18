import type { Context } from "hono";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user-repository";

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  register = async (c: Context) => {
    try {
      const { email, password, name } = await c.req.json();

      if (!email || !password) {
        return c.json({ error: "Email and password are required" }, 400);
      }

      const existingUser = await this.userRepo.findByEmail(email);
      if (existingUser) {
        return c.json({ error: "User already exists" }, 400);
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await this.userRepo.createUser({
        email,
        password_hash,
        name,
        provider: "local",
      });

      const token = await this.generateToken(user.id, user.email, user.role);

      return c.json({ 
        message: "User registered successfully",
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role } 
      }, 201);
    } catch (error) {
      console.error("[AuthService] Registration Error:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  };

  login = async (c: Context) => {
    try {
      const { email, password } = await c.req.json();

      const user = await this.userRepo.findByEmail(email);
      if (!user || !user.password_hash) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      const token = await this.generateToken(user.id, user.email, user.role);
      await this.userRepo.updateLastLogin(user.id);

      return c.json({ 
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role } 
      });
    } catch (error) {
      console.error("[AuthService] Login Error:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  };

  googleLogin = async (c: Context) => {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const redirectUri = process.env.GOOGLE_CALLBACK_URL?.trim();
    console.log(`[Google SSO] Attempting login with Client ID: ${clientId}`);
    const scope = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId || "")}&redirect_uri=${encodeURIComponent(redirectUri || "")}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    
    return c.redirect(googleAuthUrl);
  };

  googleCallback = async (c: Context) => {
    try {
      const code = c.req.query("code");
      if (!code) {
        console.error("[AuthService] Google Callback: 'code' parameter missing");
        return c.json({ error: "Code not provided by Google" }, 400);
      }

      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenResponse.json() as any;
      if (tokens.error) throw new Error(tokens.error_description);

      // Get user info
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const googleUser = await userResponse.json() as any;

      let user = await this.userRepo.findByEmail(googleUser.email);

      if (!user) {
        user = await this.userRepo.createUser({
          email: googleUser.email,
          name: googleUser.name,
          provider: "google",
          provider_id: googleUser.id,
          role: "user",
        });
      }

      const token = await this.generateToken(user.id, user.email, user.role);
      await this.userRepo.updateLastLogin(user.id);

      // Redirect back to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return c.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error("[AuthService] Google Callback Error:", error);
      return c.json({ error: "Authentication failed" }, 500);
    }
  };

  private async generateToken(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email: email,
      role: role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 1 week
    };
    return sign(payload, process.env.JWT_SECRET!);
  }
}
