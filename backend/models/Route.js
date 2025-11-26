const mongoose = require('mongoose');

const busStopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    semester: { type: Number, required: true },
    yearly: { type: Number, required: true }
});

const routeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    from: { type: String, required: true },
    stops: [busStopSchema]
});

module.exports = mongoose.model('Route', routeSchema);
