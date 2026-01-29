-- =====================================
-- UTOPIA X - Messages Table
-- 1:1 Real-time Chat System
-- =====================================

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Indexes for performance
    CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

-- Create composite index for chat queries
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(sender_id, receiver_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own messages (sent or received)
CREATE POLICY "Users can read their own messages"
ON messages FOR SELECT
USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Policy: Users can insert messages they send
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
);

-- Policy: Users can update read status of messages they received
CREATE POLICY "Users can mark messages as read"
ON messages FOR UPDATE
USING (
    auth.uid() = receiver_id
)
WITH CHECK (
    auth.uid() = receiver_id
);

-- Create a function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM messages
        WHERE receiver_id = user_id AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for chat conversations (list of unique chat partners)
CREATE OR REPLACE VIEW chat_conversations AS
SELECT DISTINCT
    CASE 
        WHEN sender_id < receiver_id THEN sender_id
        ELSE receiver_id
    END AS user1_id,
    CASE 
        WHEN sender_id < receiver_id THEN receiver_id
        ELSE sender_id
    END AS user2_id,
    MAX(created_at) AS last_message_at
FROM messages
GROUP BY user1_id, user2_id
ORDER BY last_message_at DESC;

-- Grant necessary permissions
GRANT SELECT ON chat_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;

-- Create notification trigger (optional - for push notifications)
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
    -- This can be used to send push notifications
    PERFORM pg_notify(
        'new_message',
        json_build_object(
            'receiver_id', NEW.receiver_id,
            'sender_id', NEW.sender_id,
            'content', NEW.content,
            'created_at', NEW.created_at
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_message();

-- Comments for documentation
COMMENT ON TABLE messages IS '1:1 chat messages between clients and artists';
COMMENT ON COLUMN messages.sender_id IS 'UUID of the user who sent the message';
COMMENT ON COLUMN messages.receiver_id IS 'UUID of the user who received the message';
COMMENT ON COLUMN messages.content IS 'Message text content';
COMMENT ON COLUMN messages.created_at IS 'Timestamp when message was sent';
COMMENT ON COLUMN messages.is_read IS 'Whether the message has been read by receiver';
