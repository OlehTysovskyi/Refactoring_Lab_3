const ShopFacade = require("../services/ShopFacade");

class BikeController {

  static async createBike(req, res) {
    try {
      const bike = await ShopFacade.createBike(req.body);
      res.status(201).json(bike);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

}

module.exports = BikeController;
