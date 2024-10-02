import { Box, Button, Container, Input, Paper, TextField, Typography } from '@mui/material';
import { blue, purple } from '@mui/material/colors';
import React from 'react';

export const Login = () => {
    const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            console.log(e.target.files);
        }
    };

    return (
        <>
            <Container maxWidth="xl" sx={{ bgcolor: blue[50], width: '100vw', height: '100vh', display: 'flex', alignItems: 'center' }}>
                <Container maxWidth="xs">
                    <Paper elevation={3} sx={{ padding: 3, marginTop: 8 }}>
                        <Typography variant="h5" component="h1" gutterBottom>
                            Login
                        </Typography>
                        <Box component="form" noValidate autoComplete="off">
                            <TextField fullWidth label="openai-api-key" margin="normal" variant="outlined" required />
                            <Box mt={2}>
                                <Input
                                    id="folder-selector"
                                    type="file"
                                    inputProps={{ webkitdirectory: 'webkitdirectory' }}
                                    onChange={handleFolderChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="folder-selector">
                                    <Button fullWidth variant="outlined" component="span" sx={{ textTransform: 'none' }}>
                                        Select Your Data
                                    </Button>
                                </label>
                            </Box>
                            <Box mt={2}>
                                <Button type="submit" fullWidth variant="contained" color="primary">
                                    Login
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Container>
        </>
    );
};
