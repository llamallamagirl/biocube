import { ReactElement } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { useCookies } from 'react-cookie';

import { Button } from 'components/Button';
import { Logger } from 'logger';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const COOKIE_NAME = process.env.REACT_APP_COOKIE_ID;

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
];

const Login = (): ReactElement => {
  const [{ [COOKIE_NAME]: cookie }, setCookie, removeCookie] = useCookies();

  const login = (response) => {
    const { accessToken, profileObj } = response;
    setCookie(COOKIE_NAME, { ...profileObj, accessToken });
  };

  const logout = () => removeCookie(COOKIE_NAME);

  return cookie ? (
    <GoogleLogout
      clientId={CLIENT_ID}
      onFailure={() => Logger.info('Logout failure')}
      onLogoutSuccess={() => logout()}
      render={(props) => (
        <Button {...props} color="inherit" disabled={false} label="Log Out" />
      )}
    />
  ) : (
    <GoogleLogin
      clientId={CLIENT_ID}
      onFailure={() => Logger.info('Login failure')}
      onSuccess={login}
      cookiePolicy="single_host_origin"
      render={(props) => (
        <Button {...props} color="inherit" disabled={false} label="Log In" />
      )}
      responseType="code,token"
      scope={SCOPES.join(' ')}
    />
  );
};

export default Login;