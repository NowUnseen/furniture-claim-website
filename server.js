const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname)));

// Endpoint to get claims
app.get('/api/claims', (req, res) => {
    const claimsFile = path.join(__dirname, 'claims.json');
    if (fs.existsSync(claimsFile)) {
        const claims = JSON.parse(fs.readFileSync(claimsFile, 'utf8'));
        res.json(claims);
    } else {
        res.json({});
    }
});

// Endpoint to claim furniture
app.post('/api/claim/:id', express.json(), (req, res) => {
    const id = req.params.id;
    const username = req.body.username;
    if (!username) {
        return res.status(400).json({ error: 'Username required' });
    }
    const claimsFile = path.join(__dirname, 'claims.json');
    let claims = {};
    if (fs.existsSync(claimsFile)) {
        claims = JSON.parse(fs.readFileSync(claimsFile, 'utf8'));
    }
    if (claims[id]) {
        return res.status(400).json({ error: 'Already claimed' });
    }
    claims[id] = username;
    fs.writeFileSync(claimsFile, JSON.stringify(claims, null, 2));
    res.json({ success: true });
});

// Endpoint to unclaim furniture (admin only)
app.post('/api/unclaim/:id', express.json(), (req, res) => {
    const id = req.params.id;
    const password = req.body.password;
    if (password !== 'admin123') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    const claimsFile = path.join(__dirname, 'claims.json');
    let claims = {};
    if (fs.existsSync(claimsFile)) {
        claims = JSON.parse(fs.readFileSync(claimsFile, 'utf8'));
    }
    delete claims[id];
    fs.writeFileSync(claimsFile, JSON.stringify(claims, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
