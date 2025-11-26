const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');

// GET /api/lost-items - Get all lost items
router.get('/', async (req, res) => {
    try {
        const items = await LostItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/lost-items - Report a lost item
router.post('/', async (req, res) => {
    try {
        const newItem = new LostItem(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH /api/lost-items/:id - Update status
router.patch('/:id', async (req, res) => {
    try {
        const updatedItem = await LostItem.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
