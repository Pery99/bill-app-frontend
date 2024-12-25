import toast from 'react-hot-toast';

export const notify = {
  success: (message) => 
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#1E3A8A',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
      }
    }),
    
  error: (message) => 
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#fff',
        color: '#991B1B',
        padding: '16px',
        borderRadius: '8px',
        border: '2px solid #991B1B',
      }
    })
};
