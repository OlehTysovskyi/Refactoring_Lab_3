const mongoose = require("mongoose");

const BikeSchema = new mongoose.Schema({
    type: { type: String, enum: ["standard", "electric"], required: true },
    color: { type: String, required: true }
});

module.exports = mongoose.model("Bike", BikeSchema);
