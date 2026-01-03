const db = require('../db/queries')



// GET all Levels
async function getAllLevelsController(req, res) {
  try {
    const levels = await db.getAllLevels()

    if (!levels) {
      return res.status(404).json({ error: 'There are no levels' })
    }

    res.json(levels)    // Return response (levels) as JSON
    
  } catch (error) {
    res.status(500).json({ error:'Failed to fetch levels' })
  }

}


// GET /round/start/:imageId
async function getLevelController(req, res) {
  try {

    const imageId = parseInt(req.params.imageId) 

    if (isNaN(imageId)) {
      return res.status(400).json({ error: 'Invalid image ID' });
    }


    
    const level = await db.getLevel(imageId) // returns image id , name, path

    
    if (!level) {
      return res.status(404).json({ error: 'Level not found' })
    }

    
    const result = await db.getCharacterLevelCount(imageId)        // Get number of characters in level
    const totalCharacterCount = parseInt(result.character_count)
    req.session.totalCharacterCount = totalCharacterCount   // Storing count in session


    const characters = await db.getCharacterImagePath(imageId)

    res.json({ 
      level,
      characters,
      message: 'Loaded Level',
    })
    
  } catch (error) {
     res.status(500).json({ error: 'Failed to start game' })
  }
}



// POST   /round/start/:imageId
async function startGamePostController (req, res) {
  try {

    const sessionId = req.sessionID; // Access session id

  
    const imageId = parseInt(req.params.imageId)    // image id from url param



    const time = new Date()   // Take current time for Start Time
     

    if (req.session.roundId) {
      return res.status(400).json({ error: 'Round already active' })
    }

    // Create new Round Entry in table (image id, session id, start time), also returns roundId
    const roundId = await db.startRound(time, imageId, sessionId)


    req.session.roundId = roundId   // Add roundId to session

    

    // Send back response including path name
    res.status(200).json({ 
      message: 'Round Started',
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
    const time = new Date();


    if (!time || !roundId) {
     return res.status(400).json({ error: "End time and round id are required." })
    }


    // Update end_time in rounds table
    await db.updateEndTimeRound(time, roundId)

    delete req.session.roundId;     // clear active round

    res.json({
      message: 'Round Complete'
    })

  } catch (error) {
    res.status(500).json({ error: 'Failed to end game' })
    
  }
}




// POST - Validate character x, y cordinates    // client side should send, imageId, Character_name, x & y coordinates
async function validateGuessController (req, res) {

  const roundId = req.session.roundId
  const totalCharacterCount = req.session.totalCharacterCount

  // Create a character found array in session if it doesn't already exist
  if (!req.session.characterFound) {
    req.session.characterFound = []
  }

  req.session.characterFound = characterFoundArr

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
    const targetX = Number(coordinates.x);
    const targetY = Number(coordinates.y)

    const correctGuess = 
    x >= targetX - tolerance &&     // x -
    x <= targetX + tolerance &&     // x +
    y >= targetY - tolerance &&     // y -
    y <= targetY + tolerance &&     // y +
    character_name === coordinates.character_name
  

    // duplicate guess
    if (characterFoundArr.includes(coordinates.id)) {
      return res.status(403).json({ message: 'Character already found'})
    }


    // incorrect guess
    if (!correctGuess) {
      return res.json({ message: 'Incorrect Guess' })
    }
      

    
    // correct Guess - add id to the character found array
    if (correctGuess) {
      characterFoundArr.push(coordinates.id)
    }



    // Check if all characters found and end round.
    if (characterFoundArr.length === totalCharacterCount) {
  

      // Take current time for End Time
      const time = new Date();


      // Update end_time in rounds table
      await db.updateEndTimeRound(time, roundId)

      delete req.session.roundId;     // clear active round
      delete req.session.totalCharacterCount;
      delete req.session.characterFound;

      return res.json({ 
        roundComplete: true,
        message: 'All characters found' 
      })
    }


    // Success message for correct guess - round continues. This is after check all characters because the function ends after the return statement. The game should end when the last character has been found. If ahead of character found function, the game wouldn't end.
    return res.json({
        correctGuess: true,
        name: character_name
      });

    
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
  getNameAndTimeController,
  getAllLevelsController,
  getLevelController
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




// Always perform end of round or all characters found checks before sending the response.