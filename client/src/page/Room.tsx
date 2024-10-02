import { Button, TextField, List, ListItem, ListItemText, IconButton, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { getRooms, createRoom, updateRoom, deleteRoom, getRoomsBefore } from '../api/api';
import { useEffect, useState } from 'react'
import { RoomEntity } from '../interface/entity';

export const Room = () => {
    const [rooms, setRooms] = useState<RoomEntity[]>([])
    const [newRoomName, setNewRoomName] = useState<string>('')
    const [editingRoomId, setEditingRoomId] = useState<number | null>(null)
    const [editingRoomName, setEditingRoomName] = useState<string>('')

    useEffect(() => {
        fetchRooms()
    }, [])

    const fetchRooms = async () => {
        try {
            const response = await getRoomsBefore();
            setRooms(response.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreateRoom = async () => {
        if (newRoomName) {
            try {
                await createRoom(newRoomName)
                setNewRoomName('')
                fetchRooms()
            } catch (error) {
                console.error(error)
            }
        }
    }

    const handleUpdateRoom = async () => {
        if (editingRoomId !== null && editingRoomName) {
            try {
                await updateRoom(editingRoomId, editingRoomName)
                setEditingRoomId(null)
                setEditingRoomName('')
                fetchRooms()
            } catch (error) {
                console.error(error)
            }
        }
    }

    const handleDeleteRoom = async (id: number) => {
        try {
            await deleteRoom(id)
            fetchRooms()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Rooms
            </Typography>
            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="New Room Name"
                    variant="outlined"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <Button variant="contained" color="primary" onClick={handleCreateRoom}>
                    Add Room
                </Button>
            </div>
            <List>
                {rooms.map((room) => (
                    <ListItem
                        key={room.id}
                        secondaryAction={
                            <>
                                {editingRoomId === room.id ? (
                                    <>
                                        <Button onClick={handleUpdateRoom} color="primary">
                                            Save
                                        </Button>
                                        <Button onClick={() => setEditingRoomId(null)} color="secondary">
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            onClick={() => {
                                                setEditingRoomId(room.id)
                                                setEditingRoomName(room.name)
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteRoom(room.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                )}
                            </>
                        }
                    >
                        {editingRoomId === room.id ? (
                            <TextField value={editingRoomName} onChange={(e) => setEditingRoomName(e.target.value)} variant="outlined" size="small" />
                        ) : (
                            <ListItemText primary={room.name} />
                        )}
                    </ListItem>
                ))}
            </List>
        </div>
    )
}
