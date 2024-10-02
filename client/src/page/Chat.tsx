import { useEffect, useState } from 'react';
import { Button, TextField, List, ListItem, ListItemText, IconButton, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { createChat, updateChat, deleteChat, getChatsBefore } from '../api/api';
import { ChatEntity } from '../interface/entity';
import { useParams } from 'react-router-dom';

export const Chat = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const roomIdNumber = roomId ? parseInt(roomId, 10) : NaN;

    const [chats, setChats] = useState<ChatEntity[]>([]);
    const [newChat, setNewChat] = useState<{ time: string; message: string; sequence: number; is_answer: number }>({
        time: '',
        message: '',
        sequence: 0,
        is_answer: 0,
    });
    const [editingChatId, setEditingChatId] = useState<number | null>(null);
    const [editingChat, setEditingChat] = useState<{ time: string; message: string; sequence: number; is_answer: number }>({
        time: '',
        message: '',
        sequence: 0,
        is_answer: 0,
    });

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const response = await getChatsBefore(roomIdNumber);
            setChats(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateChat = async () => {
        if (newChat.message) {
            try {
                await createChat({ ...newChat, time: new Date().toISOString(), room_id: roomIdNumber });
                setNewChat({ time: '', message: '', sequence: 0, is_answer: 0 });
                fetchChats();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleUpdateChat = async () => {
        if (editingChatId !== null) {
            try {
                await updateChat(editingChatId, editingChat);
                setEditingChatId(null);
                setEditingChat({ time: '', message: '', sequence: 0, is_answer: 0 });
                fetchChats();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleDeleteChat = async (id: number) => {
        try {
            await deleteChat(id);
            fetchChats();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Chats for Room {roomIdNumber}
            </Typography>
            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="Message"
                    variant="outlined"
                    value={newChat.message}
                    onChange={(e) => setNewChat({ ...newChat, message: e.target.value })}
                    style={{ marginRight: '10px' }}
                />
                <TextField
                    type="number"
                    label="Sequence"
                    variant="outlined"
                    value={newChat.sequence}
                    onChange={(e) => setNewChat({ ...newChat, sequence: Number(e.target.value) })}
                    style={{ marginRight: '10px' }}
                />
                <FormControl variant="outlined" style={{ marginRight: '10px' }}>
                    <InputLabel>Is Answer</InputLabel>
                    <Select value={newChat.is_answer} onChange={(e) => setNewChat({ ...newChat, is_answer: Number(e.target.value) })} label="Is Answer">
                        <MenuItem value={0}>No</MenuItem>
                        <MenuItem value={1}>Yes</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleCreateChat}>
                    Add Chat
                </Button>
            </div>
            <List>
                {chats.map((chat) => (
                    <ListItem
                        key={chat.id}
                        secondaryAction={
                            <>
                                {editingChatId === chat.id ? (
                                    <>
                                        <Button onClick={handleUpdateChat} color="primary">
                                            Save
                                        </Button>
                                        <Button onClick={() => setEditingChatId(null)} color="secondary">
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            onClick={() => {
                                                setEditingChatId(chat.id);
                                                setEditingChat({
                                                    time: chat.time,
                                                    message: chat.message,
                                                    sequence: chat.sequence,
                                                    is_answer: chat.is_answer,
                                                });
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteChat(chat.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                )}
                            </>
                        }
                    >
                        {editingChatId === chat.id ? (
                            <>
                                <TextField
                                    value={editingChat.time}
                                    onChange={(e) => setEditingChat({ ...editingChat, time: e.target.value })}
                                    variant="outlined"
                                    size="small"
                                />
                                <TextField
                                    value={editingChat.message}
                                    onChange={(e) => setEditingChat({ ...editingChat, message: e.target.value })}
                                    variant="outlined"
                                    size="small"
                                />
                                <TextField
                                    type="number"
                                    value={editingChat.sequence}
                                    onChange={(e) => setEditingChat({ ...editingChat, sequence: Number(e.target.value) })}
                                    variant="outlined"
                                    size="small"
                                />
                                <FormControl variant="outlined" size="small" style={{ marginLeft: '10px' }}>
                                    <InputLabel>Is Answer</InputLabel>
                                    <Select
                                        value={editingChat.is_answer}
                                        onChange={(e) => setEditingChat({ ...editingChat, is_answer: Number(e.target.value) })}
                                        label="Is Answer"
                                    >
                                        <MenuItem value={0}>No</MenuItem>
                                        <MenuItem value={1}>Yes</MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        ) : (
                            <>
                                <ListItemText
                                    primary={`Time: ${chat.time}`}
                                    secondary={`Message: ${chat.message} - Sequence: ${chat.sequence} - Is Answer: ${chat.is_answer ? 'Yes' : 'No'}`}
                                />
                            </>
                        )}
                    </ListItem>
                ))}
            </List>
        </div>
    );
};
