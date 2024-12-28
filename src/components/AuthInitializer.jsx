import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData, selectors } from '../store/slices/authSlice';
import { authUtils } from '../utils/auth';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, userFetched } = useSelector(selectors.selectAuth);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !userFetched && authUtils.isAuthenticated()) {
        await dispatch(fetchUserData());
      }
    };

    initializeAuth();
  }, [dispatch, token, userFetched]);

  return children;
};

export default AuthInitializer;
