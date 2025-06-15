import { Container } from "@mui/material";
import { ImageSegmentationUploader } from "../components/Image/ImageSegmentationUploader";

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
            <ImageSegmentationUploader />
        </Container>
    );
};
