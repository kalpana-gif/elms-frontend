import {
    Typography,
    Box,
    Stack,
    Card,
    CardContent,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useMediaQuery,
    TextField,
    InputAdornment,
    Grid,
    Autocomplete,
    Button,
    Chip,
    IconButton,
    Tooltip,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TablePagination,
    TableSortLabel,
    Collapse,
    Alert,
    CircularProgress,
    useTheme,
    Fade,
    Divider,
    LinearProgress,
    Menu,
    Snackbar
} from '@mui/material';
import {
    Grade as GradeIcon,
    Search,
    FilterList,
    Clear,
    Download,
    Visibility,
    ExpandMore,
    ExpandLess,
    School,
    Person,
    Subject,
    CalendarMonth,
    TrendingUp,
    Assessment,
    FileDownload,
    Print,
    GetApp,
    TableChart
} from '@mui/icons-material';
import { useEffect, useState, useMemo } from 'react';
import axios from '../api/axiosConfig';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

interface Subject {
    id: string;
    name: string;
}

interface Classroom {
    id: string;
    name: string;
}

interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
}

interface Mark {
    id: string;
    marks: number;
    examType: string;
    batchYear: string;
    createdAt: string;
    student: Student;
    subject: Subject;
    classroom: Classroom;
    teacher: Teacher;
}

type SortDirection = 'asc' | 'desc';
type SortField = 'studentName' | 'subject' | 'marks' | 'examType' | 'classroom' | 'batchYear' | 'createdAt';

const MarkListViewPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:600px)');
    const isTablet = useMediaQuery('(max-width:900px)');

    // State for data
    const [marks, setMarks] = useState<Mark[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedExamType, setSelectedExamType] = useState<string>('');
    const [selectedBatchYear, setSelectedBatchYear] = useState<string>('');
    const [marksRange, setMarksRange] = useState({ min: '', max: '' });
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    // State for UI
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Derived data for filter options
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [examTypes, setExamTypes] = useState<string[]>([]);
    const [batchYears, setBatchYears] = useState<string[]>([]);

    const fetchMarks = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get('/exam/mark-entry/all-marks');
            const marksData = res.data || [];
            setMarks(marksData);

            // Extract unique values for filter options
            const uniqueClassrooms = Array.from(
                new Map(marksData.filter(m => m.classroom).map(m => [m.classroom.id, m.classroom])).values()
            );
            const uniqueSubjects = Array.from(
                new Map(marksData.filter(m => m.subject).map(m => [m.subject.id, m.subject])).values()
            );
            const uniqueTeachers = Array.from(
                new Map(marksData.filter(m => m.teacher).map(m => [m.teacher.id, m.teacher])).values()
            );
            const uniqueExamTypes = [...new Set(marksData.map(m => m.examType).filter(Boolean))];
            const uniqueBatchYears = [...new Set(marksData.map(m => m.batchYear).filter(Boolean))];

            setClassrooms(uniqueClassrooms);
            setSubjects(uniqueSubjects);
            setTeachers(uniqueTeachers);
            setExamTypes(uniqueExamTypes);
            setBatchYears(uniqueBatchYears);
        } catch (error) {
            console.error('Error fetching marks:', error);
            setError('Failed to load marks data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarks();
    }, []);

    // Filter and sort logic
    const filteredAndSortedMarks = useMemo(() => {
        let filtered = marks.filter(mark => {
            // Search query filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const studentName = `${mark.student?.firstName || ''} ${mark.student?.lastName || ''}`.toLowerCase();
                const subjectName = mark.subject?.name?.toLowerCase() || '';
                const examType = mark.examType?.toLowerCase() || '';
                const classroomName = mark.classroom?.name?.toLowerCase() || '';

                if (!studentName.includes(query) &&
                    !subjectName.includes(query) &&
                    !examType.includes(query) &&
                    !classroomName.includes(query)) {
                    return false;
                }
            }

            // Classroom filter
            if (selectedClassroom && mark.classroom?.id !== selectedClassroom.id) {
                return false;
            }

            // Subject filter
            if (selectedSubject && mark.subject?.id !== selectedSubject.id) {
                return false;
            }

            // Exam type filter
            if (selectedExamType && mark.examType !== selectedExamType) {
                return false;
            }

            // Batch year filter
            if (selectedBatchYear && mark.batchYear !== selectedBatchYear) {
                return false;
            }

            // Teacher filter
            if (selectedTeacher && mark.teacher?.id !== selectedTeacher.id) {
                return false;
            }

            // Marks range filter
            if (marksRange.min && mark.marks < parseInt(marksRange.min)) {
                return false;
            }
            if (marksRange.max && mark.marks > parseInt(marksRange.max)) {
                return false;
            }

            // Date range filter
            if (dateRange.from && new Date(mark.createdAt) < new Date(dateRange.from)) {
                return false;
            }
            if (dateRange.to && new Date(mark.createdAt) > new Date(dateRange.to)) {
                return false;
            }

            return true;
        });

        // Sort logic
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortField) {
                case 'studentName':
                    aValue = `${a.student?.firstName || ''} ${a.student?.lastName || ''}`.toLowerCase();
                    bValue = `${b.student?.firstName || ''} ${b.student?.lastName || ''}`.toLowerCase();
                    break;
                case 'subject':
                    aValue = a.subject?.name?.toLowerCase() || '';
                    bValue = b.subject?.name?.toLowerCase() || '';
                    break;
                case 'marks':
                    aValue = a.marks;
                    bValue = b.marks;
                    break;
                case 'examType':
                    aValue = a.examType?.toLowerCase() || '';
                    bValue = b.examType?.toLowerCase() || '';
                    break;
                case 'classroom':
                    aValue = a.classroom?.name?.toLowerCase() || '';
                    bValue = b.classroom?.name?.toLowerCase() || '';
                    break;
                case 'batchYear':
                    aValue = a.batchYear;
                    bValue = b.batchYear;
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [marks, searchQuery, selectedClassroom, selectedSubject, selectedExamType,
        selectedBatchYear, selectedTeacher, marksRange, dateRange, sortField, sortDirection]);

    // Pagination
    const paginatedMarks = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredAndSortedMarks.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredAndSortedMarks, page, rowsPerPage]);

    // Statistics
    const statistics = useMemo(() => {
        if (filteredAndSortedMarks.length === 0) return null;

        const marks = filteredAndSortedMarks.map(m => m.marks);
        const total = marks.length;
        const average = marks.reduce((sum, mark) => sum + mark, 0) / total;
        const highest = Math.max(...marks);
        const lowest = Math.min(...marks);
        const passing = marks.filter(mark => mark >= 50).length;
        const passingRate = (passing / total) * 100;

        return { total, average, highest, lowest, passing, passingRate };
    }, [filteredAndSortedMarks]);

    // Export Functions
    const getGrade = (marks: number) => {
        if (marks >= 90) return 'A+';
        if (marks >= 80) return 'A';
        if (marks >= 70) return 'B';
        if (marks >= 60) return 'C';
        if (marks >= 50) return 'D';
        return 'F';
    };

    const getFilterSummary = () => {
        const filters = [];
        if (searchQuery) filters.push(`Search: "${searchQuery}"`);
        if (selectedClassroom) filters.push(`Classroom: ${selectedClassroom.name}`);
        if (selectedSubject) filters.push(`Subject: ${selectedSubject.name}`);
        if (selectedExamType) filters.push(`Exam Type: ${selectedExamType}`);
        if (selectedBatchYear) filters.push(`Batch Year: ${selectedBatchYear}`);
        if (selectedTeacher) filters.push(`Teacher: ${selectedTeacher.firstName} ${selectedTeacher.lastName}`);
        if (marksRange.min || marksRange.max) {
            filters.push(`Marks Range: ${marksRange.min || 0} - ${marksRange.max || 100}`);
        }
        if (dateRange.from || dateRange.to) {
            filters.push(`Date Range: ${dateRange.from || 'Start'} to ${dateRange.to || 'End'}`);
        }
        return filters;
    };

    const exportToExcel = async () => {
        try {
            setExporting(true);

            // Simulate processing time for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            // Prepare main data for export
            const exportData = filteredAndSortedMarks.map(mark => ({
                'Student Name': `${mark.student?.firstName || ''} ${mark.student?.lastName || ''}`.trim(),
                'Subject': mark.subject?.name || 'N/A',
                'Marks': mark.marks,
                'Grade': getGrade(mark.marks),
                'Exam Type': mark.examType || 'N/A',
                'Classroom': mark.classroom?.name || 'N/A',
                'Batch Year': mark.batchYear || 'N/A',
                'Teacher': `${mark.teacher?.firstName || ''} ${mark.teacher?.lastName || ''}`.trim(),
                'Created At': mark.createdAt ? new Date(mark.createdAt).toLocaleString() : 'N/A'
            }));

            // Create main worksheet
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Set column widths
            const colWidths = [
                { wch: 20 }, // Student Name
                { wch: 15 }, // Subject
                { wch: 8 },  // Marks
                { wch: 8 },  // Grade
                { wch: 15 }, // Exam Type
                { wch: 15 }, // Classroom
                { wch: 12 }, // Batch Year
                { wch: 20 }, // Teacher
                { wch: 20 }  // Created At
            ];
            worksheet['!cols'] = colWidths;

            // Style the header row
            const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
            for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                if (!worksheet[cellAddress]) continue;

                worksheet[cellAddress].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4F81BD" } },
                    alignment: { horizontal: "center" }
                };
            }

            // Create summary data
            let summaryData = [
                { 'Report Information': 'Export Date', 'Value': new Date().toLocaleString() },
                { 'Report Information': 'Total Records Exported', 'Value': exportData.length },
                { 'Report Information': 'Total Records Available', 'Value': marks.length },
                { 'Report Information': '', 'Value': '' }, // Empty row
            ];

            if (statistics) {
                summaryData.push(
                    { 'Report Information': 'Statistics', 'Value': '' },
                    { 'Report Information': 'Average Score', 'Value': statistics.average.toFixed(1) },
                    { 'Report Information': 'Highest Score', 'Value': statistics.highest },
                    { 'Report Information': 'Lowest Score', 'Value': statistics.lowest },
                    { 'Report Information': 'Passing Students', 'Value': statistics.passing },
                    { 'Report Information': 'Pass Rate (%)', 'Value': statistics.passingRate.toFixed(1) }
                );
            }

            // Add filter summary
            const filters = getFilterSummary();
            if (filters.length > 0) {
                summaryData.push({ 'Report Information': '', 'Value': '' }); // Empty row
                summaryData.push({ 'Report Information': 'Applied Filters', 'Value': '' });
                filters.forEach(filter => {
                    summaryData.push({ 'Report Information': filter, 'Value': '' });
                });
            }

            const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
            summaryWorksheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

            // Style summary headers
            if (summaryData.length > 0) {
                ['A1', 'B1'].forEach(cell => {
                    if (summaryWorksheet[cell]) {
                        summaryWorksheet[cell].s = {
                            font: { bold: true, color: { rgb: "FFFFFF" } },
                            fill: { fgColor: { rgb: "4F81BD" } },
                            alignment: { horizontal: "center" }
                        };
                    }
                });
            }

            // Create grade distribution sheet
            const gradeDistribution = {};
            filteredAndSortedMarks.forEach(mark => {
                const grade = getGrade(mark.marks);
                gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
            });

            const gradeData = Object.entries(gradeDistribution).map(([grade, count]) => ({
                'Grade': grade,
                'Count': count,
                'Percentage': ((count / filteredAndSortedMarks.length) * 100).toFixed(1) + '%'
            }));

            const gradeWorksheet = XLSX.utils.json_to_sheet(gradeData);
            gradeWorksheet['!cols'] = [{ wch: 10 }, { wch: 10 }, { wch: 15 }];

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Student Marks");
            XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
            XLSX.utils.book_append_sheet(workbook, gradeWorksheet, "Grade Distribution");

            // Generate filename
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `Student_Marks_Report_${timestamp}.xlsx`;

            // Save file
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            saveAs(data, filename);

            setSnackbar({
                open: true,
                message: `Successfully exported ${exportData.length} records to ${filename}`,
                severity: 'success'
            });

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            setSnackbar({
                open: true,
                message: 'Failed to export data. Please try again.',
                severity: 'error'
            });
        } finally {
            setExporting(false);
        }
    };

    const exportToCSV = async () => {
        try {
            setExporting(true);

            await new Promise(resolve => setTimeout(resolve, 300));

            const csvData = filteredAndSortedMarks.map(mark => [
                `${mark.student?.firstName || ''} ${mark.student?.lastName || ''}`.trim(),
                mark.subject?.name || 'N/A',
                mark.marks,
                getGrade(mark.marks),
                mark.examType || 'N/A',
                mark.classroom?.name || 'N/A',
                mark.batchYear || 'N/A',
                `${mark.teacher?.firstName || ''} ${mark.teacher?.lastName || ''}`.trim(),
                mark.createdAt ? new Date(mark.createdAt).toLocaleString() : 'N/A'
            ]);

            const headers = [
                'Student Name', 'Subject', 'Marks', 'Grade', 'Exam Type',
                'Classroom', 'Batch Year', 'Teacher', 'Created At'
            ];
            csvData.unshift(headers);

            const csvContent = csvData
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `Student_Marks_Report_${timestamp}.csv`;

            saveAs(blob, filename);

            setSnackbar({
                open: true,
                message: `Successfully exported ${csvData.length - 1} records to CSV`,
                severity: 'success'
            });

        } catch (error) {
            console.error('Error exporting to CSV:', error);
            setSnackbar({
                open: true,
                message: 'Failed to export data. Please try again.',
                severity: 'error'
            });
        } finally {
            setExporting(false);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedClassroom(null);
        setSelectedSubject(null);
        setSelectedExamType('');
        setSelectedBatchYear('');
        setSelectedTeacher(null);
        setMarksRange({ min: '', max: '' });
        setDateRange({ from: '', to: '' });
        setPage(0);
    };

    const getGradeColor = (marks: number) => {
        if (marks >= 90) return '#4caf50'; // A+ - Green
        if (marks >= 80) return '#8bc34a'; // A - Light Green
        if (marks >= 70) return '#ff9800'; // B - Orange
        if (marks >= 60) return '#ff5722'; // C - Deep Orange
        if (marks >= 50) return '#f44336'; // D - Red
        return '#9e9e9e'; // F - Grey
    };

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (searchQuery) count++;
        if (selectedClassroom) count++;
        if (selectedSubject) count++;
        if (selectedExamType) count++;
        if (selectedBatchYear) count++;
        if (selectedTeacher) count++;
        if (marksRange.min || marksRange.max) count++;
        if (dateRange.from || dateRange.to) count++;
        return count;
    }, [searchQuery, selectedClassroom, selectedSubject, selectedExamType,
        selectedBatchYear, selectedTeacher, marksRange, dateRange]);

    return (
        <Box p={isMobile ? 2 : 4}>
            {/* Header with Statistics */}
            <Fade in timeout={600}>
                <Card sx={{
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    mb: 3,
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        p: 4,
                        color: 'white',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: 'inherit'
                        }
                    }}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Stack direction={isMobile ? 'column' : 'row'} alignItems="center" spacing={3}>
                                <Avatar sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    width: 64,
                                    height: 64,
                                    backdropFilter: 'blur(10px)',
                                    border: '2px solid rgba(255,255,255,0.3)'
                                }}>
                                    <GradeIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Box flex={1}>
                                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                                        Student Marks Dashboard
                                    </Typography>
                                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                        Comprehensive view of all student performance data
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* Statistics Cards */}
                            {statistics && (
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid item xs={6} sm={3}>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',color:"white"}}>
                                            <Typography variant="h4" fontWeight="bold" color="inherit">
                                                {statistics.total}
                                            </Typography>
                                            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                                                Total Records
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',color:"white" }}>
                                            <Typography variant="h4" fontWeight="bold" color="inherit">
                                                {statistics.average.toFixed(1)}
                                            </Typography>
                                            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                                                Average Score
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' ,color:"white"}}>
                                            <Typography variant="h4" fontWeight="bold" color="inherit">
                                                {statistics.highest}
                                            </Typography>
                                            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                                                Highest Score
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' ,color:"white"}}>
                                            <Typography variant="h4" fontWeight="bold" color="inherit">
                                                {statistics.passingRate.toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                                                Pass Rate
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                    </Box>
                </Card>
            </Fade>

            {/* Search and Filter Section */}
            <Fade in timeout={800}>
                <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        {/* Search and Filter Toggle */}
                        <Grid container spacing={2} alignItems="center" mb={2}>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search by student name, subject, exam type, or classroom..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchQuery && (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setSearchQuery('')} edge="end">
                                                    <Clear />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main,
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button
                                        variant="outlined"
                                        startIcon={<FilterList />}
                                        endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                                        onClick={() => setShowFilters(!showFilters)}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Filters
                                        {activeFiltersCount > 0 && (
                                            <Chip
                                                size="small"
                                                label={activeFiltersCount}
                                                color="primary"
                                                sx={{ ml: 1, minWidth: 'auto' }}
                                            />
                                        )}
                                    </Button>
                                    {activeFiltersCount > 0 && (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            startIcon={<Clear />}
                                            onClick={clearAllFilters}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>

                        {/* Expanded Filters */}
                        <Collapse in={showFilters}>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Autocomplete
                                        options={classrooms}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedClassroom}
                                        onChange={(_, value) => setSelectedClassroom(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Classroom"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <School fontSize="small" />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Autocomplete
                                        options={subjects}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedSubject}
                                        onChange={(_, value) => setSelectedSubject(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Subject"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Subject fontSize="small" />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Exam Type</InputLabel>
                                        <Select
                                            value={selectedExamType}
                                            onChange={(e) => setSelectedExamType(e.target.value)}
                                            label="Exam Type"
                                            startAdornment={<Assessment sx={{ mr: 1, fontSize: 20 }} />}
                                        >
                                            <MenuItem value="">All Types</MenuItem>
                                            {examTypes.map((type) => (
                                                <MenuItem key={type} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Autocomplete
                                        options={teachers}
                                        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                                        value={selectedTeacher}
                                        onChange={(_, value) => setSelectedTeacher(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Teacher"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Person fontSize="small" />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Batch Year</InputLabel>
                                        <Select
                                            value={selectedBatchYear}
                                            onChange={(e) => setSelectedBatchYear(e.target.value)}
                                            label="Batch Year"
                                            startAdornment={<CalendarMonth sx={{ mr: 1, fontSize: 20 }} />}
                                        >
                                            <MenuItem value="">All Years</MenuItem>
                                            {batchYears.map((year) => (
                                                <MenuItem key={year} value={year}>
                                                    {year}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            label="Min Marks"
                                            type="number"
                                            value={marksRange.min}
                                            onChange={(e) => setMarksRange(prev => ({ ...prev, min: e.target.value }))}
                                            inputProps={{ min: 0, max: 100 }}
                                        />
                                        <TextField
                                            label="Max Marks"
                                            type="number"
                                            value={marksRange.max}
                                            onChange={(e) => setMarksRange(prev => ({ ...prev, max: e.target.value }))}
                                            inputProps={{ min: 0, max: 100 }}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            label="From Date"
                                            type="date"
                                            value={dateRange.from}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                            InputLabelProps={{ shrink: true }}
                                            fullWidth
                                        />
                                        <TextField
                                            label="To Date"
                                            type="date"
                                            value={dateRange.to}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                            InputLabelProps={{ shrink: true }}
                                            fullWidth
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Collapse>
                    </CardContent>
                </Card>
            </Fade>

            {/* Results Summary */}
            {!loading && (
                <Fade in timeout={1000}>
                    <Box mb={2}>
                        <Typography variant="body1" color="text.secondary">
                            Showing {paginatedMarks.length} of {filteredAndSortedMarks.length} records
                            {activeFiltersCount > 0 && ` (filtered from ${marks.length} total)`}
                        </Typography>
                    </Box>
                </Fade>
            )}

            {/* Main Table */}
            <Fade in timeout={1200}>
                <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    {loading && <LinearProgress />}

                    <CardContent sx={{ p: 0 }}>
                        {error ? (
                            <Alert severity="error" sx={{ m: 3 }}>
                                {error}
                            </Alert>
                        ) : (
                            <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'studentName'}
                                                    direction={sortField === 'studentName' ? sortDirection : 'asc'}
                                                    onClick={() => handleSort('studentName')}
                                                >
                                                    Student Name
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'subject'}
                                                    direction={sortField === 'subject' ? sortDirection : 'asc'}
                                                    onClick={() => handleSort('subject')}
                                                >
                                                    Subject
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'marks'}
                                                    direction={sortField === 'marks' ? sortDirection : 'asc'}
                                                    onClick={() => handleSort('marks')}
                                                >
                                                    Marks & Grade
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'examType'}
                                                    direction={sortField === 'examType' ? sortDirection : 'asc'}
                                                    onClick={() => handleSort('examType')}
                                                >
                                                    Exam Type
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'classroom'}
                                                    direction={sortField === 'classroom' ? sortDirection : 'asc'}
                                                    onClick={() => handleSort('classroom')}
                                                >
                                                    Classroom
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'batchYear'}
                                                    direction={sortField === 'batchYear' ? sortDirection : 'asc'}
                                                    onClick={() => handleSort('batchYear')}
                                                >
                                                    Batch Year
                                                </TableSortLabel>
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold' }}>
                                                Teacher
                                            </TableCell>
                                            <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold' }}>
                                                <TableSortLabel
                                                    active={sortField === 'createdAt'}
                                                    direction={sortField === 'createdAt' ? sortDirection : 'asc'}
                                                    onClick={() => handleSort('createdAt')}
                                                >
                                                    Created At
                                                </TableSortLabel>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                                    <Stack alignItems="center" spacing={2}>
                                                        <CircularProgress />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Loading marks data...
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ) : paginatedMarks.length > 0 ? (
                                            paginatedMarks.map((mark) => (
                                                <TableRow key={mark.id} hover sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={2}>
                                                            <Avatar
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    bgcolor: theme.palette.primary.light,
                                                                    fontSize: 14
                                                                }}
                                                            >
                                                                {`${mark.student?.firstName?.[0] || 'N'}${mark.student?.lastName?.[0] || 'A'}`}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="500">
                                                                    {mark.student?.firstName || 'N/A'} {mark.student?.lastName || ''}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={mark.subject?.name || 'N/A'}
                                                            variant="outlined"
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={2}>
                                                            <Box textAlign="center">
                                                                <Typography variant="h6" fontWeight="bold" color={getGradeColor(mark.marks)}>
                                                                    {mark.marks}
                                                                </Typography>
                                                                <Chip
                                                                    label={getGrade(mark.marks)}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: getGradeColor(mark.marks),
                                                                        color: 'white',
                                                                        fontWeight: 'bold',
                                                                        minWidth: 32
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Box width="100px">
                                                                <LinearProgress
                                                                    variant="determinate"
                                                                    value={mark.marks}
                                                                    sx={{
                                                                        height: 6,
                                                                        borderRadius: 3,
                                                                        bgcolor: 'grey.200',
                                                                        '& .MuiLinearProgress-bar': {
                                                                            bgcolor: getGradeColor(mark.marks)
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={mark.examType}
                                                            variant="filled"
                                                            size="small"
                                                            color="secondary"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <School fontSize="small" color="action" />
                                                            <Typography variant="body2">
                                                                {mark.classroom?.name || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={mark.batchYear}
                                                            variant="outlined"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Person fontSize="small" color="action" />
                                                            <Typography variant="body2">
                                                                {mark.teacher?.firstName || 'N/A'} {mark.teacher?.lastName || ''}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {mark.createdAt ? new Date(mark.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                                    <Stack alignItems="center" spacing={2}>
                                                        <Assessment sx={{ fontSize: 64, color: 'text.disabled' }} />
                                                        <Typography variant="h6" color="text.secondary">
                                                            No marks found
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {activeFiltersCount > 0
                                                                ? 'Try adjusting your filters to see more results'
                                                                : 'No mark entries have been recorded yet'
                                                            }
                                                        </Typography>
                                                        {activeFiltersCount > 0 && (
                                                            <Button
                                                                variant="outlined"
                                                                onClick={clearAllFilters}
                                                                startIcon={<Clear />}
                                                            >
                                                                Clear All Filters
                                                            </Button>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>

                    {/* Pagination */}
                    {!loading && filteredAndSortedMarks.length > 0 && (
                        <TablePagination
                            component="div"
                            count={filteredAndSortedMarks.length}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            sx={{
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                '& .MuiTablePagination-toolbar': {
                                    px: 3
                                }
                            }}
                        />
                    )}
                </Card>
            </Fade>

            {/* Action Buttons */}
            <Fade in timeout={1400}>
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Print />}
                        onClick={() => window.print()}
                        sx={{ borderRadius: 2 }}
                        disabled={loading || filteredAndSortedMarks.length === 0}
                    >
                        Print Report
                    </Button>

                    {/* Export Menu Button */}
                    <Button
                        variant="contained"
                        startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <FileDownload />}
                        onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                        disabled={loading || exporting || filteredAndSortedMarks.length === 0}
                        sx={{
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                            },
                            '&:disabled': {
                                background: 'grey.400'
                            }
                        }}
                    >
                        {exporting ? 'Exporting...' : 'Export Data'}
                    </Button>

                    {/* Export Menu */}
                    <Menu
                        anchorEl={exportMenuAnchor}
                        open={Boolean(exportMenuAnchor)}
                        onClose={() => setExportMenuAnchor(null)}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                exportToExcel();
                                setExportMenuAnchor(null);
                            }}
                            disabled={exporting}
                        >
                            <GetApp sx={{ mr: 1 }} />
                            Export to Excel (.xlsx)
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                exportToCSV();
                                setExportMenuAnchor(null);
                            }}
                            disabled={exporting}
                        >
                            <TableChart sx={{ mr: 1 }} />
                            Export to CSV (.csv)
                        </MenuItem>
                    </Menu>
                </Box>
            </Fade>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MarkListViewPage;