import { Box, Container, Typography } from "@mui/material";
import { red } from "@mui/material/colors";
import { getRooms } from "../api/api";
import { RoomEntity } from "../interface/entity";
import { useQuery } from "@tanstack/react-query";
import { useChatStore } from "../status/store";
import { useEffect } from "react";

export const LeftComponent = () => {
    const setRoomId = useChatStore((state) => state.setRoomId);

    const { isPending, error, data } = useQuery<RoomEntity[]>({
        queryKey: ["rooms"],
        queryFn: getRooms,
    });

    const handleClick = (id: number) => {
        setRoomId(id);
    };

    useEffect(() => {
        console.log(data);
    }, [data]);

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box>'An error has occurred: ' + error.message</Box>;
    return (
        <Container sx={{ bgcolor: red[50], height: "100%", width: "100%" }}>
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {data.map((v, i) => (
                    <Box
                        key={v.id}
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            bgcolor: "#f5f5f5", // Background color similar to the image
                            padding: "8px 16px",
                            borderRadius: "16px", // Rounded corners
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                            cursor: "pointer",
                            margin: "10px",
                            "&:hover": {
                                bgcolor: "#e0e0e0", // Background color on hover
                            },
                        }}
                        onClick={() => handleClick(v.id)}
                    >
                        <Typography variant="body2" color="textPrimary">
                            {v.name}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Container>
    );
};
