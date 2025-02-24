import { useEffect, useState } from 'react';

export const useRole = () => {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole');
        console.log("Passed Role:", storedRole);
        setRole(storedRole);
    }, []);

    return role;
};
