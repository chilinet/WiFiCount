import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Home() {
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [session, router]);

    return null;
} 