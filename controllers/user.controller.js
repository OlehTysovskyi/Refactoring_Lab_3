const ShopFacade = require("../services/ShopFacade");

class UserController {

  static async registerUser(req, res) {
    try {
      const result = await ShopFacade.registerUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async loginUser(req, res) {
    try {
      const result = await ShopFacade.loginUser(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

}

module.exports = UserController;
