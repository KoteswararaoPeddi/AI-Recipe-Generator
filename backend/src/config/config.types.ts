/** Typed shape of the namespaced app config, returned by the `configuration` factory. */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  gemini: {
    apiKey: string;
    model: string;
  };
}
