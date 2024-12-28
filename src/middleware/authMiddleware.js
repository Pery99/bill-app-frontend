import { authService } from "../services/authService";
import { resetAuth, setAuthError } from "../store/slices/authSlice";

export const authMiddleware = (store) => (next) => async (action) => {
  const result = next(action);

  if (action.type?.startsWith("auth/") && action.error) {
    const error = action.payload;
    if (error === "Session expired") {
      store.dispatch(resetAuth());
    } else {
      store.dispatch(setAuthError(error));
    }
  }

  return result;
};
