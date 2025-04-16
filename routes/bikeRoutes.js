const express = require("express");
const BikeController = require("../controllers/bike.controller");

const router = express.Router();

/**
 * @swagger
 * /api/create-bike:
 *   post:
 *     summary: Додає новий велосипед
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "electric"
 *               color:
 *                 type: string
 *                 example: "black"
 *     responses:
 *       201:
 *         description: Велосипед додано
 */
router.post("/create-bike", BikeController.createBike);

module.exports = router;
