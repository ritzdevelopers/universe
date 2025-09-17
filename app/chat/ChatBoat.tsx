"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, X, User, Mail, Phone } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./page.module.css";
import axios from "axios";
interface CHATS {
  id: string;
  msg: string;
  date: Date;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: Array<{
    [index: number]: {
      transcript: string;
    };
    isFinal: boolean;
  }>;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): ISpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): ISpeechRecognition;
    };
  }
}

function ChatBoat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    session_id: "",
  });
  const crChatRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const boatRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userMsgs, setUserMsgs] = useState<CHATS[]>([]);
  const [resLoader, setResLoader] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formLoader, setFormLoader] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useGSAP(() => {
    if (isOpen) {
      // Animate backdrop
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      // Animate chat interface
      gsap.fromTo(
        chatRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );

      if (messageRef.current) {
        gsap.fromTo(
          messageRef.current.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, delay: 0.3 }
        );
      }

      // Focus input when chat opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500);
    } else {
      // Animate backdrop out
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          if (backdropRef.current) {
            backdropRef.current.style.display = "none";
          }
        },
      });

      // Animate boat icon
      gsap.to(boatRef.current, {
        rotate: 360,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  const toggleChat = async () => {
    // alert('26f8eb961b3d0b30a20b838cad928389aa38397695d78aa3f89f936903f42bce');

    try {
      const res = await axios.get(
        "https://apis.contenaissance.com/api/v1/session/create", //close
        {
          headers: {
            "X-API-KEY": '26f8eb961b3d0b30a20b838cad928389aa38397695d78aa3f89f936903f42bce',
          },
        }
      );
      setSessionId(res.data.session_id);
      sessionStorage.setItem("RMW_SESSION", res.data.session_id);
    } catch (error) {
      console.error("Failed to create session:", error);
    }

    setIsOpen(!isOpen);
    if (backdropRef.current && !isOpen) {
      backdropRef.current.style.display = "block";
    }
  };

  const openBoat = () => {
    setIsOpen(true);
    const exitsSessionId = sessionStorage.getItem("RMW_SESSION");

    if (!exitsSessionId) {
      toggleChat();
    } else {
      setSessionId(exitsSessionId);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [frmResType, setFrmResType] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormData((pr) => ({
        ...pr,
        session_id: sessionId,
      }));
      setFormLoader(true);
      const res = await axios.post(
        "https://apis.contenaissance.com/api/v1/user/update",
        formData,
        {
          headers: {
            "X-API-KEY": '26f8eb961b3d0b30a20b838cad928389aa38397695d78aa3f89f936903f42bce',
          },
        }
      );
      if (res) {
        setFormLoader(false);
      }
      if (res.status === 200) {
        setFrmResType("green");
      }
    } catch (error) {
      setFormLoader(false);
      if (error) {
        setFrmResType("red");
      }
    }
  };

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !boatRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const [lastDate, setLastDate] = useState<Date>();
  const [closeSession, setCloseSession] = useState(false);
  useEffect(() => {
    function handleSessionExpire() {
      if (lastDate) {
        const futureDate = new Date(lastDate.getTime() + 900 * 1000); // +15 min
        const expireMs = futureDate.getTime() - lastDate.getTime(); // always 900000 ms

        setTimeout(async () => {
          try {
            const res = await axios.post(
              "https://apis.contenaissance.com/api/v1/session/close",
              { session_id: sessionId },
              {
                headers: {
                  "X-API-KEY": '26f8eb961b3d0b30a20b838cad928389aa38397695d78aa3f89f936903f42bce',
                },
              }
            );
            if (res.status === 200) {
              setCloseSession(true);
            }
          } catch (error) {
            console.log("Err in token expiry", error);
          }
        }, expireMs); // ✅ pass ms directly
      }
    }

    if (lastDate) {
      handleSessionExpire();
    }
  }, [lastDate]);

 const sendMessageToApi = useCallback(async () => {
  try {
    if (message.trim().length <= 1) return;

    const data = { session_id: sessionId, user_input: message };
    setResLoader(true);
    setMessage("");
    setUserMsgs((pr) => [
      ...pr,
      { id: "user", msg: message, date: new Date() },
    ]);

    const res = await axios.post(
      "https://apis.contenaissance.com/api/v1/chat/",
      data,
      {
        headers: { "X-API-KEY": '26f8eb961b3d0b30a20b838cad928389aa38397695d78aa3f89f936903f42bce' },
      }
    );

    if (res.data.response) {
      setResLoader(false);
      setUserMsgs((pr) => [
        ...pr,
        { id: "boat", msg: res.data.response_html, date: new Date() },
      ]);
      setLastDate(new Date());
    }

    setTimeout(() => {
      crChatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  } catch (error) {
    console.log(error);
    setResLoader(false);
    setUserMsgs((pr) => [
      ...pr,
      {
        id: "boat",
        msg: "Sorry, I'm having trouble connecting right now. Please try again later.",
        date: new Date(),
      },
    ]);
  }
}, [message, sessionId]); // ✅ dependencies tracked


  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);
  const [userExist, setUserExist] = useState<string>("");
  useEffect(() => {
    const formToShow = sessionStorage.getItem("RMW_LEAD_GENERATED");
    setUserExist(formToShow ? formToShow : "NO");

    if (frmResType === "green") {
      setTimeout(() => {
        setFrmResType("nrml");
        sessionStorage.setItem("RMW_LEAD_GENERATED", "TRUE");
        setFormOpen(false);
      }, 3000);
    }
    if (frmResType === "red") {
      setTimeout(() => {
        setFrmResType("nrml");
      }, 3000);
    }
  }, [frmResType]);

  const [isAudiable, setIsAudiable] = useState(false);
  // const [audiableTxt, setText] = useState("");
  useEffect(() => {
 const SpeechRec =
  window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("Your Browser Do Not Supported Speech Recognitation!");
      return;
    }
    const recognitation = new SpeechRec();
    recognitation.continuous = true;
    recognitation.interimResults = true;
    recognitation.lang = "en-US";
    interface SpeechRecognitionEventResult {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    }

    interface SpeechRecognitionEvent extends Event {
      resultIndex: number;
      results: SpeechRecognitionEventResult[];
    }

    recognitation.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      // ✅ Sirf jab final result ho tabhi set karo
      if (event.results[event.resultIndex].isFinal) {
        setMessage((prev) => `${prev} ${transcript}`);
      }
    };

    if (isAudiable) recognitation.start();
    else recognitation.stop();

    return () => {
      recognitation.stop();
    };
  }, [isAudiable]);

  return (
    <>
      {/* Full-screen blur backdrop */}
      <div
        ref={backdropRef}
        className={styles.backdrop}
        style={{ display: isOpen ? "block" : "none" }}
      />

      <div className={styles.chatContainer} ref={containerRef}>
        {/* Chat Boat Trigger */}
        <div ref={boatRef} onClick={openBoat} className={styles.chatBoat}>
          {isOpen ? (
            <X className={styles.boatIcon} />
          ) : (
            <img
              src="https://cdn-icons-png.flaticon.com/512/6873/6873405.png"
              alt="Chat Icon"
              className={styles.boatGifIcon}
            />
          )}
          {!isOpen && <span className={styles.pulseAnimation}></span>}
        </div>

        {/* Chat Interface */}
        {isOpen && (
          <div
            style={{
              position: "fixed",
              height: "100vh",
              width: "100vw",
              // backgroundColor:'red',
              margin: "auto",
              top: "0",
              left: "0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: "2000",
            }}
          >
            <div ref={chatRef} className={styles.chatInterface}>
              {/* Split Container */}
              <div className={styles.splitContainer}>
                {/* Left Panel - User Form */}
                {formOpen && userExist === "NO" && (
                  <div className={styles.formPanel}>
                    <div className={styles.formHeader}>
                      <h3 className={styles.formTitle}>Contact Information</h3>
                      <p className={styles.formSubtitle}>
                        Fill out the form to start chatting
                      </p>
                      <button
                        className={styles.closeFormBtn}
                        onClick={() => setFormOpen(false)}
                        aria-label="Close form"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form
                      onSubmit={handleFormSubmit}
                      className={styles.userForm}
                    >
                      <div className={styles.formGroup}>
                        <div className={styles.inputWithIcon}>
                          <User className={styles.inputIcon} size={18} />
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            className={styles.formInput}
                            placeholder="Full Name"
                            required
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <div className={styles.inputWithIcon}>
                          <Mail className={styles.inputIcon} size={18} />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            className={styles.formInput}
                            placeholder="Email Address"
                            required
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <div className={styles.inputWithIcon}>
                          <Phone className={styles.inputIcon} size={18} />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleFormChange}
                            className={styles.formInput}
                            placeholder="Phone Number (optional)"
                          />
                        </div>
                      </div>
                      <button
                        disabled={formLoader}
                        type="submit"
                        className={styles.submitButton}
                      >
                        {formLoader ? (
                          <div className={styles.frmLoader}></div>
                        ) : (
                          <>Save & Continue</>
                        )}
                      </button>
                      {frmResType === "red" && (
                        <p
                          style={{
                            color: "#b91c1c", // dark red text
                            padding: "10px 16px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 500,
                            textAlign: "center",
                            marginTop: "10px",
                          }}
                        >
                          Internal Server Error
                        </p>
                      )}{" "}
                      {frmResType === "green" && (
                        <p
                          style={{
                            // light green background
                            color: "#166534", // dark green text
                            padding: "10px 16px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 500,
                            textAlign: "center",
                            marginTop: "10px",
                          }}
                        >
                          Form Submitted
                        </p>
                      )}
                    </form>

                    {/* <div className={styles.userInfo}>
                    <div className={styles.userInfoTitle}>Your Details:</div>
                    <div className={styles.userInfoItem}>
                      <span className={styles.userInfoLabel}>Name:</span>{" "}
                      {formData.name || "-"}
                    </div>
                    <div className={styles.userInfoItem}>
                      <span className={styles.userInfoLabel}>Email:</span>{" "}
                      {formData.email || "-"}
                    </div>
                    <div className={styles.userInfoItem}>
                      <span className={styles.userInfoLabel}>Phone:</span>{" "}
                      {formData.phone || "-"}
                    </div>
                  </div> */}
                  </div>
                )}

                {/* Right Panel - Chat Interface */}
                <div
                  className={styles.chatPanel}
                  style={{ width: formOpen && !isMobile ? "70%" : "100%" }}
                >
                  {/* Header */}
                  <div className={styles.chatHeader}>
                    <div className={styles.headerContent}>
                      <div className={styles.avatar}>
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/6873/6873405.png"
                          alt="Chat Avatar"
                          className={styles.avatarGif}
                        />
                      </div>
                      <div className={styles.headerText}>
                        <h3 className={styles.headerTitle}>
                          Ritz Media Assistant
                        </h3>
                        <p className={styles.headerStatus}>
                          <span className={styles.statusIndicator}></span>{" "}
                          Online now
                        </p>
                      </div>
                    </div>

                    <div className={styles.headerActions}>
                      {userExist === "NO" && (
                        <button
                          className={styles.qrBtn}
                          onClick={() => setFormOpen((pr) => !pr)}
                          aria-label="Quick Response"
                        >
                          {formOpen ? "Close Form" : "Quick Response"}
                        </button>
                      )}
                      <X
                        className={styles.cncl}
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                      />
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={messageRef} className={styles.messagesContainer}>
                    {/* Welcome Message */}
                    <div className={styles.greetingMessage}>
                      <p className={styles.messageText}>
                        Welcome to{" "}
                        <span className={styles.highlight}>Ritz Media</span>! We
                        are a full-service digital agency specializing in web &
                        app development, digital advertising, and influencer
                        marketing. How can we help you today?
                      </p>
                      <div className={styles.messageTime}>
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {userMsgs.length > 0 &&
                      userMsgs.map((tk, idx) => {
                        const isUser = tk.id === "user";

                        return (
                          <div
                            key={idx}
                            className={`${styles.message} ${
                              isUser ? styles.messageRight : styles.messageLeft
                            }`}
                          >
                            {!isUser && (
                              <div className={styles.messageAvatar}>
                                <img
                                  src="https://cdn-icons-png.flaticon.com/512/6873/6873405.png"
                                  alt="Bot Avatar"
                                  className={styles.avatarGifSmall}
                                />
                              </div>
                            )}
                            <div
                              className={`${styles.messageBubble} ${
                                isUser ? styles.bubbleRight : styles.bubbleLeft
                              }`}
                            >
                              <div
                                className={styles.messageContainer}
                                dangerouslySetInnerHTML={{ __html: tk.msg }}
                              ></div>

                              <div
                                className={`${styles.messageTime} ${
                                  isUser ? styles.timeRight : styles.timeLeft
                                }`}
                              >
                                {tk.date.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            {isUser && (
                              <div className={styles.messageAvatar}>
                                <img
                                  src="https://tse4.mm.bing.net/th/id/OIP.SqTcfufj92gVRBT45d045wAAAA?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3"
                                  alt="User Avatar"
                                  className={styles.avatarGifSmall}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Scroll anchor */}
                    <div ref={crChatRef}></div>

                    {resLoader && (
                      <div
                        className={`${styles.messageBubble} ${styles.bubbleLeft}`}
                        style={{
                          width: "80px",
                        }}
                      >
                        <div className={styles.loadingDots}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className={styles.inputArea}>
                    {!closeSession ? (
                      <div className={styles.messageInputContainer}>
                        <textarea
                          ref={inputRef}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type your message..."
                          className={styles.messageInput}
                          rows={1}
                        />
                        <div className={styles.sendButtonContainer}>
                          {message ? (
                            <button
                              type="button"
                              className={styles.sendButton}
                              onClick={sendMessageToApi}
                              disabled={resLoader}
                              aria-label="Send message"
                            >
                              <Send className={styles.sendIcon} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={styles.micButton}
                              aria-label="Use microphone"
                              onClick={() => setIsAudiable((pr) => !pr)}
                              style={{
                                backgroundColor: isAudiable
                                  ? "#a1a0a0"
                                  : "#f0f0f0",
                              }}
                            >
                              <Mic className={styles.micIcon} />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.chatTips}>
                        <p>
                          Your Session Has Expired, Please Refresh The Page!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ChatBoat;
