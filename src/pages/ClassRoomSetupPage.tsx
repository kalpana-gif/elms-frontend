import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Autocomplete,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Grid,
    Card,
    CardContent,
    Container,
    Stack,
    AppBar,
    Toolbar,
    Slide,
    useScrollTrigger,
    Divider,
    Chip,
} from '@mui/material';
import { Save } from 'lucide-react';

const teachers = ['Mr. Smith', 'Ms. Johnson', 'Dr. Lee', 'Mrs. Patel'];

const students = [
    { name: 'Alice', batchYear: 2024 },
    { name: 'Bob', batchYear: 2024 },
    { name: 'Charlie', batchYear: 2023 },
    { name: 'David', batchYear: 2024 },
    { name: 'Emma', batchYear: 2025 },
    { name: 'Fiona', batchYear: 2023 },
];

const subjectTemplates = [
    {
        label: 'Commerce A',
        coreSubjects: ['Accountancy', 'Business Studies (BS)'],
        optionalSubject: 'English',
        description: 'Focused on traditional commerce stream with strong language foundation.',
    },
    {
        label: 'Commerce B',
        coreSubjects: ['Economics', 'Accountancy'],
        optionalSubject: 'Combined Mathematics',
        description: 'Economics-heavy focus with analytical optional subject.',
    },
    {
        label: 'Commerce C',
        coreSubjects: ['Business Studies (BS)', 'Economics'],
        optionalSubject: 'ICT',
        description: 'Modern business mix with tech skills.',
    },
    {
        label: 'Language Plus',
        coreSubjects: ['Accountancy', 'Economics'],
        optionalSubject: 'French',
        description: 'Commerce with a foreign language focus.',
    },
];

const coreSubjects = ['Accountancy', 'Business Studies (BS)', 'Economics'];
const optionalSubjects = [
    'Business Statistics',
    'Geography',
    'Political Science',
    'History (History with History of Indian or European or World history)',
    'The logic and the scientific method',
    'English',
    'German',
    'French',
    'Agricultural Sciences',
    'Combined Mathematics',
    'Information and Communication Technology (ICT)',
];

type Student = { name: string; batchYear: number };
type StudentData = {
    name: string;
    coreSubjects: string[];
    optionalSubject: string;
};

