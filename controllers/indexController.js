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

    const sessionId = req.sessionID; // Access session id

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

  
    
    // Create a character found array in session if it doesn't already exist
    if (!req.session.characterFound) {
      req.session.characterFound = []
    }
    
     
  

    req.session.save();
    
    const characters = await db.getCharacterImagePath(imageId)

    res.json({ 
      level,
      characters,
      totalCharacterCount,
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

  
    const imageId = parseInt(req.params.imageId)     // image id from url param



    const now = new Date();  // Tue Jan 06 2026 00:25:16 GMT+0000 (Greenwich Mean Time)

    const timeOnly = now.toTimeString().split(' ')[0];    // "00:25:16"   -- Only gets the time
     

    if (req.session.roundId) {
      return res.status(400).json({ error: 'Round already active' })
    }

    
    // Create new Round Entry in table (image id, session id, start time), also returns roundId
    const roundId = await db.startRound(timeOnly, imageId, sessionId)


    req.session.roundId = roundId   // Add roundId to session
    

    req.session.save();
    

    // Send back response
    res.status(200).json({ 
      message: 'Round Started',
      roundId
    })

  } catch (error) {

    console.error("Start Game Error:", error);
    res.status(500).json({ error: 'Failed to start game' });
  }
}


// GET - Get round id to make sure that the roundId persists after refresh using current session
async function getCurrentRoundController (req, res) {
  try {
  
    // Get RoundId if there is a roundId
    const roundId = req.session.roundId

    
    // No active RoundId
    if (!roundId) {
      return res.json({ error: 'No active round' })
    }

    req.session.save();

    // if true - get the roundId and return a json response with roundId
    return res.json({
      roundActive: true,
      roundId
      })
    
    
  } catch (error) {
    console.error("Current Round Error:", error);
    res.status(500).json({ error: 'Failed to retrieve current round' });
    
  }
}







// POST - Validate character x, y cordinates    // client side should send, imageId, Character_name, x & y coordinates
async function validateGuessController (req, res) {

  const roundId = req.session.roundId   // Retrieve round id from session
  const totalCharacterCount = req.session.totalCharacterCount   // Retrieve total character count from session



  try {     
    // Grab image id, character name, x, y from req.body
    const { imageId, x, y, character_name } = req.body;

    
    // Validate the data from frontend
    if (
      imageId == null ||
      x == null ||
      y == null
    ) {
      return res.status(400).json({ error: 'Missing data' })
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
    if (req.session.characterFound.includes(coordinates.character_name)) {
      return res.json({ 
        message: 'Character already found',
        duplicate: true,
        correctGuess: false,
      })
    }

    // incorrect guess
    if (!correctGuess) {
      return res.json({
        message: 'Incorrect Guess',
        correctGuess: false,
      })
    }
      

  
    
    // correct Guess - add id to the character found array
    if (correctGuess) {
      req.session.characterFound.push(coordinates.character_name)
    }



    // Check if all characters found and end round.
    if (req.session.characterFound.length === totalCharacterCount) {
  
      

      const now = new Date();  // Tue Jan 06 2026 00:25:16 GMT+0000 (Greenwich Mean Time)

      const timeOnly = now.toTimeString().split(' ')[0];    // "00:25:16"   -- Only gets the time


      // Update end_time in rounds table
      const result = await db.updateEndTimeRound(timeOnly, roundId)
      

      const finished = result.finished
      req.session.finished = true


      req.session.save();

      // Get elapsed time
      const elapsedResult = await db.getElapsedTime(roundId)
     
      const time = elapsedResult?.elapsed

      if (!time) {
        return res.json({error: 'No elapsed time'})
      }
      
    
      return res.json({ 
        roundComplete: true,
        finished,
        name: character_name,
        time,
        message: 'You Win! All characters found' 
      })
    }


    // Success message for correct guess - round continues. This is after check all characters because the function ends after the return statement. The game should end when the last character has been found. If ahead of character found function, the game wouldn't end.
    return res.json({
        correctGuess: true,
        name: character_name,
        message: 'Correct Guess'
      });

    
  } catch (error) {
    console.error("Validate Guess Error:", error);
    res.status(400).json({ error: 'Server Error' })
  }
}




// GET - Check to see if the current round is finished
async function finishedRoundController (req, res) {
  try {
    
    // Check if game is finished in session
    const finished = req.session.finished || false // Default to false if not set

    const roundId = req.session.roundId;

  
    const dbResult = await db.getElapsedTime(roundId)

    
    const time = dbResult?.elapsed
    

    req.session.save();

    res.json({
      finished, // send back finished boolean value,
      time,
      message: finished ? 'You Win, All Characters Found!' : 'In Progress'
    })
    
    
  } catch (error) {
    console.error("Check if game is finished:", error);
    res.status(500).json({ error: 'Failed to to check if game is finished' })
  }
}



// POST - submit name to leaderboard
async function submitDataController (req, res) {
  try {
    
    const { username } = req.body;
    const roundId = req.session.roundId;
    

   


    if (!username || isNaN(roundId)) {
      return res.status(400).json({ error: 'No username or Round id' })
    }
   

    await db.submitToLeaderboard(username, roundId)
    
    delete req.session.roundId;     // clear active round
    delete req.session.totalCharacterCount;   // clear total character count session  
    delete req.session.characterFound;        // clear character found array session
    delete req.session.finished

    
    
    req.session.destroy(() => {
      res.json({
        message: 'Username submitted to leaderboard',
      })
    })
    
    
  } catch (error) {
    console.error("Submit to leaderboard Controller:", error);
    res.status(500).json({ error: 'Failed to submit details' })
  }
}


// Get all names and time for leaderboard
async function getNameAndTimeController(req, res) {
  try {
    
    const imageId = parseInt(req.params.imageId)     // image id from url param
    const leaderboard = await db.getNameAndTime(imageId); // Get name and time from DB for particular map (imageId)
    

    if (!leaderboard || !imageId || leaderboard.length === 0) {
      return res.status(404).json({ error: 'No results' })
    }

    res.json({
      message: 'Fetched leaderboard',
      leaderboard // returns name, time, image_id
    })

  } catch (error) {
    console.error("Leaderboard:", error);
    res.status(500).json({ error: 'Error fetching leaderboard'})
  }
}

module.exports = {
  startGamePostController,
  finishedRoundController,
  submitDataController,
  validateGuessController,
  getNameAndTimeController,
  getAllLevelsController,
  getLevelController,
  getCurrentRoundController
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