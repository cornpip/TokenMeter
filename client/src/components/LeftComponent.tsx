import { Box, Container, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { deleteRoom, getRooms } from "../api/api";
import { RoomEntity } from "../interface/entity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { RoomDeleteResDto } from "../interface/dto";
import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useLeftCompOpenStore } from "../status/store";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";

// RoomItem 컴포넌트의 prop 타입 정의
interface RoomItemProps {
    roomData: RoomEntity; // 각 방의 데이터
    selectedItemId: number | null; // 선택된 항목의 ID
    hoveredItemId: number | null; // 현재 호버 중인 항목의 ID
    safeRoomId: string; // 안전 룸의 ID (스트링인 이유: component에서 string을 사용하고 있기 때문)
    onMouseEnter: () => void; // 마우스 엔터 핸들러
    onMouseLeave: () => void; // 마우스 리브 핸들러
    onClick: () => void; // 클릭 핸들러
    onIconButtonClick: (event: React.MouseEvent<HTMLButtonElement>, id: number) => void; // 아이콘 버튼 클릭 핸들러
}

const RoomItem: React.FC<RoomItemProps> = ({
    roomData,
    selectedItemId,
    hoveredItemId,
    safeRoomId,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onIconButtonClick,
}) => {
    // Hover 조건 추가: 메뉴가 열려 있는지 확인하기 위해 selectedItemId 조건 추가
    /**
     * 상태가 3개임
     * hoverId, moreBtnSelectedId, selectedRoomId
     */
    const isHoveredOrSelected =
        hoveredItemId === roomData.id || selectedItemId === roomData.id || parseInt(safeRoomId) === roomData.id;

    return (
        <Box
            sx={{
                minWidth: "100px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 16px",
                borderRadius: "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                cursor: "pointer",
                margin: "10px",
                backgroundColor: isHoveredOrSelected ? "#e0e0e0" : "#f5f5f5",
                "&:hover": { bgcolor: "#e0e0e0" },
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            <Typography variant="body2" color="textPrimary">
                {roomData.name}
            </Typography>
            {isHoveredOrSelected && (
                <IconButton
                    sx={{ padding: 0, margin: 0 }}
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onIconButtonClick(e, roomData.id);
                    }}
                >
                    <MoreVertIcon sx={{ fontSize: "inherit" }} />
                </IconButton>
            )}
        </Box>
    );
};

export const LeftComponent = () => {
    const navigate = useNavigate();
    const { roomId } = useParams<{ roomId: string }>();
    const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null); //anchor
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null); //moreBtnSelected
    const isOpen = useLeftCompOpenStore((state) => state.isOpen);
    const setIsOpen = useLeftCompOpenStore((state) => state.setIsOpen);

    const queryClient = useQueryClient();
    const safeRoomId = roomId ?? "0";
    const { isPending, error, data } = useQuery<RoomEntity[]>({
        queryKey: ["rooms"],
        queryFn: getRooms,
    });

    const deleteRoomMutation = useMutation({
        mutationFn: (id: number) => {
            return deleteRoom(id);
        },
        onSuccess: (data, variables, context) => {
            let d: RoomDeleteResDto = data.data;
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            queryClient.invalidateQueries({ queryKey: ["room", d.deletedId] });
        },
    });

    const handleRoomClick = (id: number) => {
        if (id !== selectedItemId) {
            setSelectedItemId(id);
            navigate(`/main/${id}`);
        }
    };

    const handleMouseEnter = (id: number) => {
        setHoveredItemId(id);
    };

    const handleMouseLeave = () => {
        setHoveredItemId(null);
    };
    const handleIconButtonClick = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setSelectedItemId(id);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedItemId(null);
    };

    const handleDeleteOption = () => {
        alert("Are you sure you want to delete this?");
        if (selectedItemId) {
            deleteRoomMutation.mutate(selectedItemId);
        }
        handleMenuClose();
    };

    const handleOpenToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleNewChat = () => {
        setSelectedItemId(null);
        navigate("/main");
    };

    useEffect(() => {
        if (safeRoomId) {
            setSelectedItemId(parseInt(safeRoomId));
        }
    }, []);

    if (isPending) return <Box>'Loading...'</Box>;
    if (error) return <Box>'An error has occurred: ' + error.message</Box>;
    return (
        <Container
            disableGutters={true}
            sx={{
                padding: 1,
                bgcolor: "#E7EBEF",
                height: "100%",
                width: "100%",
                overflowY: "auto",
                overflowX: "auto",
                maxHeight: "100%",
                // 스크롤바 스타일
                "&::-webkit-scrollbar": {
                    width: "8px", // 세로 스크롤바의 너비
                },
                "&::-webkit-scrollbar-track": {
                    background: "#E7EBEF", // 스크롤바 배경 색상
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888", // 스크롤바 색상
                    borderRadius: "10px", // 둥글게 만들기
                },
                "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#555", // 마우스를 올렸을 때 색상 변화
                },
                scrollbarWidth: "thin",
                scrollbarColor: "#888 #E7EBEF",
            }}
        >
            <Box
                sx={{
                    padding: 1,
                    color: "black",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #ccc",
                }}
            >
                <IconButton edge="start" color="inherit" onClick={handleOpenToggle}>
                    {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
                <Box>
                    <IconButton
                        color="inherit"
                        onClick={() => {
                            navigate("/image");
                        }}
                    >
                        <InsertPhotoIcon />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleNewChat}>
                        <EditIcon />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {data.map((v, i) => (
                    <RoomItem
                        key={v.id}
                        roomData={v}
                        selectedItemId={selectedItemId}
                        hoveredItemId={hoveredItemId}
                        safeRoomId={safeRoomId}
                        onMouseEnter={() => handleMouseEnter(v.id)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleRoomClick(v.id)}
                        onIconButtonClick={handleIconButtonClick}
                    />
                ))}
                <Menu
                    anchorEl={menuAnchorEl}
                    closeAfterTransition={true} //false로 하면 pick한데 다른데를 누를 때 뜨고, true하면 pick한데를 누를 때 한 번 뜨네
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                    }}
                >
                    <MenuItem onClick={() => handleDeleteOption()}>Delete</MenuItem>
                </Menu>
            </Box>
        </Container>
    );
};
