import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  Slide,
  CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import {
  FaCamera,
  FaMicrophone,
  FaImage,
  FaBookOpen,
  FaGamepad,
  FaCut,
} from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import ImageMessage from "./ImageMessage.jsx";
import GomokuInviteCard from "./GomokuInviteCard.jsx";
import { renderStars, renderCookbookCard, calculateFileHash } from "./utils.js";
import baseUrl from "./config.js";
import apiRequest from "./api.js";
import DynamicAvatar from "./commons/DynamicAvatar.jsx";

// 恋爱记风格配色
const COLORS = {
  primary: "#FF5E87",
  secondary: "#FFB6C1",
  accent: "#FF85A2",
  light: "#FFF0F3",
  dark: "#333333",
};

// 聊天页面组件
const ChatPage = ({
  navigate,
  selectedFriend,
  friendMessages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyPress,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  emojiIconRef,
  emojiPickerRef,
  selfAvatar,
  inputRef,
  onBack,
  handleShareCookbookClick,
  handleReadMessage,
  handleShowGames,
  setFriendMessages,
}) => {
  const chatListRef = useRef(null);
  const inputBoxRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isMobile, setIsMobile] = useState(false); // 检测是否为移动设备
  const [inputFocused, setInputFocused] = useState(false); // 输入框是否聚焦
  const [scrollEnabled, setScrollEnabled] = useState(true); // 滚动是否启用
  const [scrollPosition, setScrollPosition] = useState(0); // 滚动位置
  const [lastScrollTop, setLastScrollTop] = useState(0); // 上次滚动位置
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true); // 是否滚动到底部

  // 添加调试状态
  const [debugInputValue, setDebugInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentUserId = localStorage.getItem("userId");

  // 检测设备类型
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice =
      userAgent.indexOf("android") > -1 ||
      userAgent.indexOf("iphone") > -1 ||
      userAgent.indexOf("ipad") > -1 ||
      userAgent.indexOf("ipod") > -1;

    setIsMobile(isMobileDevice);
  }, []);

  // 监听聊天列表滚动事件
  useEffect(() => {
    const chatListElement = chatListRef.current;
    if (!chatListElement) return;

    const handleScroll = () => {
      const scrollTop = chatListElement.scrollTop;
      const scrollHeight = chatListElement.scrollHeight;
      const clientHeight = chatListElement.clientHeight;

      // 保存当前滚动位置
      setScrollPosition(scrollTop);
      setLastScrollTop(scrollTop);

      // 如果用户滚动到顶部附近，禁用自动滚动到底部
      if (scrollHeight - scrollTop > clientHeight * 1.5) {
        setScrollEnabled(false);
        setIsScrolledToBottom(false);
      } else {
        setScrollEnabled(true);
        setIsScrolledToBottom(true);
      }
    };

    chatListElement.addEventListener("scroll", handleScroll);

    return () => {
      chatListElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 当有新消息时，滚动到底部（仅当用户在底部或自动滚动启用时）
  useEffect(() => {
    if (chatListRef.current && (scrollEnabled || scrollPosition === 0)) {
      // 使用requestAnimationFrame确保DOM更新完成后再滚动
      requestAnimationFrame(() => {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      });
    }
  }, [friendMessages, scrollEnabled, scrollPosition]);

  // 当输入框聚焦时，确保滚动到底部
  useEffect(() => {
    if (inputFocused && chatListRef.current) {
      // 使用requestAnimationFrame确保DOM更新完成后再滚动
      requestAnimationFrame(() => {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      });
    }
  }, [inputFocused]);

  useEffect(() => {
    if (selectedFriend) {
      handleReadMessage();
    }
  }, [selectedFriend]);

  // 处理图片选择
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSendImage = async () => {
    if (!selectedImage || !selectedFriend) return;

    setIsUploading(true);

    try {
      // 1. 从File对象中读取二进制数据并计算哈希值
      const fileInput = document.getElementById("fileInput");
      const file = fileInput.files[0];
      if (!file) throw new Error("未选择图片");

      // 计算文件哈希值（使用SHA-1算法）
      const hash = await calculateFileHash(file);

      // 2. 调用后端接口检查文件是否已存在
      const existResult = await apiRequest(
        "/aliyun/fileExist",
        "GET",
        { hash },
        navigate
      );
      if (existResult.code !== "200") {
        throw new Error(existResult.message || "文件存在性检查失败");
      }

      const cachedFileId = existResult.data;
      if (cachedFileId) {
        // 存在缓存文件，直接发送
        await sendImageMessage(cachedFileId);
      } else {
        // 不存在缓存，执行原上传流程
        const uploadResult = await uploadImage(file);
        const fileId = uploadResult.data;
        await sendImageMessage(fileId);
      }

      // 重置状态
      setSelectedImage(null);
      // 重置文件输入
      fileInput.value = "";
    } catch (error) {
      console.error("图片发送失败:", error);
      // 这里可以添加错误提示（如Toast）
    } finally {
      setIsUploading(false);
    }
  };

  // 发送图片消息的通用函数
  const sendImageMessage = async (fileId) => {
    const sendResult = await apiRequest(
      "/send-message",
      "POST",
      {
        userIdFrom: currentUserId,
        userIdTo: selectedFriend.id,
        messageType: "image",
        messageContent: fileId,
      },
      navigate
    );

    if (sendResult.code === "200") {
      setFriendMessages((prevMessages) => ({
        ...prevMessages,
        [selectedFriend.id]: [
          ...(prevMessages[selectedFriend.id] || []),
          {
            text: fileId,
            sender: "user",
            messageType: "image",
            isRead: true, // 假设发送即视为已读
          },
        ],
      }));
    } else {
      throw new Error(sendResult.message || "发送图片消息失败");
    }
  };

  // 上传图片的辅助函数（保持原逻辑）
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResult = await apiRequest(
      "/image/upload",
      "POST",
      formData,
      navigate
    );
    if (uploadResult.code !== "200") {
      throw new Error(uploadResult.message || "图片上传失败");
    }
    return uploadResult;
  };

  // 取消图片选择
  const handleCancelImage = () => {
    setSelectedImage(null);
    // 重置文件输入
    document.getElementById("fileInput").value = "";
  };

  // 处理图片点击，进入全屏模式
  const handleImageClick = (event, imageUrl) => {
    setFullscreenImage(imageUrl);
    // 阻止事件冒泡，避免触发聊天区域点击
    event.stopPropagation();
  };

  // 退出全屏模式
  const exitFullscreen = () => {
    setFullscreenImage(null);
  };

  // 处理拍照
  const handleTakePhoto = () => {
    document.getElementById("cameraInput").click();
  };

  // 处理相机拍摄的照片
  const handleCameraImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 改进的输入框事件处理
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    setDebugInputValue(value);
    setIsTyping(true);

    // 添加调试日志
    console.log("Input changed:", value);
  };

  // 简化的输入框聚焦处理
  const handleInputFocus = () => {
    setInputFocused(true);
    setIsTyping(true);

    // 确保DOM更新完成后再滚动
    setTimeout(() => {
      if (chatListRef.current) {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      }
    }, 0);
  };

  // 简化的输入框失焦处理
  const handleInputBlur = () => {
    setInputFocused(false);
    setIsTyping(false);
  };

  // 改进的外部点击事件处理，避免意外失焦
  const handleOutsideClick = (e) => {
    // 如果点击的是表情选择器或其内部元素，不触发失焦
    if (emojiPickerRef.current && emojiPickerRef.current.contains(e.target)) {
      return;
    }

    // 如果点击的是图片预览区域，不触发失焦
    const imagePreview = document.querySelector(".image-preview");
    if (imagePreview && imagePreview.contains(e.target)) {
      return;
    }

    // 只有点击了输入框外部的其他区域才失焦
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      inputRef.current.blur();
    }
  };

  // 添加点击外部失焦事件监听
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedFriend]);

  // 监听窗口大小变化，处理键盘弹出问题（仅移动设备）
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      // 当窗口大小变化时，确保聊天列表滚动到底部
      if (chatListRef.current && isScrolledToBottom) {
        requestAnimationFrame(() => {
          chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile, isScrolledToBottom]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        backgroundColor: COLORS.light,
        overflow: "hidden",
      }}
    >
      {/* 顶部导航栏 */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: COLORS.primary,
          boxShadow: "0 2px 4px rgba(255, 94, 135, 0.2)",
          height: "56px",
        }}
      >
        <Toolbar>
          <IconButton onClick={onBack} color="inherit">
            <ArrowBack />
          </IconButton>
          <Box flexGrow={1} /> {/* 左侧占位元素 */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "60%",
              color: "white",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            {selectedFriend
              ? `正在和 ${selectedFriend.name} 聊天`
              : "请选择好友开始聊天"}
          </Typography>
          <Box flexGrow={1} /> {/* 右侧占位元素 */}
        </Toolbar>
      </AppBar>

      {/* 聊天列表部分 */}
      <List
        ref={chatListRef}
        sx={{
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.light,
          backgroundImage:
            'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23FF5E87" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          // 为输入框和图片预览留出空间
          paddingBottom: selectedImage ? "150px" : "100px",
          // 平滑滚动
          scrollBehavior: "smooth",
        }}
      >
        {friendMessages[selectedFriend.id]?.map((message, index) => (
          <ListItem
            key={index}
            alignItems="flex-start"
            sx={{
              justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
              mb: 2,
              flexDirection: "row",
            }}
          >
            {message.sender === "user" ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center", // 垂直居中
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: message.isRead ? "#666" : COLORS.primary,
                      marginRight: 2,
                      whiteSpace: "nowrap", // 防止换行
                    }}
                  >
                    {message.isRead ? "已读" : "未读"}
                  </Typography>
                  {message.messageType === "image" ? (
                    <ImageMessage
                      fileId={message.text}
                      onImageClick={(e, url) => handleImageClick(e, url)}
                    />
                  ) : message.messageType === "cookBook" ? (
                    renderCookbookCard(JSON.parse(message.text))
                  ) : message.messageType === "Gomoku" ? (
                    <GomokuInviteCard
                      message={JSON.parse(message.text)}
                      friend={selectedFriend}
                      onJoin={(roomId) => navigate(`/gomoku?roomId=${roomId}`)}
                      userIdTo={message.userIdTo}
                    />
                  ) : (
                    <Box
                      sx={{
                        backgroundColor: COLORS.primary,
                        borderRadius: "20px 4px 20px 20px",
                        padding: "8px 16px",
                        maxWidth: {
                          xs: "85%", // 增加小屏幕宽度
                          sm: "90%", // 增加大屏幕宽度
                        },
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        boxShadow: "0 2px 4px rgba(255, 94, 135, 0.2)",
                        color: "white",
                      }}
                    >
                      {message.text}
                    </Box>
                  )}
                </Box>
                <DynamicAvatar userId={message.userIdFrom} size="md" />
              </>
            ) : (
              <>
                <DynamicAvatar userId={message.userIdFrom} size="md" />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center", // 垂直居中
                    flexDirection: "row",
                  }}
                >
                  {message.messageType === "image" ? (
                    <ImageMessage
                      fileId={message.text}
                      onImageClick={(e, url) => handleImageClick(e, url)}
                    />
                  ) : message.messageType === "cookBook" ? (
                    renderCookbookCard(JSON.parse(message.text))
                  ) : message.messageType === "Gomoku" ? (
                    <GomokuInviteCard
                      message={JSON.parse(message.text)}
                      friend={selectedFriend}
                      onJoin={(roomId) => navigate(`/gomoku?roomId=${roomId}`)}
                      userIdTo={message.userIdTo}
                    />
                  ) : (
                    <Box
                      sx={{
                        backgroundColor: "white",
                        borderRadius: "4px 20px 20px 20px",
                        padding: "8px 16px",
                        maxWidth: {
                          xs: "85%", // 增加小屏幕宽度
                          sm: "90%", // 增加大屏幕宽度
                        },
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        color: COLORS.dark,
                      }}
                    >
                      {message.text}
                    </Box>
                  )}
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: message.isRead ? "#666" : COLORS.primary,
                      marginLeft: 2,
                      whiteSpace: "nowrap", // 防止换行
                    }}
                  >
                    {message.isRead ? "已读" : "未读"}
                  </Typography>
                </Box>
              </>
            )}
          </ListItem>
        ))}
      </List>

      {/* 底部输入区域 */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTop: `1px solid ${COLORS.secondary}`,
          zIndex: 1,
          transition: "transform 0.3s ease",
        }}
      >
        {/* 输入框和发送按钮 */}
        <Box
          sx={{ padding: "4px 16px", display: "flex", alignItems: "center" }}
        >
          <IconButton
            ref={emojiIconRef}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            sx={{ color: COLORS.primary }}
          >
            <span style={{ fontSize: "22px" }}>😊</span>
          </IconButton>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            rows={1}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            sx={{
              "& fieldset": {
                borderWidth: "0px",
                borderRadius: "24px",
                backgroundColor: COLORS.light,
                // 增强聚焦状态的视觉反馈
                transition: "all 0.3s ease",
              },
              height: 40,
              padding: "0px 8px",
              "& .MuiInputBase-input": {
                padding: "6px 12px",
                fontSize: "16px",
                // 强制设置文字颜色为深色，确保可见性
                color: COLORS.dark,
                // 确保文字可见，添加明确的字体设置
                fontFamily: "Roboto, sans-serif",
                // 添加文字阴影，增强可读性
                textShadow: "0 0 1px rgba(0, 0, 0, 0.1)",
                // 确保文字不被隐藏
                opacity: 1,
                // 确保文字显示在最上层
                zIndex: 10,
              },
              "& .Mui-focused fieldset": {
                borderColor: COLORS.primary,
                borderWidth: "2px", // 增加边框宽度
                boxShadow: "0 0 0 3px rgba(255, 94, 135, 0.2)", // 添加光晕效果
              },
              // 确保输入框可见
              "& .MuiInputBase-root": {
                zIndex: 10,
              },
            }}
          />
          {newMessage.trim() ? (
            <Button
              variant="contained"
              onClick={handleSendMessage}
              sx={{
                backgroundColor: COLORS.primary,
                "&:hover": { backgroundColor: "#FF4778" },
                marginLeft: 2,
                height: 40,
                width: 40,
                borderRadius: 20,
                boxShadow: "0 2px 4px rgba(255, 94, 135, 0.3)",
              }}
            >
              <IoSend />
            </Button>
          ) : (
            <IconButton
              onClick={() => document.getElementById("fileInput").click()}
              sx={{ color: COLORS.primary, marginLeft: 2 }}
            >
              <FaImage />
            </IconButton>
          )}
        </Box>

        {/* 功能按钮区 */}
        <Box
          sx={{
            padding: "8px 16px",
            display: "flex",
            justifyContent: "space-around",
            borderTop: `1px solid ${COLORS.secondary}`,
          }}
        >
          <IconButton
            sx={{ width: 40, height: 40, color: COLORS.primary }}
            onClick={handleTakePhoto}
          >
            <FaCamera />
          </IconButton>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />
          <IconButton
            sx={{ width: 40, height: 40, color: COLORS.primary }}
            onClick={handleShareCookbookClick}
          >
            <FaBookOpen />
          </IconButton>
          <IconButton
            sx={{ width: 40, height: 40, color: COLORS.primary }}
            onClick={handleShowGames}
          >
            <FaGamepad />
          </IconButton>
          <IconButton sx={{ width: 40, height: 40, color: COLORS.primary }}>
            <FaMicrophone />
          </IconButton>
        </Box>

        {/* 表情选择器 */}
        {showEmojiPicker && (
          <Slide
            direction="up"
            in={showEmojiPicker}
            mountOnEnter
            unmountOnExit
            style={{
              position: "absolute",
              bottom: 120,
              left: 0,
              right: 0,
              zIndex: 2,
            }}
          >
            <Box
              ref={emojiPickerRef}
              sx={{
                backgroundColor: "white",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                padding: "8px",
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                disableAutoFocus={true}
              />
            </Box>
          </Slide>
        )}

        {/* 图片预览与上传区域 */}
        {selectedImage && (
          <Box
            sx={{
              position: "absolute",
              bottom: "128px",
              left: 16,
              backgroundColor: "white",
              borderRadius: 12,
              padding: 1,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              maxWidth: "90%",
              className: "image-preview", // 添加类名以便于选择
            }}
          >
            <img
              src={selectedImage}
              alt="预览"
              style={{
                maxWidth: "120px",
                maxHeight: "120px",
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
            <Box
              sx={{ marginLeft: 1, display: "flex", flexDirection: "column" }}
            >
              {isUploading ? (
                <CircularProgress size={24} sx={{ color: COLORS.primary }} />
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={handleSendImage}
                    size="small"
                    sx={{
                      backgroundColor: COLORS.primary,
                      "&:hover": { backgroundColor: "#FF4778" },
                      marginBottom: 1,
                      fontSize: "12px",
                      textTransform: "none",
                    }}
                  >
                    发送图片
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancelImage}
                    size="small"
                    sx={{
                      color: COLORS.primary,
                      borderColor: COLORS.primary,
                      "&:hover": { borderColor: "#FF4778" },
                      fontSize: "12px",
                      textTransform: "none",
                    }}
                  >
                    取消
                  </Button>
                </>
              )}
            </Box>
          </Box>
        )}

        {/* 全屏图片查看器 */}
        {fullscreenImage && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              zIndex: 1000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={exitFullscreen}
          >
            <IconButton
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "50%",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
              }}
              onClick={exitFullscreen}
            >
              <FaCut />
            </IconButton>
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
              }}
            />
          </Box>
        )}

        {/* 相机输入 */}
        <input
          id="cameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleCameraImage}
        />
      </Box>
    </Box>
  );
};

export default ChatPage;
