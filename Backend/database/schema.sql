-- Cafe Akasa Database Schema
-- MySQL Database Setup

CREATE DATABASE IF NOT EXISTS cafe_akasa;
USE cafe_akasa;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id INT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_item (user_id, item_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    tracking_id VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Insert sample categories
INSERT INTO categories (name) VALUES
('All'),
('Fruit'),
('Vegetable'),
('Non-veg'),
('Breads'),
('Beverages'),
('Snacks')
ON DUPLICATE KEY UPDATE name=name;

-- Insert sample items
INSERT INTO items (name, description, price, stock, category_id, image_url) VALUES
-- Fruits
('Apple', 'Fresh red apples', 50.00, 100, 2, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Banana', 'Sweet yellow bananas', 40.00, 150, 2, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Orange', 'Juicy oranges', 60.00, 80, 2, 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Mango', 'Seasonal mangoes', 80.00, 50, 2, 'https://www.biovie.fr/img/cms/histoire-origine-mangue.png'),

-- Vegetables
('Tomato', 'Fresh red tomatoes', 30.00, 200, 3, 'https://www.healthdigest.com/img/gallery/can-you-eat-too-many-tomatoes/intro-1649444633.webp'),
('Potato', 'Fresh potatoes', 25.00, 300, 3, 'https://cdn.mos.cms.futurecdn.net/iC7HBvohbJqExqvbKcV3pP-970-80.jpg.webp'),
('Onion', 'Fresh onions', 35.00, 250, 3, 'https://en-chatelaine.mblycdn.com/ench/resized/2018/08/w1534/types-of-onions.jpg'),
('Carrot', 'Fresh carrots', 40.00, 180, 3, 'https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),

-- Non-veg
('Chicken Curry', 'Spicy chicken curry', 200.00, 30, 4, 'https://www.google.com/imgres?q=chicken%20curry&imgurl=https%3A%2F%2Fwww.whiskaffair.com%2Fwp-content%2Fuploads%2F2021%2F10%2FAndhra-Chicken-Curry-2-3.jpg&imgrefurl=https%3A%2F%2Fwww.whiskaffair.com%2Fandhra-chicken-curry-recipe%2F&docid=Gf3BHFGFf4736M&tbnid=0R1GgfpoZPcIAM&vet=12ahUKEwjR9qe3j96QAxWUTGwGHUepOOwQM3oECBoQAA..i&w=1200&h=1200&hcb=2&ved=2ahUKEwjR9qe3j96QAxWUTGwGHUepOOwQM3oECBoQAA'),
('Fish Fry', 'Crispy fish fry', 250.00, 25, 4, 'https://www.google.com/imgres?q=fish%20fry&imgurl=https%3A%2F%2Fwww.yummytummyaarthi.com%2Fwp-content%2Fuploads%2F2022%2F02%2Ffish-fry-1.jpeg&imgrefurl=https%3A%2F%2Fwww.yummytummyaarthi.com%2Ftawa-fish-fry-recipe%2F&docid=W6ZVu1FjwgWceM&tbnid=G-C5aUXI-pAc0M&vet=12ahUKEwjEsozCj96QAxUUV3ADHSMuOowQM3oECBQQAA..i&w=768&h=512&hcb=2&ved=2ahUKEwjEsozCj96QAxUUV3ADHSMuOowQM3oECBQQAA'),
('Egg Curry', 'Delicious egg curry', 120.00, 40, 4, 'https://www.spicebangla.com/wp-content/uploads/2024/08/Egg-Masala-Curry.webp'),
('Mutton Biryani', 'Flavorful mutton biryani', 350.00, 20, 4, 'https://www.licious.in/blog/wp-content/uploads/2019/11/Mutton-Biryani-1-e1574922017237.jpg'),

-- Breads
('White Bread', 'Fresh white bread', 30.00, 100, 5, 'https://www.rockrecipes.com/wp-content/uploads/2008/01/DSC_0221-4.jpg'),
('Brown Bread', 'Healthy brown bread', 40.00, 80, 5, 'https://sallysbakingaddiction.com/wp-content/uploads/2024/01/whole-wheat-bread-3.jpg'),
('Garlic Bread', 'Tasty garlic bread', 60.00, 50, 5, 'https://www.allrecipes.com/thmb/1S7mF-tC89-HaKV_NvPK7bwsDtM=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/21080-great-garlic-bread-DDMFS-4x3-e1c7b5c79fde4d629a9b7bce6c0702ed.jpg'),
('Naan', 'Soft naan bread', 25.00, 120, 5, 'https://media.istockphoto.com/id/1140752821/photo/indian-naan-bread-with-garlic-butter-on-wooden-table.jpg?s=612x612&w=0&k=20&c=lTtokg-1e2OxzzPDHhtwWLR_43TCRBTcmpJU08OL6nQ='),

-- Beverages
('Coffee', 'Hot coffee', 50.00, 200, 6, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Tea', 'Hot tea', 30.00, 250, 6, 'https://www.teaforturmeric.com/wp-content/uploads/2021/11/Masala-Chai-Tea-9-1024x1536.jpg'),
('Orange Juice', 'Fresh orange juice', 60.00, 100, 6, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
('Mango Shake', 'Cold mango shake', 80.00, 80, 6, 'https://tastyoven.com/wp-content/uploads/2022/06/mango-shake-3.jpeg'),

-- Snacks
('Samosa', 'Crispy samosa', 20.00, 150, 7, 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_960,w_960//InstamartAssets/samosa.webp?updatedAt=1727156367955'),
('Pakora', 'Spicy pakora', 40.00, 100, 7, 'https://www.recipetineats.com/tachyon/2021/05/Pakora_1.jpg?resize=900%2C1260&zoom=0.72'),
('Chips', 'Potato chips', 30.00, 200, 7, 'https://buya1chips.com/cdn/shop/files/PotatoChipsSpicyGarlic.jpg?v=1742537002&width=800'),
('Biscuits', 'Sweet biscuits', 50.00, 180, 7, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')
ON DUPLICATE KEY UPDATE name=name;

