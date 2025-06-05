import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { errorToStr } from '@/common/errorToStr';
import { hansRequest } from '@/common/hansRequest';
import { LoginResponse } from '@/types/auth';
import { useJwtTokenStore } from '../stores/useJwtTokenStore';
import { validateLoginInput } from '@/common/validateLoginInput';
import { cn } from '@/common/utils';

type LoginFormData = {
  uname: string;
  pwd: string;
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { setJwtTokenState } = useJwtTokenStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {
    const validationError = validateLoginInput(data.uname, data.pwd);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    hansRequest.post<LoginResponse>('/api/login', data)
      .then((res) => {
        setJwtTokenState(res.token);
        toast.success('登录成功');
        navigate(searchParams.get('redirect') || '/');
      })
      .catch((err) => {
        toast.error(errorToStr(err));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const validateUsername = (value: string) => {
    if (!value.trim()) return '用户名不能为空';
    if (value.length < 4) return '用户名至少4个字符';
    if (value.length > 30) return '用户名不能超过30个字符';
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) return '密码不能为空';
    if (value.length < 8) return '密码至少8个字符';
    if (value.length > 30) return '密码不能超过30个字符';
    if (value === getValues('uname')) return '密码不能与用户名相同';
    return true;
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-md bg-[#1a1a1a]">
      <h2 className="text-2xl font-bold text-center mb-6">登录</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="uname" className="block text-sm font-medium mb-1">
            用户名
          </label>
          <input
            id="uname"
            {...register('uname', {
              validate: validateUsername,
            })}
            className={cn(
              'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
              errors.uname ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            )}
          />
          {errors.uname && <p className="mt-1 text-sm text-red-600">{errors.uname.message}</p>}
        </div>

        <div>
          <label htmlFor="pwd" className="block text-sm font-medium mb-1">
            密码
          </label>
          <div className="relative">
            <input
              id="pwd"
              type={showPassword ? 'text' : 'password'}
              {...register('pwd', {
                validate: validatePassword,
              })}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                errors.pwd ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? (
                <FiEyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <FiEye className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          {errors.pwd && <p className="mt-1 text-sm text-red-600">{errors.pwd.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full py-2 px-4 rounded-md text-white font-medium',
            isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
        >
          {isSubmitting ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
}
