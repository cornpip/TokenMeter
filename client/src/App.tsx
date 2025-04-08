import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Main } from "./page/Main";
import { Config } from "./page/Config";
import { ImageTest } from "./page/ImageTest";
import { CONFIG_URL, IMAGE_URL, MAIN_URL } from "./constants/path.const";

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={`${MAIN_URL}/:roomId`} element={<Main />} />
                <Route path={MAIN_URL} element={<Main />} />
                <Route path={CONFIG_URL} element={<Config />} />
                <Route path={IMAGE_URL} element={<ImageTest />} />
                <Route path="*" element={<Navigate to={MAIN_URL} replace />} />
            </Routes>
        </BrowserRouter>
    );
};
