import { useState } from 'react';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TestConnectionPage() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [details, setDetails] = useState<string[]>([]);

  const testConnection = async () => {
    setStatus('testing');
    setErrorMessage('');
    setDetails([]);

    try {
      // Log initial state
      setDetails(prev => [...prev, 'Starting connection test...']);

      // Test 1: Write Operation
      setDetails(prev => [...prev, 'Testing write operation...']);
      const testDoc = await addDoc(collection(db, '_test_connection'), {
        timestamp: new Date(),
        test: true
      });
      setDetails(prev => [...prev, '✓ Write operation successful']);

      // Test 2: Read Operation
      setDetails(prev => [...prev, 'Testing read operation...']);
      const testQuery = query(collection(db, '_test_connection'), limit(1));
      await getDocs(testQuery);
      setDetails(prev => [...prev, '✓ Read operation successful']);

      setStatus('success');
      setDetails(prev => [...prev, '✓ All tests passed']);
    } catch (error: any) {
      console.error('Firebase connection test failed:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Connection test failed');
      setDetails(prev => [...prev, `✗ Error: ${error.message}`]);
      
      // Add debugging information
      if (error.code) {
        setDetails(prev => [...prev, `Error code: ${error.code}`]);
      }
      if (error.stack) {
        setDetails(prev => [...prev, 'Check console for full error stack']);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Firebase Connection Test</h1>

          <div className="space-y-4">
            <button
              onClick={testConnection}
              disabled={status === 'testing'}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {status === 'testing' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Test Connection'
              )}
            </button>

            {/* Test Details */}
            {details.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Test Details:</h3>
                <div className="space-y-1 font-mono text-sm">
                  {details.map((detail, index) => (
                    <div key={index} className="text-gray-600">{detail}</div>
                  ))}
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle className="w-5 h-5 mr-2" />
                Connection successful! Firebase is properly configured.
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <div className="flex items-center mb-2">
                  <XCircle className="w-5 h-5 mr-2" />
                  Connection failed
                </div>
                <p className="text-sm font-mono whitespace-pre-wrap">{errorMessage}</p>
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>This test will:</p>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Attempt to write a test document to Firestore</li>
              <li>Attempt to read from Firestore</li>
              <li>Verify the connection is working properly</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}