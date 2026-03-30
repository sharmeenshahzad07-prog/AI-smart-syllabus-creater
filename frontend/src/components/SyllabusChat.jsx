import { useState, useRef, useEffect } from 'react';

export default function SyllabusChat({ schedule, messages, setMessages }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    const input = e.target.elements.chatInput.value.trim();
    if (!input || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    e.target.reset();
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          schedule: schedule || [] 
        }),
      });

      const data = await response.json();
      
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
      }, 800 + Math.random() * 1000);

    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to the brain right now. 🧠❌" }]);
    }
  };

  return (
    <>
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <h4>Study Assistant AI</h4>
              <span className="online-indicator"></span>
            </div>
            <button 
              onClick={() => {
                if(confirm("Clear chat history?")) {
                  setMessages([{ role: 'bot', text: "History cleared! How can I help you today? ✨" }]);
                }
              }}
              style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer', padding: '4px'}}
            >
              Clear
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input 
              name="chatInput"
              type="text" 
              placeholder="Ask me a question..." 
              autoComplete="off"
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}
