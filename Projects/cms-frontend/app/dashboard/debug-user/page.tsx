'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import axios from '@/lib/axios';
import { buildApiUrl } from '@/lib/api';

export default function DebugUserPage() {
  const { user, hydrate } = useAuthStore();
  const [backendUser, setBackendUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        // Hydrate from cookie
        await hydrate();
        
        // Get user from backend
        const response = await axios.get(buildApiUrl('/api/auth/verify'));
        setBackendUser(response.data.user);
      } catch (err: any) {
        console.error('[DebugUserPage] Error:', err);
        setError(err.response?.data?.error || err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [hydrate]);

  const frontendUser = useAuthStore((state) => state.user);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug User Info</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frontend User (from Zustand store) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Frontend User (Zustand Store)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(frontendUser, null, 2)}
          </pre>
        </div>

        {/* Backend User (from API) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Backend User (from /api/auth/verify)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(backendUser, null, 2)}
          </pre>
        </div>
      </div>

      {/* Permission Check */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Permission Check</h2>
        <div className="space-y-2">
          <p>
            <strong>Can create course?</strong>{' '}
            {frontendUser?.role === 'admin' || frontendUser?.role === 'instructor' ? (
              <span className="text-green-600">✅ Yes</span>
            ) : (
              <span className="text-red-600">❌ No</span>
            )}
          </p>
          <p>
            <strong>Required roles:</strong> admin hoặc instructor
          </p>
          <p>
            <strong>Current role:</strong> {frontendUser?.role || 'none'}
          </p>
        </div>
      </div>

      {/* Cookies Info */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Cookies</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {typeof document !== 'undefined' ? document.cookie : 'N/A (SSR)'}
        </pre>
      </div>
    </div>
  );
}

