import jwt from 'jsonwebtoken'


export function authenticateToken(req, res, next) {

    console.log("auth mw: got header:", req.headers.authorization)
    try {
        // Haetaan Authorization header
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        const [bearer, token] = authHeader.split(" ");
        if (bearer !== "Bearer" || !token) {
            return res.status(401).json({ error: "Invalid Authorization format" })
        }

        // Vahvista token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("auth mw: decoded:", decoded)

        // Asetetaan käyttäjä requestiin
        req.user = { id: decoded.id }

        // Jatketaan
        next()
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" })
    }


}