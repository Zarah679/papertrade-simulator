import jwt from 'jsonwebtoken'

export default function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization

    if(!authHeader) {
        return res.status(401).json({
            message: 'Token is required'
        })
    }

    // remove outer spaces and trim at whitespaces
    const parts = authHeader.trim().split(/\s+/)

    if( parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({
            message: 'Use Authorization: Bearer <token> '
        })
    }

    const token = parts[1]

    const secret = process.env.JWT_SECRET

    if(!secret) {
        return res.status(500).json({
            message: 'Authentication is not configured'
        })
    }
    // verify the token using the secret 
     jwt.verify(
        token,
        secret,
        { 
            algorithms: ['HS256']
        },

        (err, payload) => {
            if (err) {
                return res.status(401).json({
                    message: 'Invalid or expired token'
                })
            }

            if (
                !payload ||
                typeof payload !== 'object' ||
                !Number.isInteger(payload.id) ||
                payload.id <= 0
            ) {
                return res.status(401).json({
                    message: 'Invalid token'
                })
            }


            req.user = { id: payload.id }
            
            next()
            
        }
    )

    

}