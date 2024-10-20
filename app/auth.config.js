// app/auth.config.js
import CredentialsProvider from 'next-auth/providers/credentials';
import { comparePassword } from '@/lib/auth'; // Make sure this function is correctly implemented
import db from '@/lib/db';

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [credentials.email]);
          const user = rows[0];

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await comparePassword(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id,
            email: user.email,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message);
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
    signOut: '/'
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
