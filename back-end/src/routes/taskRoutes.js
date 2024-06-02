const express = require('express');
const router = express.Router();
const { generateTask, updatePriorities, updateTaskStatus, deleteTask, updateSubtaskStatus } = require('../controllers/taskController');

router.post('/generate', generateTask);
router.post('/update-priorities', updatePriorities);
router.post('/update-status', updateTaskStatus);
router.post('/delete-task', deleteTask);
router.post('/update-subtask-status', updateSubtaskStatus);
module.exports = router;
