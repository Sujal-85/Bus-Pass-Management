const express = require('express');
const router = express.Router();
const BusPass = require('../models/BusPass');

// POST /api/verify - Verify a bus pass
router.post('/', async (req, res) => {
    const { data } = req.body; // Expecting scanned data (e.g., studentId or _id)

    try {
        // Try to find by studentId first, then by _id
        let pass = await BusPass.findOne({ studentId: data });
        if (!pass) {
            // If data is a valid ObjectId, try finding by _id
            if (data.match(/^[0-9a-fA-F]{24}$/)) {
                pass = await BusPass.findById(data);
            }
        }

        if (!pass) {
            return res.status(404).json({ valid: false, message: 'Bus pass not found' });
        }

        if (pass.status !== 'active') {
            return res.json({ valid: false, message: 'Bus pass is inactive', student: pass });
        }

        // Check expiry (optional, if you have expiry date logic)
        // const now = new Date();
        // if (new Date(pass.expiryDate) < now) { ... }

        res.json({ valid: true, message: 'Bus pass is valid', student: pass });
    } catch (error) {
        res.status(500).json({ valid: false, message: error.message });
    }
});

module.exports = router;
