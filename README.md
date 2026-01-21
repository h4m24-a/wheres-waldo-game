# 📝 Wheres-Waldo Backend

An ** API** for creating Wheres Waldo type levels. Built with **Node.js**, **Express**, and **PostgreSQL**.
---

##  Tech Stack

|  |  |
|------------|-------------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) | Server-side|
| ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) | Routing and server logic |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-0064a5?style=for-the-badge&logo=postgresql&logoColor=white) | Relational database |
---

## Features
- Designed and implemented a backend API to create a Wheres Wally type game where users make guesses in an attempt to find all characters
- Built server-side game session tracking to securely record round start and ending times, to prevent client-side manipulation using express-sessions
- Endpoints to verify user guess attempts and return real-time validation feedback to the client.
- Designed a relational PostgreSQL schema to model images (levels), characters & coordinate location, rounds, and leaderboard entries
- Wrote SQL queries to validate user guesses by checking whether the normalized click coordinates fall within stored character tolerance along with the name in the database
- Controller functions and Endpoints were made with making the game logic dynamic, so multiple levels can be supported by inserting images and the names and coordinates of characters in the database.