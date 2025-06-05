import { errorToStr } from '@/common/errorToStr';
import { hansRequest } from '@/common/hansRequest';
import { IsLoginResponse } from '@/types/auth';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Location } from 'react-router-dom';
import { throttle } from 'throttle-debounce';
import { CHECK_LOGIN_THROTTLE_TIME } from './const';

async function checkLoginStatus(jwtToken: string, clearJwtTokenState: () => void) {
  if (!jwtToken) {
    return;
  }
  try {
    const response = await hansRequest.getWithAuthorization<IsLoginResponse>('/api/user/isLogin', jwtToken);
    if (!response.isLogin) {
      clearJwtTokenState();
      toast.info('登录信息过期，已自动退出');
    }
  } catch (error) {
    toast.error(errorToStr(error));
  }
}

const checkLoginStatusWithThrottle = throttle(CHECK_LOGIN_THROTTLE_TIME, checkLoginStatus);

export default function useRouteChange(location: Location, jwtToken: string, clearJwtTokenState: () => void) {
  useEffect(() => {
    checkLoginStatusWithThrottle(jwtToken, clearJwtTokenState);
  }, [location, jwtToken, clearJwtTokenState]);
}
