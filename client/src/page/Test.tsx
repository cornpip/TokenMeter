import { Container } from "@mui/material";
import { CreateImageEdit } from "../components/Image/CreateImageEdit";

export const Test = () => {
    return (
        <Container
            maxWidth="lg"
            sx={{
                paddingY: 4,
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <CreateImageEdit />
        </Container>
    );
};
