require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const busPassRoutes = require('./routes/busPassRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bus-pass', busPassRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/verify', require('./routes/verifyRoutes'));

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();
    let reply = "I'm not sure about that. Try asking about 'routes', 'pass status', or 'deadlines'.";

    if (lowerMsg.includes('route') || lowerMsg.includes('bus')) {
        reply = "We have routes covering Vita, Khanapur, Kadegaon, and more. Check the Route Management tab for details.";
    } else if (lowerMsg.includes('status') || lowerMsg.includes('active')) {
        reply = "You can check your pass status in the Student Management section. Green means Active!";
    } else if (lowerMsg.includes('payment') || lowerMsg.includes('fee')) {
        reply = "Pass fees depend on the route and duration (Monthly/Semester/Yearly). Please visit the office for payment issues.";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        reply = "Hello! How can I assist you with your bus pass today?";
    }

    res.json({ reply });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });
