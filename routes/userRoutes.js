const express = require("express");
const UserController = require("../controllers/user.controller");

const router = express.Router();

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Регістрація нового користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Користувач зареєстрований
 */
router.post("/register", UserController.registerUser);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Логін користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Логін успішний
 */
router.post("/login", UserController.loginUser);

module.exports = router;
