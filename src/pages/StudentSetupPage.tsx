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
import { showSuccessAlert, showErrorAlert } from '../components/Alert';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'student' | 'parent' | 'teacher';
}

interface Subject {
    id: string;
    name: string;
    code: string;
}

interface GuardianMapping {
    studentId: string;
    guardian: User;
    batchYear: string;
    subjects: Subject[];
}

const StudentSetupPage = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [parents, setParents] = useState<User[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [guardiansMap, setGuardiansMap] = useState<Record<string, GuardianMapping[]>>({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [selectedGuardianId, setSelectedGuardianId] = useState<string>('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

    const isMobile = useMediaQuery('(max-width:600px)');
    const theme = useTheme();

    const batchOptions = Array.from({ length: 11 }, (_, i) => (2020 + i).toString());
    const allGuardians = [...parents, ...teachers];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, parentsRes, teachersRes, guardianMappingsRes, subjectsRes] = await Promise.all([
                    axios.get<User[]>('/users?role=student'),
                    axios.get<User[]>('/users?role=parent'),
                    axios.get<User[]>('/users?role=teacher'),
                    axios.get<GuardianMapping[]>('/guardian'),
                    axios.get<Subject[]>('/subject'),
                ]);

                setStudents(studentsRes.data);
                setParents(parentsRes.data);
                setTeachers(teachersRes.data);
                setSubjects(subjectsRes.data);

                const guardianResults: Record<string, GuardianMapping[]> = {};
                guardianMappingsRes.data.forEach((mapping) => {
                    const { studentId } = mapping;
                    if (!guardianResults[studentId]) {
                        guardianResults[studentId] = [];
                    }
                    guardianResults[studentId].push(mapping);
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
        setSelectedSubjects([]);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedStudent(null);
        setSelectedGuardianId('');
        setSelectedBatch('');
        setSelectedSubjects([]);
    };

    const handleSaveMapping = async () => {
        if (!selectedStudent || !selectedGuardianId || !selectedBatch || selectedSubjects.length === 0) {
            showErrorAlert('Validation', 'Please fill all fields including at least one subject.');
            return;
        }

        try {
            await axios.post(`/students/${selectedStudent.id}/assign-guardian`, {
                guardianId: selectedGuardianId,
                batchYear: selectedBatch,
                subjectIds: selectedSubjects.map((s) => s.id),
            });

            showSuccessAlert('Success', 'Guardian and subjects assigned successfully.');
            handleCloseDialog();

            const guardianMappingsRes = await axios.get<GuardianMapping[]>('/guardian');
            const guardianResults: Record<string, GuardianMapping[]> = {};
            guardianMappingsRes.data.forEach((mapping) => {
                const { studentId } = mapping;
                if (!guardianResults[studentId]) guardianResults[studentId] = [];
                guardianResults[studentId].push(mapping);
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
                        <Typography variant="body2">Assign students to guardians, batches and subjects</Typography>
                    </Box>
                </Box>

                <CardContent  sx={{ p: 3}}>
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
                                    <TableCell><strong>Guardians</strong></TableCell>
                                    <TableCell><strong>Batch</strong></TableCell>
                                    <TableCell><strong>Subjects</strong></TableCell>
                                    <TableCell align="center"><strong>Action</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id} hover>
                                            <TableCell>{student.firstName} {student.lastName}</TableCell>
                                            <TableCell>{student.email}</TableCell>

                                            {/* Guardians */}
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

                                            {/* Batch */}
                                            <TableCell>
                                                {guardiansMap[student.id]?.length > 0 ? (
                                                    guardiansMap[student.id].map(({ batchYear }, index) => (
                                                        <Chip
                                                            key={`batch-${index}`}
                                                            label={batchYear}
                                                            size="small"
                                                            color="secondary"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Chip label="No Batch Assigned" size="small" color="error" />
                                                )}
                                            </TableCell>

                                            {/* Subjects */}
                                            <TableCell>
                                                {guardiansMap[student.id]?.some(({ subjects }) => subjects && subjects.length > 0) ? (
                                                    guardiansMap[student.id]?.flatMap(({ subjects = [] }, index) =>
                                                        subjects.map((subject) => (
                                                            <Chip
                                                                key={`${index}-${subject.id}`}
                                                                label={`${subject.name} (${subject.code})`}
                                                                size="small"
                                                                color="info"
                                                                sx={{ mr: 0.5, mb: 0.5 }}
                                                            />
                                                        ))
                                                    )
                                                ) : (
                                                    <Chip label="No Subjects Assigned" size="small" color="error" />
                                                )}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Tooltip title="Assign Guardian and Subjects">
                                                    <IconButton onClick={() => handleOpenDialog(student)}>
                                                        <LinkIcon color="primary" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
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

            {/* Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ p: 0 }}>
                    <Box
                        sx={{
                            background: 'linear-gradient(to right, #3f51b5, #2196f3)',
                            p: 3,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold">
                            Assign Guardian and Subjects
                        </Typography>
                    </Box>
                </DialogTitle>
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
                                />
                            )}
                        />
                        <TextField
                            select
                            label="Select Batch Year"
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            fullWidth
                        >
                            {batchOptions.map((year) => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </TextField>
                        <Autocomplete
                            multiple
                            options={subjects}
                            value={selectedSubjects}
                            onChange={(_, value) => setSelectedSubjects(value)}
                            getOptionLabel={(option) => `${option.name} (${option.code})`}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Subjects" placeholder="Choose subjects" />
                            )}
                        />
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
