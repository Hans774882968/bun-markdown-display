import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FiLogIn, FiLogOut } from 'react-icons/fi';
import { errorToStr } from '@/common/errorToStr';
import { useJwtTokenStore } from '@/frontend/stores/useJwtTokenStore';
import { hansRequest } from '@/common/hansRequest';

export function UserStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { uname, jwtToken, clearJwtTokenAndUname } = useJwtTokenStore();

  const handleLogout = async () => {
    setIsLoading(true);
    if (!jwtToken) return;
    hansRequest.post('/api/logout', null, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
    })
      .then(() => {
        clearJwtTokenAndUname();
        toast.success('退出成功');
      })
      .catch((error) => {
        toast.error(errorToStr(error));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLoginRedirect = () => {
    const isLoginPage = location.pathname === '/login';
    // TODO: location.hash 成功加进去了，但只有再回车一次才能到达对应锚点
    const redirectUrl = isLoginPage
      ? '/login'
      : `/login?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`;
    navigate(redirectUrl);
  };

  if (uname) {
    return (
      <div className="flex items-center space-x-4">
        <span className="font-bold">你好，{uname}</span>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <FiLogOut className="h-5 w-5" />
          <span>退出</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLoginRedirect}
      className="flex items-center gap-1.5 font-bold cursor-pointer"
    >
      <FiLogIn className="h-5 w-5" />
      <span>登录</span>
    </button>
  );
}
