const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    filename: String,
    filepath: String,
    filePassword: String,
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', FileSchema);