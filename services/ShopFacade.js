const User = require("../models/User");
const BikeBuilder = require("./BikeBuilder");
const Order = require("../models/Order");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const nodemailer = require("nodemailer");

class ShopFacade {

  static validateUserData({ name, email, password }) {
    const errors = [];

    if (!name || !email || !password) {
      errors.push("All fields are required");
    }
    if (!validator.isEmail(email)) {
      errors.push("Invalid email format");
    }
    if (!validator.isStrongPassword(password, { minLength: 8 })) {
      errors.push("Password must be at least 8 characters long and contain numbers and special characters");
    }

    return errors;
  }

  static async registerUser({ name, email, password }) {
    const validationErrors = ShopFacade.validateUserData({ name, email, password });
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(", "));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    try {
      await newUser.save();
      await ShopFacade.sendWelcomeEmail(email, name);
      return { message: "User registered successfully" };
    } catch (error) {
      throw new Error("Error registering user");
    }
  }

  static async sendWelcomeEmail(email, name) {
    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to our Shop!",
        text: `Hello ${name},\n\nThank you for registering at our shop!`
      };
  
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("Email error:", error.message);
    }
  }
  

  static async loginUser({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { message: "Login successful", token };
  }

  static async createBike({ type, color }) {
    const bike = new BikeBuilder()
      .setType(type)
      .setColor(color)
      .build();
    try {
      await bike.save();
      return bike;
    } catch (error) {
      throw new Error("Error creating bike");
    }
  }

  static async createOrder({ userId, bikeIds }) {
    const order = new Order({ user: userId, bikes: bikeIds });
    try {
      await order.save();
      return order;
    } catch (error) {
      throw new Error("Error creating order");
    }
  }
}

module.exports = ShopFacade;
