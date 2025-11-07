const mysql = require('mysql2');
require('dotenv').config();

// Create database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cafe_akasa'
});

// Direct image URLs provided by user
const imageUpdates = [
  {
    name: 'Mango Shake',
    directUrl: 'https://tastyoven.com/wp-content/uploads/2022/06/mango-shake-3.jpeg'
  },
  {
    name: 'Tea',
    directUrl: 'https://www.teaforturmeric.com/wp-content/uploads/2021/11/Masala-Chai-Tea-9-1024x1536.jpg'
  },
  {
    name: 'Mango',
    directUrl: 'https://www.biovie.fr/img/cms/histoire-origine-mangue.png'
  },
  {
    name: 'Egg Curry',
    directUrl: 'https://www.spicebangla.com/wp-content/uploads/2024/08/Egg-Masala-Curry.webp'
  },
  {
    name: 'Mutton Biryani',
    directUrl: 'https://www.licious.in/blog/wp-content/uploads/2019/11/Mutton-Biryani-1-e1574922017237.jpg'
  },
  {
    name: 'Chips',
    directUrl: 'https://buya1chips.com/cdn/shop/files/PotatoChipsSpicyGarlic.jpg?v=1742537002&width=800'
  },
  {
    name: 'Samosa',
    directUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_960,w_960//InstamartAssets/samosa.webp?updatedAt=1727156367955'
  },
  {
    name: 'Pakora',
    directUrl: 'https://www.recipetineats.com/tachyon/2021/05/Pakora_1.jpg?resize=900%2C1260&zoom=0.72'
  },
  {
    name: 'Onion',
    directUrl: 'https://en-chatelaine.mblycdn.com/ench/resized/2018/08/w1534/types-of-onions.jpg'
  },
  {
    name: 'Tomato',
    directUrl: 'https://www.healthdigest.com/img/gallery/can-you-eat-too-many-tomatoes/intro-1649444633.webp'
  },
  {
    name: 'Potato',
    directUrl: 'https://cdn.mos.cms.futurecdn.net/iC7HBvohbJqExqvbKcV3pP-970-80.jpg.webp'
  }
];

async function updateAllItemImages() {
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
    console.log('\n Updating items with direct image URLs you provided...\n');

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
          console.log(`   Updated successfully!\n`);
          updatedCount++;
        } else {
          console.log(`     No rows updated\n`);
        }
      } catch (error) {
        console.error(`   ❌ Error updating ${update.name}:`, error.message);
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
    console.error('\n❌ Error:', error.message);
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
updateAllItemImages();

