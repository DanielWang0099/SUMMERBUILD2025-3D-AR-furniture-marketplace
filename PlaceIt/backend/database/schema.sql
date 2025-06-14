-- PlaceIt! Database Schema
-- This schema supports all features: seller dashboard, 3D/AR, cart, favorites, ratings, etc.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
-- Removed user_role enum as all users can now both buy and sell
CREATE TYPE furniture_status AS ENUM ('draft', 'active', 'archived', 'out_of_stock');
CREATE TYPE media_type AS ENUM ('image', 'video', 'model_3d', 'thumbnail');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE interaction_type AS ENUM ('view', 'rotate', 'scale', 'move', 'place_ar', 'screenshot');

-- 1. Users Table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address JSONB, -- {street, city, state, country, zip}
    profile_image TEXT,
    bio TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB, -- user preferences like favorite categories, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories Table (for better organization)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Furniture Table (main product table)
CREATE TABLE furniture (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2), -- for sale prices
    sku TEXT UNIQUE,
    dimensions JSONB, -- {height, width, depth, weight, unit}
    materials TEXT[],
    colors TEXT[],
    tags TEXT[],
    features TEXT[],
    care_instructions TEXT,
    assembly_required BOOLEAN DEFAULT FALSE,
    warranty_info TEXT,
    has_3d_model BOOLEAN DEFAULT FALSE,
    has_ar_support BOOLEAN DEFAULT FALSE,
    inventory_count INTEGER DEFAULT 0,
    min_order_quantity INTEGER DEFAULT 1,
    max_order_quantity INTEGER DEFAULT 10,
    status furniture_status DEFAULT 'draft',
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT[],
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Media Assets Table
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    furniture_id UUID NOT NULL REFERENCES furniture(id) ON DELETE CASCADE,
    type media_type NOT NULL,
    url TEXT NOT NULL,
    filename TEXT,
    file_size INTEGER,
    mime_type TEXT,
    thumbnail_url TEXT,
    alt_text TEXT,
    caption TEXT,
    format TEXT,
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- for videos
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Model Generation Jobs Table
CREATE TABLE model_generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    furniture_id UUID NOT NULL REFERENCES furniture(id) ON DELETE CASCADE,
    video_asset_id UUID REFERENCES media_assets(id),
    video_url TEXT NOT NULL,
    output_model_url TEXT,
    status job_status DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0,
    processing_time_seconds INTEGER,
    error_message TEXT,
    error_code TEXT,
    metadata JSONB, -- processing parameters, quality settings, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Reviews and Ratings Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    furniture_id UUID NOT NULL REFERENCES furniture(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(furniture_id, user_id)
);

-- 7. Favorites/Wishlist Table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    furniture_id UUID NOT NULL REFERENCES furniture(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, furniture_id)
);

-- 8. Shopping Cart Table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    furniture_id UUID NOT NULL REFERENCES furniture(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, furniture_id)
);

-- 9. Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_number TEXT UNIQUE NOT NULL,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    payment_reference TEXT,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    tracking_number TEXT,
    notes TEXT,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    furniture_id UUID NOT NULL REFERENCES furniture(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    product_snapshot JSONB, -- snapshot of product at time of purchase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. AR Interactions Log Table (for analytics)
CREATE TABLE ar_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    furniture_id UUID NOT NULL REFERENCES furniture(id),
    session_id TEXT,
    interaction_type interaction_type NOT NULL,
    duration_seconds INTEGER,
    device_info JSONB, -- browser, OS, device type, etc.
    ar_capability BOOLEAN DEFAULT FALSE,
    placement_count INTEGER DEFAULT 0,
    screenshot_taken BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Vendor Analytics Table
CREATE TABLE vendor_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    furniture_id UUID NOT NULL REFERENCES furniture(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    cart_additions INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    ar_views INTEGER DEFAULT 0,
    model_3d_views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vendor_id, furniture_id, date)
);

-- 13. Search History Table (for improving search)
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    search_query TEXT NOT NULL,
    filters_applied JSONB,
    results_count INTEGER,
    clicked_item_id UUID REFERENCES furniture(id),
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_furniture_vendor_id ON furniture(vendor_id);
CREATE INDEX idx_furniture_category_id ON furniture(category_id);
CREATE INDEX idx_furniture_status ON furniture(status);
CREATE INDEX idx_furniture_price ON furniture(price);
CREATE INDEX idx_furniture_created_at ON furniture(created_at);
CREATE INDEX idx_furniture_has_3d_model ON furniture(has_3d_model);
CREATE INDEX idx_furniture_has_ar_support ON furniture(has_ar_support);
CREATE INDEX idx_furniture_search ON furniture USING gin(to_tsvector('english', title || ' ' || description));

CREATE INDEX idx_media_assets_furniture_id ON media_assets(furniture_id);
CREATE INDEX idx_media_assets_type ON media_assets(type);

CREATE INDEX idx_reviews_furniture_id ON reviews(furniture_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_furniture_id ON favorites(furniture_id);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_ar_interactions_furniture_id ON ar_interactions(furniture_id);
CREATE INDEX idx_ar_interactions_user_id ON ar_interactions(user_id);
CREATE INDEX idx_ar_interactions_created_at ON ar_interactions(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_furniture_updated_at BEFORE UPDATE ON furniture
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_generation_jobs_updated_at BEFORE UPDATE ON model_generation_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for furniture table
CREATE POLICY "Anyone can view active furniture" ON furniture
    FOR SELECT USING (status = 'active');

CREATE POLICY "Vendors can manage their own furniture" ON furniture
    FOR ALL USING (auth.uid() = vendor_id);

-- RLS Policies for cart_items table
CREATE POLICY "Users can manage their own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for favorites table
CREATE POLICY "Users can manage their own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for reviews table
CREATE POLICY "Anyone can view approved reviews" ON reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can manage their own reviews" ON reviews
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for orders table
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vendor analytics
CREATE POLICY "Vendors can view their own analytics" ON vendor_analytics
    FOR SELECT USING (auth.uid() = vendor_id);
