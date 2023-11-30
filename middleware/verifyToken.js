const jwt = require("jsonwebtoken")

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'claveSecreta', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        };

        req.body.decoded = decoded;
        next();
    });
}

module.exports = {
    verifyToken
}