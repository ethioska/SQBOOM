import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { VERIFIED_AGENCIES } from '../constants';
import type { Agency, ChatMessage, User as UserType } from '../types';
import AgencyProfileModal from './AgencyProfileModal';


const ChatBubble: React.FC<{ message: ChatMessage; currentUserId: string }> = ({ message, currentUserId }) => {
    const isUser = message.senderId === currentUserId;
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 animate-fade-in ${isUser ? 'bg-boom-cyan text-white rounded-br-none' : 'bg-glass border border-boom-border text-white rounded-bl-none'}`}>
                <p className="text-sm">{message.text}</p>
            </div>
        </div>
    );
};

const ChatInterface: React.FC<{
  currentUser: UserType;
  otherParty: UserType | Agency;
  onBack: () => void;
}> = ({ currentUser, otherParty, onBack }) => {
    const { chatMessages, sendMessage } = useGame();
    const [message, setMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    const conversationMessages = useMemo(() => {
        return chatMessages.filter(msg =>
            (msg.senderId === currentUser.id && msg.receiverId === otherParty.id) ||
            (msg.senderId === otherParty.id && msg.receiverId === currentUser.id)
        ).sort((a, b) => a.timestamp - b.timestamp);
    }, [chatMessages, currentUser.id, otherParty.id]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationMessages]);

    const handleSend = () => {
        if (message.trim()) {
            sendMessage(otherParty.id, message.trim());
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-boom-dark border border-boom-border rounded-2xl shadow-lg">
            <div className="flex items-center p-3 border-b border-boom-border bg-glass rounded-t-2xl">
                <button onClick={onBack} className="text-boom-cyan mr-3 p-1 rounded-full hover:bg-boom-border">&larr;</button>
                <div className="w-10 h-10 bg-boom-dark rounded-full flex items-center justify-center font-bold text-boom-gold border border-boom-border">
                    {otherParty.name.charAt(0)}
                </div>
                <div className="ml-3">
                    <h3 className="font-bold text-white">{otherParty.name}</h3>
                    <p className="text-xs text-green-400">Online</p>
                </div>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {conversationMessages.length === 0 ? (
                    <div className="text-center text-xs text-boom-text-gray p-4">
                        Start the conversation with {otherParty.name}. Messages are secure.
                    </div>
                ) : (
                    conversationMessages.map(msg => <ChatBubble key={msg.id} message={msg} currentUserId={currentUser.id} />)
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-boom-border bg-glass rounded-b-2xl flex gap-2">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="w-full bg-boom-dark/50 border border-boom-border rounded-full p-3 text-sm text-white placeholder:text-boom-text-gray focus:outline-none focus:ring-2 focus:ring-boom-cyan"
                />
                <button onClick={handleSend} className="bg-boom-cyan text-white font-bold rounded-full px-5 py-2 hover:bg-boom-cyan/80 transition-colors active:scale-95">Send</button>
            </div>
        </div>
    );
};


const ChatScreen: React.FC = () => {
    const { user, allUsers, chatMessages, setActiveScreen } = useGame();
    const [selectedProfile, setSelectedProfile] = useState<Agency | null>(null);
    const [activeChat, setActiveChat] = useState<UserType | Agency | null>(null);

    if (!user) {
        return (
          <div className="max-w-md mx-auto space-y-5 text-center">
            <h2 className="text-2xl font-bold text-boom-cyan">Chat & Support</h2>
            <div className="bg-glass border border-boom-border rounded-2xl p-8 space-y-4">
                <p className="text-white">You need an account to chat with agencies and support.</p>
                <button
                    onClick={() => setActiveScreen('settings')}
                    className="btn-primary"
                >
                  Go to Register
                </button>
            </div>
          </div>
        );
    }

    if (activeChat) {
        return (
            <div className="max-w-md mx-auto h-[75vh]">
                <ChatInterface currentUser={user} otherParty={activeChat} onBack={() => setActiveChat(null)} />
            </div>
        );
    }
    
    // User View
    if (user.role === 'USER') {
        return (
            <>
            <div className="max-w-md mx-auto space-y-5">
                <h1 className="text-2xl font-bold text-center mb-6 text-boom-cyan">Chat & Support</h1>
                <div className="bg-glass border border-boom-border rounded-2xl p-4 space-y-3">
                    <h2 className="text-white font-semibold mb-2">Verified Agencies</h2>
                    {VERIFIED_AGENCIES.map(agency => (
                        <button key={agency.id} onClick={() => setSelectedProfile(agency)} className="w-full bg-boom-dark/50 p-3 rounded-lg flex items-center hover:bg-boom-border/50 transition-colors text-left border border-boom-border">
                            <div className="w-10 h-10 bg-boom-border rounded-full flex items-center justify-center font-bold text-boom-gold">{agency.name.charAt(0)}</div>
                            <div className="ml-4 flex-grow">
                                <p className="font-bold text-white">{agency.name}</p>
                                <p className="text-xs text-boom-text-gray">ID: {agency.id}</p>
                            </div>
                            <span className="text-xs text-boom-cyan font-bold">&rarr;</span>
                        </button>
                    ))}
                </div>
            </div>
            {selectedProfile && (
                <AgencyProfileModal 
                    agency={selectedProfile}
                    onClose={() => setSelectedProfile(null)}
                    onStartChat={() => { setSelectedProfile(null); setActiveChat(selectedProfile); }}
                />
            )}
            </>
        );
    }

    // Agency Views (Admin/Support) - Support Inbox
    if (user.role === 'ADMIN' || user.role === 'SUPPORT') {
        const userConversations = useMemo(() => {
            const conversations: Record<string, { user: UserType; lastMessage: ChatMessage }> = {};
            chatMessages
                .forEach(msg => {
                    let otherPartyId: string | null = null;
                    if (msg.receiverId === user.id) {
                        otherPartyId = msg.senderId;
                    } else if (msg.senderId === user.id) {
                        otherPartyId = msg.receiverId;
                    }

                    if (otherPartyId) {
                        const otherUser = allUsers.find(u => u.id === otherPartyId && u.role === 'USER');
                        if(otherUser) {
                             const existing = conversations[otherPartyId];
                            if (!existing || msg.timestamp > existing.lastMessage.timestamp) {
                                conversations[otherPartyId] = { user: otherUser, lastMessage: msg };
                            }
                        }
                    }
                });
            return Object.values(conversations).sort((a,b) => b.lastMessage.timestamp - a.lastMessage.timestamp);
        }, [chatMessages, user.id, allUsers]);

        return (
            <div className="max-w-md mx-auto space-y-5">
                <h1 className="text-2xl font-bold text-center mb-6 text-boom-cyan">Support Inbox</h1>
                <div className="bg-glass border border-boom-border rounded-2xl p-4 space-y-3">
                    <h2 className="text-white font-semibold mb-2">User Conversations</h2>
                    {userConversations.length === 0 ? (
                        <p className="text-boom-text-gray text-center text-sm py-4">No user messages yet.</p>
                    ) : (
                        userConversations.map(({ user: conversationUser, lastMessage }) => (
                            <button key={conversationUser.id} onClick={() => setActiveChat(conversationUser)} className="w-full bg-boom-dark/50 p-3 rounded-lg flex items-center hover:bg-boom-border/50 transition-colors text-left border border-boom-border">
                                <div className="w-10 h-10 bg-boom-border rounded-full flex items-center justify-center font-bold text-boom-gold">{conversationUser.name.charAt(0)}</div>
                                <div className="ml-4 flex-grow overflow-hidden">
                                    <p className="font-bold text-white truncate">{conversationUser.name}</p>
                                    <p className="text-xs text-boom-text-gray truncate">{lastMessage.senderId === user.id ? 'You: ' : ''}{lastMessage.text}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        );
    }
    
    // Receiver Agency View
    if (user.role === 'RECEIVER') {
        const agencyContacts = VERIFIED_AGENCIES.filter(
            agency => agency.id === user.id || agency.id === '551340'
        );
        return (
             <div className="max-w-md mx-auto space-y-5">
                <h1 className="text-2xl font-bold text-center mb-6 text-boom-cyan">Agency Chat</h1>
                <div className="bg-glass border border-boom-border rounded-2xl p-4 space-y-3">
                    <h2 className="text-white font-semibold mb-2">Agency Contacts</h2>
                    {agencyContacts.map(agency => (
                         <button key={agency.id} onClick={() => setActiveChat(agency)} disabled={agency.id === user.id} className="w-full bg-boom-dark/50 p-3 rounded-lg flex items-center hover:bg-boom-border/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed border border-boom-border">
                             <div className="w-10 h-10 bg-boom-border rounded-full flex items-center justify-center font-bold text-boom-gold">{agency.name.charAt(0)}</div>
                             <div className="ml-4 flex-grow">
                                 <p className="font-bold text-white">{agency.name} {agency.id === user.id && '(You)'}</p>
                                 <p className="text-xs text-boom-text-gray">ID: {agency.id}</p>
                             </div>
                             {agency.id !== user.id && <span className="text-xs text-boom-cyan font-bold">&rarr;</span>}
                         </button>
                    ))}
                </div>
            </div>
        );
    }

    return <div className="text-center text-boom-text-gray">Loading Chat...</div>;
};

export default ChatScreen;
