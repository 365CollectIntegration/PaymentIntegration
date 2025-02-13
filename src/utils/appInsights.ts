import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING,
    instrumentationKey: process.env.NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATIONKEY,
    enableAutoRouteTracking: true, // Tracks page views
  }
});

appInsights.loadAppInsights();

export default appInsights;
