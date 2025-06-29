import { useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/admin/login');
      }
    });

    return unsubscribe;
  }, [navigate]);

  return children;
};

export default ProtectedRoute;