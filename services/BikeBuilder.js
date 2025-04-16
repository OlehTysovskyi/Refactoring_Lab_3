const Bike = require("../models/Bike");

class BikeBuilder {
  constructor() {
    this.type = null;
    this.color = null;
  }

  setType(type) {
    this.type = type;
    return this;
  }

  setColor(color) {
    this.color = color;
    return this;
  }

  build() {
    if (!this.type || !this.color) {
      throw new Error("Missing required fields: type and color");
    }
    return new Bike({
      type: this.type,
      color: this.color
    });
  }
}

module.exports = BikeBuilder;
