import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chatbotKnowledge, findBestFaqMatch } from './chatbotKnowledge';
import './CustomerChatbot.css';

const defaultBotMessage = {
  id: 'welcome',
  from: 'bot',
  text: 'Hi! I am AeroPulse Assistant. Ask me about Shop, Services, My Unit, Orders, Settings, or Contact support.'
};

const CustomerChatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([defaultBotMessage]);

  const quickQuestions = useMemo(() => chatbotKnowledge.quickQuestions, []);

  const buildBotReply = (messageText) => {
    const normalized = messageText.toLowerCase();
    if (['hi', 'hello', 'hey'].some((word) => normalized.includes(word))) {
      return {
        text: 'Hello! You can ask things like "How do I book a service?" or "Where can I track my orders?".'
      };
    }

    const match = findBestFaqMatch(messageText);
    if (match) {
      return {
        text: match.answer,
        route: match.route
      };
    }

    return {
      text:
        "I couldn't find an exact answer for that yet. Try asking about shop products, service booking, adding units, order tracking, settings, or support."
    };
  };

  const pushMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendUserMessage = (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    pushMessage({
      id: `user-${Date.now()}`,
      from: 'user',
      text
    });

    const response = buildBotReply(text);

    pushMessage({
      id: `bot-${Date.now() + 1}`,
      from: 'bot',
      text: response.text,
      route: response.route
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendUserMessage(input);
    setInput('');
  };

  return (
    <div className="customer-chatbot-root" aria-live="polite">
      {isOpen && (
        <section className="customer-chatbot-panel" role="dialog" aria-label="Customer chatbot">
          <header className="customer-chatbot-header">
            <div>
              <h3>AeroPulse Assistant</h3>
              <p>Automated support for customer pages</p>
            </div>
            <button
              type="button"
              className="customer-chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="customer-chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`customer-chatbot-message ${message.from === 'user' ? 'user' : 'bot'}`}
              >
                <p>{message.text}</p>
                {message.route && message.route !== location.pathname && (
                  <button
                    type="button"
                    className="customer-chatbot-route-btn"
                    onClick={() => navigate(message.route)}
                  >
                    Open page
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="customer-chatbot-quick-questions">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendUserMessage(question)}
              >
                {question}
              </button>
            ))}
          </div>

          <form className="customer-chatbot-input-row" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about customer features..."
              aria-label="Chatbot input"
            />
            <button type="submit">Send</button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="customer-chatbot-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Hide chatbot' : 'Open chatbot'}
      >
        Chat
      </button>
    </div>
  );
};

export default CustomerChatbot;
