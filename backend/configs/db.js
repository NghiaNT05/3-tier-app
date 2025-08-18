const mysql = require('mysql2');

const db = mysql.createConnection({
   host: 'terraform-20250818060305828900000001.cbkk4ag2mn7a.ap-southeast-1.rds.amazonaws.com',
   port: '3306',
   user: 'admin',
   password: 'Nghiatoila!123',
   database: 'react_node_app'
});

module.exports = db;