const express = require('express');
const router = express.Router();
const BusPass = require('../models/BusPass');
const sendEmail = require('../utils/emailService');

// POST /api/bus-pass - Create a new bus pass application
router.post('/', async (req, res) => {
    try {
        const newBusPass = new BusPass(req.body);
        const savedBusPass = await newBusPass.save();

        // Send email notification
        if (req.body.EmailId) {
            const subject = 'Bus Pass Application Received';
            const html = `
                <h3>Dear ${req.body.studentName},</h3>
                <p>Your bus pass application has been received successfully.</p>
                <p><strong>Details:</strong></p>
                <ul>
                    <li>Route: ${req.body.busRoute}</li>
                    <li>Destination: ${req.body.routeTo}</li>
                    <li>Amount Paid: ${req.body.receivedAmount}</li>
                </ul>
                <p>Thank you!</p>
            `;

            // Send email asynchronously without blocking response
            sendEmail(req.body.EmailId, subject, html).catch(err => console.error('Email send failed:', err));
        }

        res.status(201).json(savedBusPass);
    } catch (error) {
        console.error('Error saving bus pass:', error);
        res.status(500).json({ message: 'Failed to save bus pass application', error: error.message });
    }
});

// GET /api/bus-pass - Get all bus pass applications
router.get('/', async (req, res) => {
    try {
        const busPasses = await BusPass.find().sort({ createdAt: -1 });
        res.status(200).json(busPasses);
    } catch (error) {
        console.error('Error fetching bus passes:', error);
        res.status(500).json({ message: 'Failed to fetch bus pass applications', error: error.message });
    }
});

// DELETE /api/bus-pass/:id - Delete a bus pass application
router.delete('/:id', async (req, res) => {
    try {
        const deletedPass = await BusPass.findByIdAndDelete(req.params.id);
        if (!deletedPass) return res.status(404).json({ message: 'Bus pass not found' });
        res.json({ message: 'Bus pass deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/bus-pass/:id - Update a bus pass application
router.put('/:id', async (req, res) => {
    try {
        const updatedPass = await BusPass.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPass) return res.status(404).json({ message: 'Bus pass not found' });
        res.json(updatedPass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
