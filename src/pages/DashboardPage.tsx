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
    Chip,
    Button,
    Fade,
    Grow,
    Paper,
    IconButton,
    Tooltip as MuiTooltip,
    Alert,
    AlertTitle,
    Skeleton,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Grade as GradeIcon,
    School as SchoolIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Analytics as AnalyticsIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Assignment as AssignmentIcon,
    Class as ClassIcon,
    Person as PersonIcon,
    Quiz as QuizIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
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
    LineChart,
    Line,
    Area,
    AreaChart,
    RadialBarChart,
    RadialBar,
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#fa709a', '#fee140'];
const GRADIENT_COLORS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
];

const DashboardPage = () => {
    const [marksData, setMarksData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [examTypes, setExamTypes] = useState([]);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [selectedExamType, setSelectedExamType] = useState(null);

    const [showFilters, setShowFilters] = useState(false);

    const isMobile = useMediaQuery('(max-width:600px)');
    const isTablet = useMediaQuery('(max-width:900px)');
    const theme = useTheme();

    const fetchData = async () => {
        try {
            setError(null);
            const response = await axios.get('/exam/mark-entry/all-marks');
            setMarksData(response.data);
            setFilteredData(response.data);
            setStudents(getUniqueBy(response.data, m => `${m.student.firstName} ${m.student.lastName}`));
            setTeachers(getUniqueBy(response.data, m => `${m.teacher.firstName} ${m.teacher.lastName}`));
            setClassrooms(getUniqueBy(response.data, m => m.classroom.name));
            setExamTypes(getUniqueBy(response.data, m => m.examType));
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error("Error fetching marks:", error);
            setError("Failed to load dashboard data. Please try again.");
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
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

    const clearAllFilters = () => {
        setSelectedStudent(null);
        setSelectedTeacher(null);
        setSelectedClassroom(null);
        setSelectedExamType(null);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const activeFiltersCount = [selectedStudent, selectedTeacher, selectedClassroom, selectedExamType].filter(Boolean).length;

    if (loading) {
        return (
            <Box p={4}>
                <Card sx={{ borderRadius: 4, boxShadow: 3, mb: 4 }}>
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            p: 3,
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                        }}
                    >
                        <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2, bgcolor: alpha('#fff', 0.2) }} />
                    </Box>
                    <CardContent sx={{ pt: 4 }}>
                        <Grid container spacing={3}>
                            {[...Array(8)].map((_, i) => (
                                <Grid item xs={12} md={6} key={i}>
                                    <Skeleton variant="rectangular" width="100%" height={350} sx={{ borderRadius: 3 }} />
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={4} display="flex" justifyContent="center" alignItems="center" height="60vh">
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    <AlertTitle>Error Loading Dashboard</AlertTitle>
                    {error}
                    <Button onClick={handleRefresh} startIcon={<RefreshIcon />} sx={{ mt: 2 }}>
                        Try Again
                    </Button>
                </Alert>
            </Box>
        );
    }

    // Calculate analytics data
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
        average: Math.round((subject.totalMarks / subject.count) * 10) / 10,
    }));

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

    const averageMarksByStudent = totalMarksByStudent.map(s => ({
        ...s,
        average: Math.round((s.totalMarks / filteredData.filter(m => `${m.student.firstName} ${m.student.lastName}` === s.student).length) * 10) / 10
    }));

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
        average: Math.round((item.totalMarks / item.count) * 10) / 10
    }));

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
        average: Math.round((item.totalMarks / item.count) * 10) / 10
    }));

    const subjectDifficultyIndex = [...averageMarksBySubject].sort((a, b) => a.average - b.average);

    // Summary statistics
    const totalStudents = students.length;
    const totalSubjects = averageMarksBySubject.length;
    const overallAverage = Math.round((filteredData.reduce((sum, entry) => sum + entry.marks, 0) / filteredData.length) * 10) / 10;
    const highestScore = Math.max(...filteredData.map(entry => entry.marks));
    const lowestScore = Math.min(...filteredData.map(entry => entry.marks));

    const CustomTooltip = ({ active, payload, label, chartType, description }) => {
        if (active && payload && payload.length) {
            const data = payload[0];

            return (
                <Paper
                    sx={{
                        p: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: 'none',
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        backdropFilter: 'blur(8px)',
                        maxWidth: 280,
                    }}
                >
                    <Typography variant="subtitle2" fontWeight="600" color="primary" gutterBottom>
                        {chartType}
                    </Typography>

                    <Box mb={1.5}>
                        <Typography variant="body2" fontWeight="500" color="text.primary">
                            {label}: {data.value}
                            {chartType.includes('Average') || chartType.includes('Marks') ? '%' : ''}
                        </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{
                        fontStyle: 'italic',
                        lineHeight: 1.4,
                        display: 'block'
                    }}>
                        💡 {description}
                    </Typography>
                </Paper>
            );
        }
        return null;
    };



    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <Grow in timeout={600}>
            <Card
                sx={{
                    borderRadius: 3,
                    background: color,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100px',
                        height: '100px',
                        background: alpha('#fff', 0.1),
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)',
                    }
                }}
            >
                <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {value}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                        <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 60, height: 60 }}>
                            {icon}
                        </Avatar>
                    </Stack>
                </CardContent>
            </Card>
        </Grow>
    );

    const ChartCard = ({ title, children, icon, delay = 0 }) => (
        <Grow in timeout={800 + delay}>
            <Card
                sx={{
                    borderRadius: 3,
                    boxShadow: theme.shadows[8],
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[16],
                    }
                }}
            >
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {icon}
                        </Avatar>
                        <Typography variant="h6" fontWeight="600" color="text.primary">
                            {title}
                        </Typography>
                    </Stack>
                    {children}
                </CardContent>
            </Card>
        </Grow>
    );

    return (
        <Box p={isMobile ? 2 : 4} sx={{ bgcolor: 'rgba(248,250,252,0)', minHeight: '100vh' }}>
            <Fade in timeout={400}>
                <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[12], mb: 4, overflow: 'hidden' }}>
                    {/* Header */}
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            p: 4,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="0.05"%3E%3Ccircle cx="20" cy="20" r="2"/%3E%3C/g%3E%3C/svg%3E")',
                            }
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                            <Stack direction="row" alignItems="center" spacing={3}>
                                <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 64, height: 64 }}>
                                    <AnalyticsIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                                        Academic Dashboard
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                        Comprehensive insights from student performance analytics
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <MuiTooltip title="Refresh Data">
                                    <IconButton
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        sx={{
                                            bgcolor: alpha('#fff', 0.1),
                                            color: 'white',
                                            '&:hover': { bgcolor: alpha('#fff', 0.2) }
                                        }}
                                    >
                                        <RefreshIcon className={refreshing ? 'animate-spin' : ''} />
                                    </IconButton>
                                </MuiTooltip>

                                <MuiTooltip title={`Toggle Filters ${activeFiltersCount ? `(${activeFiltersCount})` : ''}`}>
                                    <IconButton
                                        onClick={() => setShowFilters(!showFilters)}
                                        sx={{
                                            bgcolor: alpha('#fff', showFilters ? 0.2 : 0.1),
                                            color: 'white',
                                            position: 'relative',
                                            '&:hover': { bgcolor: alpha('#fff', 0.2) }
                                        }}
                                    >
                                        <FilterIcon />
                                        {activeFiltersCount > 0 && (
                                            <Chip
                                                label={activeFiltersCount}
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    bgcolor: '#ff4757',
                                                    color: 'white',
                                                    fontSize: '0.7rem',
                                                    height: 20,
                                                    minWidth: 20,
                                                }}
                                            />
                                        )}
                                    </IconButton>
                                </MuiTooltip>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Filters Section */}
                    <Fade in={showFilters}>
                        <CardContent sx={{ pt: 4, display: showFilters ? 'block' : 'none' }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                                }}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                                    <Typography variant="h6" fontWeight="600" color="primary">
                                        Filter Analytics
                                    </Typography>
                                    {activeFiltersCount > 0 && (
                                        <Button
                                            size="small"
                                            startIcon={<ClearIcon />}
                                            onClick={clearAllFilters}
                                            sx={{ borderRadius: 3 }}
                                        >
                                            Clear All
                                        </Button>
                                    )}
                                </Stack>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Autocomplete
                                            options={students}
                                            value={selectedStudent}
                                            onChange={(e, value) => setSelectedStudent(value)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Filter by Student"
                                                    variant="outlined"
                                                    fullWidth
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                    }}
                                                />
                                            )}
                                            clearOnEscape
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Autocomplete
                                            options={teachers}
                                            value={selectedTeacher}
                                            onChange={(e, value) => setSelectedTeacher(value)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Filter by Teacher"
                                                    variant="outlined"
                                                    fullWidth
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                    }}
                                                />
                                            )}
                                            clearOnEscape
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Autocomplete
                                            options={classrooms}
                                            value={selectedClassroom}
                                            onChange={(e, value) => setSelectedClassroom(value)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Filter by Classroom"
                                                    variant="outlined"
                                                    fullWidth
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: <ClassIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                    }}
                                                />
                                            )}
                                            clearOnEscape
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Autocomplete
                                            options={examTypes}
                                            value={selectedExamType}
                                            onChange={(e, value) => setSelectedExamType(value)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Filter by Exam Type"
                                                    variant="outlined"
                                                    fullWidth
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: <QuizIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                    }}
                                                />
                                            )}
                                            clearOnEscape
                                        />
                                    </Grid>
                                </Grid>

                                {/* Active Filters Display */}
                                {activeFiltersCount > 0 && (
                                    <Box mt={3}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Active Filters:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {selectedStudent && (
                                                <Chip
                                                    label={`Student: ${selectedStudent}`}
                                                    onDelete={() => setSelectedStudent(null)}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                            {selectedTeacher && (
                                                <Chip
                                                    label={`Teacher: ${selectedTeacher}`}
                                                    onDelete={() => setSelectedTeacher(null)}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                            {selectedClassroom && (
                                                <Chip
                                                    label={`Classroom: ${selectedClassroom}`}
                                                    onDelete={() => setSelectedClassroom(null)}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                            {selectedExamType && (
                                                <Chip
                                                    label={`Exam: ${selectedExamType}`}
                                                    onDelete={() => setSelectedExamType(null)}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                )}
                            </Paper>
                        </CardContent>
                    </Fade>
                </Card>
            </Fade>

            {/* Statistics Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="Total Students"
                        value={totalStudents}
                        icon={<PersonIcon />}
                        color={GRADIENT_COLORS[0]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="Subjects"
                        value={totalSubjects}
                        icon={<AssignmentIcon />}
                        color={GRADIENT_COLORS[1]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="Overall Average"
                        value={`${overallAverage}%`}
                        icon={<AnalyticsIcon />}
                        color={GRADIENT_COLORS[2]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="Highest Score"
                        value={`${highestScore}%`}
                        icon={<TrendingUpIcon />}
                        color={GRADIENT_COLORS[3]}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <StatCard
                        title="Lowest Score"
                        value={`${lowestScore}%`}
                        icon={<TrendingDownIcon />}
                        color={GRADIENT_COLORS[4]}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                {/* Chart 1: Average Marks per Subject - ENHANCED */}
                <Grid item xs={12} md={6}>
                    <ChartCard
                        title="Average Marks per Subject"
                        icon={<AssignmentIcon />}
                        delay={100}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={averageMarksBySubject} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorSubject" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    content={({ active, payload, label }) => (
                                        <CustomTooltip
                                            active={active}
                                            payload={payload}
                                            label={label}
                                            chartType="Subject Performance Analysis"
                                            description="This shows the mean score across all students for each subject. Higher bars indicate subjects where students generally perform better."
                                        />
                                    )}
                                />
                                <Bar dataKey="average" fill="url(#colorSubject)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Chart 2: Marks Distribution by Subject - ENHANCED */}
                <Grid item xs={12} md={6}>
                    <ChartCard
                        title="Marks Distribution by Subject"
                        icon={<GradeIcon />}
                        delay={200}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <defs>
                                    {COLORS.map((color, index) => (
                                        <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={color} stopOpacity={1}/>
                                            <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={marksDistribution}
                                    dataKey="total"
                                    nameKey="subject"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    paddingAngle={2}
                                    label={({ subject, percent }) => `${subject} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {marksDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#pieGradient${index % COLORS.length})`} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <CustomTooltip
                                                    active={true}
                                                    payload={[{ value: data.total }]}
                                                    label={data.subject}
                                                    chartType="Subject Contribution Analysis"
                                                    description="This represents what percentage of total marks each subject contributes. Larger slices indicate subjects with higher total mark accumulation."
                                                />
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Chart 3: Total Marks by Student - ENHANCED */}
                <Grid item xs={12}>
                    <ChartCard
                        title="Total Marks by Student"
                        icon={<PersonIcon />}
                        delay={300}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={totalMarksByStudent}
                                layout="vertical"
                                margin={{ top: 20, right: 80, left: 0, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="colorStudent" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="student" type="category" width={150} tick={{ fontSize: 11 }} interval={0} />
                                <Tooltip
                                    content={({ active, payload, label }) => (
                                        <CustomTooltip
                                            active={active}
                                            payload={payload}
                                            label={label}
                                            chartType="Individual Student Performance"
                                            description="Shows cumulative marks earned by each student across all subjects and exams. Longer bars indicate students with higher total achievement."
                                        />
                                    )}
                                />
                                <Bar dataKey="totalMarks" fill="url(#colorStudent)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Chart 4: Top 5 Students - ENHANCED */}
                <Grid item xs={12} md={6}>
                    <ChartCard
                        title="🏆 Top 5 Students by Average Marks"
                        icon={<TrendingUpIcon />}
                        delay={400}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={[...averageMarksByStudent].sort((a, b) => b.average - a.average).slice(0, 5)}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="colorTopStudents" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#38f9d7" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="student" type="category" width={110} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    content={({ active, payload, label }) => (
                                        <CustomTooltip
                                            active={active}
                                            payload={payload}
                                            label={label}
                                            chartType="Academic Excellence Leaders"
                                            description="Highlights the top-performing students based on average marks across all subjects. These students demonstrate consistent high achievement."
                                        />
                                    )}
                                />
                                <Bar dataKey="average" fill="url(#colorTopStudents)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Chart 5: Bottom 5 Students - ENHANCED */}
                <Grid item xs={12} md={6}>
                    <ChartCard
                        title="📈 Students Needing Support"
                        icon={<TrendingDownIcon />}
                        delay={500}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={[...averageMarksByStudent].sort((a, b) => a.average - b.average).slice(0, 5)}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                            >
                                <defs>
                                    <linearGradient id="colorBottomStudents" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor="#fa709a" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#fee140" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="student" type="category" width={110} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    content={({ active, payload, label }) => (
                                        <CustomTooltip
                                            active={active}
                                            payload={payload}
                                            label={label}
                                            chartType="Academic Support Priority"
                                            description="Identifies students with lower average marks who may benefit from additional academic support and personalized attention."
                                        />
                                    )}
                                />
                                <Bar dataKey="average" fill="url(#colorBottomStudents)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Chart 6: Average Marks by Exam Type - ENHANCED */}
                <Grid item xs={12} md={6}>
                    <ChartCard
                        title="Average Marks by Exam Type"
                        icon={<QuizIcon />}
                        delay={600}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={averageMarksByExamType} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorExamType" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f5576c" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="examType" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    content={({ active, payload, label }) => (
                                        <CustomTooltip
                                            active={active}
                                            payload={payload}
                                            label={label}
                                            chartType="Assessment Type Analysis"
                                            description="Compares student performance across different examination formats. Helps identify which assessment types students find more challenging."
                                        />
                                    )}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="average"
                                    stroke="#f093fb"
                                    fillOpacity={1}
                                    fill="url(#colorExamType)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Chart 7: Classroom-Wise Average Marks - ENHANCED */}
                <Grid item xs={12} md={6}>
                    <ChartCard
                        title="Average Marks by Classroom"
                        icon={<ClassIcon />}
                        delay={700}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={averageMarksByClassroom} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorClassroom" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a8edea" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#fed6e3" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="classroom" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    content={({ active, payload, label }) => (
                                        <CustomTooltip
                                            active={active}
                                            payload={payload}
                                            label={label}
                                            chartType="Classroom Performance Comparison"
                                            description="Shows average academic performance by classroom. Useful for identifying high-performing classes and those needing additional resources."
                                        />
                                    )}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="average"
                                    stroke="#00d2ff"
                                    fillOpacity={1}
                                    fill="url(#colorClassroom)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="average"
                                    stroke="#00d2ff"
                                    strokeWidth={4}
                                    dot={{ fill: '#00d2ff', strokeWidth: 2, r: 6 }}
                                    activeDot={{ r: 8, stroke: '#00d2ff', strokeWidth: 2, fill: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Chart 8: Subject Difficulty Index - ENHANCED */}
                <Grid item xs={12}>
                    <ChartCard
                        title="Subject Difficulty Analysis"
                        icon={<AnalyticsIcon />}
                        delay={800}
                    >
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Lower average scores indicate higher difficulty level
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={subjectDifficultyIndex} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorDifficulty" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    content={({ active, payload, label }) => (
                                        <CustomTooltip
                                            active={active}
                                            payload={payload}
                                            label={label}
                                            chartType="Subject Difficulty Assessment"
                                            description="Ranks subjects by difficulty based on average student performance. Lower scores suggest the subject is more challenging and may need curriculum review."
                                        />
                                    )}
                                />
                                <Bar
                                    dataKey="average"
                                    fill="url(#colorDifficulty)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Grid>

                {/* Performance Insights */}
                <Grid item xs={12}>
                    <ChartCard
                        title="Performance Insights & Recommendations"
                        icon={<TrendingUpIcon />}
                        delay={900}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                        color: 'white',
                                        textAlign: 'center'
                                    }}
                                >
                                    <TrendingUpIcon sx={{ fontSize: 48, mb: 2 }} />
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Best Performing Subject
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {averageMarksBySubject.length > 0 ?
                                            [...averageMarksBySubject].sort((a, b) => b.average - a.average)[0]?.subject
                                            : 'N/A'
                                        }
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                                        Average: {averageMarksBySubject.length > 0 ?
                                        [...averageMarksBySubject].sort((a, b) => b.average - a.average)[0]?.average
                                        : 0
                                    }%
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                        color: 'white',
                                        textAlign: 'center'
                                    }}
                                >
                                    <TrendingDownIcon sx={{ fontSize: 48, mb: 2 }} />
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Needs Improvement
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {subjectDifficultyIndex.length > 0 ? subjectDifficultyIndex[0]?.subject : 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                                        Average: {subjectDifficultyIndex.length > 0 ? subjectDifficultyIndex[0]?.average : 0}%
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        textAlign: 'center'
                                    }}
                                >
                                    <AnalyticsIcon sx={{ fontSize: 48, mb: 2 }} />
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Performance Trend
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {overallAverage >= 70 ? 'Excellent' : overallAverage >= 60 ? 'Good' : 'Improving'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                                        Overall: {overallAverage}%
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Box mt={4}>
                            <Typography variant="h6" fontWeight="600" gutterBottom color="primary">
                                📋 Key Recommendations
                            </Typography>
                            <Grid container spacing={2}>
                                {subjectDifficultyIndex.slice(0, 3).map((subject, index) => (
                                    <Grid item xs={12} md={4} key={subject.subject}>
                                        <Alert
                                            severity={subject.average < 50 ? 'error' : subject.average < 70 ? 'warning' : 'success'}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            <AlertTitle>{subject.subject}</AlertTitle>
                                            {subject.average < 50 ?
                                                'Requires immediate attention and additional support' :
                                                subject.average < 70 ?
                                                    'Could benefit from targeted improvement strategies' :
                                                    'Performing well, maintain current standards'
                                            }
                                        </Alert>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </ChartCard>
                </Grid>
            </Grid>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </Box>
    );
};

export default DashboardPage;