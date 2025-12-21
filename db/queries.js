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
async function getCoordinatesofLevel(imageId) {
  try {
    const { rows } = await pool.query(`
                                           SELECT location.character_name, location.x, location.y, image.id, image.name 
                                           FROM location 
                                           LEFT JOIN image    
                                           ON location.image_id = image.id 
                                           WHERE image.id = $1`, [imageId]);
    return rows 
    
  } catch (error) {
    throw Error('Error fetching rows')
  }
  
}


// Get x & y of a specific character using imageId and character name
async function getCoordinatesofACharacter(imageId, character_name) {
  try {
    const result = { rows } = await pool.query(`
                                           SELECT character_name, x, y, tolerance
                                           FROM location  
                                           WHERE image_id = $1
                                           AND character_name = $2
                                           `, [imageId, character_name]);
    return result.rows[0]
    
  } catch (error) {
    throw Error('Error fetching rows')
  }
  
}





module.exports = {
  getLocationOfAllCharacters,
  getCoordinatesofLevel,
  getCoordinatesofACharacter

}