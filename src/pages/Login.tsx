import React, { useState, useEffect } from 'react';
import {
    Avatar, Button, TextField, FormControlLabel, Checkbox, Link,
    Grid, Box, Typography, Container, CssBaseline, Paper,
    IconButton, InputAdornment, Fade, Slide, Alert,
    CircularProgress, Divider, Card, CardContent,
    useTheme, useMediaQuery, Collapse, LinearProgress
} from '@mui/material';
import {
    LockOutlined as LockOutlinedIcon,
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    AdminPanelSettings as AdminIcon,
    SupervisorAccount as SupervisorIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    ArrowForward as ArrowForwardIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axios from '../api/axiosConfig';

export default function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // UI states
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [formTouched, setFormTouched] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check for remembered credentials
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return 'Email is required';
        }
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const validatePassword = (password) => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 2) {
            return 'Password must be at least 6 characters';
        }
        return '';
    };

    // Real-time validation
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setFormTouched(true);
        if (value) {
            setEmailError(validateEmail(value));
        } else {
            setEmailError('');
        }
        if (error) setError('');
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setFormTouched(true);
        if (value) {
            setPasswordError(validatePassword(value));
        } else {
            setPasswordError('');
        }
        if (error) setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validate form
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);

        setEmailError(emailErr);
        setPasswordError(passwordErr);

        if (emailErr || passwordErr) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('Logging in with:', { email, password });

            const response = await axios.post('/login', {
                email,
                password,
            });

            const { uid, role, email: returnedEmail } = response.data;

            // Store teacher-specific data if needed
            if (role === 'teacher') {
                localStorage.setItem('teacherId', uid);
                localStorage.setItem('teacherEmail', returnedEmail);
            }

            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // Show success message
            setSuccess('Login successful! Redirecting...');

            // Store auth data
            login(uid, role, returnedEmail);

            // Delayed navigation for better UX
            setTimeout(() => {
                navigate(`/${role}`);
            }, 1500);

        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'student': return <PersonIcon />;
            case 'teacher': return <SchoolIcon />;
            case 'admin': return <AdminIcon />;
            case 'principal': return <SupervisorIcon />;
            default: return <PersonIcon />;
        }
    };

    const isFormValid = email && password && !emailError && !passwordError;

    return (
        <Box
            sx={{
                backgroundColor: '#ffffff', // changed from gradient to solid white
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    animation: 'float 20s ease-in-out infinite'
                }
            }}
        >

        <CssBaseline />

            <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Fade in={mounted} timeout={800}>
                    <Paper
                        elevation={20}
                        sx={{
                            borderRadius: 4,
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)',
                            background: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            minHeight: isMobile ? '80vh' : 600,
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {loading && <LinearProgress />}

                        {/* Header Section */}
                        <Slide direction="down" in={mounted} timeout={1000}>
                            <Box sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                p: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0,0,0,0.1)',
                                }
                            }}>
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <center><Avatar sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: '#fff',
                                        mb: 2,
                                        width: 60,
                                        height: 60,
                                        backdropFilter: 'blur(10px)',
                                        border: '2px solid rgba(255,255,255,0.3)'
                                    }}>
                                        <LockOutlinedIcon sx={{ fontSize: 28 }} />
                                    </Avatar></center>
                                    <Typography variant="h4" sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        textAlign: 'center'
                                    }}>
                                        Welcome Back
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        opacity: 0.9,
                                        textAlign: 'center'
                                    }}>
                                        Sign in to access your account
                                    </Typography>
                                </Box>
                            </Box>
                        </Slide>

                        {/* Form Section */}
                        <Box component="form" onSubmit={handleLogin} sx={{ p: 4, flexGrow: 1 }}>
                            <Slide direction="up" in={mounted} timeout={1200}>
                                <Box>
                                    {/* Success/Error Messages */}
                                    <Collapse in={!!success}>
                                        <Alert
                                            severity="success"
                                            icon={<CheckCircleIcon />}
                                            sx={{ mb: 2, borderRadius: 2 }}
                                        >
                                            {success}
                                        </Alert>
                                    </Collapse>

                                    <Collapse in={!!error}>
                                        <Alert
                                            severity="error"
                                            icon={<ErrorIcon />}
                                            sx={{ mb: 2, borderRadius: 2 }}
                                        >
                                            {error}
                                        </Alert>
                                    </Collapse>

                                    {/* Email Field */}
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        error={!!emailError}
                                        helperText={emailError}
                                        margin="normal"
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon color={emailError ? 'error' : 'action'} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                },
                                                '&.Mui-focused': {
                                                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                                                }
                                            }
                                        }}
                                    />

                                    {/* Password Field */}
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        error={!!passwordError}
                                        helperText={passwordError}
                                        margin="normal"
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color={passwordError ? 'error' : 'action'} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={togglePasswordVisibility}
                                                        edge="end"
                                                        disabled={loading}
                                                        sx={{
                                                            transition: 'transform 0.2s ease',
                                                            '&:hover': { transform: 'scale(1.1)' }
                                                        }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                },
                                                '&.Mui-focused': {
                                                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                                                }
                                            }
                                        }}
                                    />

                                    {/* Remember Me */}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                color="primary"
                                                disabled={loading}
                                            />
                                        }
                                        label="Remember me"
                                        sx={{ mt: 2, mb: 1 }}
                                    />

                                    {/* Login Button */}
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        type="submit"
                                        disabled={loading || !isFormValid}
                                        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                                        sx={{
                                            mt: 3,
                                            mb: 3,
                                            py: 1.5,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            fontSize: '1.1rem',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                                                transform: 'translateY(-2px)'
                                            },
                                            '&:disabled': {
                                                background: '#e0e0e0',
                                                transform: 'none'
                                            }
                                        }}
                                    >
                                        {loading ? 'Signing In...' : 'Sign In'}
                                    </Button>

                                    {/*<Divider sx={{ my: 2 }}>*/}
                                    {/*    <Typography variant="body2" color="text.secondary">*/}
                                    {/*        OR*/}
                                    {/*    </Typography>*/}
                                    {/*</Divider>*/}

                                    {/* Demo Accounts */}
                                    {/*<Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>*/}
                                    {/*    <CardContent sx={{ p: 2 }}>*/}
                                    {/*        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>*/}
                                    {/*            <SecurityIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />*/}
                                    {/*            <Typography variant="subtitle2" fontWeight="600">*/}
                                    {/*                Demo Accounts*/}
                                    {/*            </Typography>*/}
                                    {/*        </Box>*/}
                                    {/*        <Typography variant="caption" color="text.secondary" display="block" mb={1}>*/}
                                    {/*            Use these credentials for testing:*/}
                                    {/*        </Typography>*/}
                                    {/*        <Grid container spacing={1}>*/}
                                    {/*            <Grid item xs={6}>*/}
                                    {/*                <Button*/}
                                    {/*                    size="small"*/}
                                    {/*                    variant="outlined"*/}
                                    {/*                    fullWidth*/}
                                    {/*                    startIcon={<PersonIcon />}*/}
                                    {/*                    onClick={() => {*/}
                                    {/*                        setEmail('student@demo.com');*/}
                                    {/*                        setPassword('demo123');*/}
                                    {/*                    }}*/}
                                    {/*                    disabled={loading}*/}
                                    {/*                    sx={{ textTransform: 'none', borderRadius: 1 }}*/}
                                    {/*                >*/}
                                    {/*                    Student*/}
                                    {/*                </Button>*/}
                                    {/*            </Grid>*/}
                                    {/*            <Grid item xs={6}>*/}
                                    {/*                <Button*/}
                                    {/*                    size="small"*/}
                                    {/*                    variant="outlined"*/}
                                    {/*                    fullWidth*/}
                                    {/*                    startIcon={<SchoolIcon />}*/}
                                    {/*                    onClick={() => {*/}
                                    {/*                        setEmail('teacher@demo.com');*/}
                                    {/*                        setPassword('demo123');*/}
                                    {/*                    }}*/}
                                    {/*                    disabled={loading}*/}
                                    {/*                    sx={{ textTransform: 'none', borderRadius: 1 }}*/}
                                    {/*                >*/}
                                    {/*                    Teacher*/}
                                    {/*                </Button>*/}
                                    {/*            </Grid>*/}
                                    {/*        </Grid>*/}
                                    {/*    </CardContent>*/}
                                    {/*</Card>*/}

                                    {/* Footer Links */}
                                    {/*<Grid container spacing={2}>*/}
                                    {/*    <Grid item xs={6}>*/}
                                    {/*        <Link*/}
                                    {/*            href="#"*/}
                                    {/*            variant="body2"*/}
                                    {/*            underline="hover"*/}
                                    {/*            sx={{*/}
                                    {/*                transition: 'color 0.2s ease',*/}
                                    {/*                '&:hover': { color: 'primary.main' }*/}
                                    {/*            }}*/}
                                    {/*        >*/}
                                    {/*            Forgot password?*/}
                                    {/*        </Link>*/}
                                    {/*    </Grid>*/}
                                    {/*    <Grid item xs={6} textAlign="right">*/}
                                    {/*        <Link*/}
                                    {/*            href="#"*/}
                                    {/*            variant="body2"*/}
                                    {/*            underline="hover"*/}
                                    {/*            sx={{*/}
                                    {/*                transition: 'color 0.2s ease',*/}
                                    {/*                '&:hover': { color: 'primary.main' }*/}
                                    {/*            }}*/}
                                    {/*        >*/}
                                    {/*            Need help?*/}
                                    {/*        </Link>*/}
                                    {/*    </Grid>*/}
                                    {/*</Grid>*/}
                                </Box>
                            </Slide>
                        </Box>
                    </Paper>
                </Fade>
            </Container>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(1deg); }
                    66% { transform: translateY(-5px) rotate(-1deg); }
                }
            `}</style>
        </Box>
    );
}