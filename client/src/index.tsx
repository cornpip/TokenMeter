import ReactDOM from "react-dom/client";
import { App } from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@emotion/react";
import theme from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const queryClient = new QueryClient();

async function prepareApp() {
    if (import.meta.env.VITE_DEV_MODE === "2") {
        const { worker } = await import("./mock/browser");
        await worker.start();
    }
}

prepareApp().then(() => {
    root.render(
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <App />
            </ThemeProvider>
        </QueryClientProvider>
    );
});
