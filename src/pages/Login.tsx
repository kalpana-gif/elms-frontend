import React, { useState } from 'react';
import {
    Avatar, Button, TextField, FormControlLabel, Checkbox, Link,
    Grid, Box, Typography, Container, CssBaseline, Paper
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axios from '../api/axiosConfig';

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            console.log('Logging in with:', { email, password });

            const response = await axios.post('/login', {
                email,
                password,
            });

            const { uid, role, email: returnedEmail } = response.data;
            if (role === 'teacher') {
                localStorage.setItem('teacherId', uid);
                localStorage.setItem('teacherEmail', returnedEmail); // optional
            }

            login(uid, role, returnedEmail);

            navigate(`/${role}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed.');
        }
    };

    return (
        <Box sx={{ background: 'linear-gradient(to right, #ece9e6, #ffffff)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Container component="main" maxWidth="sm" sx={{ width: 520 }}>
                <CssBaseline />
                <Paper elevation={6} sx={{ borderRadius: 2, overflow: 'hidden', minHeight: 520, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ background: 'linear-gradient(to right, #3f51b5, #2196f3)', color: '#fff', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#fff', color: 'primary.main', mb: 1 }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Sign in
                        </Typography>
                    </Box>

                    <Box sx={{ p: 3, flexGrow: 1 }}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" sx={{ mt: 1 }} />
                        {error && <Typography variant="body2" color="error" sx={{ mt: 1 }}>{error}</Typography>}
                        <Button fullWidth variant="contained" onClick={handleLogin} sx={{ mt: 3, mb: 2, py: 1.2, fontWeight: 600, textTransform: 'none' }}>
                            Sign In
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2" underline="hover">Forgot password?</Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
