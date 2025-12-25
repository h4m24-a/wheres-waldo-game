#! /usr/bin/env node
require('dotenv').config();
const { Client } = require("pg"); //  used to interact with the PostgreSQL database.


// SQL is a string containing SQL command
const SQL = `

  ALTER TABLE rounds
DROP COLUMN elapsed;

ALTER TABLE rounds
ALTER COLUMN start_time TYPE TIME USING start_time::time,
ALTER COLUMN end_time   TYPE TIME USING end_time::time;

ALTER TABLE rounds
ADD COLUMN elapsed INTERVAL
GENERATED ALWAYS AS (end_time - start_time) STORED;


`;



async function main() {         // async function
  console.log('seeding...');    // logs seeding to console to indicate start of seeding process
  const client = new Client({   // A new instance of Client is created.
    connectionString: process.env.DATABASE_URL  // connectionString specifies the database connection details
  });
  await client.connect();   //  establishes a connection to the PostgreSQL database using the client.
  await client.query(SQL);  //  Executes the SQL commands defined in the SQL string.
  await client.end();       // This closes the connection to the database.
  console.log("done");      // logs done to console to indicate end of seeding process.
}

main();






// INSERT INTO image (name, path)
// VALUES ('wally-sports-stadium', '/images/wally-map.jpg');

// INSERT INTO location (character_name, x, y, tolerance, image_id)
// VALUES  
//   ('wally', 414.5, 320, 30, 1),
//   ('wenda', 371.5, 664, 30, 1),
//   ('wizard', 892.5, 804, 30, 1),
//   ('odlaw', 874.5, 599, 30, 1),
//   ('woof', 893.5, 396, 30, 1);



// CREATE TABLE IF NOT EXISTS rounds
//  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//  session_id TEXT,
//  start_time TIMESTAMP,    - when search begins
//  end_time TIMESTAMP       - When all characters are found.
//  finished BOOLEAN
//  image_id INTEGER REFERENCES image (id)


// CREATE TABLE IF NOT EXISTS leaderboard
//  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//  name TEXT,
//  time INTERVAL,    
//  created_at TIMESTAMP,
//  round_id INTEGER REFERENCES rounds (id)

/*
CREATE TABLE IF NOT EXISTS rounds (
 id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 session_id TEXT,
 start_time TIMESTAMP NOT NULL,
 end_time TIMESTAMP,
 finished BOOLEAN,
 image_id INTEGER REFERENCES image (id)
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT,
  time INTERVAL,
  created_at TIMESTAMP,
  round_id INTEGER REFERENCES rounds (id)
);


*/