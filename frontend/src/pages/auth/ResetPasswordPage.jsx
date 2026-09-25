import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword,
    setShowConfirmPassword] = useState(false);

  const [message, setMessage] =
    useState('');

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage('');

    if (password !== confirmPassword) {

      return setMessage(
        'Passwords do not match'
      );
    }

    try {

      const res = await axios.post(
        `http://localhost:4000/api/v1/auth/reset-password/${token}`,
        {
          password
        }
      );

      setMessage(res.data.message);
      navigate('/login');

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        'Something went wrong'
      );
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl bg-white p-6 shadow-lg"
      >

        <div>

          <h2 className="text-2xl font-bold text-slate-800">
            Create New Password
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter your new password below.
          </p>

        </div>

        {/* PASSWORD */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            New Password
          </label>

          <div className="relative">

            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }

              placeholder="Enter new password"

              value={password}

              onChange={(e) =>
                setPassword(e.target.value)
              }

              className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-cyan-500"
            />

            <button
              type="button"

              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }

              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >

              {
                showPassword
                  ? <EyeOff size={20} />
                  : <Eye size={20} />
              }

            </button>

          </div>

        </div>

        {/* CONFIRM PASSWORD */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Confirm Password
          </label>

          <div className="relative">

            <input
              type={
                showConfirmPassword
                  ? 'text'
                  : 'password'
              }

              placeholder="Confirm password"

              value={confirmPassword}

              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }

              className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-cyan-500"
            />

            <button
              type="button"

              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }

              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >

              {
                showConfirmPassword
                  ? <EyeOff size={20} />
                  : <Eye size={20} />
              }

            </button>

          </div>

        </div>

        <button
          type="submit"

          className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-900 transition hover:bg-cyan-400"
        >
          Reset Password
        </button>

        {
          message && (

            <p className="text-center text-sm text-red-500">
              {message}
            </p>
          )
        }

      </form>

    </div>
  );
};

export default ResetPasswordPage;