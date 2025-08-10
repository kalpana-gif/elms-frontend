import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Grid, TextField, Autocomplete, Button, Card, CardContent,
    Box, Divider, Typography, Avatar, useMediaQuery, Accordion,
    AccordionSummary, AccordionDetails, InputAdornment, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip,
    Tooltip, CircularProgress, Alert, Snackbar, Menu, MenuItem,
    Paper, Fade, LinearProgress, useTheme
} from '@mui/material';
import {
    ExpandMore, Search, Edit, Delete, Download, Visibility,
    AttachFile, DateRange, School, MoreVert, FilePresent,
    CloudUpload, Clear, CheckCircle, Warning, ErrorOutline, Lock
} from '@mui/icons-material';
import { ClipboardList, Save, Trash2, Eye, Calendar } from 'lucide-react';
import { showSuccessAlert, showErrorAlert } from '../components/Alert.tsx';
import {useAuthStore} from "../store/useAuthStore.ts";

interface Classroom {
    id: string;
    name: string;
}

interface Exam {
    id: string;
    title: string;
    classroomId: string;
    date: string;
    description: string;
    fileName?: string;
    fileUrl?: string;
    classroom?: Classroom;
    createdAt?: string;
    updatedAt?: string;
}

const ExamPage: React.FC = () => {
    const theme = useTheme();
    const { examId } = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');
    const isTablet = useMediaQuery('(max-width:900px)');

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [allExams, setAllExams] = useState<Exam[]>([]);

    const [title, setTitle] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [existingFileName, setExistingFileName] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [fileLoading, setFileLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedExamForMenu, setSelectedExamForMenu] = useState<Exam | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);

    const role = useAuthStore((state) => state.role);

    // Role-based access control
    const canManageExam = role === 'admin' || role === 'teacher';
    const canCreateExam = canManageExam;
    const canEditExam = canManageExam;
    const canDeleteExam = canManageExam;

    // Fetch classrooms and exams list
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [classroomRes, examRes] = await Promise.all([
                axios.get('/classroom'),
                axios.get('/exams/test')
            ]);

            setClassrooms(Array.isArray(classroomRes.data) ? classroomRes.data : []);
            setAllExams(Array.isArray(examRes.data) ? examRes.data : []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showSnackbar('Failed to load initial data.', 'error');
            setClassrooms([]);
            setAllExams([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch single exam details
    const fetchExam = async () => {
        if (!examId) return;
        try {
            setLoading(true);
            const res = await axios.get(`/exams/${examId}`);
            const data: Exam = res.data;
            setTitle(data.title);
            setSelectedClassroom(data.classroom || null);
            setDate(data.date);
            setDescription(data.description);
            setExistingFileName(data.fileName || '');
        } catch (error) {
            console.error('Error fetching exam:', error);
            showSnackbar('Failed to load exam details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchExam();
    }, [examId]);

    const showSnackbar = (message: string, type: 'success' | 'error') => {
        setSnackbar({ open: true, message, type });
    };

    const validateAndSubmit = async () => {
        // Check permissions before allowing create/edit
        if (!canManageExam) {
            showSnackbar('You do not have permission to create or edit exams.', 'error');
            return;
        }

        if (!title || !selectedClassroom || !date) {
            showSnackbar('Please fill in all required fields.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('classroomId', selectedClassroom.id);
        formData.append('date', date);
        formData.append('description', description);
        if (file) formData.append('file', file);

        try {
            setLoading(true);
            setUploadProgress(0);

            const config = {
                onUploadProgress: (progressEvent: any) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };

            if (examId) {
                await axios.put(`/exams/${examId}`, formData, config);
                showSnackbar('Exam updated successfully!', 'success');
            } else {
                await axios.post('/exams/test', formData, config);
                showSnackbar('Exam created successfully!', 'success');
            }

            // Refresh list without full reload
            await fetchInitialData();

            // Clear form if creating new
            if (!examId) {
                resetForm();
            }
        } catch (error: any) {
            console.error('Error saving exam:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to save exam.';
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const resetForm = () => {
        setTitle('');
        setSelectedClassroom(null);
        setDate('');
        setDescription('');
        setFile(null);
        setExistingFileName('');
    };

    const handleEditExam = (exam: Exam) => {
        if (!canEditExam) {
            showSnackbar('You do not have permission to edit exams.', 'error');
            return;
        }
        navigate(`/exams/${exam.id}`);
        setMenuAnchor(null);
    };

    const handleDeleteClick = (exam: Exam) => {
        if (!canDeleteExam) {
            showSnackbar('You do not have permission to delete exams.', 'error');
            return;
        }
        setExamToDelete(exam);
        setDeleteDialogOpen(true);
        setMenuAnchor(null);
    };

    const confirmDelete = async () => {
        if (!examToDelete || !canDeleteExam) return;

        try {
            setLoading(true);
            await axios.delete(`/exams/${examToDelete.id}`);
            showSnackbar('Exam deleted successfully!', 'success');

            // Remove from local state
            setAllExams(prev => prev.filter(exam => exam.id !== examToDelete.id));

            // If we're currently editing this exam, navigate back
            if (examId === examToDelete.id) {
                navigate('/exams');
            }
        } catch (error: any) {
            console.error('Error deleting exam:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to delete exam.';
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setExamToDelete(null);
        }
    };

    // File download function (available to all users)
    const handleFileDownload = async (exam: Exam) => {
        if (!exam.fileName) {
            showSnackbar('No file attached to this exam.', 'error');
            return;
        }

        try {
            setFileLoading(`download-${exam.id}`);

            let response;
            try {
                response = await axios.get(`/exams/${exam.id}/download`, {
                    responseType: 'blob',
                    timeout: 30000,
                });
            } catch (downloadError) {
                console.log('Download endpoint failed, trying alternative...');
                response = await axios.get(`/exams/${exam.id}/file`, {
                    responseType: 'blob',
                    timeout: 30000,
                });
            }

            const blob = new Blob([response.data]);
            let filename = exam.fileName;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showSnackbar(`File "${filename}" downloaded successfully!`, 'success');
        } catch (error: any) {
            console.error('Error downloading file:', error);
            let errorMessage = 'Failed to download file.';

            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Download timeout. The file might be too large.';
            } else if (error.response?.status === 404) {
                errorMessage = 'File not found on server.';
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to download this file.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            showSnackbar(errorMessage, 'error');
        } finally {
            setFileLoading(null);
        }
    };

    // File view function (available to all users)
    const handleFileView = async (exam: Exam) => {
        if (!exam.fileName) {
            showSnackbar('No file attached to this exam.', 'error');
            return;
        }

        try {
            setFileLoading(`view-${exam.id}`);

            try {
                const response = await axios.get(`/exams/${exam.id}/view`);
                console.log("view->", response);

                if (response.data?.url || response.data?.viewUrl) {
                    const viewUrl = response.data.url || response.data.viewUrl;
                    const newWindow = window.open(viewUrl, '_blank', 'noopener,noreferrer');

                    if (newWindow) {
                        showSnackbar('File opened in new tab.', 'success');
                        return;
                    } else {
                        showSnackbar('Failed to open file. Please check your popup blocker.', 'error');
                        return;
                    }
                }
            } catch (viewError) {
                console.log('View endpoint failed, trying direct file access...', viewError);
            }

            try {
                const fileResponse = await axios.get(`/exams/${exam.id}/file`, {
                    responseType: 'blob',
                    timeout: 30000,
                });

                const blob = new Blob([fileResponse.data]);
                const contentType = fileResponse.headers['content-type'] || '';

                const viewableTypes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'image/gif',
                    'image/webp',
                    'text/plain',
                    'text/html',
                    'text/csv'
                ];

                const isViewable = viewableTypes.some(type =>
                    contentType.toLowerCase().includes(type.toLowerCase())
                );

                if (isViewable) {
                    const url = window.URL.createObjectURL(blob);
                    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

                    if (newWindow) {
                        newWindow.addEventListener('load', () => {
                            setTimeout(() => {
                                window.URL.revokeObjectURL(url);
                            }, 1000);
                        });

                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                        }, 10000);

                        showSnackbar('File opened in new tab.', 'success');
                    } else {
                        window.URL.revokeObjectURL(url);
                        showSnackbar('Failed to open file. Please check your popup blocker.', 'error');
                    }
                } else {
                    window.URL.revokeObjectURL(window.URL.createObjectURL(blob));
                    showSnackbar('This file type cannot be viewed directly. Use download instead.', 'warning');
                }
            } catch (fileError) {
                console.error('Direct file access failed:', fileError);
                throw fileError;
            }

        } catch (error: any) {
            console.error('Error viewing file:', error);
            let errorMessage = 'Failed to open file.';

            if (error.code === 'ECONNABORTED') {
                errorMessage = 'File loading timeout. The file might be too large.';
            } else if (error.response?.status === 404) {
                errorMessage = 'File not found on server. It may have been deleted.';
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to view this file.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error while loading file. Please try again later.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }

            showSnackbar(errorMessage, 'error');
        } finally {
            setFileLoading(null);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        if (!canManageExam) {
            showSnackbar('You do not have permission to upload files.', 'error');
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const selectedFile = files[0];

            const maxSize = 50 * 1024 * 1024; // 50MB in bytes
            if (selectedFile.size > maxSize) {
                showSnackbar('File size must be less than 50MB.', 'error');
                return;
            }

            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'text/plain'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                showSnackbar('Please upload a valid file type (PDF, DOC, DOCX, images, or text files).', 'error');
                return;
            }

            setFile(selectedFile);
            showSnackbar(`File "${selectedFile.name}" selected successfully.`, 'success');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (canManageExam) {
            setDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canManageExam) {
            showSnackbar('You do not have permission to upload files.', 'error');
            return;
        }

        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const maxSize = 50 * 1024 * 1024; // 50MB
        if (selectedFile.size > maxSize) {
            showSnackbar('File size must be less than 50MB.', 'error');
            return;
        }

        setFile(selectedFile);
        showSnackbar(`File "${selectedFile.name}" selected successfully.`, 'success');
    };

    const filteredExams = allExams.filter((exam) =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.classroom?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Box p={isMobile ? 2 : 4}>
            {/* Enhanced Exam Form - Only show to admin and teachers */}
            {canCreateExam && (
                <Fade in timeout={600}>
                    <Card sx={{
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        mb: 4,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                    }}>
                        <Box sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            p: 3,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }
                        }}>
                            <Avatar sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}>
                                <ClipboardList />
                            </Avatar>
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h5" fontWeight="bold">
                                    {examId ? 'Edit Exam' : 'Create New Exam'}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {examId ? 'Update exam details and settings' : 'Set up a new exam for your classroom'}
                                </Typography>
                            </Box>
                        </Box>

                        {loading && <LinearProgress />}

                        <CardContent sx={{ p: 4 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Exam Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                        required
                                        disabled={!canManageExam}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        options={classrooms}
                                        getOptionLabel={(option) => option.name}
                                        value={selectedClassroom}
                                        onChange={(_, value) => setSelectedClassroom(value)}
                                        disabled={!canManageExam}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Classroom"
                                                required
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: <School sx={{ mr: 1, color: 'action.active' }} />
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <School fontSize="small" />
                                                {option.name}
                                            </Box>
                                        )}
                                        fullWidth
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        type="date"
                                        label="Exam Date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        fullWidth
                                        required
                                        disabled={!canManageExam}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <DateRange />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        multiline
                                        rows={4}
                                        fullWidth
                                        variant="outlined"
                                        disabled={!canManageExam}
                                        placeholder="Enter exam description, instructions, or additional notes..."
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            border: dragOver && canManageExam ? '2px dashed #667eea' : '2px dashed #e0e0e0',
                                            backgroundColor: dragOver && canManageExam ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                                            borderRadius: 2,
                                            textAlign: 'center',
                                            cursor: canManageExam ? 'pointer' : 'not-allowed',
                                            opacity: canManageExam ? 1 : 0.6,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: canManageExam ? 'rgba(102, 126, 234, 0.02)' : 'transparent',
                                                borderColor: canManageExam ? '#667eea' : '#e0e0e0'
                                            }
                                        }}
                                        onDrop={handleFileDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => canManageExam && document.getElementById('file-input')?.click()}
                                    >
                                        <input
                                            id="file-input"
                                            type="file"
                                            hidden
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                                            onChange={handleFileSelect}
                                            disabled={!canManageExam}
                                        />

                                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                            {!canManageExam ? (
                                                <>
                                                    <Lock sx={{ fontSize: 48, color: 'text.secondary' }} />
                                                    <Typography variant="h6" color="text.secondary">
                                                        File Upload Restricted
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Only admins and teachers can upload files
                                                    </Typography>
                                                </>
                                            ) : file || existingFileName ? (
                                                <>
                                                    <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
                                                    <Typography variant="h6" color="success.main">
                                                        {file ? file.name : existingFileName}
                                                    </Typography>
                                                    {file && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Size: {formatFileSize(file.size)}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="body2" color="text.secondary">
                                                        Click to change file
                                                    </Typography>
                                                    {file && (
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFile(null);
                                                            }}
                                                            sx={{ mt: 1 }}
                                                        >
                                                            <Clear />
                                                        </IconButton>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
                                                    <Typography variant="h6">
                                                        Drag & drop a file here, or click to browse
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Supports PDF, DOC, DOCX, images, and text files (Max: 50MB)
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>

                                        {uploadProgress > 0 && (
                                            <Box sx={{ width: '100%', mt: 2 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={uploadProgress}
                                                    sx={{ borderRadius: 1, height: 8 }}
                                                />
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    Uploading: {uploadProgress}%
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 4 }} />

                            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                                {examId && (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => navigate('/exams')}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Cancel
                                    </Button>
                                )}

                                <Box display="flex" gap={2} ml="auto">
                                    {!examId && canManageExam && (
                                        <Button
                                            variant="outlined"
                                            onClick={resetForm}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Clear Form
                                        </Button>
                                    )}

                                    {canManageExam && (
                                        <Button
                                            variant="contained"
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                            onClick={validateAndSubmit}
                                            disabled={loading}
                                            size="large"
                                            sx={{
                                                borderRadius: 2,
                                                px: 4,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                }
                                            }}
                                        >
                                            {loading ? 'Saving...' : (examId ? 'Update Exam' : 'Create Exam')}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Fade>
            )}

            {/* Role-based access alert for students */}
            {!canCreateExam && (
                <Fade in timeout={600}>
                    <Alert
                        severity="info"
                        icon={<Lock />}
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            '& .MuiAlert-message': {
                                fontWeight: 500
                            }
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                            View Only Access
                        </Typography>
                        <Typography variant="body2">
                            You have read-only access to exams. Only administrators and teachers can create, edit, or delete exams.
                        </Typography>
                    </Alert>
                </Fade>
            )}

            {/* Enhanced Exams List */}
            <Fade in timeout={800}>
                <Card sx={{
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        px: 3,
                        py: 3,
                        color: 'white',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }
                    }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}>
                                    <ClipboardList />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">
                                        All Exams ({filteredExams.length})
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        {canManageExam ? 'Manage your scheduled exams' : 'View scheduled exams'}
                                    </Typography>
                                </Box>
                            </Box>

                            <TextField
                                label="Search exams..."
                                variant="outlined"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    borderRadius: 2,
                                    width: isMobile ? '100%' : 300,
                                    '& .MuiOutlinedInput-root': {
                                        color: '#333',
                                    }
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
                    </Box>

                    <CardContent sx={{ p: 0 }}>
                        {filteredExams.length === 0 ? (
                            <Box textAlign="center" py={8}>
                                <ClipboardList size={64} color="#ccc" />
                                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                                    {searchQuery ? 'No exams match your search' : 'No exams found'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {!searchQuery && canCreateExam && 'Create your first exam using the form above'}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={2}>
                                    {filteredExams.map((exam, index) => (
                                        <Grid item xs={12} key={exam.id}>
                                            <Fade in timeout={300 + index * 100}>
                                                <Card sx={{
                                                    borderRadius: 3,
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}>
                                                    <Accordion elevation={0}>
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMore />}
                                                            sx={{
                                                                '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.02)' },
                                                                px: 3,
                                                                py: 2
                                                            }}
                                                        >
                                                            <Box sx={{ width: '100%' }}>
                                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" width="100%">
                                                                    <Box flex={1}>
                                                                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                                                                            <Typography variant="h6" fontWeight="600">
                                                                                {exam.title}
                                                                            </Typography>
                                                                            {exam.fileName && (
                                                                                <Tooltip title={`File: ${exam.fileName}`}>
                                                                                    <Chip
                                                                                        icon={<FilePresent />}
                                                                                        label="File Attached"
                                                                                        size="small"
                                                                                        color="primary"
                                                                                        variant="outlined"
                                                                                    />
                                                                                </Tooltip>
                                                                            )}
                                                                            {!canManageExam && (
                                                                                <Tooltip title="Read-only access">
                                                                                    <Chip
                                                                                        icon={<Lock />}
                                                                                        label="View Only"
                                                                                        size="small"
                                                                                        color="default"
                                                                                        variant="outlined"
                                                                                    />
                                                                                </Tooltip>
                                                                            )}
                                                                        </Box>

                                                                        <Box display="flex" gap={3} flexWrap="wrap" alignItems="center">
                                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                                <Calendar size={16} color="#666" />
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    {formatDate(exam.date)}
                                                                                </Typography>
                                                                            </Box>

                                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                                <School fontSize="small" sx={{ color: 'text.secondary' }} />
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    {exam.classroom?.name}
                                                                                </Typography>
                                                                            </Box>

                                                                            {exam.fileName && (
                                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                                    <AttachFile fontSize="small" sx={{ color: 'text.secondary' }} />
                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                        {exam.fileName}
                                                                                    </Typography>
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    </Box>

                                                                    {/* Only show menu for admins and teachers */}
                                                                    {canManageExam && (
                                                                        <IconButton
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setMenuAnchor(e.currentTarget);
                                                                                setSelectedExamForMenu(exam);
                                                                            }}
                                                                            sx={{ ml: 2 }}
                                                                        >
                                                                            <MoreVert />
                                                                        </IconButton>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </AccordionSummary>

                                                        <AccordionDetails sx={{ pt: 0, px: 3, pb: 3 }}>
                                                            <Divider sx={{ mb: 2 }} />
                                                            <Typography variant="subtitle2" gutterBottom color="primary" fontWeight="600">
                                                                Description
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
                                                                {exam.description || 'No description provided.'}
                                                            </Typography>

                                                            <Box display="flex" gap={2} flexWrap="wrap">
                                                                {/* Edit button - only for admins and teachers */}
                                                                {canEditExam && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        startIcon={<Edit />}
                                                                        onClick={() => handleEditExam(exam)}
                                                                        size="small"
                                                                        sx={{ borderRadius: 2 }}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                )}

                                                                {/* File viewing and downloading - available to all users */}
                                                                {exam.fileName && (
                                                                    <>
                                                                        <Button
                                                                            variant="outlined"
                                                                            startIcon={
                                                                                fileLoading === `view-${exam.id}` ?
                                                                                    <CircularProgress size={16} /> :
                                                                                    <Visibility />
                                                                            }
                                                                            onClick={() => handleFileView(exam)}
                                                                            size="small"
                                                                            disabled={fileLoading === `view-${exam.id}`}
                                                                            sx={{ borderRadius: 2 }}
                                                                        >
                                                                            {fileLoading === `view-${exam.id}` ? 'Opening...' : 'View File'}
                                                                        </Button>

                                                                        <Button
                                                                            variant="outlined"
                                                                            startIcon={
                                                                                fileLoading === `download-${exam.id}` ?
                                                                                    <CircularProgress size={16} /> :
                                                                                    <Download />
                                                                            }
                                                                            onClick={() => handleFileDownload(exam)}
                                                                            size="small"
                                                                            disabled={fileLoading === `download-${exam.id}`}
                                                                            sx={{ borderRadius: 2 }}
                                                                        >
                                                                            {fileLoading === `download-${exam.id}` ? 'Downloading...' : 'Download'}
                                                                        </Button>
                                                                    </>
                                                                )}

                                                                {/* Delete button - only for admins and teachers */}
                                                                {canDeleteExam && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="error"
                                                                        startIcon={<Trash2 size={16} />}
                                                                        onClick={() => handleDeleteClick(exam)}
                                                                        size="small"
                                                                        sx={{ borderRadius: 2 }}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                </Card>
                                            </Fade>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Fade>

            {/* Context Menu - Only show management options for admins and teachers */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{
                    sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }
                }}
            >
                {canEditExam && (
                    <MenuItem
                        onClick={() => selectedExamForMenu && handleEditExam(selectedExamForMenu)}
                        sx={{ gap: 2 }}
                    >
                        <Edit fontSize="small" />
                        Edit Exam
                    </MenuItem>
                )}

                {selectedExamForMenu?.fileName && [
                    <MenuItem
                        key="view-file"
                        onClick={() => selectedExamForMenu && handleFileView(selectedExamForMenu)}
                        disabled={fileLoading === `view-${selectedExamForMenu.id}`}
                        sx={{ gap: 2 }}
                    >
                        {fileLoading === `view-${selectedExamForMenu.id}` ?
                            <CircularProgress size={16} /> :
                            <Visibility fontSize="small" />
                        }
                        {fileLoading === `view-${selectedExamForMenu.id}` ? 'Opening...' : 'View File'}
                    </MenuItem>,

                    <MenuItem
                        key="download-file"
                        onClick={() => selectedExamForMenu && handleFileDownload(selectedExamForMenu)}
                        disabled={fileLoading === `download-${selectedExamForMenu.id}`}
                        sx={{ gap: 2 }}
                    >
                        {fileLoading === `download-${selectedExamForMenu.id}` ?
                            <CircularProgress size={16} /> :
                            <Download fontSize="small" />
                        }
                        {fileLoading === `download-${selectedExamForMenu.id}` ? 'Downloading...' : 'Download File'}
                    </MenuItem>
                ]}

                {canDeleteExam && selectedExamForMenu?.fileName && <Divider />}

                {canDeleteExam && (
                    <MenuItem
                        onClick={() => selectedExamForMenu && handleDeleteClick(selectedExamForMenu)}
                        sx={{ gap: 2, color: 'error.main' }}
                    >
                        <Delete fontSize="small" />
                        Delete Exam
                    </MenuItem>
                )}
            </Menu>

            {/* Delete Confirmation Dialog - Only accessible by admins and teachers */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !loading && setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'error.light', color: 'white' }}>
                            <Delete />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="600">
                                Delete Exam
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                This action cannot be undone
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        You are about to permanently delete this exam. All associated data will be lost.
                    </Alert>

                    {examToDelete && (
                        <Paper sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                {examToDelete.title}
                            </Typography>
                            <Box display="flex" gap={3} flexWrap="wrap" mb={2}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Date:</strong> {formatDate(examToDelete.date)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Classroom:</strong> {examToDelete.classroom?.name}
                                </Typography>
                                {examToDelete.fileName && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>File:</strong> {examToDelete.fileName}
                                    </Typography>
                                )}
                            </Box>
                            {examToDelete.description && (
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Description:</strong> {examToDelete.description}
                                </Typography>
                            )}
                        </Paper>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={loading}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Delete />}
                        sx={{ borderRadius: 2 }}
                    >
                        {loading ? 'Deleting...' : 'Delete Exam'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.type}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ExamPage;