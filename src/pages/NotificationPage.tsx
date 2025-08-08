import {
    Typography,
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Paper,
    CircularProgress
} from '@mui/material';
import { useState } from 'react';
import axios from 'axios';

const NotificationPage = ({ onNotificationCreated }) => {
    const [formData, setFormData] = useState({
        message: '',
        targetRole: 'Student',
        priority: 'normal'
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.message.trim()) {
            setError('Message is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const payload = {
                message: formData.message.trim(),
                targetRole: formData.targetRole,
                priority: formData.priority,
                createdAt: new Date().toISOString()
            };

            const res = await axios.post('/api/notifications', payload);

            setSuccess('Notification created successfully!');

            // Reset form
            setFormData({
                message: '',
                targetRole: 'Student',
                priority: 'normal'
            });

            // Callback to parent component if provided
            if (onNotificationCreated) {
                onNotificationCreated(res.data);
            }

        } catch (err) {
            console.error('Failed to create notification', err);
            setError(
                err.response?.data?.message ||
                'Failed to create notification. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    return (
        <Paper elevation={2} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Create New Notification
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={clearMessages}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={clearMessages}>
                    {success}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notification Message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your notification message here..."
                    variant="outlined"
                    sx={{ mb: 3 }}
                    disabled={loading}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Target Role</InputLabel>
                    <Select
                        name="targetRole"
                        value={formData.targetRole}
                        onChange={handleInputChange}
                        label="Target Role"
                        disabled={loading}
                    >
                        <MenuItem value="Student">Student</MenuItem>
                        <MenuItem value="Teacher">Teacher</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="All">All Users</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        label="Priority"
                        disabled={loading}
                    >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="normal">Normal</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading || !formData.message.trim()}
                    sx={{ py: 1.5 }}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Creating...
                        </>
                    ) : (
                        'Create Notification'
                    )}
                </Button>
            </Box>
        </Paper>
    );
};

export default NotificationPage;