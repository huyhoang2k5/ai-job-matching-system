'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useMessageStore } from '@/store/messageStore'
import { ChatRoom, Message as MessageType } from '@/types'
import { connectSocket, getSocket } from '@/lib/socket'
import { useSearchParams } from 'next/navigation'
import { 
  Send, 
  Search, 
  Paperclip, 
  Smile, 
  MessageSquare, 
  Check, 
  CheckCheck,
  Circle,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const { user } = useAuthStore()
  const { 
    conversations, 
    currentMessages, 
    isLoading, 
    fetchConversations, 
    fetchRoomMessages, 
    markRoomAsRead,
    unreadCount,
    addReceivedMessage,
    updateMessageReadStatus
  } = useMessageStore()

  const searchParams = useSearchParams()
  const queryUserId = searchParams.get('userId')
  const queryUserName = searchParams.get('name') || 'Đối tác'

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})
  const [onlineRooms, setOnlineRooms] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeRoomRef = useRef<string | null>(null)

  // Sync active room selection from query parameter
  useEffect(() => {
    if (queryUserId && user?.id) {
      const roomId = [user.id, queryUserId].sort().join('_')
      setSelectedRoomId(roomId)
    }
  }, [queryUserId, user?.id])

  // Sync active room state to a ref for socket listener callbacks
  useEffect(() => {
    activeRoomRef.current = selectedRoomId
  }, [selectedRoomId])

  // 1. Establish socket connection on mount
  useEffect(() => {
    fetchConversations()
    
    // Connect Socket
    const socket = connectSocket()
    
    // Listen to real-time events
    socket.on('receive_message', (msg: MessageType) => {
      addReceivedMessage(msg, activeRoomRef.current)
      
      // Auto-read if we are looking at this room and the message is not our own
      if (activeRoomRef.current === msg.roomId && msg.senderId !== user?.id) {
        socket.emit('mark_read', { messageId: msg.id || (msg as any)._id })
        markRoomAsRead(msg.roomId)
      } else if (msg.senderId !== user?.id) {
        // Display toast alert for other room incoming messages
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black/5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {msg.sender?.name.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-foreground">{msg.sender?.name || 'New Message'}</p>
                  <p className="mt-1 text-xs text-muted truncate">{msg.content}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-border">
              <button
                onClick={() => {
                  setSelectedRoomId(msg.roomId)
                  toast.dismiss(t.id)
                }}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-bold text-primary hover:text-primary/80 focus:outline-none"
              >
                Reply
              </button>
            </div>
          </div>
        ))
      }
    })

    socket.on('message_read', (data: { messageId: string; readAt: string }) => {
      updateMessageReadStatus(data.messageId, data.readAt)
    })

    socket.on('user_typing', (data: { userId: string; roomId: string }) => {
      if (data.roomId === activeRoomRef.current) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: true }))
      }
    })

    socket.on('user_stop_typing', (data: { userId: string; roomId: string }) => {
      if (data.roomId === activeRoomRef.current) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: false }))
      }
    })

    socket.on('user_online', (data: { userId: string }) => {
      setOnlineRooms(prev => ({ ...prev, [data.userId]: true }))
    })

    socket.on('user_offline', (data: { userId: string }) => {
      setTypingUsers(prev => ({ ...prev, [data.userId]: false }))
      setOnlineRooms(prev => ({ ...prev, [data.userId]: false }))
    })

    // Get active rooms online info
    socket.emit('get_online_users', {})
    socket.on('online_users', (data: { users: Array<{ userId: string }> }) => {
      const statuses: Record<string, boolean> = {}
      data.users.forEach(u => {
        statuses[u.userId] = true
      })
      setOnlineRooms(statuses)
    })

    return () => {
      socket.off('receive_message')
      socket.off('message_read')
      socket.off('user_typing')
      socket.off('user_stop_typing')
      socket.off('user_online')
      socket.off('user_offline')
      socket.off('online_users')
    }
  }, [fetchConversations, addReceivedMessage, updateMessageReadStatus, markRoomAsRead, user?.id])

  // 2. Load room messages and join socket room
  useEffect(() => {
    if (selectedRoomId) {
      fetchRoomMessages(selectedRoomId)
      markRoomAsRead(selectedRoomId)
      
      const socket = getSocket()
      socket.emit('join_room', { roomId: selectedRoomId })
      
      // Clear typing indicator for new room
      setTypingUsers({})
      
      // Mark read for all unread messages
      markRoomAsRead(selectedRoomId)
    }
  }, [selectedRoomId, fetchRoomMessages, markRoomAsRead])

  // 3. Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  // 4. Typing indicator emits
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)
    
    if (!selectedRoomId) return
    const socket = getSocket()
    
    socket.emit('typing', { roomId: selectedRoomId })
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { roomId: selectedRoomId })
    }, 2000)
  }

  // 5. Send message via Socket
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedRoomId) return
    
    const socket = getSocket()
    socket.emit('send_message', {
      roomId: selectedRoomId,
      content: messageInput.trim(),
      type: 'text'
    })
    
    socket.emit('stop_typing', { roomId: selectedRoomId })
    setMessageInput('')
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return ''
    }
  }

  const selectedRoom = conversations.find(r => r.id === selectedRoomId)
  
  // Create fallback user details if this is a newly initiated chat session
  const fallbackOtherUser = {
    id: queryUserId || '',
    name: queryUserName,
    avatar: '',
    role: 'candidate' as any,
    isActive: true,
    isVerified: true,
    createdAt: ''
  }
  
  const displayOtherUser = selectedRoom?.otherUser || fallbackOtherUser
  const otherUserId = displayOtherUser.id || (displayOtherUser as any)?._id as string
  const isOnline = otherUserId ? !!onlineRooms[otherUserId] : false
  const isTyping = otherUserId ? !!typingUsers[otherUserId] : false

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-6 animate-fade-in p-6 bg-slate-50/50">
      {/* Sidebar - Conversation List */}
      <div className="w-80 flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Trò chuyện
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-[10px] px-2.5 py-0.5 rounded-full shadow-sm font-black">
                  {unreadCount}
                </span>
              )}
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm người nhắn..."
              className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary/30 rounded-2xl pl-11 pr-4 h-11 text-sm font-semibold outline-none transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((room) => {
              const otherUserOnline = !!onlineRooms[room.otherUser.id || (room.otherUser as any)._id]
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all group ${
                    selectedRoomId === room.id 
                    ? 'bg-primary/5 ring-1 ring-primary/20 shadow-sm' 
                    : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Avatar and status */}
                  <div className="relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-base bg-primary/10 text-primary border border-primary/10">
                    {room.otherUser.avatar ? (
                      <img src={room.otherUser.avatar} alt={room.otherUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      room.otherUser.name.charAt(0)
                    )}
                    
                    {/* Real-time status indicator */}
                    {otherUserOnline ? (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-slate-300 border-2 border-white rounded-full"></span>
                    )}

                    {room.unreadCount > 0 && selectedRoomId !== room.id && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="font-bold text-slate-800 truncate text-sm leading-none group-hover:text-primary transition-colors">
                        {room.otherUser.name}
                      </p>
                      <span className="text-[11px] font-bold text-slate-400">
                        {room.lastMessage ? formatTime(room.lastMessage.createdAt) : ''}
                      </span>
                    </div>
                    <p className={`text-xs mt-1.5 truncate ${room.unreadCount > 0 && selectedRoomId !== room.id ? 'font-bold text-slate-800' : 'text-slate-400 font-medium'}`}>
                      {room.lastMessage?.content || 'Chưa có cuộc trò chuyện'}
                    </p>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="text-center py-20">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Không tìm thấy cuộc trò chuyện</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm relative">
        {selectedRoomId ? (
          <>
            {/* Chat Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary text-lg border border-slate-100">
                  {displayOtherUser.avatar ? (
                    <img src={displayOtherUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    displayOtherUser.name.charAt(0)
                  )}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {displayOtherUser.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isOnline ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Đang hoạt động</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngoại tuyến</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 scroll-smooth bg-slate-50/60 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="loading-spinner h-7 w-7"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang tải tin nhắn...</p>
                </div>
              ) : currentMessages.length > 0 ? (
                currentMessages.map((msg, i) => {
                  const isOwn = msg.senderId === user?.id
                  return (
                    <div key={msg.id || (msg as any)._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                      <div className={`max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          isOwn 
                          ? 'bg-primary text-white font-medium rounded-tr-none' 
                          : 'bg-white text-slate-700 font-medium border border-slate-100 rounded-tl-none'
                        }`}>
                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider opacity-60">
                            {formatTime(msg.createdAt)}
                          </p>
                          {isOwn && (
                            <span className="text-primary">
                              {msg.isRead ? (
                                <CheckCheck className="w-3.5 h-3.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-35">
                  <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
                  <p className="font-bold uppercase tracking-widest text-xs text-slate-500">Hãy gửi tin nhắn đầu tiên</p>
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400">Đang soạn tin nhắn</span>
                    <span className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-slate-100 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Nhập nội dung tin nhắn..."
                    className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 rounded-2xl h-12 px-5 text-sm font-semibold outline-none transition-all"
                    value={messageInput}
                    onChange={handleInputChange}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <button type="button" className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary/95 transition-all shadow-md disabled:opacity-20 disabled:hover:bg-primary"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-center mb-6 shadow-sm group">
              <MessageSquare className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Hộp thư cá nhân</h3>
            <p className="max-w-xs text-slate-400 font-semibold text-xs leading-relaxed">Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu trao đổi công việc.</p>
          </div>
        )}
      </div>
    </div>
  )
}
