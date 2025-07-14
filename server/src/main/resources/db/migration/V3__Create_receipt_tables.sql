-- Create receipt table for storing receipt metadata and OCR results
CREATE TABLE receipts (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    original_image_url VARCHAR(500) NOT NULL,
    processed_image_url VARCHAR(500),
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- OCR processing status and results
    processing_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED
    ocr_confidence DECIMAL(5,2),
    raw_ocr_text TEXT,
    
    -- Extracted structured data (JSON format)
    extracted_data JSONB,
    
    -- User verified data
    verified_data JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_receipt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create receipt_transactions junction table for linking receipts to transactions
CREATE TABLE receipt_transactions (
    id BIGSERIAL PRIMARY KEY,
    receipt_id BIGINT NOT NULL,
    transaction_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_receipt_transaction_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    CONSTRAINT fk_receipt_transaction_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    
    -- Ensure unique receipt-transaction pairs
    CONSTRAINT uk_receipt_transaction UNIQUE (receipt_id, transaction_id)
);

-- Create receipt_items table for storing line-item details from receipts
CREATE TABLE receipt_items (
    id BIGSERIAL PRIMARY KEY,
    receipt_id BIGINT NOT NULL,
    item_name VARCHAR(255),
    quantity DECIMAL(10,2),
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    category_suggestion VARCHAR(100),
    line_number INTEGER,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_receipt_item_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_processing_status ON receipts(processing_status);
CREATE INDEX idx_receipts_created_at ON receipts(created_at);
CREATE INDEX idx_receipts_is_verified ON receipts(is_verified);

CREATE INDEX idx_receipt_transactions_receipt_id ON receipt_transactions(receipt_id);
CREATE INDEX idx_receipt_transactions_transaction_id ON receipt_transactions(transaction_id);

CREATE INDEX idx_receipt_items_receipt_id ON receipt_items(receipt_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
