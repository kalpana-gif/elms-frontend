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
            login(user.role, user.username); // Set userName and user Role
            navigate(`/${user.role}`);
        } else {
            setError('Invalid credentials.');
        }
    };

    return (
        <Box
            sx={{
                background: 'linear-gradient(to right, #ece9e6, #ffffff)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container component="main" maxWidth="sm" sx={{ width: 520 }}>
                <CssBaseline />
                <Paper
                    elevation={6}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        minHeight: 520,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Gradient Header */}
                    <Box
                        sx={{
                            background: 'linear-gradient(to right, #3f51b5, #2196f3)',
                            color: '#fff',
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ bgcolor: '#fff', color: 'primary.main', mb: 1 }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Sign in
                        </Typography>
                    </Box>

                    {/* Login Form */}
                    <Box sx={{ p: 3, flexGrow: 1 }}>
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
                        </Grid>
                    </Box>
                </Paper>
            </Container>

        </Box>
    );
}
