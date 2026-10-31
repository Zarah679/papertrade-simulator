import bcrypt from 'bcrypt'
import pool from '../config/db.js'
import jwt from 'jsonwebtoken'

export async function register(req, res) {
    const { name, email, password } = req.body ?? {}

    //guardrails for the right data type 
    if( typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string'
    ) {
        return res.status(400).json({
            message: 'Please enter a valid email and password'
        })
    }

    const cleanedName = name.trim()
    const cleanedEmail = email.trim().toLowerCase()

    if(!cleanedName || !cleanedEmail || !password) {
        return res.status(400).json({
            message : 'Name, email and password are required'
        })
    }

    if(password.length < 8) {
        return res.status(400).json({
            message: 'Password must be atleast 8 characters'
        })
    }

    try {

        const passwordHash = await bcrypt.hash(password, 12)

        const result = await pool.query(
            `INSERT INTO users(name, email,      password_hash)
             VALUES($1,$2,$3)
             RETURNING id, name, email, created_at`,
             [cleanedName, cleanedEmail, passwordHash]
        )

        // Send the response and object to frontend
        return res.status(201).json({
            message: 'Account created successfully',
            user: result.rows[0]
        })
    } catch (error) {
        if(error.code === '23505') {
            return res.status(409).json({
                message: 'Name or email is already in use'
            })
        }

        console.error('Registration failed', error.message)

        return res.status(500).json({
            message: 'Could not create account'
        })
    }

}

export async function login(req, res) {
    const { email, password } = req.body ?? {}

    if( typeof email !== 'string' || 
        typeof password !== 'string') {
        return res.status(400).json({
            message: 'Please provide a valid email'
        })
    }

    const cleanedEmail = email.trim().toLowerCase()

    if(!cleanedEmail || !password) {
        return res.status(400).json({
            message: 'Email and password are required'
        })
    }

    // retrieve the account during login so that we can see if password matches 

    try {
        const result = await pool.query(
            `SELECT id, name, email, password_hash FROM users
            WHERE LOWER(email) = $1`,
            [cleanedEmail]
        )

        const user = result.rows[0]

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        //extract the password and compare 

        const passwordMatches = await bcrypt.compare(password, user.password_hash)

        if(!passwordMatches) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        // JSON web token
        const secret = process.env.JWT_SECRET 

        // sign the token
        const token = jwt.sign(
            {id: user.id},
            secret,
            {
                algorithm: 'HS256',
                expiresIn: '1h'
            }
        )

        // Send token back to client
        return res.json({
            message: 'Login Successful!',
            token, 
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })
        
    } catch (error) {
        console.error('Login failed:', error.message)

        return res.status(500).json({
            message: 'Could not log in'
        })
    }

}