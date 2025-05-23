import { Typography, Box, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            textAlign="center"
            bgcolor="#f8f9fa"
            p={4}
        >
            <LockOutlinedIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" color="error" gutterBottom>
                Access Denied
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
                You do not have permission to view this page.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
            >
                Go to Home
            </Button>
        </Box>
    );
};

export default Unauthorized;
