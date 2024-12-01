const RequiredEnvVars = [
  //
  'ENABLE_DOCUMENTATION',
  'SERVER_PORT',
];

interface Configuration {
  server: {
    port: number;
  };
  enableDocumentation: boolean;
}

// Default configuration variables
const DEFAULT_SERVER_PORT = 3002;

export const processENV = (): Configuration => {
  const defaultConfiguration = {
    server: {
      port: parseInt(process.env.SERVER_PORT as string, 10) || DEFAULT_SERVER_PORT,
    },
    enableDocumentation: process.env.ENABLE_DOCUMENTATION === 'true',
  };

  return defaultConfiguration;
};

export const validateEnvironmentVars = (): void => {
  // if (process.env.NODE_ENV === undefined) {
  //   process.env.NODE_ENV = 'development';
  // }

  RequiredEnvVars.forEach((v) => {
    if (!process.env[v]) throw Error(`Missing required env variable ${v}`);
  });
};
