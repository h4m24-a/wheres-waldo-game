const pool = require("./pool");


// Get name, x & y coordinates, tolerance and image_id of characters
async function getLocationOfAllCharacters() {
  try {
    const { rows } = await pool.query('SELECT * FROM waldo_location');
    return rows
  } catch (error) {
    throw Error('Error fetching all rows')
    
  }
}



// Get all x & y coordinate of characters in different levels using image id
async function getCoordinatesofLevel(image_id) {
  try {
    const { rows } = await pool.query(`
                                           SELECT location.character_name, location.x, location.y, image.id, image.name 
                                           FROM location 
                                           LEFT JOIN image    
                                           ON location.image_id = image.id 
                                           WHERE image.id = $1`, [image_id]);
    return rows 
    
  } catch (error) {
    throw Error('Error fetching rows')
  }
  
}


// Get x & y of a specific character using imageId and character name
async function getCoordinatesofACharacter(imageId, character_name) {
  try {
    const result = await pool.query(`
                                           SELECT id, character_name, x, y, tolerance
                                           FROM location  
                                           WHERE image_id = $1
                                           AND character_name = $2
                                           `, [imageId, character_name]);
    return result.rows[0]
    
  } catch (error) {
    throw Error('Error fetching rows')
  }
  
}



// Get a specific level using imageId
async function getLevel(id) {
  try {
    const result = await pool.query('SELECT name, path FROM image WHERE id = $1', [id]);
    return result.rows[0]
    
  } catch (error) {
    throw Error('Error fetching level')
  }
}



// Get number of characters in a particular level using image id
async function getCharacterLevelCount(image_id) {
  try {
    const result = await pool.query(`
                                    SELECT image.name, COUNT(location.image_id) as character_count 
                                    FROM location
                                    JOIN image
                                    ON location.image_id = image.id
                                    WHERE location.image_id = ($1)
                                    GROUP BY image.name`,  [image_id]);
    return result.rows[0]
    
  } catch (error) {
    throw Error('Error fetching count of level')
  }
}


// Start the round
async function startRound(startTime, image_id, session_id) {
  try {
    const result = await pool.query('INSERT into rounds (start_time, image_id, sessionId) VALUES ($1, $2, $3) RETURNING id', [startTime, image_id, session_id])
    return result.rows[0].id // round_id
  } catch (error) {
    throw Error('Error adding start time')
  }
  
}


// Update end_time column for end of round
async function updateEndTimeRound(end_time, roundId) {
  try {
    const result = await pool.query('UPDATE rounds SET end_time = $1, finished = true WHERE roundId = $2 RETURNING id', [end_time, roundId])
    return result.rows[0]
    
  } catch (error) {
    throw Error('Error updating end time')
  }
}


// Return a specific round entry using round Id
async function getRoundUsingId(roundId) {
  try {
    const result = await pool.query('SELECT * FROM rounds WHERE roundId = $1', [roundId])
    return result.rows[0]
    
  } catch (error) {
    throw Error('Error fetching round Id')
  }
  
}



// Get elapsed time using rounds Id from rounds table
async function getElapsedTime(roundId) {
  try {
    const result = await pool.query('SELECT elapsed FROM rounds WHERE id = $1 AND finished = true', [roundId])
    return result.rows[0]
    
  } catch (error) {
    throw Error('Error fetching elapsed time')
  }
}



// Submit name and elapsed time? to leaderboard
async function submitToLeaderboard(name, roundId) {
  try {
    await pool.query(`
                        INSERT into leaderboard (name, time) 
                        SELECT $1 , rounds.elapsed
                        FROM rounds
                        WHERE rounds.id = $2 AND finished = true
                        `, [name, roundId])
    
  } catch (error) {
    throw Error('Error submitting name and time')
  }
}




// Display name and time in leaderboard
async function getNameAndTime() {
  try {
    const { rows } = await pool.query('SELECT name, time FROM leaderboard ORDER BY time ASC LIMIT 10');
    return rows
  } catch (error) {
    throw Error('Error fetching leaderboard')
  }
}

module.exports = {
  getLocationOfAllCharacters,
  getCoordinatesofLevel,
  getCoordinatesofACharacter,
  getLevel,
  startRound,
  updateEndTimeRound,
  getElapsedTime,
  submitToLeaderboard,
  getNameAndTime,
  getRoundUsingId,
  getCharacterLevelCount
}


