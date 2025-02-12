import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData, selectors, setAuth } from "../store/slices/authSlice";
import { TOKEN_KEY } from "../utils/constants";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user, loading } = useSelector(selectors.selectAuth);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem("user");

      // Debug log
      console.log("Initializing Auth:", {
        storedToken: !!storedToken,
        storedUser: JSON.parse(storedUser || "{}"),
        currentUser: user,
      });

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        dispatch(
          setAuth({
            token: storedToken,
            user: parsedUser,
          })
        );
      }
    };

    initializeAuth();
  }, []);

  return children;
};

export default AuthInitializer;
