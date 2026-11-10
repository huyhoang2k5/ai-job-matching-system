import { create } from 'zustand'
import { messageApi } from '@/lib/api'
import { Message, ChatRoom } from '@/types'

interface MessageState {
  conversations: ChatRoom[]
  currentMessages: Message[]
  unreadCount: number
  isLoading: boolean
  isSending: boolean
  error: string | null
}

interface MessageActions {
  fetchConversations: (limit?: number) => Promise<void>
  fetchRoomMessages: (roomId: string, limit?: number, before?: string) => Promise<void>
  fetchConversation: (userId: string, limit?: number) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markRoomAsRead: (roomId: string) => Promise<void>
  sendMessage: (roomId: string, content: string) => Promise<void>
  editMessage: (id: string, content: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  addReaction: (id: string, emoji: string) => Promise<void>
  addReceivedMessage: (message: Message, activeRoomId: string | null) => void
  updateMessageReadStatus: (messageId: string, readAt: string) => void
  setError: (error: string | null) => void
}

export const useMessageStore = create<MessageState & MessageActions>((set, get) => ({
  conversations: [],
  currentMessages: [],
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,

  fetchConversations: async (limit = 20) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await messageApi.getConversations({ limit })
      if (response.success) {
        set({ conversations: response.data.conversations, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchRoomMessages: async (roomId, limit = 50, before) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await messageApi.getRoomMessages(roomId, { limit, before })
      if (response.success) {
        set({ currentMessages: response.data.messages, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchConversation: async (userId, limit = 50) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await messageApi.getConversation(userId, { limit })
      if (response.success) {
        set({ currentMessages: response.data.messages, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response: any = await messageApi.getUnreadCount()
      if (response.success) {
        set({ unreadCount: response.data.unreadCount })
      }
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error)
    }
  },

  markRoomAsRead: async (roomId) => {
    try {
      await messageApi.markRoomAsRead(roomId)
      // Optimistically update conversations list
      const { conversations } = get()
      set({
        conversations: conversations.map(c => 
          c.id === roomId ? { ...c, unreadCount: 0 } : c
        )
      })
      get().fetchUnreadCount()
    } catch (error: any) {
      console.error('Failed to mark room as read:', error)
    }
  },

  sendMessage: async (roomId, content) => {
    // Note: Actual sending is done via Socket.io in the component,
    // but we can keep this for API callbacks or fallback logic.
  },

  editMessage: async (id, content) => {
    try {
      const response: any = await messageApi.editMessage(id, content)
      if (response.success) {
        const { currentMessages } = get()
        set({
          currentMessages: currentMessages.map(m => 
            m.id === id ? { ...m, content, isEdited: true } : m
          ) as Message[]
        })
      }
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteMessage: async (id) => {
    try {
      const response: any = await messageApi.deleteMessage(id)
      if (response.success) {
        const { currentMessages } = get()
        set({
          currentMessages: currentMessages.filter(m => m.id !== id)
        })
      }
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  addReaction: async (id, emoji) => {
    try {
      const response: any = await messageApi.addReaction(id, emoji)
      if (response.success) {
        // Handle reaction update
      }
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  addReceivedMessage: (message, activeRoomId) => {
    const { currentMessages, conversations } = get()
    
    // 1. If it's for the currently active chat room, append it
    if (message.roomId === activeRoomId) {
      const exists = currentMessages.some(m => m.id === message.id)
      if (!exists) {
        set({ currentMessages: [...currentMessages, message] })
      }
    }
    
    // 2. Update the conversations list (bring conversation to top and update last message)
    let roomExists = false
    const updatedConversations = conversations.map(c => {
      if (c.id === message.roomId) {
        roomExists = true
        const isUnread = message.roomId !== activeRoomId && message.senderId !== message.receiverId
        return {
          ...c,
          lastMessage: message,
          unreadCount: isUnread ? c.unreadCount + 1 : c.unreadCount
        }
      }
      return c
    })

    if (!roomExists) {
      // Refresh conversations list if it is a new chat room
      get().fetchConversations()
    } else {
      // Sort conversations so that the most recent is at the top
      updatedConversations.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
        const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
        return bTime - aTime
      })
      set({ conversations: updatedConversations })
    }
    
    // Update global unread badge count
    get().fetchUnreadCount()
  },

  updateMessageReadStatus: (messageId, readAt) => {
    const { currentMessages } = get()
    set({
      currentMessages: currentMessages.map(m => 
        m.id === messageId ? { ...m, isRead: true, readAt } : m
      )
    })
  },

  setError: (error) => set({ error })
}))
