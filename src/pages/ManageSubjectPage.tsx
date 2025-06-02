import {
    Typography,
    Box,
    TextField,
    Button,
    Stack,
    Card,
    CardContent,
    Avatar,
    Grid,
    IconButton,
    Tooltip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useMediaQuery
} from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import {
    showSuccessAlert,
    showErrorAlert,
    showConfirmationAlert
} from '../components/Alert.tsx';

const ManageSubjectPage = () => {
    const [subject, setSubject] = useState({ name: '', code: '' });
    const [subjects, setSubjects] = useState([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const isMobile = useMediaQuery('(max-width:300px)');

    const fetchSubjects = async () => {
        try {
            const res = await axios.get('/subject');
            setSubjects(res.data);
        } catch {
            await showErrorAlert('Error', 'Failed to fetch subjects');
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleChange = (field: string, value: string) => {
        setSubject((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setSubject({ name: '', code: '' });
        setEditingId(null);
    };

    const handleSubmit = async () => {
        if (!subject.name || !subject.code) {
            await showErrorAlert('Validation Error', 'Please fill out all fields.');
            return;
        }

        try {
            if (editingId) {
                const confirmed = await showConfirmationAlert(
                    'Update Subject?',
                    'Do you want to save the changes?',
                    'Yes, update',
                    'Cancel'
                );
                if (!confirmed) return;

                await axios.put(`/subject/${editingId}`, subject);
                await showSuccessAlert('Updated', 'Subject has been updated successfully!');
            } else {
                await axios.post('/subject', subject);
                await showSuccessAlert('Added', 'Subject has been added successfully!');
            }
            resetForm();
            fetchSubjects();
        } catch {
            await showErrorAlert('Error', 'Failed to save subject');
        }
    };

    const handleEdit = async (subj) => {
        const confirmed = await showConfirmationAlert(
            'Edit Subject?',
            `You are about to edit "${subj.name}" (${subj.code}).`,
            'Yes, edit it',
            'Cancel'
        );
        if (!confirmed) return;

        setSubject({ name: subj.name, code: subj.code });
        setEditingId(subj.id);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirmationAlert(
            'Delete Subject?',
            'This action cannot be undone.',
            'Yes, delete',
            'Cancel'
        );
        if (!confirmed) return;

        try {
            await axios.delete(`/subject/${id}`);
            await showSuccessAlert('Deleted', 'Subject deleted successfully');
            fetchSubjects();
        } catch {
            await showErrorAlert('Error', 'Failed to delete subject');
        }
    };

    return (
        <Box p={isMobile ? 2 : 4}>
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <Box
                    sx={{
                        background: 'linear-gradient(to right, #3f51b5, #2196f3)',
                        p: 3,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        color: 'white',
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={3}>
                        <Avatar sx={{ bgcolor: 'white', color: '#5e35b1', width: 48, height: 48 }}>
                            <BookIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {editingId ? 'Edit Subject' : 'Add New Subject'}
                            </Typography>
                            <Typography variant="body2">Provide subject details and manage the list below</Typography>
                        </Box>
                    </Stack>
                </Box>

                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={1}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Subject Name"
                                    placeholder="e.g. Mathematics"
                                    value={subject.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Subject Code"
                                    placeholder="e.g. MATH101"
                                    value={subject.code}
                                    onChange={(e) => handleChange('code', e.target.value)}
                                    required
                                />
                            </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            {editingId && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleSubmit}
                                disabled={!subject.name || !subject.code}
                                sx={{ px: 5 }}
                            >
                                {editingId ? 'Update Subject' : 'Add Subject'}
                            </Button>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Subject List
                        </Typography>

                        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#eeeeee' }}>
                                    <TableRow>
                                        <TableCell><b>Subject Name</b></TableCell>
                                        <TableCell><b>Subject Code</b></TableCell>
                                        <TableCell align="right"><b>Actions</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {subjects.length > 0 ? (
                                        subjects.map((subj, index) => (
                                            <TableRow
                                                key={subj.id}
                                                sx={{ backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' }}
                                            >
                                                <TableCell>{subj.name}</TableCell>
                                                <TableCell>{subj.code}</TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Edit">
                                                        <IconButton onClick={() => handleEdit(subj)} color="primary">
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            onClick={() => handleDelete(subj.id)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                No subjects found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ManageSubjectPage;
