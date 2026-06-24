import React, { createContext, useReducer, useEffect, useState } from 'react';
import instance from '../util/axios.customize';
import { useNavigate } from 'react-router-dom';

const initialState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
};

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem('access_token', action.payload.accessToken);
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                accessToken: action.payload.accessToken,
            };
        case 'LOGOUT':
            localStorage.removeItem('access_token');
            delete instance.defaults.headers.common['Authorization'];
            return {
                ...initialState,
            };
        default:
            return state;
    }
};

// Component con để xử lý chuyển hướng an toàn
const AuthNavigator = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const handleLogoutNavigation = () => {
            navigate('/login');
        };
        window.addEventListener('force_logout_navigation', handleLogoutNavigation);
        return () => window.removeEventListener('force_logout_navigation', handleLogoutNavigation);
    }, [navigate]);
    return null;
};

const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            const token = localStorage.getItem('access_token');

            if (!token) {
                try {
                    const res = await instance.post('/api/auth/refresh');
                    const newAccessToken = res.data.token;
                    const profileRes = await instance.get('/api/auth/profile', {
                        headers: { 'Authorization': `Bearer ${newAccessToken}` }
                    });
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: { accessToken: newAccessToken, user: profileRes.data },
                    });
                } catch (error) {
                    // Ignore, user is not logged in
                }
            } else {
                try {
                    const profileRes = await instance.get('/api/auth/profile');
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: { accessToken: token, user: profileRes.data },
                    });
                } catch (error) {
                    // Interceptor will handle 401, if it fails for other reasons, we logout
                    if (error.response?.status !== 401) {
                         dispatch({ type: 'LOGOUT' });
                    }
                }
            }
            setIsLoading(false);
        };

        initializeApp();

        const handleForceLogout = () => {
            dispatch({ type: 'LOGOUT' });
            window.dispatchEvent(new Event('force_logout_navigation'));
        };
        window.addEventListener('force_logout', handleForceLogout);

        return () => {
            window.removeEventListener('force_logout', handleForceLogout);
        };
    }, []);

    if (isLoading) {
        return <div>Loading application...</div>;
    }

    return (
        <AuthContext.Provider value={{ auth: state, dispatch }}>
            <AuthNavigator />
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };