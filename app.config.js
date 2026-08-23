export default ({ config }) => ({
  ...config,
  extra: {
    API_BASE: process.env.API_BASE,
    eas: {
      projectId: "437d3519-3b0a-4047-bfd7-79e9d9860634",
    },
  },
  android: {
    ...config.android,

    googleServicesFile: "./google-services.json",
  },
});
