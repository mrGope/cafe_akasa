const mysql = require('mysql2');
require('dotenv').config();

// Create database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cafe_akasa'
});

// Direct image URLs provided by user (extracted manually from websites)
const imageUpdates = [
  {
    name: 'Brown Bread',
    directUrl: 'https://sallysbakingaddiction.com/wp-content/uploads/2024/01/whole-wheat-bread-3.jpg'
  },
  {
    name: 'White Bread',
    directUrl: 'https://www.rockrecipes.com/wp-content/uploads/2008/01/DSC_0221-4.jpg'
  },
  {
    name: 'Garlic Bread',
    directUrl: 'https://www.allrecipes.com/thmb/1S7mF-tC89-HaKV_NvPK7bwsDtM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/21080-great-garlic-bread-DDMFS-4x3-e1c7b5c79fde4d629a9b7bce6c0702ed.jpg'
  },
  {
    name: 'Naan',
    directUrl: 'https://media.istockphoto.com/id/1140752821/photo/indian-naan-bread-with-garlic-butter-on-wooden-table.jpg?s=612x612&w=0&k=20&c=lTtokg-1e2OxzzPDHhtwWLR_43TCRBTcmpJU08OL6nQ='
  }
];

async function updateBreadImagesDirect() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Connect to database
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log(' Connected to database!');
    console.log('\n Updating bread images with direct URLs you provided...\n');

    let updatedCount = 0;
    let notFoundCount = 0;

    // Update each item
    for (const update of imageUpdates) {
      try {
        // Check if item exists
        const [items] = await connection.promise().execute(
          'SELECT id, name, image_url FROM items WHERE name = ?',
          [update.name]
        );

        if (items.length === 0) {
          console.log(`  "${update.name}" not found in database`);
          notFoundCount++;
          continue;
        }

        const currentUrl = items[0].image_url;
        const newUrl = update.directUrl;

        console.log(` ${update.name}:`);
        console.log(`   Current: ${currentUrl.substring(0, 70)}...`);
        console.log(`   New:     ${newUrl.substring(0, 70)}...`);

        // Update the database
        const [result] = await connection.promise().execute(
          'UPDATE items SET image_url = ? WHERE name = ?',
          [newUrl, update.name]
        );
        
        if (result.affectedRows > 0) {
          console.log(`    Updated successfully!\n`);
          updatedCount++;
        } else {
          console.log(`     No rows updated\n`);
        }
      } catch (error) {
        console.error(`    Error updating ${update.name}:`, error.message);
      }
    }

    console.log('─'.repeat(60));
    console.log(` Updated: ${updatedCount} items`);
    if (notFoundCount > 0) {
      console.log(`  Not found: ${notFoundCount} items`);
    }
    console.log('\n Next steps:');
    console.log('   1. Restart your backend server (if running)');
    console.log('   2. Refresh your frontend browser');
    console.log('   3. Check if the images display correctly');
    console.log('\n All images have been updated with the direct URLs you provided!');

  } catch (error) {
    console.error('\n Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n Tip: Check your database credentials in Backend/.env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n Tip: Database not found. Make sure to run schema.sql first.');
    }
    process.exit(1);
  } finally {
    connection.end();
  }
}

// Run the update
updateBreadImagesDirect();

