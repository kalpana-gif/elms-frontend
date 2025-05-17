import { Typography, Box } from '@mui/material';

const TeacherPage = () => (
    <Box p={4}>
        <Typography variant="h5">Teacher Panel</Typography>
        <Typography mt={1}>This page is only accessible by teachers.</Typography>
    </Box>
);

export default TeacherPage;
