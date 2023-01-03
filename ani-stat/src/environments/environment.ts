export const APP_CONFIG: EnvironmentConfig = {
  production: false,
  environment: 'LOCAL',
};

export type EnvironmentConfig = {
  production: boolean;
  environment: string;
  mock?: boolean;
};
