import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

function useFetch<T>(route: string | null) {
    const [data, setData] = useState<T | undefined>(); // State to store fetched data
    const [loading, setLoading] = useState(true); // State to track loading status
    const [error, setError] = useState<Error | null>(null); // State to handle errors

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<T>(route as string);
            setData(response.data);
        } catch (err) {
            setError(err as Error);
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    toast.error('Unauthorized access. Please log in again.');
                } else if (err.response?.status === 403) {
                    toast.error('Forbidden access. You do not have permission to view this resource.');
                } else if (err.response?.status === 404) {
                    toast.error('Resource not found. Please check the URL.');
                } else if (err.response?.status === 500) {
                    toast.error('Internal server error. Please try again later.');
                } else {
                    toast.error('An unexpected error occurred. Please try again.');
                }
            } else if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('An unknown error occurred. Please try again.');
            }
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (route) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route]);

    const refetch = () => {
        fetchData();
    };

    return { data, loading, error, refetch };
}

export default useFetch;
