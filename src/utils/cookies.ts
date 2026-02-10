import Cookies from "js-cookie";

export const AUTH_COOKIE_NAME = "access_token";
export const USERNAME_COOKIE_NAME = "username";
export const ROLE_COOKIE_NAME = "role";

export const cookieUtils = {
  setAuthToken: (token: string) => {
    Cookies.set(AUTH_COOKIE_NAME, token, {
      expires: 1,
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

  setUsername: (username: string) => {
    Cookies.set(USERNAME_COOKIE_NAME, username, {
      expires: 1,
      path: "/",
      sameSite: "lax",
    });
  },

  getUsername: () => Cookies.get(USERNAME_COOKIE_NAME),

  setRole: (role: string) => {
    Cookies.set(ROLE_COOKIE_NAME, role, {
      expires: 1,
      path: "/",
      sameSite: "lax",
    });
  },

  getRole: () => Cookies.get(ROLE_COOKIE_NAME),

  removeUserMeta: () => {
    Cookies.remove(USERNAME_COOKIE_NAME, { path: "/" });
    Cookies.remove(ROLE_COOKIE_NAME, { path: "/" });
  },
};
