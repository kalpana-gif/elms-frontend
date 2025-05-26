// pages/CourseCreate.tsx

import React, { useState } from 'react';
import {
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Checkbox,
    RadioGroup,
    Radio,
    Button,
    Alert,
} from '@mui/material';

const coreSubjects = [
    'Accountancy',
    'Business Studies (BS)',
    'Economics',
];

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

const CourseCreate: React.FC = () => {
    const [coreSelection, setCoreSelection] = useState<string[]>([]);
    const [optionalSelection, setOptionalSelection] = useState<string>('');
    const [error, setError] = useState('');

    const handleCoreChange = (subject: string) => {
        setCoreSelection((prev) =>
            prev.includes(subject)
                ? prev.filter((s) => s !== subject)
                : [...prev, subject]
        );
    };

    const handleOptionalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOptionalSelection(event.target.value);
    };

    const handleSubmit = () => {
        if (coreSelection.length < 2) {
            setError('Please select at least two core Commerce subjects.');
            return;
        }
        if (!optionalSelection) {
            setError('Please select one optional subject.');
            return;
        }
        setError('');

        // Replace this with API call logic
        const courseData = {
            coreSubjects: coreSelection,
            optionalSubject: optionalSelection,
        };

        console.log('Submitted:', courseData);
        alert('Course setup submitted successfully!');
    };

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto', mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
                Course Setup - Commerce Stream
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Typography variant="subtitle1" gutterBottom>
                Choose at least two core Commerce subjects:
            </Typography>
            <FormGroup sx={{ mb: 3 }}>
                {coreSubjects.map((subject) => (
                    <FormControlLabel
                        key={subject}
                        control={
                            <Checkbox
                                checked={coreSelection.includes(subject)}
                                onChange={() => handleCoreChange(subject)}
                            />
                        }
                        label={subject}
                    />
                ))}
            </FormGroup>

            <Typography variant="subtitle1" gutterBottom>
                Choose one optional subject:
            </Typography>
            <RadioGroup value={optionalSelection} onChange={handleOptionalChange}>
                {optionalSubjects.map((subject) => (
                    <FormControlLabel
                        key={subject}
                        value={subject}
                        control={<Radio />}
                        label={subject}
                    />
                ))}
            </RadioGroup>

            <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={handleSubmit}>
                Submit Course Setup
            </Button>
        </Box>
    );
};

export default CourseCreate;
