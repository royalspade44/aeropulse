const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listServiceRequests, createServiceRequest } = require("../controllers/serviceRequestController");

const router = express.Router();

router.use(requireAuth);

router.get("/", listServiceRequests);
router.post("/", createServiceRequest);

module.exports = router;

