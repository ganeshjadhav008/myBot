import React, { useEffect, useState, useRef }  from 'react'
import ReactMarkdown from 'react-markdown';
import logo from '../images/logo.svg';
import bot from '../images/bot.png';
import copy from '../images/copy.png';
import like from '../images/like.png';
import dislike from '../images/dislike.png';
import add from '../images/add.png';
import logout from '../images/logout.png';

export default function ChatApp() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [showBot, setShowBot] = useState(true);


    const messagesEndRef = useRef(null);
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

      useEffect(() => {
        const storedEmail = localStorage.getItem('userEmail');
        if (!storedEmail) {
          window.location.href = '/';
        }
        
      }, []);

        const handleSendMessage = async () => {
          window.speechSynthesis.cancel();
          if (!userInput.trim()) return;
      
          // Add user message to the messages array
          const newMessage = { text: userInput, sender: 'user' };
          const updatedMessages = [...messages, newMessage];
          setMessages(updatedMessages);
      
          // Save to local storage
          localStorage.setItem('chatHistory', JSON.stringify(updatedMessages));
      
          // Reset input field
          setUserInput('');
          setShowBot(false);
      
          // Add typing indicator
          const typingMessage = { sender: 'bot', text: '<span class="wave-dots"><span>.</span><span>.</span><span>.</span><span>.</span></span>' };
          setMessages((prevMessages) => [...prevMessages, typingMessage]);
      
          try {
              const userQuery = encodeURIComponent(userInput);
              const url = `/query_with_openai?user_query=${userQuery}`;
      
              const response = await fetch(url, {
                  method: "POST",
                  headers: {
                      Accept: "application/json",
                  },
                  body: "", // Empty body as required
              });
      
              if (!response.ok) {
                  throw new Error("Network response was not ok");
              }
      
              const data = await response.json();
      
              // Remove typing indicator and add bot response
              setMessages((prevMessages) => {
                  const filteredMessages = prevMessages.filter(msg => msg !== typingMessage);
                  const botReply = { text: data.answer || "I didn't understand that.", sender: 'bot' };
                  const newChat = [...filteredMessages, botReply];
                  localStorage.setItem('chatHistory', JSON.stringify(newChat)); // Update local storage
                  return newChat;
              });
      
          } catch (error) {
              
              // Remove typing indicator and add error message
              setMessages((prevMessages) => {
                  const filteredMessages = prevMessages.filter(msg => msg !== typingMessage);
                  const botReply = { text: "Sorry, something went wrong.", sender: 'bot' };
                  const newChat = [...filteredMessages, botReply];
                  localStorage.setItem('chatHistory', JSON.stringify(newChat));
                  return newChat;
              });
          }
      };

      const formatText = (text) => {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      };
    
    // Load messages from local storage
    useEffect(() => {
        const savedMessages = JSON.parse(localStorage.getItem('chatHistory'));
        if (savedMessages) {
            setMessages(savedMessages);
            setShowBot(false);
        }
    }, []);
    
      return (
        <>
        <div className='container'>
          <nav>
            <img src={logo} alt="Logo" className="logo" />
          </nav>
          <div className="cards">
          <div className={`card-body ${showBot ? 'p-5 mt-5' : ''}`}>
                <div className="bot-info">
                  <div className="bot-info-head" style={{ display: showBot ? '' : 'none' }}>
                    <div className="bot-info-logo">
                      <img src={bot} alt="bot" className="bot-icon" />
                    </div>
                    <div className="bot-info-details">
                      <h2>Hi! I’m Botus. </h2>
                      <p>How can I help you today?</p>
                    </div>
                  </div>

                 {/* Message container start here */}
                 <div className="message-container" style={{ 
                  height: 'calc(83vh - 150px)', 
                  overflowY: 'auto', 
                  paddingBottom: '50px', 
                  display: showBot ? 'none' : '', 
                  scrollbarWidth: 'none' 
                }}>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                      style={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '10px',
                      }}
                    >

                      {/* If the message is from the bot, show the bot image */}
                    {message.sender === 'bot' && (
                      <img 
                        src={bot}
                        alt="Bot"
                        title='Botus'
                        className='icon-message'
                      />
                    )}
              <div
                className="message-bubble"
                style={{
                  backgroundColor: message.sender === 'user' ? '#FFFFFF' : '#F8F7F4',
                  color: '#222222',
                  borderRadius: '15px',
                  padding: '10px 20px',
                  maxWidth: '620px',
                  wordWrap: 'break-word',
                }}
              >
                 {message.sender === 'bot' ? (
                  <p dangerouslySetInnerHTML={{ __html: formatText(message.text) }} />
                ) : (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                )}
                
                {/* React Buttons */}
                {message.sender === 'bot' && !message.text.includes('<span class="wave-dots">') && (
                  <div 
                    className="reactThumb" 
                    style={{ display: 'flex', gap: '10px', marginTop: '5px', justifyContent: 'end' }}
                  >
                    <button
                      className="reactButton"
                      title="Listen"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => {
                        if ("speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                          const utterance = new SpeechSynthesisUtterance(message.text);
                          utterance.lang = "en-US";
                          utterance.rate = 1;
                          utterance.pitch = 1;
                          window.speechSynthesis.speak(utterance);
                        } 
                      }}
                    >
                      🔊
                    </button>

                    <button 
                      className="reactButton" 
                      title="Copy" 
                      onClick={() => {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(message.text)
                        } else {
                          const textarea = document.createElement("textarea");
                          textarea.value = message.text;
                          document.body.appendChild(textarea);
                          textarea.select();
                          document.body.removeChild(textarea);
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <img src={copy} alt="Copy" className="reactIcon" />
                    </button>

                    <button 
                      className="reactButton" 
                      title="Thumbs Up" 
                      onClick={() => console.log('Thumbs up')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <img src={like} alt="Thumbs Up" className="reactIcon" />
                    </button>

                    <button 
                      className="reactButton" 
                      title="Thumbs Down" 
                      onClick={() => console.log('Thumbs down')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <img src={dislike} alt="Thumbs Down" className="reactIcon" />
                    </button>
                  </div>
                )}

            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
                </div>

                  {/* textarea code start here*/}
                  <div>
                  <div className='action-buttons'>
                      <button className="new-chat" 
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        localStorage.removeItem("chatHistory");
                        setMessages([]);
                        setUserInput("");
                        window.location.reload();
                      }}>
                        New chat
                        <img src={add} alt="Thumbs Up" className="reactIcon" />
                        
                      </button>
                      <button className="logout-btn"
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        localStorage.removeItem("chatHistory");
                        localStorage.removeItem("userEmail");
                        localStorage.removeItem("authToken");
                        window.location.reload();
                      }}>
                        Logout
                        <img src={logout} alt="Thumbs Up" className="reactIcon" />
                      </button>
                  </div>
                    
                    <div className="position-relative">
                    <textarea
                      id="message"
                      className="form-control pe-5"
                      rows="3"
                      placeholder="Enter Your Message..."
                      value={userInput}
                      onChange={(e) => {
                        let sanitizedInput = e.target.value
                          .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
                          .replace(/[^\w\s.,!?]/gi, "") // Remove special characters except basic punctuation
                          .replace(/\n{2,}/g, "\n"); // Replace multiple line breaks with a single one

                        setUserInput(sanitizedInput);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { 
                          e.preventDefault();
                          if (userInput.trim() !== "") {
                            handleSendMessage();
                          }
                        }
                      }}
                    ></textarea>


                    <button
                      className="btn btn-primary position-absolute send-btn"
                      onClick={() => {
                        if (userInput.trim() !== "") { 
                          setUserInput((prev) => prev.replace(/\n{2,}/g, "\n")); 
                          handleSendMessage();
                        }
                      }}
                    >
                    </button>
                  </div>
    
                  </div>
                </div>
                </div>
          </div>
        </div>
        </>
      );
}
