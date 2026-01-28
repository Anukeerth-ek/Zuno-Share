"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const upload_1 = require("../middleware/upload");
const profileController_1 = require("../controllers/profileController");
const router = express_1.default.Router();
router.get("/me", authMiddleware_1.authenticateUser, userController_1.getUserProfile);
router.get("/user/:id", userController_1.getUserById);
// ✅ FIXED: apply `authenticateUser` here too
router.post("/", authMiddleware_1.authenticateUser, upload_1.upload.single("avatar"), userController_1.createUserProfile);
router.put("/update", authMiddleware_1.authenticateUser, upload_1.upload.single("avatar"), profileController_1.updateUserProfile);
// router.post("/", authenticateUser, upload.single("avatar"), updateUserProfile);
router.put("/:id", authMiddleware_1.authenticateUser, userController_1.updateSessionStatus);
router.get("/all", profileController_1.getAllProfiles);
exports.default = router;
