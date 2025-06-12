-- Seed data for PlaceIt! database
-- This includes sample categories, users, furniture items, and related data

-- Insert sample users (these will need to be created through Supabase Auth first)
-- For now, we'll just create the extended user profiles

-- Sample furniture items with complete data
INSERT INTO furniture (
    id, vendor_id, category_id, title, slug, description, short_description, 
    price, compare_at_price, sku, dimensions, materials, colors, tags, features,
    care_instructions, assembly_required, warranty_info, has_3d_model, has_ar_support,
    inventory_count, status, view_count
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440011', -- vendor_id (needs to exist in users table)
    (SELECT id FROM categories WHERE slug = 'sofas-chairs'),
    'Modern Sectional Sofa',
    'modern-sectional-sofa',
    'Experience ultimate comfort with this modern sectional sofa. Crafted with premium materials and designed for contemporary living spaces. The sleek design and plush cushioning make it perfect for both relaxation and entertaining. Features high-density foam cushions, solid hardwood frame, and premium upholstery.',
    'Luxurious modern sectional sofa with premium materials',
    1299.00,
    1599.00,
    'SOF-MOD-001',
    '{"height": 32, "width": 84, "depth": 36, "weight": 180, "unit": "inches"}',
    ARRAY['Premium Leather', 'Hardwood Frame', 'High-Density Foam'],
    ARRAY['Charcoal Gray', 'Navy Blue', 'Cognac Brown'],
    ARRAY['modern', 'sectional', 'leather', 'comfortable', 'living-room'],
    ARRAY['Premium leather upholstery', 'Solid hardwood frame', 'High-density foam cushions', 'Stain-resistant coating', '5-year warranty included'],
    'Clean with leather cleaner and conditioner. Avoid direct sunlight.',
    true,
    '5-year manufacturer warranty on frame and cushions',
    true,
    true,
    15,
    'active',
    234
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440012', -- different vendor
    (SELECT id FROM categories WHERE slug = 'tables'),
    'Handcrafted Oak Dining Table',
    'handcrafted-oak-dining-table',
    'Beautiful handcrafted dining table made from solid oak wood. Features a natural finish that highlights the wood grain. Perfect for family gatherings and dinner parties. Seats up to 6 people comfortably.',
    'Solid oak dining table that seats 6 people',
    899.00,
    NULL,
    'TAB-OAK-002',
    '{"height": 30, "width": 72, "depth": 36, "weight": 120, "unit": "inches"}',
    ARRAY['Solid Oak Wood', 'Natural Wood Finish'],
    ARRAY['Natural Oak', 'Dark Walnut', 'White Oak'],
    ARRAY['dining', 'oak', 'wood', 'handcrafted', 'family'],
    ARRAY['Solid oak construction', 'Natural wood finish', 'Seats 6 people', 'Handcrafted details', '10-year warranty'],
    'Clean with wood cleaner. Apply wood conditioner annually.',
    true,
    '10-year warranty on craftsmanship',
    true,
    true,
    8,
    'active',
    156
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440011',
    (SELECT id FROM categories WHERE slug = 'beds-mattresses'),
    'Platform Bed Frame with Storage',
    'platform-bed-frame-storage',
    'Minimalist platform bed frame with built-in storage compartments. Perfect for modern bedrooms where space is at a premium. The clean lines and storage functionality make it both beautiful and practical.',
    'Modern platform bed with built-in storage',
    599.00,
    NULL,
    'BED-PLAT-003',
    '{"height": 14, "width": 60, "depth": 80, "weight": 85, "unit": "inches"}',
    ARRAY['Engineered Wood', 'Metal Hardware'],
    ARRAY['Walnut', 'Oak', 'White'],
    ARRAY['platform', 'storage', 'modern', 'bedroom', 'minimalist'],
    ARRAY['Built-in storage drawers', 'No box spring required', 'Solid construction', 'Easy assembly', '3-year warranty'],
    'Dust regularly. Clean with damp cloth.',
    true,
    '3-year manufacturer warranty',
    false,
    false,
    12,
    'active',
    89
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440012',
    (SELECT id FROM categories WHERE slug = 'storage'),
    'Industrial Bookshelf Unit',
    'industrial-bookshelf-unit',
    'Industrial-style bookshelf with metal frame and reclaimed wood shelves. Perfect for displaying books, decor, and personal items. The rugged design adds character to any room.',
    'Industrial bookshelf with metal frame and wood shelves',
    449.00,
    NULL,
    'STO-IND-004',
    '{"height": 72, "width": 30, "depth": 12, "weight": 65, "unit": "inches"}',
    ARRAY['Reclaimed Wood', 'Powder-Coated Steel'],
    ARRAY['Natural Wood/Black Metal', 'Dark Wood/Bronze Metal'],
    ARRAY['industrial', 'bookshelf', 'storage', 'metal', 'wood'],
    ARRAY['5 adjustable shelves', 'Industrial metal frame', 'Reclaimed wood shelves', 'Wall anchor included', '2-year warranty'],
    'Dust regularly. Clean metal with mild detergent.',
    true,
    '2-year warranty on materials',
    true,
    true,
    20,
    'active',
    78
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440013', -- another vendor
    (SELECT id FROM categories WHERE slug = 'lighting'),
    'Pendant Light Fixture Set',
    'pendant-light-fixture-set',
    'Modern pendant light fixture with adjustable height. Features Edison-style bulbs and a sleek metal finish. Perfect for kitchen islands, dining areas, or anywhere you need focused lighting.',
    'Modern pendant lights with Edison bulbs',
    299.00,
    NULL,
    'LIG-PEN-005',
    '{"height": 8, "width": 8, "depth": 8, "weight": 3, "unit": "inches"}',
    ARRAY['Brushed Metal', 'Glass', 'Edison Bulbs'],
    ARRAY['Brushed Nickel', 'Oil Rubbed Bronze', 'Matte Black'],
    ARRAY['pendant', 'lighting', 'modern', 'edison', 'adjustable'],
    ARRAY['Adjustable height cord', 'Edison-style bulbs included', 'Easy installation', 'Dimmable compatible', '1-year warranty'],
    'Clean with glass cleaner. Replace bulbs as needed.',
    true,
    '1-year electrical warranty',
    true,
    false,
    25,
    'active',
    92
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440011',
    (SELECT id FROM categories WHERE slug = 'sofas-chairs'),
    'Velvet Accent Chair',
    'velvet-accent-chair',
    'Luxurious velvet accent chair with gold metal legs. The perfect statement piece for any living room or bedroom. Comfortable padding and beautiful velvet upholstery make this chair both stylish and functional.',
    'Luxury velvet accent chair with gold legs',
    799.00,
    NULL,
    'CHA-VEL-006',
    '{"height": 32, "width": 28, "depth": 30, "weight": 35, "unit": "inches"}',
    ARRAY['Velvet Upholstery', 'Metal Legs', 'Foam Padding'],
    ARRAY['Emerald Green', 'Navy Blue', 'Blush Pink', 'Charcoal'],
    ARRAY['accent', 'velvet', 'luxury', 'chair', 'statement'],
    ARRAY['Premium velvet upholstery', 'Gold-finished metal legs', 'High-density foam padding', 'Easy assembly', '2-year warranty'],
    'Vacuum regularly. Professional cleaning recommended.',
    true,
    '2-year upholstery warranty',
    true,
    true,
    10,
    'active',
    134
);

