const express = require("express");
const OrderController = require("../controllers/order.controller");

const router = express.Router();

/**
 * @swagger
 * /api/create-order:
 *   post:
 *     summary: Створює нове замовлення
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60c72b2f5f1b2c001f8e4f20"
 *               bikeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "60c72b2f5f1b2c001f8e4f22"
 *     responses:
 *       201:
 *         description: Замовлення успішно створене
 */
router.post("/create-order", OrderController.createOrder);

module.exports = router;
