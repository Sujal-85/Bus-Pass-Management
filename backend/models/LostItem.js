const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    busRoute: { type: String, required: true },
    date: { type: Date, default: Date.now },
    contactInfo: { type: String, required: true },
    status: { type: String, enum: ['lost', 'found', 'claimed'], default: 'lost' }
}, { timestamps: true });

module.exports = mongoose.model('LostItem', lostItemSchema);
