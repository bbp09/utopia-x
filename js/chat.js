/**
 * UTOPIA X - 1:1 Real-time Chat Module
 * 
 * 클라이언트와 아티스트 간 실시간 채팅 기능
 * Supabase Realtime을 사용한 실시간 메시지 수신
 */

import { supabase } from './supabase-config.js';

class ChatModule {
    constructor() {
        this.currentUser = null;
        this.currentChatPartner = null;
        this.messageSubscription = null;
        this.conversations = new Map(); // 대화 목록 캐시
        
        this.init();
    }

    async init() {
        console.log('💬 ChatModule initializing...');
        
        // 현재 사용자 확인
        const { data: { user } } = await supabase.auth.getUser();
        this.currentUser = user;
        
        if (this.currentUser) {
            console.log('✅ Chat user loaded:', this.currentUser.email);
            this.setupRealtimeSubscription();
        }
    }

    /**
     * Realtime 구독 설정 - 새로운 메시지 실시간 수신
     */
    setupRealtimeSubscription() {
        console.log('🔔 Setting up realtime subscription...');
        
        // 내가 받은 메시지만 실시간으로 구독
        this.messageSubscription = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${this.currentUser.id}`
                },
                (payload) => {
                    console.log('📨 New message received:', payload.new);
                    this.handleNewMessage(payload.new);
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
            });
    }

    /**
     * 새 메시지 수신 시 처리
     */
    handleNewMessage(message) {
        // 현재 채팅 중인 상대방의 메시지인 경우
        if (this.currentChatPartner && message.sender_id === this.currentChatPartner.id) {
            this.appendMessageToChat(message);
            this.markAsRead(message.id);
        }
        
        // 대화 목록 업데이트
        this.updateConversationList();
        
        // 알림 표시 (선택사항)
        this.showNotification(message);
    }

    /**
     * 대화 목록 가져오기
     */
    async getConversations() {
        try {
            console.log('📋 Fetching conversations...');
            
            // 내가 보낸 메시지와 받은 메시지에서 상대방 목록 추출
            const { data: sentMessages, error: sentError } = await supabase
                .from('messages')
                .select('receiver_id, created_at')
                .eq('sender_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            const { data: receivedMessages, error: receivedError } = await supabase
                .from('messages')
                .select('sender_id, created_at')
                .eq('receiver_id', this.currentUser.id)
                .order('created_at', { ascending: false });

            if (sentError || receivedError) throw sentError || receivedError;

            // 중복 제거하고 최근 대화 순으로 정렬
            const partners = new Set();
            const conversations = [];

            // 받은 메시지의 발신자
            receivedMessages?.forEach(msg => partners.add(msg.sender_id));
            
            // 보낸 메시지의 수신자
            sentMessages?.forEach(msg => partners.add(msg.receiver_id));

            // 각 상대방별 최근 메시지 가져오기
            for (const partnerId of partners) {
                const lastMessage = await this.getLastMessage(partnerId);
                const unreadCount = await this.getUnreadCount(partnerId);
                const partnerInfo = await this.getUserInfo(partnerId);
                
                conversations.push({
                    partner: partnerInfo,
                    lastMessage,
                    unreadCount
                });
            }

            // 최근 메시지 시간 순으로 정렬
            conversations.sort((a, b) => 
                new Date(b.lastMessage?.created_at || 0) - new Date(a.lastMessage?.created_at || 0)
            );

            console.log(`✅ Found ${conversations.length} conversations`);
            return conversations;

        } catch (error) {
            console.error('❌ Error fetching conversations:', error);
            return [];
        }
    }

    /**
     * 특정 사용자와의 대화 내역 가져오기
     */
    async getChatHistory(partnerId, limit = 50) {
        try {
            console.log('💬 Loading chat history with:', partnerId);
            
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${this.currentUser.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${this.currentUser.id})`)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;

            console.log(`✅ Loaded ${data.length} messages`);
            
            // 받은 메시지 중 읽지 않은 메시지 읽음 처리
            this.markPartnerMessagesAsRead(partnerId);

