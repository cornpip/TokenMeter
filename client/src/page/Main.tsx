import { Container } from '@mui/material';
import { blue } from '@mui/material/colors';
import { LeftComponent } from '../components/LeftComponent';
import { ChatComponent } from '../components/ChatComponent';
import Grid from '@mui/material/Grid2';

export const Main = () => {
    return (
        <>
            <Container maxWidth="xl" sx={{ bgcolor: blue[50], width: '98vw', height: '98vh', paddingTop: 1, paddingBottom: 3 }}>
                <Grid container spacing={2} sx={{ height: '100%', width: '100%' }}>
                    <Grid size={{ xs: 3 }} sx={{ height: '100%' }}>
                        <LeftComponent />
                    </Grid>
                    <Grid size={{ xs: 9 }} sx={{ height: '100%' }}>
                        <ChatComponent />
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};
