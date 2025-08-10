import {
    Typography,
    Box,
    TextField,
    Button,
    Stack,
    MenuItem,
    Card,
    CardContent,
    Avatar,
    Grid,
    IconButton,
    Tooltip,
    Chip,
    InputAdornment,
    Fade,
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    Autorenew as AutorenewIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Security as SecurityIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { showSuccessAlert, showErrorAlert } from '../components/Alert.tsx';

const roles = ['student', 'admin', 'teacher', 'parent'];

const generatePassword = (length = 12) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

const AddUserPage = () => {
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: '',
    });

    const [emailError, setEmailError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const generateAndSetPassword = () => {
        const newPassword = generatePassword();
        setUser((prev) => ({ ...prev, password: newPassword }));
    };

    useEffect(() => {
        generateAndSetPassword();
    }, []);

    const handleChange = (field: string, value: string) => {
        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                setEmailError('Please enter a valid email address');
            } else {
                setEmailError('');
            }
        }

        setUser((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('/users', user);
            console.log('User created:', response.data);
            await showSuccessAlert('User Created', 'The user has been created successfully!');

            setUser({
                firstName: '',
                lastName: '',
                email: '',
                password: generatePassword(),
                phone: '',
                address: '',
                role: '',
            });
            setEmailError('');
        } catch (error) {
            console.error('Error creating user:', error);
            await showErrorAlert('Error', 'Something went wrong while creating the user!');
        }
    };

    const isFormValid =
        user.firstName &&
        user.lastName &&
        user.email &&
        user.phone &&
        user.address &&
        user.role &&
        !emailError;

    const getRoleColor = (role: string) => {
        const colors = {
            student: '#4CAF50',
            admin: '#FF9800',
            teacher: '#2196F3',
            parent: '#9C27B0'
        };
        return colors[role as keyof typeof colors] || '#757575';
    };

    return (
        <Fade in timeout={600}>
            <Box
                display="flex"
                justifyContent="center"
                minHeight="80vh"
                sx={{
                    p: 2
                }}
            >
                <Card
                    sx={{
                        width: '100%',
                        maxWidth: 880,
                        borderRadius: 4,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            p: 4,
                            color: 'white',
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                transform: 'translate(50%, -50%)',
                            }
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={3}>
                            <Avatar
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    width: 56,
                                    height: 56,
                                    border: '2px solid rgba(255,255,255,0.3)'
                                }}
                            >
                                <PersonAddIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight="700">
                                    Add New User
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                                    Fill in the details to register a new user
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        <Stack spacing={4}>
                            {/* Name Section */}
                            <Box sx={{
                                p: 3,
                                bgcolor: '#fafafa',
                                borderRadius: 3,
                                border: '1px solid #e0e0e0',
                                transition: 'all 0.3s ease',
                                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                            }}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                    <Avatar sx={{ bgcolor: '#2196F3', width: 32, height: 32 }}>
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Typography variant="h6" color="primary" fontWeight="600">
                                        Personal Details
                                    </Typography>
                                </Stack>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            variant="outlined"
                                            value={user.firstName}
                                            onChange={(e) => handleChange('firstName', e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': { borderColor: '#2196F3' },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            variant="outlined"
                                            value={user.lastName}
                                            onChange={(e) => handleChange('lastName', e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '&:hover fieldset': { borderColor: '#2196F3' },
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Contact Info Section */}
                            <Box sx={{
                                p: 3,
                                bgcolor: '#fafafa',
                                borderRadius: 3,
                                border: '1px solid #e0e0e0',
                                transition: 'all 0.3s ease',
                                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                            }}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                    <Avatar sx={{ bgcolor: '#4CAF50', width: 32, height: 32 }}>
                                        <EmailIcon fontSize="small" />
                                    </Avatar>
                                    <Typography variant="h6" color="primary" fontWeight="600">
                                        Contact Information
                                    </Typography>
                                </Stack>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        variant="outlined"
                                        value={user.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        error={!!emailError}
                                        helperText={emailError}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        type="tel"
                                        variant="outlined"
                                        value={user.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PhoneIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        variant="outlined"
                                        value={user.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        multiline
                                        rows={3}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                                                    <LocationIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Stack>
                            </Box>

                            {/* Credentials Section */}
                            <Box sx={{
                                p: 3,
                                bgcolor: '#fafafa',
                                borderRadius: 3,
                                border: '1px solid #e0e0e0',
                                transition: 'all 0.3s ease',
                                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                            }}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                    <Avatar sx={{ bgcolor: '#9C27B0', width: 32, height: 32 }}>
                                        <SecurityIcon fontSize="small" />
                                    </Avatar>
                                    <Typography variant="h6" color="primary" fontWeight="600">
                                        Security & Access
                                    </Typography>
                                </Stack>
                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <TextField
                                            fullWidth
                                            label="Auto-Generated Password"
                                            type={showPassword ? "text" : "password"}
                                            variant="outlined"
                                            value={user.password}
                                            disabled
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                            size="small"
                                                        >
                                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Tooltip title="Generate New Password" arrow>
                                            <IconButton
                                                onClick={generateAndSetPassword}
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    '&:hover': {
                                                        bgcolor: 'primary.dark',
                                                        transform: 'scale(1.05)',
                                                    },
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                <AutorenewIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Select Role"
                                        variant="outlined"
                                        value={user.role}
                                        onChange={(e) => handleChange('role', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': { borderColor: '#9C27B0' },
                                            },
                                        }}
                                    >
                                        {roles.map((role) => (
                                            <MenuItem key={role} value={role}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: getRoleColor(role)
                                                        }}
                                                    />
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </Stack>
                                            </MenuItem>
                                        ))}
                                    </TextField>

                                    {user.role && (
                                        <Fade in>
                                            <Box>
                                                <Chip
                                                    label={`Selected: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`}
                                                    sx={{
                                                        bgcolor: getRoleColor(user.role),
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        '& .MuiChip-label': { px: 2 }
                                                    }}
                                                />
                                            </Box>
                                        </Fade>
                                    )}
                                </Stack>
                            </Box>

                            {/* Submit Section */}
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{
                                    p: 3,
                                    bgcolor: isFormValid ? '#e8f5e8' : '#fff3e0',
                                    borderRadius: 3,
                                    border: `1px solid ${isFormValid ? '#4CAF50' : '#FF9800'}`,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography
                                        variant="body2"
                                        color={isFormValid ? 'success.main' : 'warning.main'}
                                        fontWeight="500"
                                    >
                                        {isFormValid ? '✓ Ready to create user' : '⚠ Please complete all fields'}
                                    </Typography>
                                </Stack>

                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid}
                                    startIcon={<PersonAddIcon />}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 3,
                                        fontWeight: '600',
                                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                                        },
                                        '&:disabled': {
                                            background: '#ccc',
                                            boxShadow: 'none',
                                            transform: 'none',
                                        },
                                    }}
                                >
                                    Create User
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Fade>
    );
};

export default AddUserPage;