const mongoose = require('mongoose');

const busPassSchema = new mongoose.Schema({
    formType: { type: String, required: true },
    date: { type: Date, required: true },
    academicYear: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    mobileNo: { type: String, required: true },
    EmailId: { type: String, required: true },
    department: { type: String, required: true },
    class: { type: String, required: true },
    semester: { type: String, required: true },
    busRoute: { type: String, required: true },
    routeTo: { type: String, required: true },
    passType: { type: String, required: true },
    passAmount: { type: Number, required: true },
    receivedAmount: { type: Number, required: true },
    pendingAmount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('BusPass', busPassSchema);
