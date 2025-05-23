import Swal from 'sweetalert2';

export const showSuccessAlert = (title = 'Success', message = 'Operation completed successfully!') => {
    return Swal.fire({
        icon: 'success',
        title,
        text: message,
        confirmButtonColor: '#3085d6',
    });
};

export const showErrorAlert = (title = 'Oops...', message = 'Something went wrong!') => {
    return Swal.fire({
        icon: 'error',
        title,
        text: message,
        confirmButtonColor: '#d33',
    });
};

export const showConfirmationAlert = async (
    title = 'Are you sure?',
    message = 'You won’t be able to revert this!',
    confirmButtonText = 'Yes, do it!',
    cancelButtonText = 'Cancel'
): Promise<boolean> => {
    const result = await Swal.fire({
        title,
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText,
        cancelButtonText,
    });

    return result.isConfirmed;
};