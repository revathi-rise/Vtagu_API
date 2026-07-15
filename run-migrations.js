const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vtagu'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL successfully.');

  // Queries to modify table columns
  const queries = [
    {
      sql: `ALTER TABLE plan ADD COLUMN is_interactive_included TINYINT DEFAULT 0`,
      description: 'Add column is_interactive_included to plan table'
    },
    {
      sql: `ALTER TABLE interactive_movies ADD COLUMN is_free TINYINT DEFAULT 0`,
      description: 'Add column is_free to interactive_movies table'
    },
    {
      sql: `ALTER TABLE interactive_movies ADD COLUMN price FLOAT DEFAULT 0`,
      description: 'Add column price to interactive_movies table'
    },
    {
      sql: `ALTER TABLE interactive_movies ADD COLUMN currency VARCHAR(10) DEFAULT 'INR'`,
      description: 'Add column currency to interactive_movies table'
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS user_interactive_movie_purchases (
        purchase_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        interactive_movie_id INT NOT NULL,
        txn_id VARCHAR(100) NULL,
        paidAmount FLOAT NOT NULL,
        currency VARCHAR(10) NOT NULL,
        status INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      description: 'Create user_interactive_movie_purchases table'
    }
  ];

  let completed = 0;
  for (const q of queries) {
    connection.query(q.sql, (error) => {
      if (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`[INFO] Column already exists for: ${q.description}`);
        } else {
          console.error(`[ERROR] Fail to run "${q.description}":`, error.message);
        }
      } else {
        console.log(`[SUCCESS] Run migration: ${q.description}`);
      }
      completed++;
      if (completed === queries.length) {
        console.log('All database migrations finished.');
        connection.end();
      }
    });
  }
});
