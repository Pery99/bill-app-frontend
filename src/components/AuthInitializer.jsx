import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initAuth } from '../store/slices/authSlice';

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  return children;
}

export default AuthInitializer;
