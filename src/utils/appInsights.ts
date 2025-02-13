import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: 'InstrumentationKey=32a1eeb6-c651-43fc-a90c-f26290929266;IngestionEndpoint=https://australiasoutheast-0.in.applicationinsights.azure.com/;LiveEndpoint=https://australiasoutheast.livediagnostics.monitor.azure.com/;ApplicationId=b4022679-e693-44cd-9d89-d077f5249125',
    instrumentationKey: '32a1eeb6-c651-43fc-a90c-f26290929266',
    enableAutoRouteTracking: true, // Tracks page views
  }
});

appInsights.loadAppInsights();

export default appInsights;
