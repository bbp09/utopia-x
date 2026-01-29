// =====================================
//  UTOPIA X - Chat Module
//  1:1 Real-time Chat System
// =====================================

const ChatModule = {
    // State
    state: {
        currentChatPartner: null,
        currentChatPartnerId: null,
        currentChatPartnerName: null,
        messages: [],
        conversations: [],
        unreadCount: 0,
        subscription: null,
        isConnected: false
    },
    
    // Supabase client
    supabase: null,
    currentUserId: null,
    
    // =====================================
    // INITIALIZATION
    // =====================================
    async init() {
        console.log('💬 Initializing ChatModule...');
        
        // Get Supabase client
        if (typeof window.supabase !== 'undefined') {
            this.supabase = window.supabase;
        } else {
            console.error('❌ Supabase client not found');
            return false;
        }
        
        // Get current user
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) {
            console.error('❌ No user logged in');
            return false;
        }
        
        this.currentUserId = user.id;
        console.log('✅ ChatModule initialized for user:', this.currentUserId);
        
        // Load conversations
        await this.loadConversations();
        
        // Update unread count
        await this.updateUnreadCount();
        
        return true;
    },
    
    // =====================================
    // CONVERSATIONS (Chat List)
    // =====================================
    async loadConversations() {
        console.log('📋 Loading conversations...');
        
        try {
            // Get all messages involving current user
            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${this.currentUserId},receiver_id.eq.${this.currentUserId}`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // Group by chat partner
            const conversationMap = new Map();
            
            data.forEach(msg => {
                const partnerId = msg.sender_id === this.currentUserId 
                    ? msg.receiver_id 
                    : msg.sender_id;
                
                if (!conversationMap.has(partnerId)) {
                    conversationMap.set(partnerId, {
                        partnerId: partnerId,
                        lastMessage: msg.content,
                        lastMessageTime: msg.created_at,
                        unreadCount: 0
                    });
                }
                
                // Count unread messages
                if (msg.receiver_id === this.currentUserId && !msg.is_read) {
                    conversationMap.get(partnerId).unreadCount++;
                }
            });
            
            this.state.conversations = Array.from(conversationMap.values());
            console.log('✅ Loaded', this.state.conversations.length, 'conversations');
            
            return this.state.conversations;
        } catch (error) {
            console.error('❌ Error loading conversations:', error);
            return [];
        }
    },
    
    // =====================================
    // MESSAGES (Chat History)
    // =====================================
    async loadMessages(partnerId) {
        console.log('📨 Loading messages with:', partnerId);
        
        try {
            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${this.currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${this.currentUserId})`)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            this.state.messages = data;
            console.log('✅ Loaded', data.length, 'messages');
            
            // Mark messages as read
            await this.markAsRead(partnerId);
            
            return data;
        } catch (error) {
            console.error('❌ Error loading messages:', error);
            return [];
        }
    },
    
    // =====================================
    // SEND MESSAGE
    // =====================================
    async sendMessage(receiverId, content) {
        console.log('📤 Sending message to:', receiverId);
        
        if (!content || !content.trim()) {
            console.error('❌ Empty message');
            return { success: false, error: 'Empty message' };
        }
        
        try {
            const { data, error } = await this.supabase
                .from('messages')
                .insert([
                    {
                        sender_id: this.currentUserId,
                        receiver_id: receiverId,
                        content: content.trim(),
                        is_read: false
                    }
                ])
                .select();
            
            if (error) throw error;
            
            console.log('✅ Message sent:', data[0].id);
            
            // Add to local state
            this.state.messages.push(data[0]);
            
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error sending message:', error);
            return { success: false, error: error.message };
        }
    },
    
    // =====================================
    // MARK AS READ
    // =====================================
    async markAsRead(senderId) {
        console.log('✅ Marking messages as read from:', senderId);
        
        try {
            const { error } = await this.supabase
                .from('messages')
                .update({ is_read: true })
                .eq('sender_id', senderId)
                .eq('receiver_id', this.currentUserId)
                .eq('is_read', false);
            
            if (error) throw error;
            
            // Update unread count
            await this.updateUnreadCount();
            
            console.log('✅ Messages marked as read');
        } catch (error) {
            console.error('❌ Error marking as read:', error);
        }
    },
    
    // =====================================
    // UNREAD COUNT
    // =====================================
    async updateUnreadCount() {
        try {
            const { count, error } = await this.supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', this.currentUserId)
                .eq('is_read', false);
            
            if (error) throw error;
            
            this.state.unreadCount = count || 0;
            console.log('📬 Unread messages:', this.state.unreadCount);
            
            // Update UI badge
            this.updateUnreadBadge();
            
            return this.state.unreadCount;
        } catch (error) {
            console.error('❌ Error getting unread count:', error);
            return 0;
        }
    },
    
    updateUnreadBadge() {
        const badge = document.getElementById('chatUnreadBadge');
        if (badge) {
            if (this.state.unreadCount > 0) {
                badge.textContent = this.state.unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    },
    
    // =====================================
    // REAL-TIME SUBSCRIPTION
    // =====================================
    subscribeToMessages(partnerId) {
        console.log('🔔 Subscribing to real-time messages with:', partnerId);
        
        // Unsubscribe from previous subscription
        this.unsubscribe();
        
        // Subscribe to new messages
        this.state.subscription = this.supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${this.currentUserId}`
                },
                (payload) => {
                    console.log('🔔 New message received:', payload);
                    
                    // Add to messages if from current chat partner
                    if (payload.new.sender_id === partnerId) {
                        this.state.messages.push(payload.new);
                        
                        // Render new message in UI
                        this.renderNewMessage(payload.new);
                        
                        // Mark as read
                        this.markAsRead(partnerId);
                    } else {
                        // Update unread count
                        this.updateUnreadCount();
                    }
                }
            )
            .subscribe((status) => {
                console.log('📡 Subscription status:', status);
                this.state.isConnected = status === 'SUBSCRIBED';
            });
    },
    
    unsubscribe() {
        if (this.state.subscription) {
            console.log('🔕 Unsubscribing from real-time messages');
            this.supabase.removeChannel(this.state.subscription);
            this.state.subscription = null;
            this.state.isConnected = false;
        }
    },
    
    // =====================================
    // UI RENDERING
    // =====================================
    renderNewMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const messageEl = this.createMessageElement(message);
        messagesContainer.appendChild(messageEl);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    createMessageElement(message) {
        const div = document.createElement('div');
        const isSent = message.sender_id === this.currentUserId;
        
        div.className = `chat-message ${isSent ? 'sent' : 'received'}`;
        div.innerHTML = `
            <div class="message-content">${this.escapeHtml(message.content)}</div>
            <div class="message-time">${this.formatTime(message.created_at)}</div>
        `;
        
        return div;
    },
    
    // =====================================
    // OPEN CHAT WITH PARTNER
    // =====================================
    async openChatWith(partnerId, partnerName, partnerEmail) {
        console.log('💬 Opening chat with:', partnerName, '(', partnerId, ')');
        
        this.state.currentChatPartnerId = partnerId;
        this.state.currentChatPartnerName = partnerName || partnerEmail || 'Unknown';
        
        // Load messages
        await this.loadMessages(partnerId);
        
        // Subscribe to real-time updates
        this.subscribeToMessages(partnerId);
        
        // Open chat modal
        this.openChatModal();
        
        // Render messages
        this.renderMessages();
    },
    
    openChatModal() {
        const modal = document.getElementById('chatModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Update header
            const header = document.getElementById('chatPartnerName');
            if (header) {
                header.textContent = this.state.currentChatPartnerName;
            }
        }
    },
    
    closeChatModal() {
        const modal = document.getElementById('chatModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Unsubscribe
        this.unsubscribe();
        
        // Clear state
        this.state.currentChatPartnerId = null;
        this.state.currentChatPartnerName = null;
        this.state.messages = [];
    },
    
    renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.state.messages.forEach(msg => {
            container.appendChild(this.createMessageElement(msg));
        });
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },
    
    // =====================================
    // UTILITIES
    // =====================================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Less than 1 minute
        if (diff < 60000) {
            return '방금 전';
        }
        
        // Less than 1 hour
        if (diff < 3600000) {
            return Math.floor(diff / 60000) + '분 전';
        }
        
        // Less than 1 day
        if (diff < 86400000) {
            return Math.floor(diff / 3600000) + '시간 전';
        }
        
        // Format as date
        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// =====================================
// GLOBAL FUNCTIONS
// =====================================
window.ChatModule = ChatModule;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Only init if user is logged in
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail && userEmail !== 'Login') {
        await ChatModule.init();
    }
});

console.log('✅ ChatModule loaded');
