import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData, selectors } from '../store/slices/authSlice';
import { authUtils } from '../utils/auth';
import { TOKEN_KEY } from '../utils/constants';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user, loading } = useSelector(selectors.selectAuth);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedToken && !user && !loading) {
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    initializeAuth();
  }, [dispatch, token, user, loading]);

  return children;
};

export default AuthInitializer;
