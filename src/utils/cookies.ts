import Cookies from "js-cookie";

export const AUTH_COOKIE_NAME = "access_token";

export const cookieUtils = {
  setAuthToken: (token: string) => {
    Cookies.set(AUTH_COOKIE_NAME, token, {
      expires: 1 / 24,
      path: "/",
      sameSite: "lax",
    });
  },

  getAuthToken: () => {
    return Cookies.get(AUTH_COOKIE_NAME);
  },

  removeAuthToken: () => {
    Cookies.remove(AUTH_COOKIE_NAME, { path: "/" });
  },

  hasAuthToken: () => {
    return Boolean(Cookies.get(AUTH_COOKIE_NAME));
  },
};
