const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB підключено!");
    } catch (error) {
        console.error("Помилка з'єднання з MongoDB:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
