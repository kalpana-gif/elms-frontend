import { Typography, Box } from '@mui/material';

const Unauthorized = () => (
    <Box p={4}>
        <Typography variant="h5" color="error">Unauthorized</Typography>
        <Typography mt={2}>You do not have access to this page.</Typography>
    </Box>
);

export default Unauthorized;
