import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import type { NextPageWithLayout } from '@/types/next';

interface PortalPageProps {
    queryParams: Record<string, string | string[]>;
    fullUrl: string;
    queryString: string;
}

const PortalPage: NextPageWithLayout<PortalPageProps> = ({ queryParams, fullUrl, queryString }) => {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">
                        Captive Portal - Parameter
                    </h1>
                    
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-gray-700">
                                Übergebene Parameter:
                            </h2>
                            
                            {Object.keys(queryParams).length === 0 ? (
                                <p className="text-gray-500 italic">
                                    Keine Parameter übergeben
                                </p>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                                    Parameter
                                                </th>
                                                <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                                    Wert
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(queryParams).map(([key, value]) => (
                                                <tr key={key} className="border-b border-gray-100">
                                                    <td className="py-2 px-3 font-mono text-sm text-gray-600">
                                                        {key}
                                                    </td>
                                                    <td className="py-2 px-3 font-mono text-sm text-gray-800 break-all">
                                                        {Array.isArray(value) ? value.join(', ') : value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-3 text-gray-700">
                                Vollständige URL:
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <code className="text-sm text-gray-800 break-all">
                                    {fullUrl}
                                </code>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-3 text-gray-700">
                                Raw Query String:
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <code className="text-sm text-gray-800 break-all">
                                    {queryString || '(keine Parameter)'}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Standard-Layout verwenden
PortalPage.getLayout = undefined;

export default PortalPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    // Alle Query-Parameter sammeln
    const queryParams: Record<string, string | string[]> = {};
    
    Object.entries(context.query).forEach(([key, value]) => {
        queryParams[key] = value || '';
    });

    // Erstelle die vollständige URL
    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const host = context.req.headers.host || 'localhost:3000';
    const path = context.req.url?.split('?')[0] || '/cpTest';
    const queryString = context.req.url?.includes('?') 
        ? context.req.url.split('?')[1] 
        : '';
    const fullUrl = `${protocol}://${host}${path}${queryString ? `?${queryString}` : ''}`;

    return {
        props: {
            queryParams,
            fullUrl,
            queryString
        }
    };
};

