import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    age: number;
}

export const Test2 = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [age, setAge] = useState<number>(0);

    // Read: 유저 목록 가져오기
    useEffect(() => {
        axios
            .get<User[]>('http://localhost:4000/users')
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.error('There was an error!', error);
            });
    }, []);

    // Create: 유저 추가
    const addUser = () => {
        axios
            .post('http://localhost:4000/users', { name, age })
            .then((response) => {
                setUsers([...users, { id: response.data.id, name, age }]);
                setName('');
                setAge(0);
            })
            .catch((error) => {
                console.error('There was an error!', error);
            });
    };

    // Update: 유저 수정
    const updateUser = (id: number) => {
        const updatedName = prompt('Enter new name:');
        const updatedAge = Number(prompt('Enter new age:'));
        axios
            .put(`http://localhost:4000/users/${id}`, { name: updatedName, age: updatedAge })
            .then(() => {
                // setUsers(users.map((user) => (user.id === id ? { ...user, name: updatedName, age: updatedAge } : user)))
            })
            .catch((error) => {
                console.error('There was an error!', error);
            });
    };

    // Delete: 유저 삭제
    const deleteUser = (id: number) => {
        axios
            .delete(`http://localhost:4000/users/${id}`)
            .then(() => {
                setUsers(users.filter((user) => user.id !== id));
            })
            .catch((error) => {
                console.error('There was an error!', error);
            });
    };

    return (
        <div>
            <h1>User List</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.name} ({user.age})<button onClick={() => updateUser(user.id)}>Edit</button>
                        <button onClick={() => deleteUser(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            <h2>Add User</h2>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} placeholder="Age" />
            <button onClick={addUser}>Add User</button>
        </div>
    );
};
