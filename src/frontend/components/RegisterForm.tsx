import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FiEye, FiEyeOff, FiHelpCircle } from 'react-icons/fi';
import { errorToStr } from '@/common/errorToStr';
import { hansRequest } from '@/common/hansRequest';
import { useJwtTokenStore } from '../stores/useJwtTokenStore';
import { validateLoginInput, getPasswordStrength, SPECIAL_CHARS } from '@/common/validateLoginInput';
import { IsAdminResponse } from '@/types/auth';
import { cn } from '@/common/utils';

type RegisterFormData = {
  uname: string;
  pwd: string;
  confirmPwd: string;
};

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { jwtToken } = useJwtTokenStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>();

  const pwd = watch('pwd');
  useEffect(() => {
    if (pwd) {
      setPasswordStrength(getPasswordStrength(pwd));
    } else {
      setPasswordStrength(0);
    }
  }, [pwd]);

  useEffect(() => {
    if (!jwtToken) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    const checkAdmin = async () => {
      try {
        const response = await hansRequest.get<IsAdminResponse>('/api/user/isAdmin', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        if (!response.isAdmin) {
          toast.error('只有管理员才能注册用户');
          navigate('/');
        }
      } catch (error) {
        toast.error(errorToStr(error));
        navigate('/');
      }
    };

    checkAdmin();
  }, [jwtToken, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    if (data.pwd !== data.confirmPwd) {
      toast.error('两次输入的密码不一致');
      return;
    }

    const validationError = validateLoginInput(data.uname, data.pwd);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await hansRequest.post('/api/register', {
        uname: data.uname,
        pwd: data.pwd
      }, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      toast.success('注册成功');
      navigate('/');
    } catch (error) {
      toast.error(errorToStr(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    const strength = passwordStrength * 25; // 将0-4转换为0-100
    if (strength >= 80) return 'bg-green-500';
    if (strength >= 60) return 'bg-yellow-500';
    if (strength >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthText = () => {
    const strength = passwordStrength * 25;
    if (strength >= 80) return '强';
    if (strength >= 60) return '中';
    if (strength >= 40) return '弱';
    return '非常弱';
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-md bg-[#1a1a1a]">
      <h2 className="text-2xl font-bold text-center mb-6">注册</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="uname" className="block text-sm font-medium mb-1">
            用户名
          </label>
          <input
            id="uname"
            {...register('uname', {
              required: '用户名不能为空',
              maxLength: { value: 30, message: '不能超过30个字符' }
            })}
            className={cn(
              'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
              errors.uname ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
            )}
          />
          {errors.uname && (
            <p className="mt-1 text-sm text-red-600">{errors.uname.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <label htmlFor="pwd" className="block text-sm font-medium">
              密码
            </label>
            <div className="group relative">
              <FiHelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-pre-wrap w-max max-w-xs z-114514">
                <div>密码需至少包含大写字母、小写字母、数字和特殊字符中的两种</div>
                <div>特殊字符列表（{SPECIAL_CHARS.length}个）：{SPECIAL_CHARS}</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <input
              id="pwd"
              type={showPassword ? 'text' : 'password'}
              {...register('pwd', {
                required: '密码不能为空',
                maxLength: { value: 30, message: '不能超过30个字符' }
              })}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                errors.pwd ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.pwd && (
            <p className="mt-1 text-sm text-red-600">{errors.pwd.message}</p>
          )}
          {pwd && (
            <div className="mt-2">
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${getStrengthColor()}`}
                  style={{ width: `${passwordStrength * 25}%` }}
                />
              </div>
              <p className="text-sm mt-1">
                密码强度：{getStrengthText()}
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPwd" className="block text-sm font-medium mb-1">
            确认密码
          </label>
          <div className="relative">
            <input
              id="confirmPwd"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPwd', {
                required: '请确认密码',
                validate: value => value === pwd || '两次输入的密码不一致'
              })}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
                errors.confirmPwd ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirmPwd && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPwd.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full py-2 px-4 text-white font-semibold rounded-md',
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
          )}
        >
          {isLoading ? '注册中...' : '注册'}
        </button>
      </form>
    </div>
  );
}
