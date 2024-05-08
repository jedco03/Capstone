import { useEffect, useState } from 'react';

export const useRole = () => {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        setRole(storedRole);
    }, []);

    return role;
};
