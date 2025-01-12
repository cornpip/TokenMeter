import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Main } from "./page/Main";
import { Config } from "./page/Config";
import { ImageTest } from "./page/ImageTest";

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/main/:roomId" element={<Main />} />
                <Route path="/main" element={<Main />} />
                <Route path="/config" element={<Config />} />
                <Route path="/image" element={<ImageTest />} />
                <Route path="*" element={<Navigate to="/main" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
