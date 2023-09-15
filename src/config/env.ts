/**
 * init dotenv
 *
 * .env: Default.
 * .env.local: Local overrides. This file is loaded for all environments except test.
 * .env.development, .env.test, .env.production: Environment-specific settings.
 * .env.development.local, .env.test.local, .env.production.local: Local overrides of environment-specific settings.
 *
 * Available settings from baseimage
 *
 * REACT_APP_TITLE='React App'
 */

/**
 *
 * @param {string} name envrironment name
 * @param {string} init default value
 * @returns {string} value
 */
function env(name: string, init: string): string {
  const key = `REACT_APP_${name.toUpperCase()}`;
  const buildTimeValue = process.env?.[key];

  //@ts-ignore
  const runtimeValue = window._runtime_?.[key];
  const value = runtimeValue || buildTimeValue || init;

  if (value === undefined) {
    throw new Error(`environment ${name} is missing`);
  }

  return value;
}

/**
 * chore
 */
export const ECHO = env('ECHO', 'true').toLocaleLowerCase() === 'true';
export const VERSION = env('VERSION', '0.0.0');
export const BUILD = env('BUILD', '20221130-000000');
export const COPYRIGHT = env('COPYRIGHT', 'cra');

/**
 * app
 */
export const TITLE = env('TITLE', 'CRA-TS脚手架');

export const API_CACHE_TIME = parseInt(env('API_CACHE_TIME', `${10 * 60 * 1000}`)); // ms

/**
 * login
 */
// 登录失败后锁定的时间，单位为秒
export const LOGIN_FAIL_LOCK_SECONDS = parseInt(env('LOGIN_FAIL_LOCK_SECONDS', `${5 * 60}`), 10);

/**
 * layout
 */
export const SHOW_HEADER = env('SHOW_HEADER', 'true').toLocaleLowerCase() === 'true';
export const SHOW_SIDEBAR = env('SHOW_SIDEBAR', 'true').toLocaleLowerCase() === 'true';

/**
 * api
 */
export const PETSTORE_API_ENDPOINT = env('PETSTORE_API_ENDPOINT', 'http://localhost:8080');
