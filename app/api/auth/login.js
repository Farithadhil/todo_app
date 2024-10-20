// app/api/auth/login.js
import jwt from 'jsonwebtoken';
import db from '@/lib/db'; // Assuming you have a database connection module

// Function to validate user credentials
async function validateUser(username, password) {
    // Replace this with your actual database query
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];
        
        if (user && (await comparePassword(password, user.password))) { // Ensure to implement comparePassword
            return user; // Return the user object if found and password is valid
        }
    } catch (error) {
        console.error('Database query error:', error);
    }
    return null; // Return null if no user is found or an error occurs
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        // Validate user credentials
        const user = await validateUser(username, password);
        
        if (user) {
            try {
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                    expiresIn: '1h',
                });
                return res.status(200).json({ token });
            } catch (error) {
                console.error('Error signing JWT:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
