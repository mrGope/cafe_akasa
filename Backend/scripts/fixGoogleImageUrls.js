const mysql = require('mysql2');
require('dotenv').config();

// Create database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cafe_akasa'
});

// Map of items with their direct image URLs extracted from Google search URLs
const imageUpdates = [
  {
    name: 'Chicken Curry',
    // From: https://www.google.com/imgres?q=chicken%20curry&imgurl=https%3A%2F%2Fwww.whiskaffair.com%2Fwp-content%2Fuploads%2F2021%2F10%2FAndhra-Chicken-Curry-2-3.jpg
    directUrl: 'https://www.whiskaffair.com/wp-content/uploads/2021/10/Andhra-Chicken-Curry-2-3.jpg'
  },
  {
    name: 'Fish Fry',
    // From: https://www.google.com/imgres?q=fish%20fry&imgurl=https%3A%2F%2Fwww.yummytummyaarthi.com%2Fwp-content%2Fuploads%2F2022%2F02%2Ffish-fry-1.jpeg
    directUrl: 'https://www.yummytummyaarthi.com/wp-content/uploads/2022/02/fish-fry-1.jpeg'
  },
  {
    name: 'Egg Curry',
    // From Google URL - need to find actual image URL
    // Using a placeholder - user can update this
    directUrl: 'https://www.slurrp.com/recipes/kerala-egg-curry-recipe-1617380104'
  },
  {
    name: 'Mutton Biryani',
    // From Google URL - need to find actual image URL
    // Using a placeholder - user can update this
    directUrl: 'https://www.licious.in/blog/recipe/mughlai-mutton-biryani-recipe'
  },
  {
    name: 'Mango',
    // From: https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.jiomart.com%2Fp%2Fgroceries%2Fraw-mango-1-kg%2F590000191
    // This is a product page, not an image - using Unsplash instead
    directUrl: 'https://images.unsplash.com/photo-1605027990121-47593b304e33?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'White Bread',
    // From Google URL - extracting direct URL
    directUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Brown Bread',
    // From Google URL - extracting direct URL
    directUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Garlic Bread',
    // From Google URL - extracting direct URL
    directUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

async function fixGoogleImageUrls() {
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
    console.log('\n Extracting and updating direct image URLs...\n');

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
        console.log(`   Current: ${currentUrl.substring(0, 60)}...`);
        console.log(`   New:     ${newUrl}`);

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
    console.log('\n Note: Some URLs might need manual verification.');
    console.log('   If an image doesn\'t display, right-click the image on the source website');
    console.log('   and select "Copy image address" to get the direct URL.');

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

// Run the fix
fixGoogleImageUrls();

