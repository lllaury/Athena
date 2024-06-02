const express = require("express");
const router = express.Router();
const dbController = require("../controllers/dbController");

router.get("/assignments", dbController.getAssignments);

router.get("/user-data", dbController.getUserStats);

router.post(
    "/import/selected-assignments",
    dbController.generateTasksFromSelectedAssignments
);

router.get(
    "/import/all-assignments",
    dbController.generateTasksFromAllAssignments
);

router.get("/test", (req, res) => {
    res.send("Test route is working");
});

module.exports = router;
