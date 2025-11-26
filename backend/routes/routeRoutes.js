const express = require('express');
const router = express.Router();
const Route = require('../models/Route');

// Get all routes
router.get('/', async (req, res) => {
    try {
        const routes = await Route.find();
        res.json(routes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a route
router.post('/', async (req, res) => {
    const route = new Route({
        name: req.body.name,
        from: req.body.from,
        stops: req.body.stops
    });

    try {
        const newRoute = await route.save();
        res.status(201).json(newRoute);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a route
router.put('/:id', async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route not found' });

        if (req.body.name) route.name = req.body.name;
        if (req.body.from) route.from = req.body.from;
        if (req.body.stops) route.stops = req.body.stops;

        const updatedRoute = await route.save();
        res.json(updatedRoute);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a route
router.delete('/:id', async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route not found' });

        await route.deleteOne();
        res.json({ message: 'Route deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
