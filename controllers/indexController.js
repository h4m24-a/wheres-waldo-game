const db = require('../db/queries')


// POST
async function startGamePostController (req, res) {
  try {

    const imageId = parseInt(req.params.imageId)
    const sessionId = req.sessionId
     

    // Make query to database to get the path of selected level using imageId
    const level = await db.getLevel(imageId)
    
    const time = new Date().toLocaleDateString([], {   // Take current time for Start Time
      hour: "2-digit",
      minute: "2-digit",
    });



    // Create new Round Entry in table (image id, session id, start time), also returns roundId
    const roundId = await db.startRound(time, imageId, sessionId)

    if (req.session.roundId) {
      return res.status(400).json({ error: 'Round already active' })
    }

    req.session.roundId = roundId   // Add roundId to session

    

    // Send back response including path name
    res.status(200).json({ 
      message: 'Level Loaded',
      levelName: level.name,
      path: level.path,
      roundId: roundId
    })

    
  } catch (error) {
    res.status(500).json({ error: 'Failed to start game' })
  }
}




// POST
async function endGamePostController (req, res) {
  try {
    
    const roundId = req.session.roundId


    // Take current time for End Time
    const time = new Date().toLocaleDateString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })


    if (!time || !roundId) {
     return res.status(400).json({ error: "End time and round id are required." })
    }


    // Update end_time in rounds table
    await db.updateEndTimeRound(time, roundId)

    delete req.session.roundId;     // clear active round

    res.json({
      message: 'Round Ended'
    })

  } catch (error) {
    res.status(500).json({ error: 'Failed to end game' })
    
  }
}




// POST - Validate character x, y cordinates    // client side should send, imageId, Character_name, x & y coordinates
async function validateGuessController (req, res) {
  try {     

    // Grab image id, character name, x, y from req.body
    const { imageId, x, y, character_name } = req.body;

    
    // Validate the data from frontend
    if (!imageId || !x  || !y) {
      return res.status(400).json({ error: 'No data' })
    }


    
    
    // make call to database using corresponding query and arguments
    const coordinates = await db.getCoordinatesofACharacter(imageId, character_name)
    


    // Return error if character is not found (db query is empty)
    if (!coordinates) {
     return res.status(400).json({ error: 'Character not found' })
    }

  
    const tolerance = Number(coordinates.tolerance)

    const correctGuess = 
    x >= coordinates.x - tolerance &&     // x -
    x <= coordinates.x + tolerance &&     // x +
    y >= coordinates.y - tolerance &&     // y -
    y <= coordinates.y + tolerance &&     // y +
    character_name === coordinates.character_name


    // success message if found
    if (correctGuess) {
      return res.status(200).json({
        message: 'Correct Guess',
        name: character_name
      })

    } else {
      return res.status(200).json({ message: 'Incorrect guess'})
    }


    
  } catch (error) {
    res.status(400),json({ error: 'Server Error' })
  }
}



// POST - submit name to leaderboard
async function submitDataController (req, res) {
  try {
    
    const { name } = req.body;
    const roundId = req.session.roundId


    if (!name || !roundId) {
      return res.status(400).json({ error: 'No name or Round id' })
    }

    await db.submitToLeaderboard(name, roundId)

    res.json({
      message: 'Name submitted to leaderboard'
    })
    
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit details' })
  }
}


// Get all names and time for leaderboard
async function getNameAndTimeController(req, res) {
  try {
    
    const leaderboard = await db.getNameAndTime(); // Get name and time from DB

    if (!leaderboard || leaderboard.length === 0) {
      return res.status(404).json({ error: 'No results' })
    }

    res.json({
      message: 'Fetched leaderboard',
      leaderboard
    })

  } catch (error) {
    res.status(500).json({ error: 'Error fetching leaderboard'})
  }
}

module.exports = {
  startGamePostController,
  endGamePostController,
  submitDataController,
  validateGuessController,
  getNameAndTimeController
}




/*
Never trust the frontend to tell you:

which character was found

how many have been found

Frontend should only send:

click coordinates

session ID

Backend decides everything else.
*/



// One user session can have multiple rounds. use Round Id as its a unique entry

// round_id = one round, one score
// session_id = one anonymous user (many rounds)