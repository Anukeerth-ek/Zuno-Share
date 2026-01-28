"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const skillController_1 = require("../controllers/skillController");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.authenticateUser, skillController_1.addSkill);
router.get('/', skillController_1.listSkills);
exports.default = router;
