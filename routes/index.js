const express = require('express');
const {getAllLevelsController, getLevelController, startGamePostController, endGamePostController, submitDataController, validateGuessController, getNameAndTimeController, getCurrentRoundController } = require('../controllers/indexController')

const router = express.Router();


// Home Menu - displays all levels
router.get('/menu', getAllLevelsController) 


// Get Level
router.get('/round/start/:imageId', getLevelController)


// Start Game (iniate round and start timer)
router.post('/round/start/:imageId', startGamePostController);


// Get Current active Round if there is one
router.get('/round/current', getCurrentRoundController);


// End game (Stop and Save time)
router.post('/round/end', endGamePostController);


// Validate Guess
router.post('/guess', validateGuessController)



// Submit username name and time to leaderboard after round ended
router.post('/submit', submitDataController);


// Get leaderboard - All names and times
router.get('/leaderboard', getNameAndTimeController);




module.exports = router;