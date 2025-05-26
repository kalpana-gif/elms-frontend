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
    TextField,
    Button,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Chip,
    useMediaQuery,
    useTheme,
    Autocomplete,
    InputAdornment,
    MenuItem,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { showSuccessAlert, showErrorAlert } from '../components/Alert.tsx';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

interface GuardianMapping {
    id: string;
    studentId: string;
    guardianId: string;
    batchYear: string;
    createdAt: string;
    student: User;
    guardian: User;
}

interface GuardianInfo {
    guardian: User;
    batchYear: string;
}

const StudentSetupPage = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [parents, setParents] = useState<User[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [guardiansMap, setGuardiansMap] = useState<Record<string, GuardianInfo[]>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [selectedGuardianId, setSelectedGuardianId] = useState<string>('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');

    const isMobile = useMediaQuery('(max-width:600px)');
    const theme = useTheme();

    const batchOptions = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());
    const allGuardians = [...parents, ...teachers];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, parentsRes, teachersRes, guardianMappingsRes] = await Promise.all([
                    axios.get('/users?role=student'),
                    axios.get('/users?role=parent'),
                    axios.get('/users?role=teacher'),
                    axios.get('/guardian'),
                ]);

                setStudents(studentsRes.data);
                setParents(parentsRes.data);
                setTeachers(teachersRes.data);

                const guardianMappings: GuardianMapping[] = guardianMappingsRes.data;

                const guardianResults: Record<string, GuardianInfo[]> = {};
                guardianMappings.forEach((mapping) => {
                    const { studentId, guardian, batchYear } = mapping;

                    if (!guardianResults[studentId]) {
                        guardianResults[studentId] = [];
                    }

                    guardianResults[studentId].push({
                        guardian,
                        batchYear,
                    });
                });

                setGuardiansMap(guardianResults);
            } catch (error) {
                showErrorAlert('Error', 'Failed to load data.');
            }
        };

        fetchData();
    }, []);

    const handleOpenDialog = (student: User) => {
        setSelectedStudent(student);
        setSelectedGuardianId('');
        setSelectedBatch('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedStudent(null);
        setSelectedGuardianId('');
        setSelectedBatch('');
    };

    const handleSaveMapping = async () => {
        if (!selectedStudent || !selectedGuardianId || !selectedBatch) {
            showErrorAlert('Validation', 'Please select a guardian and batch.');
            return;
        }

        try {
            await axios.post(`/students/${selectedStudent.id}/assign-guardian`, {
                guardianId: selectedGuardianId,
                batchYear: selectedBatch,
            });

            showSuccessAlert('Success', 'Guardian assigned successfully.');
            handleCloseDialog();

            const guardianMappingsRes = await axios.get('/guardian');
            const guardianMappings: GuardianMapping[] = guardianMappingsRes.data;

            const guardianResults: Record<string, GuardianInfo[]> = {};
            guardianMappings.forEach((mapping) => {
                const { studentId, guardian, batchYear } = mapping;

                if (!guardianResults[studentId]) {
                    guardianResults[studentId] = [];
                }

                guardianResults[studentId].push({ guardian, batchYear });
            });

            setGuardiansMap(guardianResults);
        } catch {
            showErrorAlert('Error', 'Failed to assign guardian.');
        }
    };

    const filteredStudents = students.filter((student) => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

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
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Avatar sx={{ bgcolor: 'white', color: '#2196f3' }}>
                        <LinkIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">Student Setup</Typography>
                        <Typography variant="body2">Assign students to guardians (Parents or Teachers)</Typography>
                    </Box>
                </Box>

                <CardContent>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <TextField
                            variant="outlined"
                            placeholder="Search students by name or email"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: isMobile ? '100%' : 300 }}
                        />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                                <TableRow>
                                    <TableCell><strong>Name</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Assigned Guardians</strong></TableCell>
                                    <TableCell><strong>Batch Year(s)</strong></TableCell>
                                    <TableCell align="center"><strong>Action</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id} hover>
                                            <TableCell>{student.firstName} {student.lastName}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>
                                                {guardiansMap[student.id]?.length > 0 ? (
                                                    guardiansMap[student.id].map(({ guardian }) => (
                                                        <Chip
                                                            key={guardian.id}
                                                            label={`${guardian.firstName} ${guardian.lastName} (${guardian.role})`}
                                                            color="primary"
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Chip label="No Guardian Assigned" size="small" color="error" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {guardiansMap[student.id]?.length > 0 ? (
                                                    guardiansMap[student.id].map(({ guardian, batchYear }) => (
                                                        <Chip
                                                            key={`${guardian.id}-${batchYear}`}
                                                            label={batchYear}
                                                            size="small"
                                                            color="secondary"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="textSecondary">—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Assign Guardian">
                                                    <IconButton onClick={() => handleOpenDialog(student)}>
                                                        <LinkIcon color="primary" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No students found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Assign Guardian Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Assign Guardian</DialogTitle>
                <Divider />
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="Student Name"
                            fullWidth
                            value={`${selectedStudent?.firstName || ''} ${selectedStudent?.lastName || ''}`}
                            disabled
                        />
                        <Autocomplete
                            options={allGuardians}
                            getOptionLabel={(option) =>
                                `${option.firstName} ${option.lastName} (${option.email}) - ${option.role}`
                            }
                            value={allGuardians.find((g) => g.id === selectedGuardianId) || null}
                            onChange={(_, newValue) => setSelectedGuardianId(newValue?.id || '')}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Guardian"
                                    fullWidth
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start">
                                                    <SearchIcon color="action" />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                        <TextField
                            select
                            label="Select AL Batch"
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            fullWidth
                        >
                            {batchOptions.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveMapping} variant="contained" color="primary">Assign</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentSetupPage;
