import { Typography, Box } from '@mui/material';

const StudentPage = () => (
    <Box p={4}>
        <Typography variant="h5">Student Portal</Typography>
        <Typography mt={1}>Only students can see this page.</Typography>
    </Box>
);

export default StudentPage;
