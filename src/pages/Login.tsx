import React, { useState } from 'react';
import {
    Avatar,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Link,
    Grid,
    Box,
    Typography,
    Container,
    CssBaseline,
    Paper,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const credentials = [
    { username: 'admin', password: '123', role: 'admin' },
    { username: 'teacher', password: '123', role: 'teacher' },
    { username: 'student', password: '123', role: 'student' },
    { username: 'parent', password: '123', role: 'parent' },
];

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        const user = credentials.find(
            (u) => u.username === username && u.password === password
        );
        if (user) {
            login(user.role);
            navigate(`/${user.role}`);
        } else {
            setError('Invalid credentials.');
        }
    };

    return (
        <Box
            sx={{
                background: 'linear-gradient(to right, #ffffff, #ffffff)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Paper
                    elevation={6}
                    sx={{
                        padding: 4,
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: '#ffffffdd',
                        backdropFilter: 'blur(6px)',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
                        Sign in
                    </Typography>
                    <Box sx={{ mt: 2, width: '100%' }}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                            sx={{ mt: 1 }}
                        />
                        {error && (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleLogin}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            Sign In
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2" underline="hover">
                                    Forgot password?
                                </Link>
                            </Grid>
                            {/*<Grid item>*/}
                            {/*    <Link href="#" variant="body2" underline="hover">*/}
                            {/*        {"Don't have an account? Sign Up"}*/}
                            {/*    </Link>*/}
                            {/*</Grid>*/}
                        </Grid>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
