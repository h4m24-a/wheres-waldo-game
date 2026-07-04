#! /usr/bin/env node
require('dotenv').config();
const { Client } = require("pg"); //  used to interact with the PostgreSQL database.


// SQL is a string containing SQL command
const SQL = `

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





/*
 INSERT INTO image (name, path)
 VALUES ('wally-sports-stadium', '/images/wally-map.jpg');

 INSERT INTO location (character_name, x, y, tolerance, image_id)
 VALUES  
   ('wally', 414.5, 320, 30, 1),
   ('wenda', 371.5, 664, 30, 1),
   ('wizard', 892.5, 804, 30, 1),
   ('odlaw', 874.5, 599, 30, 1),
   ('woof', 893.5, 396, 30, 1);




CREATE TABLE image (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT,
    path TEXT
);



CREATE TABLE location (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    character_name TEXT,
    x NUMERIC(10,2),
    y NUMERIC(10,2),
    tolerance NUMERIC(10,2) DEFAULT 30.00,
    image_id INTEGER,
    image_path VARCHAR(255),

    CONSTRAINT waldo_location_image_id_fkey
        FOREIGN KEY (image_id)
        REFERENCES image(id)
);



CREATE TABLE rounds (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id TEXT,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE,
    finished BOOLEAN,
    image_id INTEGER,

    elapsed INTERVAL GENERATED ALWAYS AS (end_time - start_time) STORED,

    CONSTRAINT rounds_image_id_fkey
        FOREIGN KEY (image_id)
        REFERENCES image(id)
);


CREATE TABLE leaderboard (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT,
    time INTERVAL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    round_id INTEGER,

    CONSTRAINT leaderboard_round_id_fkey
        FOREIGN KEY (round_id)
        REFERENCES rounds(id)
);

*/