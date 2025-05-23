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
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { showSuccessAlert, showErrorAlert } from '../components/Alert.tsx';


const roles = ['student', 'admin', 'teacher', 'parent'];

const generatePassword = (length = 12) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
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

    const generateAndSetPassword = () => {
        const newPassword = generatePassword();
        setUser((prev) => ({ ...prev, password: newPassword }));
    };

    useEffect(() => {
        generateAndSetPassword();
    }, []); // Only runs once on initial load

    const handleChange = (field: string, value: string) => {
        setUser((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('/users', user);
            console.log('User created:', response.data);
            await showSuccessAlert('User Created', 'The user has been created successfully!');

            // Reset form with new password
            setUser({
                firstName: '',
                lastName: '',
                email: '',
                password: generatePassword(),
                phone: '',
                address: '',
                role: '',
            });
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
        user.role;

    return (
        <Box display="flex" justifyContent="center" minHeight="80vh" bgcolor="#fffff" p={2}>
            <Card sx={{ width: '100%', maxWidth: 700, borderRadius: 3, boxShadow: 6 }}>
                <Box
                    sx={{
                        background: 'linear-gradient(to right, #3f51b5, #2196f3)',
                        p: 3,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        color: 'white',
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={4}>
                        <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                            <PersonAddIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Add New User
                            </Typography>
                            <Typography variant="body2">
                                Fill in the details to register a user
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        {/* Name Section */}
                        <Box sx={{ p: 3, bgcolor: '#fffff', borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                                Name Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={7}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        variant="outlined"
                                        value={user.firstName}
                                        onChange={(e) => handleChange('firstName', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={5}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        variant="outlined"
                                        value={user.lastName}
                                        onChange={(e) => handleChange('lastName', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Contact Info Section */}
                        <Box sx={{ p: 3, bgcolor: '#fffff', borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                                Contact Information
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    variant="outlined"
                                    value={user.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    type="tel"
                                    variant="outlined"
                                    value={user.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                                <TextField
                                    fullWidth
                                    label="Address"
                                    variant="outlined"
                                    value={user.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    multiline
                                    rows={2}
                                />
                            </Stack>
                        </Box>

                        {/* Credentials Section */}
                        <Box sx={{ p: 3, bgcolor: '#fffff', borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                                Credentials
                            </Typography>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <TextField
                                        fullWidth
                                        label="Auto-Generated Password"
                                        type="text"
                                        variant="outlined"
                                        value={user.password}
                                        disabled
                                    />
                                    <Tooltip title="Regenerate Password">
                                        <IconButton onClick={generateAndSetPassword}>
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
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                        </Box>
                        <br/>
                        {/* Submit Button */}
                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                            >
                                Create User
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AddUserPage;
