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
} from '@mui/material';
import GradeIcon from '@mui/icons-material/Grade';
import { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';

const MarkListViewPage = () => {
    const [marks, setMarks] = useState([]);
    const isMobile = useMediaQuery('(max-width:300px)');

    const fetchMarks = async () => {
        try {
            const res = await axios.get('/exam/mark-entry/all-marks');
            setMarks(res.data);
            // console.log(res.data)
        } catch (error) {
            console.error('Error fetching marks:', error);
        }
    };

    useEffect(() => {
        fetchMarks();
    }, []);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
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
                                Student Marks
                            </Typography>
                            <Typography variant="body2">List of marks submitted across subjects and exams</Typography>
                        </Box>
                    </Stack>
                </Box>

                <CardContent>
                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell><b>Student Name</b></TableCell>
                                    <TableCell><b>Subject</b></TableCell>
                                    <TableCell><b>Marks</b></TableCell>
                                    <TableCell><b>Exam Type</b></TableCell>
                                    <TableCell><b>Classroom</b></TableCell>
                                    <TableCell><b>Batch Year</b></TableCell>
                                    <TableCell><b>Teacher</b></TableCell>
                                    <TableCell><b>Created At</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {marks.length > 0 ? (
                                    marks.map((mark) => (
                                        <TableRow key={mark.id}>
                                            <TableCell>
                                                {mark.student?.firstName || 'N/A'} {mark.student?.lastName || ''}
                                            </TableCell>
                                            <TableCell>{mark.subject?.name || 'N/A'}</TableCell>
                                            <TableCell>{mark.marks}</TableCell>
                                            <TableCell>{mark.examType}</TableCell>
                                            <TableCell>{mark.classroom?.name || 'N/A'}</TableCell>
                                            <TableCell>{mark.batchYear}</TableCell>
                                            <TableCell> {mark.teacher?.firstName || 'N/A'} {mark.teacher?.lastName || ''}</TableCell>
                                            <TableCell>
                                                {mark.createdAt ? new Date(mark.createdAt).toLocaleString() : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No mark entries found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default MarkListViewPage;