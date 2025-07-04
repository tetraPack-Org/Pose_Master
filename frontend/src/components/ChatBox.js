import React, { useEffect } from 'react';
import { Box, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatBox = ({ messages, message, setMessage, setMessages, sendMessage, user, socket }) => {

    useEffect(() => {
        // Listen for incoming messages
        const handleNewMessage = (msgObj) => {
            setMessages(prev => [...prev, msgObj]);
        };

        socket.on("message", handleNewMessage);

        // Clean up when component unmounts
        return () => {
            socket.off("message", handleNewMessage);
        };
    }, [socket, setMessages]);


    return (
        <>
            <Typography variant="h6" gutterBottom>
                Chat
            </Typography>
            <Box
                sx={{
                    maxHeight: 300,
                    overflowY: "auto",
                    mb: 2,
                    p: 2,
                    backgroundColor: "grey.100",
                    borderRadius: 1,
                }}
            >
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            mb: 1,
                            p: 1,
                            borderRadius: 1,
                            backgroundColor:
                                msg.sender === user.username
                                    ? "primary.light"
                                    : "background.paper",
                            alignSelf:
                                msg.sender === user.username
                                    ? "flex-end"
                                    : "flex-start",
                            maxWidth: "80%",
                        }}
                    >
                        <Typography variant="subtitle2">
                            {msg.sender}
                        </Typography>
                        <Typography variant="body2">
                            {msg.text}
                        </Typography>
                    </Box>
                ))}
            </Box>
            <TextField
                fullWidth
                label="Message"
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                edge="end"
                                color="primary"
                                onClick={sendMessage}
                            >
                                <SendIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                onKeyPress={(e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }}
            />
        </>
    );
};

export default ChatBox;