import { Typography, Box } from '@mui/material';

const AdminPage = () => (
    <Box p={4}>
        <Typography variant="h5">Admin Panel</Typography>
        <Typography mt={1}>This page is only accessible by admin users.</Typography>
    </Box>
);

export default AdminPage;
