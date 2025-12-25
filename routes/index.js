const express = require('express');
const { startGamePostController, endGamePostController, submitDataController, validateGuessController, getNameAndTimeController } = require('../controllers/indexController')

const router = express.Router();


router.get('/home', (req, res) => {
  res.send('Home Page')
})


// Start Game (iniate round and start timer)
router.post('/round/start/:imageId', startGamePostController);




// End game (Stop and Save time)
router.post('/round/end', endGamePostController);



// Validate Guess
router.post('/guess', validateGuessController)



// Submit username name and time to leaderboard
router.post('/submit', submitDataController);


// Get leaderboard - All names and times
router.get('/leaderboard', getNameAndTimeController);




module.exports = router;