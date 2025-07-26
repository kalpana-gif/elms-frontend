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
    TextField,
    MenuItem,
    Button,
    Stack,
    useMediaQuery,
    useTheme,
    Chip,
    CircularProgress,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Collapse,
    Fab,
    Alert,
    LinearProgress,
} from '@mui/material';
import { useEffect, useState, useMemo, useCallback, useReducer, memo } from 'react';
import axios from '../api/axiosConfig';
import { showSuccessAlert, showErrorAlert } from '../components/Alert';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import { useAuthStore } from '../store/useAuthStore.ts';
import { debounce } from 'lodash';

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

interface Classroom {
    id: string;
    name: string;
    teacherId: string;
    batchYear: number;
    students: { studentId: string }[];
}

interface StudentSubject {
    studentId: string;
    subjectId: string;
    subject: Subject;
}

interface MarkEntry {
    studentId: string;
    subjectId: string;
    teacherId: string;
    classroomId: string;
    batchYear: number;
    examType: string;
    marks: number | '';
}

interface ExistingMark {
    studentId: string;
    subjectId: string;
    classroomId: string;
    batchYear: number;
    examType: string;
    marks: number;
}

interface MarkEntryState {
    entries: Record<string, MarkEntry>;
}

type MarkEntryAction =
    | { type: 'SET_ENTRY'; payload: MarkEntry }
    | { type: 'RESET' };

const examTypes = ['MIDTERM', 'FINAL', 'QUIZ', 'ASSIGNMENT'];

const markEntryReducer = (state: MarkEntryState, action: MarkEntryAction): MarkEntryState => {
    switch (action.type) {
        case 'SET_ENTRY':
            return {
                ...state,
                entries: {
                    ...state.entries,
                    [`${action.payload.studentId}-${action.payload.subjectId}-${action.payload.examType}`]: action.payload,
                },
            };
        case 'RESET':
            return { entries: {} };
        default:
            return state;
    }
};

// Memoized table row component
const MarkEntryRow = memo(
    ({ student, classrooms, filteredStudentSubjects, selectedSubject, examType, getMarkValue, handleMarkChange, unauthorizedDialogOpen, theme }: any) => (
        <TableRow key={student.id} hover sx={{ '&:hover': { backgroundColor: theme.palette.grey[50] } }}>
            <TableCell sx={{ minWidth: 150 }}>{student.firstName} {student.lastName}</TableCell>
            <TableCell sx={{ minWidth: 100 }}>
                {classrooms
                    .filter((c: Classroom) => c.students.some((cs: any) => cs.studentId === student.id))
                    .map((c: Classroom, index: number) => (
                        <Chip
                            key={`batch-${index}`}
                            label={c.batchYear}
                            size="small"
                            color="secondary"
                            sx={{ mr: 0.5 }}
                        />
                    ))}
            </TableCell>
            <TableCell sx={{ minWidth: 100 }}>
                {classrooms
                    .filter((c: Classroom) => c.students.some((cs: any) => cs.studentId === student.id))
                    .map((c: Classroom, index: number) => (
                        <Chip
                            key={`class-${index}`}
                            label={c.name}
                            size="small"
                            color="info"
                            sx={{ mr: 0.5 }}
                        />
                    ))}
            </TableCell>
            <TableCell sx={{ minWidth: 150 }}>
                {filteredStudentSubjects
                    .filter((ss: StudentSubject) => ss.studentId === student.id)
                    .map((ss: StudentSubject) => (
                        <Chip
                            key={ss.subjectId}
                            label={`${ss.subject.name} (${ss.subject.code})`}
                            size="small"
                            color="info"
                            sx={{ mr: 0.5, mb: 0.5 }}
                        />
                    ))}
            </TableCell>
            <TableCell align="center" sx={{ maxWidth: 120 }}>
                <TextField
                    type="number"
                    size="small"
                    fullWidth
                    placeholder="0-100"
                    inputProps={{ min: 0, max: 100, step: '0.1', 'aria-label': `Mark for ${student.firstName} ${examType}` }}
                    value={getMarkValue(student.id)}
                    onChange={(e) => handleMarkChange(student.id, e.target.value)}
                    error={getMarkValue(student.id) !== '' && (getMarkValue(student.id) < 0 || getMarkValue(student.id) > 100)}
                    helperText={
                        getMarkValue(student.id) !== '' && (getMarkValue(student.id) < 0 || getMarkValue(student.id) > 100)
                            ? 'Marks must be 0-100'
                            : ''
                    }
                    disabled={
                        !selectedSubject ||
                        !examType ||
                        !filteredStudentSubjects.some((ss: StudentSubject) => ss.studentId === student.id) ||
                        unauthorizedDialogOpen
                    }
                    sx={{ '& .MuiInputBase-input': { padding: '6px 8px' } }}
                />
            </TableCell>
        </TableRow>
    )
);

