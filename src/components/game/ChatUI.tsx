import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAccountStore } from '@/store/accountStore';
import { useGuildStore } from '@/store/guildStore';

type ChatType = 'general' | 'guild' | 'private';

interface Props {
  onClose: () => void;
}

export const ChatUI = ({ onClose }: Props) => {
  const [chatType, setChatType] = useState<ChatType>('general');
  const [message, setMessage] = useState('');
  const [privateTo, setPrivateTo] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const allMessages = useChatStore(s => s.messages);
  const addMessage = useChatStore(s => s.addMessage);
  const currentUser = useAccountStore(s => s.getCurrentUsername());
  const hasGuild = useGuildStore(s => s.hasGuild);

  const filteredMessages = allMessages.filter(m => {
    if (chatType === 'general') return m.type === 'general';
    if (chatType === 'guild') return m.type === 'guild';
    if (chatType === 'private') return m.type === 'private' && (m.sender === currentUser || m.receiver === currentUser);
    return false;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const sendMessage = () => {
    if (!message.trim() || !currentUser) return;
    
    if (chatType === 'private' && !privateTo.trim()) {
      alert('Bitte Empfänger eingeben');
      return;
    }

    addMessage({
      type: chatType,
      sender: currentUser,
      receiver: chatType === 'private' ? privateTo : undefined,
      message: message.trim(),
    });
    setMessage('');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-20 left-4 z-40 w-80" data-chat-open="true">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-t-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
          <span className="text-white font-bold text-sm">💬 Chat</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex px-2 py-1 border-b border-gray-700">
          <button
            onClick={() => setChatType('general')}
            className={`flex-1 px-2 py-1 rounded text-xs font-bold ${
              chatType === 'general' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            📢
          </button>
          {hasGuild && (
            <button
              onClick={() => setChatType('guild')}
              className={`flex-1 px-2 py-1 rounded text-xs font-bold ${
                chatType === 'guild' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              🏛️
            </button>
          )}
          <button
            onClick={() => setChatType('private')}
            className={`flex-1 px-2 py-1 rounded text-xs font-bold ${
              chatType === 'private' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            💜
          </button>
        </div>

        {/* Private input */}
        {chatType === 'private' && (
          <div className="px-2 py-1 border-b border-gray-700">
            <input
              type="text"
              value={privateTo}
              onChange={e => setPrivateTo(e.target.value)}
              placeholder="An: Spieler"
              className="w-full bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600"
            />
          </div>
        )}

        {/* Messages */}
        <div className="h-48 overflow-y-auto p-2 space-y-1">
          {filteredMessages.length === 0 ? (
            <div className="text-gray-500 text-xs text-center py-4">
              {chatType === 'general' && 'Keine Nachrichten'}
              {chatType === 'guild' && 'Keine Gilden-Nachrichten'}
              {chatType === 'private' && 'Keine Privatnachrichten'}
            </div>
          ) : (
            filteredMessages.map(msg => (
              <div key={msg.id} className="text-xs">
                <span className="text-gray-400">[{formatTime(msg.timestamp)}]</span>{' '}
                <span className="font-bold text-blue-400">{msg.sender}</span>
                {msg.type === 'private' && msg.receiver && (
                  <span className="text-purple-400"> → {msg.receiver}</span>
                )}
                <span className="text-white">: {msg.message}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex px-2 py-2 border-t border-gray-700">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Nachricht..."
            className="flex-1 bg-gray-800 text-white text-xs px-2 py-1 rounded-l border border-gray-600"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-r text-xs font-bold"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};