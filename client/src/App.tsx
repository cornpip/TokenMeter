import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Main } from './page/Main';
import { Test } from './page/Test';
import { Test2 } from './page/Test2';
import { Login } from './page/Login';
import { Chat } from './page/Chat';
import { Room } from './page/Room';

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/main" element={<Main />} />
                <Route path="/login" element={<Login />} />
                <Route path="/test" element={<Test />} />
                <Route path="/test2" element={<Test2 />} />
                <Route path="/chat/:roomId" element={<Chat />} />
                <Route path="/room" element={<Room />} />
            </Routes>
        </BrowserRouter>
    );
};