-- Insert media assets for the furniture items
INSERT INTO media_assets (furniture_id, type, url, filename, thumbnail_url, alt_text, sort_order, is_primary) VALUES
-- Modern Sectional Sofa
('550e8400-e29b-41d4-a716-446655440001', 'image', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'sofa-main.jpg', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', 'Modern sectional sofa in living room', 0, true),
('550e8400-e29b-41d4-a716-446655440001', 'image', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', 'sofa-angle.jpg', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300', 'Side view of sectional sofa', 1, false),
('550e8400-e29b-41d4-a716-446655440001', 'video', 'https://example.com/sofa-360.mp4', 'sofa-360.mp4', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', '360 degree view of sofa', 2, false),

-- Oak Dining Table
('550e8400-e29b-41d4-a716-446655440002', 'image', 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800', 'table-main.jpg', 'https://images.unsplash.com/photo-1549497538-303791108f95?w=300', 'Oak dining table with chairs', 0, true),
('550e8400-e29b-41d4-a716-446655440002', 'image', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800', 'table-detail.jpg', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300', 'Close-up of table wood grain', 1, false),

-- Platform Bed
('550e8400-e29b-41d4-a716-446655440003', 'image', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'bed-main.jpg', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300', 'Platform bed in modern bedroom', 0, true),

-- Industrial Bookshelf
('550e8400-e29b-41d4-a716-446655440004', 'image', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'bookshelf-main.jpg', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', 'Industrial bookshelf with books', 0, true),

-- Pendant Light
('550e8400-e29b-41d4-a716-446655440005', 'image', 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800', 'light-main.jpg', 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=300', 'Pendant light over kitchen island', 0, true),

-- Velvet Chair
('550e8400-e29b-41d4-a716-446655440006', 'image', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'chair-main.jpg', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', 'Velvet accent chair in emerald green', 0, true);

-- Insert sample reviews
INSERT INTO reviews (furniture_id, user_id, rating, title, comment, verified_purchase) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440021', 5, 'Amazing quality!', 'This sofa exceeded my expectations. The leather is top quality and it''s incredibly comfortable.', true),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440022', 4, 'Great purchase', 'Love the style and comfort. Assembly took a while but worth it.', true),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440021', 5, 'Beautiful craftsmanship', 'The oak table is stunning. Perfect size for our dining room.', true),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440023', 4, 'Sturdy and stylish', 'Great bookshelf, holds a lot of books and looks fantastic.', true);

-- Insert sample model generation jobs
INSERT INTO model_generation_jobs (furniture_id, video_url, status, progress_percentage) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'https://example.com/sofa-360.mp4', 'completed', 100),
('550e8400-e29b-41d4-a716-446655440002', 'https://example.com/table-360.mp4', 'completed', 100),
('550e8400-e29b-41d4-a716-446655440004', 'https://example.com/bookshelf-360.mp4', 'processing', 65);

-- Insert sample AR interactions
INSERT INTO ar_interactions (furniture_id, user_id, interaction_type, duration_seconds, device_info) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440021', 'place_ar', 120, '{"browser": "Chrome", "device": "iPhone", "os": "iOS"}'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440022', 'rotate', 45, '{"browser": "Safari", "device": "iPad", "os": "iOS"}'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440021', 'view', 180, '{"browser": "Chrome", "device": "Android", "os": "Android"}');

-- Note: User records will need to be created through Supabase Auth first
-- Then extended profiles can be added to the users table
