const ShopFacade = require("../services/ShopFacade");

class OrderController {

  static async createOrder(req, res) {
    try {
      const order = await ShopFacade.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

}

module.exports = OrderController;