            return data;

        } catch (error) {
            console.error('❌ Error loading chat history:', error);
            return [];
        }
    }

    /**
     * 메시지 전송
     */
    async sendMessage(receiverId, content) {
        try {
            if (!content.trim()) {
                throw new Error('메시지 내용이 비어있습니다.');
            }

            console.log('📤 Sending message to:', receiverId);

            const { data, error } = await supabase
                .from('messages')
                .insert({
                    sender_id: this.currentUser.id,
                    receiver_id: receiverId,
                    content: content.trim()
                })
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Message sent:', data.id);
            return data;

        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    }

    /**
     * 메시지 읽음 처리
     */
    async markAsRead(messageId) {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId);

            if (error) throw error;
            console.log('✅ Message marked as read:', messageId);

        } catch (error) {
            console.error('❌ Error marking message as read:', error);
        }
    }

    /**
     * 특정 상대방의 모든 메시지 읽음 처리
     */
    async markPartnerMessagesAsRead(partnerId) {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('sender_id', partnerId)
                .eq('receiver_id', this.currentUser.id)
                .eq('is_read', false);

            if (error) throw error;
            console.log('✅ All messages from partner marked as read');

        } catch (error) {
            console.error('❌ Error marking partner messages as read:', error);
        }
    }

    /**
     * 마지막 메시지 가져오기
     */
    async getLastMessage(partnerId) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${this.currentUser.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${this.currentUser.id})`)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            return null;
        }
    }

    /**
     * 읽지 않은 메시지 개수
     */
    async getUnreadCount(partnerId) {
        try {
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('sender_id', partnerId)
                .eq('receiver_id', this.currentUser.id)
                .eq('is_read', false);

            if (error) throw error;
            return count || 0;

        } catch (error) {
            console.error('❌ Error getting unread count:', error);
            return 0;
        }
    }

    /**
     * 전체 읽지 않은 메시지 개수
     */
    async getTotalUnreadCount() {
        try {
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', this.currentUser.id)
                .eq('is_read', false);

            if (error) throw error;
            return count || 0;

        } catch (error) {
            console.error('❌ Error getting total unread count:', error);
            return 0;
        }
    }

    /**
     * 사용자 정보 가져오기 (프로필)
     */
    async getUserInfo(userId) {
        try {
            // users 테이블에서 사용자 정보 가져오기
            const { data, error } = await supabase
                .from('users')
                .select('id, email, full_name, role, profile_image')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('❌ Error getting user info:', error);
            
            // users 테이블이 없는 경우 auth 정보 반환
            return {
                id: userId,
                email: 'Unknown User',
                full_name: 'Unknown',
                role: 'user'
            };
        }
    }

    /**
     * 채팅방 열기
     */
    async openChat(partnerId) {
        try {
            this.currentChatPartner = await this.getUserInfo(partnerId);
            console.log('💬 Opening chat with:', this.currentChatPartner.email);

            // 대화 내역 로드
            const messages = await this.getChatHistory(partnerId);
            
            // UI 업데이트 (main.js에서 처리)
            if (window.updateChatUI) {
                window.updateChatUI(this.currentChatPartner, messages);
            }

            return messages;

        } catch (error) {
            console.error('❌ Error opening chat:', error);
            throw error;
        }
    }

    /**
     * 채팅방 닫기
     */
    closeChat() {
        this.currentChatPartner = null;
        console.log('✅ Chat closed');
    }

    /**
     * 채팅 UI에 메시지 추가
     */
    appendMessageToChat(message) {
        if (window.appendChatMessage) {
            window.appendChatMessage(message);
        }
    }

    /**
     * 대화 목록 업데이트
     */
    updateConversationList() {
        if (window.updateConversationList) {
            window.updateConversationList();
        }
    }

    /**
     * 알림 표시
     */
    showNotification(message) {
        // 브라우저 알림 또는 UI 알림 표시
        if (Notification.permission === 'granted') {
            new Notification('새 메시지', {
                body: message.content,
                icon: '/images/logo.png'
            });
        }
    }

    /**
     * 정리 (구독 해제)
     */
    destroy() {
        if (this.messageSubscription) {
            supabase.removeChannel(this.messageSubscription);
            console.log('🗑️ Chat subscription removed');
        }
    }
}

// 전역 인스턴스 생성
let chatInstance = null;

export function initChat() {
    if (!chatInstance) {
        chatInstance = new ChatModule();
    }
    return chatInstance;
}

export function getChat() {
    return chatInstance;
}

export default ChatModule;
