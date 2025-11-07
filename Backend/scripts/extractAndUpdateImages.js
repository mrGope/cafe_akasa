const mysql = require('mysql2');
require('dotenv').config();

// Create database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cafe_akasa'
});

// Function to extract direct image URL from Google search URL
function extractImageUrl(googleUrl) {
  if (!googleUrl || !googleUrl.includes('google.com')) {
    return googleUrl; // Already a direct URL
  }

  try {
    // Extract imgurl parameter from Google search URL
    const urlParams = new URL(googleUrl);
    const imgurl = urlParams.searchParams.get('imgurl');
    
    if (imgurl) {
      // Decode the URL
      return decodeURIComponent(imgurl);
    }
    
    // Try alternative method - look for imgurl in the URL string
    const match = googleUrl.match(/imgurl=([^&]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    
    return googleUrl; // Return original if can't extract
  } catch (error) {
    console.error('Error extracting URL:', error.message);
    return googleUrl;
  }
}

async function extractAndUpdateImages() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Connect to database
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Connected to database!');
    console.log('\nExtracting direct image URLs from Google search URLs...\n');

    // Get all items with Google URLs
    const [items] = await connection.promise().execute(
      'SELECT id, name, image_url FROM items WHERE image_url LIKE "%google.com%"'
    );

    if (items.length === 0) {
      console.log('No Google URLs found. All images are already direct URLs!');
      return;
    }

    console.log(`Found ${items.length} item(s) with Google URLs:\n`);

    // Update each item
    for (const item of items) {
      const directUrl = extractImageUrl(item.image_url);
      
      console.log(`${item.name}:`);
      console.log(`   Old URL: ${item.image_url.substring(0, 80)}...`);
      console.log(`   New URL: ${directUrl}`);
      
      // Update the database
      const [result] = await connection.promise().execute(
        'UPDATE items SET image_url = ? WHERE id = ?',
        [directUrl, item.id]
      );
      
      if (result.affectedRows > 0) {
        console.log(`   Updated successfully!\n`);
      } else {
        console.log(`     No rows updated\n`);
      }
    }

    console.log(' All images updated successfully!');
    console.log('\n Next steps:');
    console.log('   1. Restart your backend server (if running)');
    console.log('   2. Refresh your frontend browser');
    console.log('   3. Check if the images display correctly');

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

// Run the extraction and update
extractAndUpdateImages();

