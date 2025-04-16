const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bike" }],
    status: { type: String, enum: ["pending", "completed"], default: "pending" }
});

module.exports = mongoose.model("Order", OrderSchema);
