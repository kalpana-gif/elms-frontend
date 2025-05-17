import { Typography, Box } from '@mui/material';

const ParentPage = () => (
    <Box p={4}>
        <Typography variant="h5">Parent Portal</Typography>
        <Typography mt={1}>Only parents can see this page.</Typography>
    </Box>
);

export default ParentPage;
