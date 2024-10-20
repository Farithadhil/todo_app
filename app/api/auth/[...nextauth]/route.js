import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { comparePassword } from '@/lib/auth';
import db from '@/lib/db';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('Authorize credentials:', credentials);
        
        try {
          const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [credentials.email]);
          const user = rows[0];

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await comparePassword(credentials.password, user.password);
          console.log('Compare password result:', isValid);

          if (!isValid) {
            throw new Error('Invalid password');
          }

          // Return user data as an object
          return {
            id: user.id,
            email: user.email,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message); // Rethrow the error to be caught by NextAuth
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error', // Custom error page
    signOut: '/' // Redirect to home on sign out
  },

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback - token:', token);
      // Ensure user data is added to token only if user exists
      if (user) {
        token = {
          ...token,
          id: user.id,
          email: user.email,
        };
      }
      return token;
    },

    async session({ session, token }) {
      console.log('Session callback - session:', session, 'token:', token);
      // Ensure session includes user information only if token is defined
      if (token && token.id && token.email) {
        session.user = {
          id: token.id,
          email: token.email,
        };
      } else {
        console.error('Token is not valid, session will not include user data');
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// Export the NextAuth handler for both GET and POST requests
export { handler as GET, handler as POST };
