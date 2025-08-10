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
    useMediaQuery,
    Chip,
    InputAdornment,
    alpha,
    useTheme
} from '@mui/material';
import {
    Book as BookIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
    School as SchoolIcon,
    Code as CodeIcon,
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
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
    const [searchTerm, setSearchTerm] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:600px)');

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
        if (!subject.name.trim() || !subject.code.trim()) {
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

    // Filter subjects based on search term
    const filteredSubjects = subjects.filter((subj) =>
        subj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subj.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box p={isMobile ? 2 : 4}>
            <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
                {/* Keep original header design exactly as is */}
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
                        {editingId && (
                            <Box sx={{ ml: 'auto' }}>
                                <Chip
                                    label="Editing Mode"
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.3)'
                                    }}
                                />
                            </Box>
                        )}
                    </Stack>
                </Box>

                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Subject Name"
                                    placeholder="e.g. Advanced Mathematics"
                                    value={subject.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SchoolIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderWidth: 2,
                                            },
                                        }
                                    }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Subject Code"
                                    placeholder="e.g. MATH401"
                                    value={subject.code}
                                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CodeIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderWidth: 2,
                                            },
                                        }
                                    }}
                                    required
                                />
                            </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" gap={2} flexWrap="wrap">
                            {editingId && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={resetForm}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        textTransform: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleSubmit}
                                disabled={!subject.name.trim() || !subject.code.trim()}
                                startIcon={editingId ? <EditIcon /> : <AddIcon />}
                                sx={{
                                    px: 4,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: 2,
                                    '&:hover': {
                                        boxShadow: 4,
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {editingId ? 'Update Subject' : 'Add Subject'}
                            </Button>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Subject List Section */}
                        <Box>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" fontWeight="600">
                                    Subject List
                                </Typography>
                                <Chip
                                    icon={<BookIcon />}
                                    label={`${subjects.length} Total`}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                />
                            </Stack>

                            {/* Search Bar */}
                            <TextField
                                fullWidth
                                placeholder="Search subjects by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchTerm && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setSearchTerm('')}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        backgroundColor: alpha(theme.palette.grey[100], 0.5),
                                    }
                                }}
                            />

                            <TableContainer
                                component={Paper}
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`
                                }}
                            >
                                <Table>
                                    <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Subject Name</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Subject Code</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredSubjects.length > 0 ? (
                                            filteredSubjects.map((subj, index) => (
                                                <TableRow
                                                    key={subj.id}
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                        },
                                                        transition: 'background-color 0.2s ease'
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={2}>
                                                            <Avatar
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    bgcolor: theme.palette.primary.main,
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                {subj.name.charAt(0)}
                                                            </Avatar>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {subj.name}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={subj.code}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                fontFamily: 'monospace',
                                                                fontWeight: 600,
                                                                borderRadius: 1
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box display="flex" gap={1} justifyContent="flex-end">
                                                            <Tooltip title="Edit">
                                                                <IconButton
                                                                    onClick={() => handleEdit(subj)}
                                                                    size="small"
                                                                    sx={{
                                                                        color: theme.palette.primary.main,
                                                                        '&:hover': {
                                                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                                        }
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton
                                                                    onClick={() => handleDelete(subj.id)}
                                                                    size="small"
                                                                    sx={{
                                                                        color: theme.palette.error.main,
                                                                        '&:hover': {
                                                                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                                        }
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: alpha(theme.palette.grey[400], 0.1),
                                                                width: 56,
                                                                height: 56
                                                            }}
                                                        >
                                                            <BookIcon sx={{ color: theme.palette.grey[400] }} />
                                                        </Avatar>
                                                        <Typography variant="body1" color="text.secondary">
                                                            {searchTerm ? 'No subjects found matching your search' : 'No subjects available'}
                                                        </Typography>
                                                        {searchTerm && (
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => setSearchTerm('')}
                                                                sx={{ textTransform: 'none' }}
                                                            >
                                                                Clear Search
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ManageSubjectPage;