import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="mx-auto mt-16 max-w-md rounded-lg border bg-white p-6 text-center shadow-sm">
    <h1 className="text-2xl font-semibold">Page not found</h1>
    <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
    <Link to="/dashboard" className="mt-4 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
      Back to Dashboard
    </Link>
  </div>
);

export default NotFoundPage;
