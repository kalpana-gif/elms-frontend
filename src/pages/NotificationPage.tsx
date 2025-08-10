import {
    Typography,
    Box,
    TextField,
    Button,
    FormControl,
    Select,
    MenuItem,
    Paper,
    CircularProgress,
    Card,
    CardContent,
    CardActions,
    Snackbar,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Chip,
    Divider,
    Stack,
    Fade,
    Slide,
    Tooltip,
    Badge,
    Container,
    Grid,
    alpha,
    useTheme
} from '@mui/material';
import {
    Edit,
    Delete,
    Notifications as NotificationsIcon,
    Add as AddIcon,
    School as SchoolIcon,
    SupervisorAccount as TeacherIcon,
    FamilyRestroom as GuardianIcon,
    Groups as AllUsersIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    Cancel as CancelIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { useAuthStore } from '../store/useAuthStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Notification {
    id: string;
    title: string;
    message: string;
    targetRole: string;
    createdAt: string;
    createdById: string;
    createdBy: {
        firstName: string;
        lastName: string;
    };
}

const NotificationPage: React.FC = () => {
    const theme = useTheme();
    const [formData, setFormData] = useState({ title: '', message: '', targetRole: 'all' });
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const uid = useAuthStore((state) => state.uid);
    const role = useAuthStore((state) => state.role);

    // Check if user can create notifications (admin or teacher only)
    const canCreateNotifications = role === 'admin' || role === 'teacher';

    const resetForm = () => {
        setFormData({ title: '', message: '', targetRole: 'all' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleError = (msg: string) => setStatus({ type: 'error', message: msg });
    const handleSuccess = (msg: string) => setStatus({ type: 'success', message: msg });

    const fetchNotifications = async () => {
        if (!uid || !role) {
            handleError('Please log in to view notifications');
            setNotifications([]);
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.get('/notifications/alert', { params: { role, id: uid } });
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err: any) {
            handleError(err.response?.data?.error || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (uid && role) fetchNotifications();
        else setNotifications([]);
    }, [uid, role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uid) return handleError('Please log in to perform this action');
        if (!canCreateNotifications) return handleError('Only admins and teachers can create notifications');
        if (!formData.title.trim() || !formData.message.trim())
            return handleError('Title and message are required');

        try {
            setLoading(true);
            const payload = { ...formData, createdBy: uid };
            if (editingId) {
                await axios.put(`notifications/alert/${editingId}`, payload);
                handleSuccess('Notification updated successfully!');
            } else {
                await axios.post('notifications/alert', payload);
                handleSuccess('Notification created successfully!');
            }
            resetForm();
            fetchNotifications();
        } catch (err: any) {
            handleError(err.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId || !uid) return;
        try {
            setLoading(true);
            await axios.delete(`notifications/alert/${deleteId}`, { params: { createdBy: uid } });
            handleSuccess('Notification deleted successfully!');
            fetchNotifications();
        } catch (err: any) {
            handleError(err.response?.data?.error || 'Failed to delete notification');
        } finally {
            setDeleteId(null);
            setLoading(false);
        }
    };

    const getRoleIcon = (targetRole: string) => {
        switch (targetRole) {
            case 'student': return <SchoolIcon fontSize="small" />;
            case 'teacher': return <TeacherIcon fontSize="small" />;
            case 'guardian': return <GuardianIcon fontSize="small" />;
            case 'admin': return <AdminIcon fontSize="small" />;
            default: return <AllUsersIcon fontSize="small" />;
        }
    };

    const getRoleColor = (targetRole: string) => {
        switch (targetRole) {
            case 'student': return 'primary';
            case 'teacher': return 'secondary';
            case 'guardian': return 'success';
            case 'admin': return 'error';
            default: return 'default';
        }
    };

    const handleEditClick = (notification: Notification) => {
        setEditingId(notification.id);
        setFormData({
            title: notification.title,
            message: notification.message,
            targetRole: notification.targetRole
        });
        setShowForm(true);
    };

    return (
        <Container maxWidth="2xl" sx={{ py: 4 }}>
            {/* Enhanced Header */}
            <Paper
                elevation={0}
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/svg%3E")',
                    }
                }}
            >
                <Box sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <Avatar
                                sx={{
                                    bgcolor: alpha(theme.palette.common.white, 0.15),
                                    color: 'white',
                                    width: 64,
                                    height: 64,
                                    backdropFilter: 'blur(10px)',
                                    border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                                }}
                            >
                                <NotificationsIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
                                Notification Center
                            </Typography>
                            <Typography variant="body1" sx={{ color: alpha(theme.palette.common.white, 0.9), mb: 1 }}>
                                Stay connected with important updates and announcements
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                    label={`Role: ${role?.toUpperCase()}`}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha(theme.palette.common.white, 0.2),
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                />
                                {canCreateNotifications && (
                                    <Chip
                                        label="Can Create Notifications"
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(theme.palette.success.main, 0.8),
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                )}
                            </Stack>
                        </Grid>
                        {canCreateNotifications && !showForm && (
                            <Grid item>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AddIcon />}
                                    onClick={() => setShowForm(true)}
                                    sx={{
                                        bgcolor: alpha(theme.palette.common.white, 0.15),
                                        color: 'white',
                                        backdropFilter: 'blur(10px)',
                                        border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.common.white, 0.25),
                                        }
                                    }}
                                >
                                    Create Notification
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Paper>

            {/* Enhanced Form Section */}
            {canCreateNotifications && (
                <Slide direction="up" in={showForm} mountOnEnter unmountOnExit>
                    <Paper
                        elevation={8}
                        sx={{
                            mt: 3,
                            borderRadius: 3,
                            background: alpha(theme.palette.background.paper, 0.95),
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                    >
                        <Box sx={{ p: 3 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                        {editingId ? <Edit /> : <AddIcon />}
                                    </Avatar>
                                    <Typography variant="h5" fontWeight="600">
                                        {editingId ? 'Edit Notification' : 'Create New Notification'}
                                    </Typography>
                                </Stack>
                                <IconButton onClick={resetForm} size="large">
                                    <CancelIcon />
                                </IconButton>
                            </Stack>

                            <Box component="form" onSubmit={handleSubmit}>
                                <Grid container spacing={8}>
                                    {/* Left Column - Title and Target Audience */}
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={4}>
                                            {/* Title Field */}
                                            <Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="600"
                                                    color="text.primary"
                                                    sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            bgcolor: theme.palette.primary.main,
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                    Notification Title
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                                                    disabled={loading}
                                                    variant="outlined"
                                                    placeholder="Enter notification title..."
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 3,
                                                            height: 56,
                                                            fontSize: '1rem',
                                                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                                                }
                                                            },
                                                            '&.Mui-focused': {
                                                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderWidth: 2,
                                                                    borderColor: theme.palette.primary.main,
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {/* Target Audience Field */}
                                            <Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="600"
                                                    color="text.primary"
                                                    sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            bgcolor: theme.palette.success.main,
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                    Target Audience
                                                </Typography>
                                                <FormControl fullWidth>
                                                    <Select
                                                        name="targetRole"
                                                        value={formData.targetRole}
                                                        onChange={(e) => setFormData((p) => ({ ...p, targetRole: e.target.value }))}
                                                        disabled={loading}
                                                        displayEmpty
                                                        sx={{
                                                            borderRadius: 3,
                                                            height: 56,
                                                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                                                            fontSize: '1rem',
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                bgcolor: alpha(theme.palette.success.main, 0.02),
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: alpha(theme.palette.success.main, 0.3),
                                                                }
                                                            },
                                                            '&.Mui-focused': {
                                                                bgcolor: alpha(theme.palette.success.main, 0.02),
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderWidth: 2,
                                                                    borderColor: theme.palette.success.main,
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <MenuItem value="all">
                                                            <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
                                                                <Avatar
                                                                    sx={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        bgcolor: alpha(theme.palette.info.main, 0.1),
                                                                        color: theme.palette.info.main
                                                                    }}
                                                                >
                                                                    <AllUsersIcon fontSize="small" />
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight="500">All Users</Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                        <MenuItem value="student">
                                                            <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
                                                                <Avatar
                                                                    sx={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                        color: theme.palette.primary.main
                                                                    }}
                                                                >
                                                                    <SchoolIcon fontSize="small" />
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight="500">Students</Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                        <MenuItem value="teacher">
                                                            <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
                                                                <Avatar
                                                                    sx={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                                                        color: theme.palette.secondary.main
                                                                    }}
                                                                >
                                                                    <TeacherIcon fontSize="small" />
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight="500">Teachers</Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                        <MenuItem value="guardian">
                                                            <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
                                                                <Avatar
                                                                    sx={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                                                        color: theme.palette.success.main
                                                                    }}
                                                                >
                                                                    <GuardianIcon fontSize="small" />
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight="500">Guardians</Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                        <MenuItem value="admin">
                                                            <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
                                                                <Avatar
                                                                    sx={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                                                        color: theme.palette.error.main
                                                                    }}
                                                                >
                                                                    <AdminIcon fontSize="small" />
                                                                </Avatar>
                                                                <Typography variant="body2" fontWeight="500">Administrators</Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </Stack>
                                    </Grid>

                                    {/* Right Column - Message */}
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ height: '100%' }}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="600"
                                                color="text.primary"
                                                sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        bgcolor: theme.palette.secondary.main,
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                                Message Content
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                multiline
                                                name="message"
                                                value={formData.message}
                                                onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                                                disabled={loading}
                                                variant="outlined"
                                                placeholder="Write your notification message here..."
                                                sx={{
                                                    height: 'calc(100% - 42px)',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 3,
                                                        fontSize: '1rem',
                                                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                                                        transition: 'all 0.3s ease',
                                                        height: '100%',
                                                        alignItems: 'flex-start',
                                                        '& textarea': {
                                                            lineHeight: 1.6,
                                                            height: '100% !important',
                                                            overflow: 'auto !important',
                                                        },
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.secondary.main, 0.02),
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: alpha(theme.palette.secondary.main, 0.3),
                                                            }
                                                        },
                                                        '&.Mui-focused': {
                                                            bgcolor: alpha(theme.palette.secondary.main, 0.02),
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderWidth: 2,
                                                                borderColor: theme.palette.secondary.main,
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* Action Buttons */}
                                <Box
                                    sx={{
                                        mt: 5,
                                        pt: 3,
                                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 3
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={resetForm}
                                        disabled={loading}
                                        size="large"
                                        startIcon={<CancelIcon />}
                                        sx={{
                                            minWidth: 140,
                                            height: 48,
                                            borderRadius: 3,
                                            borderWidth: 2,
                                            fontWeight: 600,
                                            '&:hover': {
                                                borderWidth: 2,
                                                transform: 'translateY(-1px)',
                                            }
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        size="large"
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                        sx={{
                                            minWidth: 180,
                                            height: 48,
                                            borderRadius: 3,
                                            fontWeight: 600,
                                            boxShadow: theme.shadows[4],
                                            '&:hover': {
                                                boxShadow: theme.shadows[8],
                                                transform: 'translateY(-1px)',
                                            },
                                            '&:active': {
                                                transform: 'translateY(0)',
                                            }
                                        }}
                                    >
                                        {loading ? 'Saving...' : editingId ? 'Update Notification' : 'Create Notification'}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Slide>
            )}

            {/* Enhanced Notifications List */}
            <Box sx={{ mt: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Typography variant="h5" fontWeight="600">
                        Your Notifications
                    </Typography>
                    <Badge badgeContent={notifications.length} color="primary">
                        <NotificationsIcon />
                    </Badge>
                </Stack>

                {loading && !notifications.length ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                        <CircularProgress size={48} sx={{ mb: 2 }} />
                        <Typography color="text.secondary">Loading notifications...</Typography>
                    </Box>
                ) : notifications.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 8,
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            borderRadius: 3,
                            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                        }}
                    >
                        <NotificationsIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No notifications found
                        </Typography>
                        <Typography color="text.secondary">
                            {canCreateNotifications
                                ? "Create your first notification to get started!"
                                : "Check back later for new updates and announcements."
                            }
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {notifications.map((notification, index) => (
                            <Grid item xs={12} key={notification.id}>
                                <Fade in timeout={300 * (index + 1)}>
                                    <Card
                                        elevation={4}
                                        sx={{
                                            borderRadius: 3,
                                            background: alpha(theme.palette.background.paper, 0.8),
                                            backdropFilter: 'blur(10px)',
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: theme.shadows[8],
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                <Typography variant="h6" fontWeight="600" sx={{ flex: 1 }}>
                                                    {notification.title}
                                                </Typography>
                                                <Chip
                                                    icon={getRoleIcon(notification.targetRole)}
                                                    label={notification.targetRole === 'all' ? 'All Users' : notification.targetRole.charAt(0).toUpperCase() + notification.targetRole.slice(1)}
                                                    color={getRoleColor(notification.targetRole) as any}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>

                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={{ mb: 3, lineHeight: 1.6 }}
                                            >
                                                {notification.message}
                                            </Typography>

                                            <Divider sx={{ my: 2 }} />

                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <PersonIcon fontSize="small" color="action" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {notification.createdBy.firstName} {notification.createdBy.lastName}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <ScheduleIcon fontSize="small" color="action" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {dayjs(notification.createdAt).fromNow()}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>

                                        {uid === notification.createdById && canCreateNotifications && (
                                            <CardActions sx={{ px: 3, pb: 2, pt: 0 }}>
                                                <Tooltip title="Edit notification">
                                                    <IconButton
                                                        onClick={() => handleEditClick(notification)}
                                                        sx={{
                                                            color: theme.palette.primary.main,
                                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                        }}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete notification">
                                                    <IconButton
                                                        onClick={() => setDeleteId(notification.id)}
                                                        sx={{
                                                            color: theme.palette.error.main,
                                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                        }}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        )}
                                    </Card>
                                </Fade>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Enhanced Snackbar */}
            <Snackbar
                open={!!status.type}
                autoHideDuration={4000}
                onClose={() => setStatus({ type: '', message: '' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                {status.type && (
                    <Alert
                        severity={status.type}
                        variant="filled"
                        sx={{ borderRadius: 2 }}
                        onClose={() => setStatus({ type: '', message: '' })}
                    >
                        {status.message}
                    </Alert>
                )}
            </Snackbar>

            {/* Enhanced Delete Confirmation Dialog */}
            <Dialog
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                PaperProps={{
                    sx: { borderRadius: 3, minWidth: 400 }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                            <Delete />
                        </Avatar>
                        <Typography variant="h6" fontWeight="600">
                            Confirm Deletion
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        Are you sure you want to delete this notification? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button
                        onClick={() => setDeleteId(null)}
                        variant="outlined"
                        size="large"
                    >
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        onClick={confirmDelete}
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Delete />}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default NotificationPage;