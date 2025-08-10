import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Grid, TextField, Autocomplete, FormControl, InputLabel,
    Select, MenuItem, Button, Card, CardContent, Chip, Box,
    Divider, Typography, Avatar, useMediaQuery, Accordion,
    AccordionSummary, AccordionDetails
} from '@mui/material';
import { ExpandMore, Link as LinkIcon } from '@mui/icons-material';
import {HomeIcon, ListIcon, Save} from 'lucide-react';
import { showSuccessAlert, showErrorAlert } from '../components/Alert.tsx';
import { Search } from '@mui/icons-material';
import { InputAdornment } from '@mui/material';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    batchYear?: number;
}

interface StudentWrapper {
    id: string;
    classroomId: string;
    studentId: string;
    student: User;
}

interface Classroom {
    id: string;
    name: string;
    teacher: User;
    students: StudentWrapper[];
    batchYear: number;
}

const ClassRoomSetupPage: React.FC = () => {
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');

    const [teachers, setTeachers] = useState<User[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [batchYears, setBatchYears] = useState<number[]>([]);
    const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);

    const [className, setClassName] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
    const [selectedBatchYear, setSelectedBatchYear] = useState<number | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<User[]>([]);

    const [assignedTeacherIds, setAssignedTeacherIds] = useState<string[]>([]);
    const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [teachersRes, batchRes, classRes] = await Promise.all([
                    axios.get('/users?role=teacher'),
                    axios.get('/batch-years'),
                    axios.get('/classroom')
                ]);

                const classrooms: Classroom[] = classRes.data || [];

                setTeachers(teachersRes.data || []);
                setBatchYears(batchRes.data || []);
                setAllClassrooms(classrooms);

                const teacherIds = classrooms
                    .filter(cls => cls.id !== classroomId)
                    .map(cls => cls.teacher.id);
                const studentIds = classrooms
                    .filter(cls => cls.id !== classroomId)
                    .flatMap(cls => cls.students.map(s => s.student.id));

                setAssignedTeacherIds(teacherIds);
                setAssignedStudentIds(studentIds);
            } catch {
                showErrorAlert('Failed to load initial data.');
            }
        };
        fetchInitialData();
    }, [classroomId]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedBatchYear) {
                setStudents([]);
                return;
            }
            try {
                const res = await axios.get(`/get-students?batchYear=${selectedBatchYear}`);
                setStudents(res.data || []);
            } catch {
                showErrorAlert('Failed to load students.');
            }
        };
        fetchStudents();
    }, [selectedBatchYear]);

    useEffect(() => {
        const fetchClassroom = async () => {
            if (!classroomId) return;
            try {
                const res = await axios.get(`/classroom/${classroomId}`);
                const data: Classroom = res.data;
                setClassName(data.name);
                setSelectedBatchYear(data.batchYear);
                setSelectedTeacher(data.teacher);
                setSelectedStudents(data.students.map(s => s.student));
            } catch {
                showErrorAlert('Failed to load classroom details.');
            }
        };
        fetchClassroom();
    }, [classroomId]);

    const validateAndSubmit = async () => {
        if (!className || !selectedTeacher || !selectedBatchYear || selectedStudents.length === 0) {
            showErrorAlert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        const classData = {
            className,
            teacherId: selectedTeacher.id,
            batchYear: selectedBatchYear,
            studentIds: selectedStudents.map((s) => s.id),
        };

        try {
            setLoading(true);
            if (classroomId) {
                await axios.put(`/classroom/${classroomId}`, classData);
            } else {
                await axios.post('/classroom', classData);
            }
            await showSuccessAlert('Success', 'Classroom saved successfully!');
        } catch {
            showErrorAlert('Save Failed', 'Failed to save classroom.');
        } finally {
            setLoading(false);
        }
    };

    const filteredClassrooms = allClassrooms.filter((cls) =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box p={isMobile ? 2 : 4}>
            {/* Classroom Form */}
            <Card sx={{ borderRadius: 4, boxShadow: 3, mb: 4 }}>
                <Box sx={{
                    background: 'linear-gradient(to right, #3f51b5, #2196f3)',
                    p: 3,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}>
                    <Avatar sx={{ bgcolor: 'white', color: '#2196f3' }}>
                        <HomeIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">Classroom Setup</Typography>
                        <Typography variant="body2">Assign students, teacher and batch year</Typography>
                    </Box>
                </Box>

                <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Class Name"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                fullWidth sx={{ minWidth: 300, maxWidth: 500 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={teachers}
                                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                                value={selectedTeacher}
                                onChange={(_, value) => setSelectedTeacher(value)}
                                isOptionDisabled={(option) =>
                                    assignedTeacherIds.includes(option.id) && option.id !== selectedTeacher?.id
                                }
                                renderInput={(params) => <TextField {...params} label="Class Teacher" />}
                                fullWidth sx={{ minWidth: 300, maxWidth: 500 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={{ minWidth: 300, maxWidth: 500 }}>
                                <InputLabel>Batch Year</InputLabel>
                                <Select
                                    value={selectedBatchYear ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedBatchYear(typeof val === 'string' ? parseInt(val) : val);
                                        setSelectedStudents([]);
                                    }}
                                    label="Batch Year"
                                >
                                    {batchYears.map((year) => (
                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={students}
                                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                                value={selectedStudents}
                                onChange={(_, value) => setSelectedStudents(value)}
                                isOptionDisabled={(option) =>
                                    assignedStudentIds.includes(option.id) &&
                                    !selectedStudents.some(s => s.id === option.id)
                                }
                                renderInput={(params) => <TextField {...params} label="Students" />}
                                fullWidth sx={{ minWidth: 300, maxWidth: 500 }}
                                disabled={!selectedBatchYear}
                            />
                        </Grid>
                    </Grid>

                    {selectedStudents.length > 0 && (
                        <Box mt={4}>
                            <Typography variant="subtitle1" fontWeight="bold">Assigned Students</Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                {selectedStudents.map((s) => (
                                    <Chip
                                        key={s.id}
                                        label={`${s.firstName} ${s.lastName}`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ my: 4 }} />

                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Save />}
                            onClick={validateAndSubmit}
                            disabled={loading}
                            size="large"
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            {loading ? 'Saving...' : (classroomId ? 'Update Classroom' : 'Save Classroom')}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* All Classrooms List */}
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <Box
                    sx={{
                        background: 'linear-gradient(to right, #3f51b5, #2196f3)',
                        px: 3,
                        py: 2,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        color: 'white',
                    }}
                >
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                    >
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'white', color: '#2196f3' }}>
                                <ListIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">All Classrooms</Typography>
                                <Typography variant="body2">Review existing classrooms and their students</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <CardContent>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <TextField
                            label="Search by Class Name"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: 1,
                                width: isMobile ? '100%' : 300,
                                mt: isMobile ? 2 : 0,
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Grid container spacing={1.5}>
                        {filteredClassrooms.map((cls) => (
                            <Grid item xs={12} key={cls.id}>
                                <Accordion elevation={4} sx={{ borderRadius: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Box>
                                            <Typography variant="h6">{cls.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Batch Year: {cls.batchYear} | Teacher: {cls.teacher.firstName} {cls.teacher.lastName} | Students: {cls.students.length}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="subtitle2" gutterBottom>Student List</Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            {cls.students.map((s) => (
                                                <Chip
                                                    key={s.student.id}
                                                    label={`${s.student.firstName} ${s.student.lastName}`}
                                                    color="secondary"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ClassRoomSetupPage;