function HideOnScroll({ children }: { children: React.ReactElement }) {
    const trigger = useScrollTrigger();
    return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

function getAllCombinations(core: string[], optional: string[]) {
    const combinations: StudentData[] = [];
    for (let i = 0; i < core.length; i++) {
        for (let j = i + 1; j < core.length; j++) {
            for (let k = 0; k < optional.length; k++) {
                combinations.push({
                    name: '',
                    coreSubjects: [core[i], core[j]],
                    optionalSubject: optional[k],
                });
            }
        }
    }
    return combinations;
}

const ClassRoomSetupPage: React.FC = () => {
    const [className, setClassName] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
    const [selectedBatchYear, setSelectedBatchYear] = useState<number | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [studentSubjectMap, setStudentSubjectMap] = useState<Record<string, StudentData>>({});
    const [error, setError] = useState('');

    const batchYears = Array.from(new Set(students.map((s) => s.batchYear)));
    const filteredStudents = selectedBatchYear
        ? students.filter((s) => s.batchYear === selectedBatchYear).map((s) => s.name)
        : [];

    const allCombinations = getAllCombinations(coreSubjects, optionalSubjects);

    const handleStudentCombinationChange = (student: string, index: number) => {
        const selectedCombo = allCombinations[index];
        setStudentSubjectMap((prev) => ({
            ...prev,
            [student]: {
                name: student,
                coreSubjects: selectedCombo.coreSubjects,
                optionalSubject: selectedCombo.optionalSubject,
            },
        }));
    };

    const applyTemplateToAll = (templateLabel: string) => {
        const template = subjectTemplates.find((t) => t.label === templateLabel);
        if (!template) return;

        const updatedMap: Record<string, StudentData> = {};
        selectedStudents.forEach((student) => {
            updatedMap[student] = {
                name: student,
                coreSubjects: [...template.coreSubjects],
                optionalSubject: template.optionalSubject,
            };
        });

        setStudentSubjectMap(updatedMap);
    };

    const validateAndSubmit = () => {
        if (!className || !selectedTeacher || selectedStudents.length === 0 || !selectedBatchYear) {
            setError('Please fill in class name, teacher, batch, and students.');
            return;
        }

        for (const student of selectedStudents) {
            const data = studentSubjectMap[student];
            if (!data || data.coreSubjects.length < 2 || !data.optionalSubject) {
                setError(`Student ${student} must choose at least 2 core subjects and 1 optional subject.`);
                return;
            }
        }

        setError('');
        const classData = {
            className,
            teacher: selectedTeacher,
            batchYear: selectedBatchYear,
            students: selectedStudents.map((name) => studentSubjectMap[name]),
        };

        console.log('Classroom Created:', classData);
        alert('Classroom created successfully!');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <HideOnScroll>
                <AppBar color="default" elevation={1}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            New Classroom Setup
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Save />}
                            onClick={validateAndSubmit}
                        >
                            Save
                        </Button>
                    </Toolbar>
                </AppBar>
            </HideOnScroll>

            <Toolbar />
            <Stack spacing={3} mt={4}>
                {error && <Alert severity="error">{error}</Alert>}

                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Class Name"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            options={teachers}
                            value={selectedTeacher}
                            onChange={(_, value) => setSelectedTeacher(value)}
                            renderInput={(params) => <TextField {...params} label="Class Teacher" />}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Batch Year</InputLabel>
                            <Select
                                value={selectedBatchYear ?? ''}
                                onChange={(e) => {
                                    setSelectedBatchYear(parseInt(e.target.value as string));
                                    setSelectedStudents([]);
                                    setStudentSubjectMap({});
                                }}
                                label="Batch Year"
                            >
                                {batchYears.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Autocomplete
                            multiple
                            options={filteredStudents}
                            value={selectedStudents}
                            onChange={(_, value) => setSelectedStudents(value)}
                            renderInput={(params) => <TextField {...params} label="Students" />}
                            fullWidth
                            disabled={!selectedBatchYear}
                        />
                    </Grid>
                </Grid>

                {selectedStudents.length > 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Templates</Typography>
                        <Grid container spacing={2}>
                            {subjectTemplates.map((template) => (
                                <Grid item xs={12} sm={6} md={3} key={template.label}>
                                    <Card
                                        variant="outlined"
                                        sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                                        onClick={() => applyTemplateToAll(template.label)}
                                    >
                                        <CardContent>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {template.label}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {template.description}
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="body2">
                                                Core: <Chip size="small" label={template.coreSubjects.join(' + ')} />
                                            </Typography>
                                            <Typography variant="body2">
                                                Optional: <Chip size="small" label={template.optionalSubject} />
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                <Divider />

                {selectedStudents.map((student) => {
                    const current = studentSubjectMap[student] || { name: student, coreSubjects: [], optionalSubject: '' };
                    const selectedIndex = allCombinations.findIndex(
                        (combo) =>
                            combo.coreSubjects.sort().join() === current.coreSubjects.sort().join() &&
                            combo.optionalSubject === current.optionalSubject
                    );

                    return (
                        <Card key={student} variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {student}'s Subject Combination
                                </Typography>

                                <FormControl fullWidth>
                                    <InputLabel>Select Subject Combination</InputLabel>
                                    <Select
                                        value={selectedIndex >= 0 ? selectedIndex : ''}
                                        onChange={(e) =>
                                            handleStudentCombinationChange(student, parseInt(e.target.value as string))
                                        }
                                    >
                                        {allCombinations.map((combo, idx) => (
                                            <MenuItem key={idx} value={idx}>
                                                Core: {combo.coreSubjects.join(' + ')} | Optional: {combo.optionalSubject}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
        </Container>
    );
};

export default ClassRoomSetupPage;
