import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Stack,
    CircularProgress,
    useMediaQuery,
    TextField,
    Autocomplete,
} from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#0088fe', '#00c49f'];

const DashboardPage = () => {
    const [marksData, setMarksData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [examTypes, setExamTypes] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [selectedExamType, setSelectedExamType] = useState(null);

    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        axios.get('http://localhost:3000/api/v1/exam/mark-entry/all-marks')
            .then(response => {
                setMarksData(response.data);
                setFilteredData(response.data);
                setStudents(getUniqueBy(response.data, m => `${m.student.firstName} ${m.student.lastName}`));
                setTeachers(getUniqueBy(response.data, m => `${m.teacher.firstName} ${m.teacher.lastName}`));
                setClassrooms(getUniqueBy(response.data, m => m.classroom.name));
                setExamTypes(getUniqueBy(response.data, m => m.examType));
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching marks:", error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let data = [...marksData];

        if (selectedStudent) {
            data = data.filter(m => `${m.student.firstName} ${m.student.lastName}` === selectedStudent);
        }

        if (selectedTeacher) {
            data = data.filter(m => `${m.teacher.firstName} ${m.teacher.lastName}` === selectedTeacher);
        }

        if (selectedClassroom) {
            data = data.filter(m => m.classroom.name === selectedClassroom);
        }

        if (selectedExamType) {
            data = data.filter(m => m.examType === selectedExamType);
        }

        setFilteredData(data);
    }, [selectedStudent, selectedTeacher, selectedClassroom, selectedExamType, marksData]);

    const getUniqueBy = (arr, keyFn) => {
        const seen = new Set();
        return arr.map(keyFn).filter(value => {
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    };

    if (loading) {
        return (
            <Box p={4} display="flex" justifyContent="center" alignItems="center" height="60vh">
                <CircularProgress />
            </Box>
        );
    }

    // Average marks per subject
    const averageMarksBySubject = Object.values(
        filteredData.reduce((acc, entry) => {
            const subjectName = entry.subject.name;
            if (!acc[subjectName]) {
                acc[subjectName] = { subject: subjectName, totalMarks: 0, count: 0 };
            }
            acc[subjectName].totalMarks += entry.marks;
            acc[subjectName].count += 1;
            return acc;
        }, {})
    ).map(subject => ({
        subject: subject.subject,
        average: Math.round(subject.totalMarks / subject.count),
    }));

    // Marks distribution for pie chart
    const marksDistribution = Object.values(
        filteredData.reduce((acc, entry) => {
            const subjectName = entry.subject.name;
            if (!acc[subjectName]) {
                acc[subjectName] = { subject: subjectName, total: 0 };
            }
            acc[subjectName].total += entry.marks;
            return acc;
        }, {})
    );

    // Total marks by student
    const totalMarksByStudent = Object.values(
        filteredData.reduce((acc, entry) => {
            const studentName = `${entry.student.firstName} ${entry.student.lastName}`;
            if (!acc[studentName]) {
                acc[studentName] = { student: studentName, totalMarks: 0 };
            }
            acc[studentName].totalMarks += entry.marks;
            return acc;
        }, {})
    );

    // Average marks by student for top/bottom charts
    const averageMarksByStudent = totalMarksByStudent.map(s => ({
        ...s,
        average: Math.round(s.totalMarks / filteredData.filter(m => `${m.student.firstName} ${m.student.lastName}` === s.student).length)
    }));

    // Average marks by exam type
    const averageMarksByExamType = Object.values(
        filteredData.reduce((acc, entry) => {
            if (!acc[entry.examType]) {
                acc[entry.examType] = { examType: entry.examType, totalMarks: 0, count: 0 };
            }
            acc[entry.examType].totalMarks += entry.marks;
            acc[entry.examType].count += 1;
            return acc;
        }, {})
    ).map(item => ({
        examType: item.examType,
        average: Math.round(item.totalMarks / item.count)
    }));

    // Average marks by classroom
    const averageMarksByClassroom = Object.values(
        filteredData.reduce((acc, entry) => {
            if (!acc[entry.classroom.name]) {
                acc[entry.classroom.name] = { classroom: entry.classroom.name, totalMarks: 0, count: 0 };
            }
            acc[entry.classroom.name].totalMarks += entry.marks;
            acc[entry.classroom.name].count += 1;
            return acc;
        }, {})
    ).map(item => ({
        classroom: item.classroom,
        average: Math.round(item.totalMarks / item.count)
    }));

    // Subject difficulty index (sorted by lowest average first)
    const subjectDifficultyIndex = [...averageMarksBySubject].sort((a, b) => a.average - b.average);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Card sx={{ borderRadius: 4, boxShadow: 3, mb: 4 }}>
                {/* Header */}
                <Box
                    sx={{
                        background: 'linear-gradient(to right, #1976d2, #42a5f5)',
                        p: 3,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        color: 'white',
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={3}>
                        <Avatar sx={{ bgcolor: 'white', color: '#1976d2', width: 48, height: 48 }}>
                            <GradeIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Dashboard Overview
                            </Typography>
                            <Typography variant="body2">
                                Insights from student performance data
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* Filters */}
                <CardContent sx={{ pt: 4 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Filter Reports
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                options={students}
                                value={selectedStudent}
                                onChange={(e, value) => setSelectedStudent(value)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Filter by Student" variant="outlined" fullWidth sx={{ minWidth: 300, maxWidth: 500 }} />
                                )}
                                clearOnEscape
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                options={teachers}
                                value={selectedTeacher}
                                onChange={(e, value) => setSelectedTeacher(value)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Filter by Teacher" variant="outlined" fullWidth sx={{ minWidth: 300, maxWidth: 500 }} />
                                )}
                                clearOnEscape
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                options={classrooms}
                                value={selectedClassroom}
                                onChange={(e, value) => setSelectedClassroom(value)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Filter by Classroom" variant="outlined" fullWidth sx={{ minWidth: 300, maxWidth: 500 }} />
                                )}
                                clearOnEscape
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Autocomplete
                                options={examTypes}
                                value={selectedExamType}
                                onChange={(e, value) => setSelectedExamType(value)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Filter by Exam Type" variant="outlined" fullWidth sx={{ minWidth: 300, maxWidth: 500 }} />
                                )}
                                clearOnEscape
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={4}>
                {/* Chart 1: Average Marks per Subject */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📚 Average Marks per Subject
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={averageMarksBySubject}>
                                    <XAxis dataKey="subject" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="average" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 2: Marks Distribution by Subject */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                🧮 Marks Distribution by Subject
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={marksDistribution}
                                        dataKey="total"
                                        nameKey="subject"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {marksDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 3: Total Marks by Student */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                👨‍🎓 Total Marks by Student
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={totalMarksByStudent} layout="vertical">
                                    <XAxis type="number" />
                                    <YAxis dataKey="student" type="category" width={150} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="totalMarks" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 4: Top 5 Students */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                🏆 Top 5 Students by Average Marks
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[...averageMarksByStudent].sort((a, b) => b.average - a.average).slice(0, 5)}
                                    layout="vertical"
                                >
                                    <XAxis type="number" />
                                    <YAxis dataKey="student" type="category" width={150} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="average" fill="#1976d2" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 5: Lowest 5 Students */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📉 Lowest 5 Students by Average Marks
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[...averageMarksByStudent].sort((a, b) => a.average - b.average).slice(0, 5)}
                                    layout="vertical"
                                >
                                    <XAxis type="number" />
                                    <YAxis dataKey="student" type="category" width={150} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="average" fill="#ff4d4d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 6: Average Marks by Exam Type */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📑 Average Marks by Exam Type
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={averageMarksByExamType}>
                                    <XAxis dataKey="examType" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="average" fill="#ff7f50" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 7: Classroom-Wise Average Marks */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                🏫 Average Marks by Classroom
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={averageMarksByClassroom}>
                                    <XAxis dataKey="classroom" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="average" fill="#00c49f" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Chart 8: Subject Difficulty Index */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📏 Subject Difficulty Index (Lower Avg = Harder)
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={subjectDifficultyIndex}>
                                    <XAxis dataKey="subject" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="average" fill="#a569bd" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