const MarkViewRow = memo(
    ({ entry, index, students, subjects, classrooms, handleEditMark, unauthorizedDialogOpen, theme }: any) => {
        const student = students.find((s: User) => s.id === entry.studentId);
        const subject = subjects.find((s: Subject) => s.id === entry.subjectId);
        const classroom = classrooms.find((c: Classroom) => c.id === entry.classroomId);
        return (
            <TableRow key={index} hover sx={{ '&:hover': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell>{student ? `${student.firstName} ${student.lastName}` : 'Unknown'}</TableCell>
                <TableCell>{subject ? `${subject.name} (${subject.code})` : 'Unknown'}</TableCell>
                <TableCell>{classroom ? classroom.name : 'Unknown'}</TableCell>
                <TableCell>{entry.batchYear}</TableCell>
                <TableCell>{entry.examType}</TableCell>
                <TableCell align="center">{entry.marks !== '' ? entry.marks : 'Not Set'}</TableCell>
                <TableCell align="center">
                    <Tooltip title="Edit Mark">
                        <IconButton
                            size="small"
                            onClick={() => handleEditMark(entry)}
                            disabled={unauthorizedDialogOpen}
                            aria-label="Edit mark"
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
        );
    }
);

const MarkEntryPage = () => {
    const [state, dispatch] = useReducer(markEntryReducer, { entries: {} });
    const [students, setStudents] = useState<User[]>([]);
    const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [batches, setBatches] = useState<string[]>([]);
    const [existingMarks, setExistingMarks] = useState<ExistingMark[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [examType, setExamType] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [isBulkSubmit, setIsBulkSubmit] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [unauthorizedDialogOpen, setUnauthorizedDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editMarkEntry, setEditMarkEntry] = useState<MarkEntry | null>(null);
    const [editMarkValue, setEditMarkValue] = useState<string>('');
    const [showViewTable, setShowViewTable] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const teacherId = useAuthStore((state) => state.uid);

    const isMobile = useMediaQuery('(max-width:600px)');
    const theme = useTheme();

    // Fetch data on mount and check teacher authorization
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [studentsRes, studentSubjectsRes, batchYearsRes, classroomsRes] = await Promise.all([
                    axios.get<User[]>('/exam/mark-entry/students'),
                    axios.get<StudentSubject[]>('/exam/mark-entry/student-subjects', { params: { teacherId } }),
                    axios.get<string[]>('/exam/mark-entry/batch-years'),
                    axios.get<Classroom[]>('/exam/mark-entry/classrooms', { params: { teacherId } }),
                ]);

                if (classroomsRes.data.length === 0) {
                    setUnauthorizedDialogOpen(true);
                    return;
                }

                setStudents(studentsRes.data);
                setStudentSubjects(studentSubjectsRes.data);
                setBatches(batchYearsRes.data);
                setClassrooms(classroomsRes.data);
            } catch (error) {
                showErrorAlert('Error', 'Failed to load data: ' + (error.response?.data?.error || error.message));
                setErrorMessage('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [teacherId]);

    // Fetch existing marks when subject, exam type, or class changes
    useEffect(() => {
        if (!selectedSubject || !examType || !selectedClass) return;
        const fetchExistingMarks = async () => {
            try {
                const response = await axios.get<ExistingMark[]>('/exam/mark-entry/marks', {
                    params: { teacherId, subjectId: selectedSubject, examType, classroomId: selectedClass },
                });
                setExistingMarks(response.data);
                response.data.forEach((mark) => {
                    dispatch({
                        type: 'SET_ENTRY',
                        payload: {
                            studentId: mark.studentId,
                            subjectId: mark.subjectId,
                            teacherId,
                            classroomId: mark.classroomId,
                            batchYear: mark.batchYear,
                            examType: mark.examType,
                            marks: mark.marks,
                        },
                    });
                });
            } catch (error) {
                console.error('Error fetching existing marks:', error);
                // setErrorMessage('Failed to load existing marks.');
            }
        };
        fetchExistingMarks();
    }, [selectedSubject, examType, selectedClass, teacherId]);

    // Mark input handler
    const handleMarkChange = useCallback(
        (studentId: string, value: string) => {
            if (!selectedSubject || !selectedClass || !examType) {
                showErrorAlert('Error', 'Please select a subject, class, and exam type.');
                return;
            }

            const mark = value === '' ? '' : parseFloat(value);
            if (mark !== '' && (isNaN(mark) || mark < 0 || mark > 100)) {
                showErrorAlert('Error', `Marks for ${examType} must be between 0 and 100.`);
                return;
            }

            const classroom = classrooms.find((c) => c.id === selectedClass);
            if (!classroom) {
                showErrorAlert('Error', 'Selected classroom is invalid.');
                return;
            }

            dispatch({
                type: 'SET_ENTRY',
                payload: {
                    studentId,
                    subjectId: selectedSubject,
                    teacherId,
                    classroomId: selectedClass,
                    batchYear: classroom.batchYear,
                    examType,
                    marks: mark,
                },
            });
        },
        [selectedSubject, examType, selectedClass, teacherId, classrooms]
    );

    // Get mark value for display
    const getMarkValue = useCallback(
        (studentId: string) => {
            return state.entries[`${studentId}-${selectedSubject}-${examType}`]?.marks || '';
        },
        [state.entries, selectedSubject, examType]
    );

    // Save draft to local storage
    const handleSaveDraft = useCallback(() => {
        const entries = Object.values(state.entries);
        localStorage.setItem(`draftMarks_${teacherId}`, JSON.stringify(entries));
        showSuccessAlert('Success', 'Draft saved locally.');
    }, [state.entries, teacherId]);

    // Reset form with confirmation
    const handleReset = useCallback(() => {
        setResetDialogOpen(true);
    }, []);

    const confirmReset = useCallback(() => {
        dispatch({ type: 'RESET' });
        setSelectedBatch('');
        setSelectedClass('');
        setSelectedSubject('');
        setExamType('');
        setExistingMarks([]);
        localStorage.removeItem(`draftMarks_${teacherId}`);
        showSuccessAlert('Success', 'Form reset successfully.');
        setResetDialogOpen(false);
    }, [teacherId]);

    // Submit filtered marks with debounce
    const handleSubmit = useCallback(
        debounce(() => {
            if (!selectedSubject || !selectedClass || !examType) {
                showErrorAlert('Error', 'Please select a subject, class, and exam type.');
                return;
            }
            const entries = Object.values(state.entries).filter(
                (entry) => entry.subjectId === selectedSubject && entry.examType === examType && entry.classroomId === selectedClass
            );

            if (entries.length === 0) {
                showErrorAlert('Error', 'No marks entered to submit.');
                return;
            }
            if (!entries.every((e) => e.marks !== '')) {
                showErrorAlert('Error', 'Please fill all marks before submitting.');
                return;
            }

            setIsBulkSubmit(false);
            setSubmitDialogOpen(true);
        }, 300),
        [selectedSubject, examType, selectedClass, state.entries]
    );

    // Submit all marks with debounce
    const handleBulkSubmit = useCallback(
        debounce(() => {
            const entries = Object.values(state.entries);
            if (entries.length === 0) {
                showErrorAlert('Error', 'No marks entered to submit.');
                return;
            }
            if (!entries.every((e) => e.marks !== '')) {
                showErrorAlert('Error', 'Please fill all marks before submitting.');
                return;
            }
            if (!entries.every((e) => e.marks >= 0 && e.marks <= 100)) {
                showErrorAlert('Error', 'All marks must be between 0 and 100.');
                return;
            }

            setIsBulkSubmit(true);
            setSubmitDialogOpen(true);
        }, 300),
        [state.entries]
    );

    // Confirm submission (filtered or bulk)
    const confirmSubmit = async () => {
        setSubmitDialogOpen(false);
        setLoading(true);
        try {
            const entries = isBulkSubmit
                ? Object.values(state.entries)
                : Object.values(state.entries).filter(
                      (entry) => entry.subjectId === selectedSubject && entry.examType === examType && entry.classroomId === selectedClass
                  );

            const existingKeys = new Set(
                existingMarks.map((m) => `${m.studentId}-${m.subjectId}-${m.examType}-${m.classroomId}`)
            );
            const newEntries = entries.filter(
                (entry) => !existingKeys.has(`${entry.studentId}-${entry.subjectId}-${entry.examType}-${entry.classroomId}`)
            );
            const updatedEntries = entries.filter(
                (entry) => existingKeys.has(`${entry.studentId}-${entry.subjectId}-${entry.examType}-${entry.classroomId}`)
            );

            if (updatedEntries.length > 0) {
                await axios.put('/exam/mark-entry/marks/batch', updatedEntries);
                showSuccessAlert('Success', 'Marks updated successfully!');
            }
            if (newEntries.length > 0) {
                await axios.post('/exam/mark-entry/marks/batch', newEntries);
                showSuccessAlert('Success', 'Marks created successfully!');
            }
            dispatch({ type: 'RESET' });
            setExistingMarks([]);
            localStorage.removeItem(`draftMarks_${teacherId}`);
        } catch (error) {
            if (error.response?.data?.error?.includes('not authorized')) {
                setUnauthorizedDialogOpen(true);
            } else {
                showErrorAlert('Error', 'Failed to submit marks: ' + (error.response?.data?.message || error.message));
                setErrorMessage('Failed to submit marks. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle edit mark
    const handleEditMark = useCallback((entry: MarkEntry) => {
        setEditMarkEntry(entry);
        setEditMarkValue(entry.marks.toString());
        setEditDialogOpen(true);
    }, []);

    // Confirm edit mark
    const confirmEditMark = useCallback(() => {
        if (!editMarkEntry) return;

        const mark = editMarkValue === '' ? '' : parseFloat(editMarkValue);
        if (mark !== '' && (isNaN(mark) || mark < 0 || mark > 100)) {
            showErrorAlert('Error', 'Marks must be between 0 and 100.');
            return;
        }

        dispatch({
            type: 'SET_ENTRY',
            payload: {
                ...editMarkEntry,
                marks: mark,
            },
        });
        setEditDialogOpen(false);
        setEditMarkEntry(null);
        setEditMarkValue('');
        showSuccessAlert('Success', 'Mark updated locally. Submit to save changes.');
    }, [editMarkEntry, editMarkValue]);

    // Memoized subjects
    const subjects = useMemo(
        () =>
            Array.from(
                new Set(
                    studentSubjects
                        .filter((ss) => classrooms.some((c) => c.students.some((cs) => cs.studentId === ss.studentId)))
                        .map((ss) => JSON.stringify(ss.subject))
                )
            )
                .map((str) => JSON.parse(str) as Subject)
                .sort((a, b) => a.name.localeCompare(b.name)),
        [studentSubjects, classrooms]
    );

    // Memoized filtered students
    const filteredStudents = useMemo(
        () =>
            students.filter((student) => {
                const studentClasses = classrooms.filter((c) => c.students.some((cs) => cs.studentId === student.id));
                const hasSubject = studentSubjects.some(
                    (ss) => ss.studentId === student.id && (!selectedSubject || ss.subjectId === selectedSubject)
                );
                return (
                    studentClasses.length > 0 &&
                    (!selectedBatch || studentClasses.some((c) => c.batchYear.toString() === selectedBatch)) &&
                    (!selectedClass || studentClasses.some((c) => c.id === selectedClass)) &&
                    (!selectedSubject || hasSubject)
                );
            }),
        [students, classrooms, studentSubjects, selectedBatch, selectedClass, selectedSubject]
    );

    // Memoized filtered student subjects for table display
    const filteredStudentSubjects = useMemo(
        () => studentSubjects.filter((ss) => (selectedSubject ? ss.subjectId === selectedSubject : true)),
        [studentSubjects, selectedSubject]
    );

    // Memoized all mark entries for view table
    const allMarkEntries = useMemo(() => Object.values(state.entries), [state.entries]);

    // Summary of marks for submit dialog
    const markSummary = useMemo(() => {
        const entries = isBulkSubmit
            ? Object.values(state.entries)
            : Object.values(state.entries).filter(
                  (entry) => entry.subjectId === selectedSubject && entry.examType === examType && entry.classroomId === selectedClass
              );
        return entries
            .map((entry) => {
                const student = students.find((s) => s.id === entry.studentId);
                const subject = subjects.find((s) => s.id === entry.subjectId);
                const classroom = classrooms.find((c) => c.id === entry.classroomId);
                return `${student?.firstName} ${student?.lastName} - ${subject?.name || 'Unknown'} (${entry.examType}, ${classroom?.name || 'Unknown'}): ${entry.marks !== '' ? entry.marks : 'Not Set'}`;
            })
            .join('\n');
    }, [isBulkSubmit, state.entries, selectedSubject, examType, selectedClass, students, subjects, classrooms]);

    return (
        <Box p={isMobile ? 2 : 3} maxWidth="1600px" mx="auto">
            <Card
                sx={{
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    position: 'relative',
                }}
            >
                {loading && <LinearProgress sx={{ position: 'absolute', top: 0, width: '100%' }} />}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                        p: 2,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold">
                        Student Mark Entry
                    </Typography>
                    <Tooltip title="Reset Form">
                        <IconButton color="inherit" onClick={handleReset} disabled={unauthorizedDialogOpen || loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                    {errorMessage && (
                        <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ mb: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: theme.palette.text.primary, mb: 2 }}>
                        Enter Marks
                    </Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 600, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Table size="small" stickyHeader aria-label="Mark entry table">
                            <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', py: 1.5, borderBottom: 'none' }} colSpan={5}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
                                        >
                                            <Tooltip title="Select exam type to enter marks">
                                                <TextField
                                                    select
                                                    label="Exam Type"
                                                    value={examType}
                                                    onChange={(e) => setExamType(e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: isMobile ? 100 : 120, maxWidth: 150 }}
                                                    disabled={unauthorizedDialogOpen || loading}
                                                    required
                                                    aria-required="true"
                                                >
                                                    <MenuItem value="">Select Exam Type</MenuItem>
                                                    {examTypes.map((type) => (
                                                        <MenuItem key={type} value={type}>
                                                            {type}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Tooltip>
                                            <Tooltip title="Filter by batch year">
                                                <TextField
                                                    select
                                                    label="Batch"
                                                    value={selectedBatch}
                                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: isMobile ? 100 : 120, maxWidth: 150 }}
                                                    disabled={unauthorizedDialogOpen || loading}
                                                >
                                                    <MenuItem value="">All Batches</MenuItem>
                                                    {batches.map((batch) => (
                                                        <MenuItem key={batch} value={batch}>
                                                            {batch}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Tooltip>
                                            <Tooltip title="Filter by classroom">
                                                <TextField
                                                    select
                                                    label="Class"
                                                    value={selectedClass}
                                                    onChange={(e) => setSelectedClass(e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: isMobile ? 100 : 120, maxWidth: 150 }}
                                                    disabled={unauthorizedDialogOpen || loading}
                                                    required
                                                    aria-required="true"
                                                >
                                                    <MenuItem value="">Select Class</MenuItem>
                                                    {classrooms.map((cls) => (
                                                        <MenuItem key={cls.id} value={cls.id}>
                                                            {cls.name} ({cls.batchYear})
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Tooltip>
                                            <Tooltip title="Select subject to enter marks">
                                                <TextField
                                                    select
                                                    label="Subject"
                                                    value={selectedSubject}
                                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: isMobile ? 100 : 120, maxWidth: 150 }}
                                                    disabled={unauthorizedDialogOpen || loading}
                                                    required
                                                    aria-required="true"
                                                >
                                                    <MenuItem value="">Select Subject</MenuItem>
                                                    {subjects.map((subject) => (
                                                        <MenuItem key={subject.id} value={subject.id}>
                                                            {subject.name} ({subject.code})
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', py: 1.5, minWidth: 150 }}>Student</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', py: 1.5, minWidth: 100 }}>Batch</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', py: 1.5, minWidth: 100 }}>Class</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', py: 1.5, minWidth: 150 }}>Subject</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', py: 1.5, textAlign: 'center', minWidth: 120 }}>
                                        Mark ({examType || 'Select Exam'})
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <MarkEntryRow
                                            key={student.id}
                                            student={student}
                                            classrooms={classrooms}
                                            filteredStudentSubjects={filteredStudentSubjects}
                                            selectedSubject={selectedSubject}
                                            examType={examType}
                                            getMarkValue={getMarkValue}
                                            handleMarkChange={handleMarkChange}
                                            unauthorizedDialogOpen={unauthorizedDialogOpen}
                                            theme={theme}
                                        />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 2, color: theme.palette.text.secondary }}>
                                            No students found for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                            View All Mark Entries
                        </Typography>
                        <Tooltip title={showViewTable ? 'Hide Entries' : 'Show Entries'}>
                            <IconButton onClick={() => setShowViewTable(!showViewTable)} color="primary" aria-label="Toggle view table">
                                {showViewTable ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Collapse in={showViewTable}>
                        <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <Table size="small" stickyHeader aria-label="Mark view table">
                                <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Student</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Subject</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Class</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Batch</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Exam Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1.5, textAlign: 'center' }}>Marks</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', py: 1.5, textAlign: 'center' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allMarkEntries.length > 0 ? (
                                        allMarkEntries.map((entry, index) => (
                                            <MarkViewRow
                                                key={index}
                                                entry={entry}
                                                index={index}
                                                students={students}
                                                subjects={subjects}
                                                classrooms={classrooms}
                                                handleEditMark={handleEditMark}
                                                unauthorizedDialogOpen={unauthorizedDialogOpen}
                                                theme={theme}
                                            />
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 2, color: theme.palette.text.secondary }}>
                                                No mark entries available.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Collapse>

                    <Box
                        sx={{
                            position: 'sticky',
                            bottom: 0,
                            bgcolor: 'background.paper',
                            p: 2,
                            mt: 2,
                            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                            zIndex: 1,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1,
                        }}
                    >
                        <Tooltip title="Save marks as draft">
                            <Button
                                variant="outlined"
                                color="info"
                                onClick={handleSaveDraft}
                                disabled={loading || unauthorizedDialogOpen || Object.keys(state.entries).length === 0}
                                sx={{ borderRadius: 20, textTransform: 'none' }}
                                startIcon={<SaveIcon />}
                            >
                                Save Draft
                            </Button>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleReset}
                            disabled={loading || unauthorizedDialogOpen}
                            sx={{ borderRadius: 20, textTransform: 'none' }}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={loading || !selectedSubject || !selectedClass || !examType || unauthorizedDialogOpen}
                            sx={{ borderRadius: 20, textTransform: 'none' }}
                        >
                            {loading && !isBulkSubmit ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : null}
                            Submit Marks
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleBulkSubmit}
                            disabled={loading || Object.keys(state.entries).length === 0 || unauthorizedDialogOpen}
                            sx={{ borderRadius: 20, textTransform: 'none' }}
                        >
                            {loading && isBulkSubmit ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : null}
                            Submit All Marks
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: theme.palette.text.primary, whiteSpace: 'pre-line' }}>
                        {isBulkSubmit
                            ? `Submit all ${Object.keys(state.entries).length} mark entries across all subjects, classes, and exam types?`
                            : `Submit ${examType} marks for ${filteredStudents.length} students in ${
    subjects.find((s) => s.id === selectedSubject)?.name || 'Selected Subject'
} for class ${classrooms.find((c) => c.id === selectedClass)?.name || 'Selected Class'}?`}
                        <br />
                        <strong>Summary:</strong>
                        <br />
                        {markSummary || 'No marks entered.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSubmitDialogOpen(false)} color="secondary" sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmSubmit} color="primary" variant="contained" sx={{ textTransform: 'none' }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Reset</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: theme.palette.text.primary }}>
                        Are you sure you want to reset all entered marks and filters? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetDialogOpen(false)} color="secondary" sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmReset} color="primary" variant="contained" sx={{ textTransform: 'none' }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={unauthorizedDialogOpen} onClose={() => setUnauthorizedDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Unauthorized Access</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: theme.palette.text.primary }}>
                        Unauthorized privilege: Only class teachers can add marks.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setUnauthorizedDialogOpen(false)}
                        color="primary"
                        variant="contained"
                        sx={{ textTransform: 'none' }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Mark Entry</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2, color: theme.palette.text.primary }}>
                        Edit the mark for{' '}
                        {students.find((s) => s.id === editMarkEntry?.studentId)?.firstName || 'Student'} in{' '}
                        {subjects.find((s) => s.id === editMarkEntry?.subjectId)?.name || 'Subject'} (
                        {editMarkEntry?.examType}).
                    </DialogContentText>
                    <TextField
                        select
                        label="Exam Type"
                        value={editMarkEntry?.examType || ''}
                        onChange={(e) =>
                            setEditMarkEntry((prev) => (prev ? { ...prev, examType: e.target.value } : prev))
                        }
                        size="small"
                        fullWidth
                        margin="dense"
                        disabled={unauthorizedDialogOpen}
                    >
                        {examTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Marks"
                        type="number"
                        fullWidth
                        value={editMarkValue}
                        onChange={(e) => setEditMarkValue(e.target.value)}
                        error={editMarkValue !== '' && (parseFloat(editMarkValue) < 0 || parseFloat(editMarkValue) > 100)}
                        helperText={
                            editMarkValue !== '' && (parseFloat(editMarkValue) < 0 || parseFloat(editMarkValue) > 100)
                                ? 'Marks must be between 0 and 100'
                                : ''
                        }
                        inputProps={{ min: 0, max: 100, step: '0.1', 'aria-label': 'Mark value' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} color="secondary" sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmEditMark} color="primary" variant="contained" sx={{ textTransform: 'none' }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Fab
                color="primary"
                aria-label="toggle view table"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={() => setShowViewTable(!showViewTable)}
            >
                {showViewTable ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </Fab>
        </Box>
    );
};

export default MarkEntryPage;