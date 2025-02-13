import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {    
    instrumentationKey: '32a1eeb6-c651-43fc-a90c-f26290929266',
    enableAutoRouteTracking: true, // Tracks page views
  }
});

appInsights.loadAppInsights();

export default appInsights;
