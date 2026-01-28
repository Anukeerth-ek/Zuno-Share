"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ai_search_controller_1 = require("../controllers/ai-search.controller");
const router = express_1.default.Router();
router.post("/ai-query", ai_search_controller_1.aiQueryToFilters);
exports.default = router;
