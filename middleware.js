import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Define the paths that require authentication
  pages: {
    signIn: "/login", // The path to your login page
  },
});

// Specify the secret for JWT (optional)
export const config = {
  matcher: [
    // Apply middleware to the following paths
    '/protected/:path*', // Adjust this to your protected routes
    '/dashboard/:path*',  // Add more paths as necessary
  ],
};
