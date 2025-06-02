import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    MenuItem,
    Chip,
    useMediaQuery,
    Divider, Avatar, useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { showSuccessAlert, showErrorAlert, showConfirmationAlert } from '../components/Alert.tsx';

const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1);

const roleColors: Record<string, 'primary' | 'secondary' | 'default' | 'info' | 'warning' | 'error'> = {
    admin: 'primary',
    teacher: 'secondary',
    student: 'info',
    parent: 'warning',
};

const ManageUserPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const isMobile = useMediaQuery('(max-width:600px)');
    const theme = useTheme();

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            showErrorAlert('Error', 'Unable to retrieve users.');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditOpen = (user: any) => {
        setEditingUser(user);
        setOpenEditDialog(true);
    };

    const handleEditClose = () => {
        setOpenEditDialog(false);
        setEditingUser(null);
    };

    const handleEditChange = (field: string, value: any) => {
        setEditingUser((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleEditSubmit = async () => {
        try {
            await axios.put(`/users/${editingUser.id}`, editingUser);
            showSuccessAlert('User Updated', 'User details updated successfully!');
            handleEditClose();
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            showErrorAlert('Error', 'Failed to update user.');
        }
    };

    const handleDelete = async (userId: string) => {
        const isConfirmed = await showConfirmationAlert(
            'Delete User?',
            'This action will permanently delete the user.',
            'Yes, delete',
            'Cancel'
        );

        if (!isConfirmed) return;

        try {
            await axios.delete(`/users/${userId}`);
            showSuccessAlert('User Deleted', 'User has been deleted successfully.');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            showErrorAlert('Error', 'Failed to delete user.');
        }
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
    };

    const filteredUsers = users.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const role = user.role.toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            fullName.includes(search) ||
            user.email.toLowerCase().includes(search) ||
            role.includes(search);
        const matchesRole = roleFilter ? user.role === roleFilter : true;
        return matchesSearch && matchesRole;
    });

    return (
        <Box p={isMobile ? 2 : 4}>
            <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
                <Box
                    sx={{
                        background: 'linear-gradient(to right, #3f51b5, #2196f3)',
                        p: 3,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Avatar sx={{ bgcolor: 'white', color: '#3f51b5', width: 40, height: 40 }}>
                        <GroupIcon sx={{ fontSize: 24 }} />
                    </Avatar>

                    <Box>
                        <Typography  variant="h5" fontWeight="bold">
                            Manage Users
                        </Typography>
                        <Typography variant="body2">
                            Search, filter, edit, or delete user accounts
                        </Typography>
                    </Box>
                </Box>

                <CardContent  sx={{ p: 3}}>
                    <Box display="flex" justifyContent="flex-end" flexWrap="wrap" gap={2} mb={3}>
                        <TextField
                            label="Search Users"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <TextField
                            select
                            label="Filter by Role"
                            size="small"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            sx={{ minWidth: 180 }}
                        >
                            <MenuItem value="">All Roles</MenuItem>
                            {['admin', 'student', 'parent', 'teacher'].map((role) => (
                                <MenuItem key={role} value={role}>
                                    {capitalize(role)}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Button
                            onClick={handleClearFilters}
                            variant="outlined"
                            color="secondary"
                            sx={{ height: '40px', whiteSpace: 'nowrap' }}
                        >
                            Clear Filters
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <TableContainer component={Paper} elevation={1}>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                                <TableRow>
                                    <TableCell><strong>Name</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Role</strong></TableCell>
                                    <TableCell><strong>Phone</strong></TableCell>
                                    <TableCell><strong>Address</strong></TableCell>
                                    <TableCell align="center"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>{user.firstName} {user.lastName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={capitalize(user.role)}
                                                    color={roleColors[user.role] || 'default'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{user.phone}</TableCell>
                                            <TableCell>{user.address}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Edit">
                                                    <IconButton onClick={() => handleEditOpen(user)}>
                                                        <EditIcon color="primary" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton onClick={() => handleDelete(user.id)}>
                                                        <DeleteIcon color="error" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No users found matching the criteria.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={handleEditClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="First Name"
                            fullWidth
                            value={editingUser?.firstName || ''}
                            onChange={(e) => handleEditChange('firstName', e.target.value)}
                        />
                        <TextField
                            label="Last Name"
                            fullWidth
                            value={editingUser?.lastName || ''}
                            onChange={(e) => handleEditChange('lastName', e.target.value)}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            value={editingUser?.email || ''}
                            onChange={(e) => handleEditChange('email', e.target.value)}
                        />
                        <TextField
                            label="Phone"
                            fullWidth
                            value={editingUser?.phone || ''}
                            onChange={(e) => handleEditChange('phone', e.target.value)}
                        />
                        <TextField
                            label="Address"
                            fullWidth
                            value={editingUser?.address || ''}
                            onChange={(e) => handleEditChange('address', e.target.value)}
                        />
                        <TextField
                            select
                            label="Role"
                            fullWidth
                            value={editingUser?.role || ''}
                            onChange={(e) => handleEditChange('role', e.target.value)}
                        >
                            {['admin', 'student', 'parent', 'teacher'].map((role) => (
                                <MenuItem key={role} value={role}>
                                    {capitalize(role)}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSubmit}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageUserPage;
