const jwt =  require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

/* This authMiddleWare acts like a middleman where it checks authorization token for every route before allowing to go through.
It is kind of like a bodyguard. */

function authMiddleWare(req, res, next){

    try{

        /*  Fetch bearer token from the HTTP/S request for authorization */
        const token = req.headers.authorization?.split(' ')[1];

        if(!token)
            return res.status(401).json({ error : "No token provided"});

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            username: decoded.username
        };

        //if the token is valid, then it is simply passed to the actual function.
        next();

    }catch(err){
        return res.status(401).json({error : 'Invalid or expired token'});
    }
};

module.exports = {authMiddleWare};
