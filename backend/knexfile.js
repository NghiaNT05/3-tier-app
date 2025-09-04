require('dotenv').config();  // nhớ cài dotenv: npm install dotenv

module.exports = {
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: './migrations'
    }
  }
};
