const mongoose = require("mongoose");
const { describe, it, before, after } = require("mocha");
const { expect } = require("chai");
const sinon = require("sinon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Order = require("../models/Order");
const ShopFacade = require("../services/ShopFacade");
const BikeBuilder = require("../services/BikeBuilder");

before(async () => {
  await mongoose.connect("mongodb://localhost:27017/testdb", { useNewUrlParser: true, useUnifiedTopology: true });
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("ShopFacade", () => {
  describe("validateUserData", () => {
    it("should return errors for missing fields", () => {
      const errors = ShopFacade.validateUserData({ name: "", email: "", password: "" });
      expect(errors).to.include("All fields are required");
    });

    it("should return an error for invalid email", () => {
      const errors = ShopFacade.validateUserData({ name: "John", email: "invalid", password: "StrongP@ss1" });
      expect(errors).to.include("Invalid email format");
    });

    it("should return an error for weak password", () => {
      const errors = ShopFacade.validateUserData({ name: "John", email: "test@example.com", password: "123" });
      expect(errors).to.include("Password must be at least 8 characters long and contain numbers and special characters");
    });
  });

  describe("registerUser", () => {
    let userFindStub, userSaveStub, bcryptStub, mailStub;
    
    beforeEach(() => {
      userFindStub = sinon.stub(User, "findOne");
      userSaveStub = sinon.stub(User.prototype, "save");
      bcryptStub = sinon.stub(bcrypt, "hash").resolves("hashedPassword");
      mailStub = sinon.stub(nodemailer, "createTransport").returns({ sendMail: sinon.stub().resolves() });
    });
    
    afterEach(() => {
      sinon.restore();
    });
    
    it("should throw an error if user already exists", async () => {
      userFindStub.resolves({ email: "test@example.com" });
      
      try {
        await ShopFacade.registerUser({ name: "John", email: "test@example.com", password: "StrongP@ss1" });
      } catch (error) {
        expect(error.message).to.equal("User already exists");
      }
    });
    
    it("should register a new user successfully", async () => {
      userFindStub.resolves(null);
      userSaveStub.resolves();
      
      const result = await ShopFacade.registerUser({ name: "John", email: "new@example.com", password: "StrongP@ss1" });
      expect(result.message).to.equal("User registered successfully");
    });
  });

  describe("loginUser", () => {
    let userFindStub, bcryptStub, jwtStub;

    beforeEach(() => {
      userFindStub = sinon.stub(User, "findOne");
      bcryptStub = sinon.stub(bcrypt, "compare");
      jwtStub = sinon.stub(jwt, "sign").returns("testToken");
    });

    afterEach(() => {
      sinon.restore();
    });

    it("should throw an error if user is not found", async () => {
      userFindStub.resolves(null);
      
      try {
        await ShopFacade.loginUser({ email: "notfound@example.com", password: "StrongP@ss1" });
      } catch (error) {
        expect(error.message).to.equal("User not found");
      }
    });

    it("should throw an error if password is incorrect", async () => {
      userFindStub.resolves({ email: "test@example.com", password: "hashedPass" });
      bcryptStub.resolves(false);
      
      try {
        await ShopFacade.loginUser({ email: "test@example.com", password: "WrongPass" });
      } catch (error) {
        expect(error.message).to.equal("Invalid credentials");
      }
    });

    it("should return token for correct credentials", async () => {
      userFindStub.resolves({ _id: "123", email: "test@example.com", password: "hashedPass" });
      bcryptStub.resolves(true);
      
      const result = await ShopFacade.loginUser({ email: "test@example.com", password: "StrongP@ss1" });
      expect(result).to.have.property("token", "testToken");
    });
  });

  describe("createBike", () => {
    it("should create a bike successfully", async () => {
      const bikeData = { type: "standard", color: "Red" };
      const bike = new BikeBuilder()
        .setType(bikeData.type)
        .setColor(bikeData.color)
        .build();
    
      const saveStub = sinon.stub(bike, "save").resolves(bike);
    
      const result = await ShopFacade.createBike(bikeData);
    
      const resultWithoutId = JSON.parse(JSON.stringify(result));
      const bikeWithoutId = JSON.parse(JSON.stringify(bike));
    
      delete resultWithoutId._id;
      delete resultWithoutId.__v;
      delete bikeWithoutId._id;
      delete bikeWithoutId.__v;
    
      expect(resultWithoutId).to.deep.equal(bikeWithoutId);
      saveStub.restore();
    });

    it("should throw an error if bike creation fails", async () => {
      const bikeData = { type: "Mountain", color: "Red" };
      const bike = new BikeBuilder()
        .setType(bikeData.type)
        .setColor(bikeData.color)
        .build();

      const saveStub = sinon.stub(bike, "save").rejects(new Error("Error creating bike"));

      try {
        await ShopFacade.createBike(bikeData);
      } catch (error) {
        expect(error.message).to.equal("Error creating bike");
      }
      saveStub.restore();
    });
  });

  describe("createOrder", () => {
    it("should create an order successfully", async () => {
      const userId = new mongoose.Types.ObjectId();
      const bikeIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
    
      const order = new Order({ user: userId, bikes: bikeIds });
    
      const saveStub = sinon.stub(order, "save").resolves(order);
    
      const result = await ShopFacade.createOrder({ userId, bikeIds });
    
      const orderJSON = result.toJSON();
      const expectedOrder = order.toJSON();

      delete orderJSON._id;
      delete orderJSON.__v;
      delete expectedOrder._id;
      delete expectedOrder.__v;
    
      expect(orderJSON).to.deep.equal(expectedOrder);
      saveStub.restore();
    });

    it("should throw an error if order creation fails", async () => {
      const userId = new mongoose.Types.ObjectId();
      const bikeIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const order = new Order({ user: userId, bikes: bikeIds });

      const saveStub = sinon.stub(order, "save").rejects(new Error("Error creating order"));

      try {
        await ShopFacade.createOrder({ userId, bikeIds });
      } catch (error) {
        expect(error.message).to.equal("Error creating order");
      }
      saveStub.restore();
    });
  });
});
