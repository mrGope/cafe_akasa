const mysql = require('mysql2');
require('dotenv').config();

// Create database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cafe_akasa'
});

// Image updates
const imageUpdates = [
  {
    name: 'Mango',
    url: 'https://images.unsplash.com/photo-1605027990121-47593b304e33?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Chicken Curry',
    url: 'https://www.whiskaffair.com/wp-content/uploads/2021/10/Andhra-Chicken-Curry-2-3.jpg'
  },
  {
    name: 'Fish Fry',
    url: 'https://www.yummytummyaarthi.com/wp-content/uploads/2022/02/fish-fry-1.jpeg'
  },
  {
    name: 'Egg Curry',
    url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Mutton Biryani',
    url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'White Bread',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Brown Bread',
    url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Garlic Bread',
    url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

async function updateImages() {
  try {
    console.log('Connecting to database...');
    
    // Connect to database
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Connected to database!');
    console.log('Updating images...\n');

    // Update each item
    for (const update of imageUpdates) {
      const [result] = await connection.promise().execute(
        'UPDATE items SET image_url = ? WHERE name = ?',
        [update.url, update.name]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✓ Updated ${update.name}`);
      } else {
        console.log(`✗ ${update.name} not found in database`);
      }
    }

    console.log('\nAll images updated successfully!');
    console.log('Restart your backend server to see the changes.');

  } catch (error) {
    console.error('Error updating images:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nTip: Check your database credentials in Backend/.env file');
      console.error('   Make sure DB_USER and DB_PASSWORD are correct.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\nTip: Database not found. Make sure to run schema.sql first.');
    }
  } finally {
    connection.end();
  }
}

// Run the update
updateImages();

