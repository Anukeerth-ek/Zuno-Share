"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connectionController_1 = require("../controllers/connectionController");
const router = express_1.default.Router();
router.post("/request", connectionController_1.sendConnectionRequest);
router.post("/accept", connectionController_1.acceptConnectionRequest);
router.post("/decline", connectionController_1.declineConnectionRequest);
router.get("/requests/incoming/:userId", connectionController_1.getIncomingRequests);
router.get("/accepted/:userId", connectionController_1.getAcceptedConnections);
router.get("/connections/:userId", connectionController_1.getUserConnections);
exports.default = router;
