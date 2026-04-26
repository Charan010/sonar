const express = require('express'); 
const router = express.Router();

const jwt = require('jsonwebtoken')

const {
    generateChallenge,
    VerifySchnorrResponse

} = require('../services/crypto.service');

const { findUserByUsername } = require('../services/user.service');
const { getChallenge, setChallenge, deleteChallenge } = require('../utils/challengeStore');

const JWT_SECRET = process.env.JWT_SECRET;


router.post("/login/challenge", async (req, res) => {
    try {
        const {username, R } = req.body

        if(!username || !R)
            return res.status(400).json({error: 'Missing username or R'})

        const user = await findUserByUsername(username)
        if(!user)
            return res.status(400).json({error: 'No such user found'});

        const c = generateChallenge()
        setChallenge(username, {R, c});

        res.json({ c });

    }catch(err){
        res.status(500).json({error: "Challenge generation failed"})
    }
});

router.post("/login/verify", async (req, res) => {
    try{

        const {username, s } = req.body

        if(!username || !s)
            res.status(400).json({error: "Missing username or S"})

        const user = await findUserByUsername(username)

        if(!user)
            res.status(400).json({eror: "No such user found"})

        const challenge = getChallenge(username)
        if(!challenge)
            return res.status(400).json({ error: 'Challenge expired or not found' });

        deleteChallenge(username);

        const isValid = VerifySchnorrResponse({R : challenge.R , s, c : challenge.c , pub : user.pub});

        if(!isValid)
            return res.status(401).json({ error : "Login failed"})

        const token = jwt.sign({ username }, JWT_SECRET, {
            expiresIn: '2h',
        });

        res.json({status: "Login succesful", token})

    }catch(err){
        res.status(500).json({ error : "Verification failed"})
    }

});

router.get('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await findUserByUsername(decoded.username);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    res.json({
      valid: true,
      username: decoded.username
    });

  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
