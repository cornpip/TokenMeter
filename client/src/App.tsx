import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Main } from "./page/Main";
import { Test } from "./page/Test";
import { Test2 } from "./page/Test2";
import { Chat } from "./page/Chat";
import { Room } from "./page/Room";
import { Manage } from "./page/Manage";
import { Config } from "./page/Config";

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/main/:roomId" element={<Main />} />
                <Route path="/main" element={<Main />} />
                <Route path="/manage" element={<Manage />} />
                <Route path="/test" element={<Test />} />
                <Route path="/test2" element={<Test2 />} />
                <Route path="/chat/:roomId" element={<Chat />} />
                <Route path="/room" element={<Room />} />
                <Route path="/config" element={<Config />} />
                <Route path="*" element={<Navigate to="/main" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
