/**
 * Performance Monitoring Utilities
 * Handles performance monitoring and tracing
 */

import perf, {FirebasePerformanceTypes} from '@react-native-firebase/perf';

/**
 * Performance trace
 */
export type PerformanceTrace = FirebasePerformanceTypes.Trace;

/**
 * HTTP metrics
 */
export type HttpMetric = FirebasePerformanceTypes.HttpMetric;

/**
 * Performance service initialization status
 */
let isInitialized = false;

/**
 * Active traces map
 */
const activeTraces = new Map<string, PerformanceTrace>();

/**
 * Initialize performance monitoring
 */
export const initializePerformance = async (): Promise<void> => {
  try {
    // Enable performance monitoring
    await perf().setPerformanceCollectionEnabled(true);

    isInitialized = true;
    console.log('[Performance] Initialized successfully');
  } catch (error) {
    console.error('[Performance] Initialization error:', error);
  }
};

/**
 * Check if performance monitoring is enabled
 */
export const isPerformanceEnabled = async (): Promise<boolean> => {
  try {
    return await perf().isPerformanceCollectionEnabled();
  } catch (error) {
    console.error('[Performance] Error checking if enabled:', error);
    return false;
  }
};

/**
 * Enable or disable performance monitoring
 */
export const setPerformanceEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await perf().setPerformanceCollectionEnabled(enabled);
    console.log(`[Performance] Monitoring ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[Performance] Error setting enabled state:', error);
  }
};

/**
 * Start a custom trace
 */
export const startTrace = async (traceName: string): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Performance] Not initialized, skipping start trace');
      return;
    }

    // Don't start if already active
    if (activeTraces.has(traceName)) {
      console.warn(`[Performance] Trace ${traceName} already active`);
      return;
    }

    const trace = await perf().startTrace(traceName);
    activeTraces.set(traceName, trace);

    console.log(`[Performance] Trace started: ${traceName}`);
  } catch (error) {
    console.error(`[Performance] Error starting trace ${traceName}:`, error);
  }
};

/**
 * Stop a custom trace
 */
export const stopTrace = async (traceName: string): Promise<void> => {
  try {
    if (!isInitialized) {
      console.warn('[Performance] Not initialized, skipping stop trace');
      return;
    }

    const trace = activeTraces.get(traceName);
    if (!trace) {
      console.warn(`[Performance] Trace ${traceName} not found or not started`);
      return;
    }

    await trace.stop();
    activeTraces.delete(traceName);

    console.log(`[Performance] Trace stopped: ${traceName}`);
  } catch (error) {
    console.error(`[Performance] Error stopping trace ${traceName}:`, error);
  }
};

/**
 * Add a metric to a trace
 */
export const incrementTraceMetric = async (
  traceName: string,
  metricName: string,
  incrementBy: number = 1,
): Promise<void> => {
  try {
    const trace = activeTraces.get(traceName);
    if (!trace) {
      console.warn(`[Performance] Trace ${traceName} not found`);
      return;
    }

    await trace.incrementMetric(metricName, incrementBy);
    console.log(`[Performance] Metric incremented: ${traceName}.${metricName} by ${incrementBy}`);
  } catch (error) {
    console.error(`[Performance] Error incrementing metric ${metricName}:`, error);
  }
};

/**
 * Put a metric value to a trace
 */
export const putTraceMetric = async (
  traceName: string,
  metricName: string,
  value: number,
): Promise<void> => {
  try {
    const trace = activeTraces.get(traceName);
    if (!trace) {
      console.warn(`[Performance] Trace ${traceName} not found`);
      return;
    }

    await trace.putMetric(metricName, value);
    console.log(`[Performance] Metric set: ${traceName}.${metricName} = ${value}`);
  } catch (error) {
    console.error(`[Performance] Error putting metric ${metricName}:`, error);
  }
};

/**
 * Set a custom attribute on a trace
 */
export const setTraceAttribute = async (
  traceName: string,
  attributeName: string,
  attributeValue: string,
): Promise<void> => {
  try {
    const trace = activeTraces.get(traceName);
    if (!trace) {
      console.warn(`[Performance] Trace ${traceName} not found`);
      return;
    }

    await trace.putAttribute(attributeName, attributeValue);
    console.log(`[Performance] Attribute set: ${traceName}.${attributeName} = ${attributeValue}`);
  } catch (error) {
    console.error(`[Performance] Error setting attribute ${attributeName}:`, error);
  }
};

/**
 * Create and track an HTTP metric
 */
export const trackHttpRequest = async (
  url: string,
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
): Promise<HttpMetric | null> => {
  try {
    if (!isInitialized) {
      console.warn('[Performance] Not initialized, skipping HTTP metric');
      return null;
    }

    const metric = await perf().newHttpMetric(url, httpMethod);
    await metric.start();

    console.log(`[Performance] HTTP metric started: ${httpMethod} ${url}`);
    return metric;
  } catch (error) {
    console.error(`[Performance] Error starting HTTP metric:`, error);
    return null;
  }
};

/**
 * Stop HTTP metric with response details
 */
export const stopHttpRequest = async (
  metric: HttpMetric | null,
  statusCode: number,
  responsePayloadSize?: number,
  requestPayloadSize?: number,
): Promise<void> => {
  try {
    if (!metric) {
      console.warn('[Performance] No HTTP metric to stop');
      return;
    }

    metric.setHttpResponseCode(statusCode);

    if (responsePayloadSize !== undefined) {
      metric.setResponsePayloadSize(responsePayloadSize);
    }

    if (requestPayloadSize !== undefined) {
      metric.setRequestPayloadSize(requestPayloadSize);
    }

    await metric.stop();

    console.log(`[Performance] HTTP metric stopped: ${statusCode}`);
  } catch (error) {
    console.error('[Performance] Error stopping HTTP metric:', error);
  }
};

/**
 * Measure async function execution time
 */
export const measureAsync = async <T>(
  traceName: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string>,
): Promise<T> => {
  await startTrace(traceName);

  // Add attributes if provided
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      await setTraceAttribute(traceName, key, value);
    }
  }

  try {
    const result = await fn();
    await stopTrace(traceName);
    return result;
  } catch (error) {
    await stopTrace(traceName);
    throw error;
  }
};

/**
 * Measure sync function execution time
 */
export const measureSync = async <T>(
  traceName: string,
  fn: () => T,
  attributes?: Record<string, string>,
): Promise<T> => {
  await startTrace(traceName);

  // Add attributes if provided
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      await setTraceAttribute(traceName, key, value);
    }
  }

  try {
    const result = fn();
    await stopTrace(traceName);
    return result;
  } catch (error) {
    await stopTrace(traceName);
    throw error;
  }
};

/**
 * PDC-specific performance traces
 */

/**
 * Trace form submission
 */
export const traceFormSubmission = async (
  formName: string,
  formId: string,
  fn: () => Promise<void>,
): Promise<void> => {
  const traceName = 'form_submission';
  await measureAsync(traceName, fn, {
    form_name: formName,
    form_id: formId,
  });
};

/**
 * Trace data upload
 */
export const traceDataUpload = async (
  uploadType: string,
  itemCount: number,
  fn: () => Promise<void>,
): Promise<void> => {
  const traceName = 'data_upload';
  await measureAsync(traceName, fn, {
    upload_type: uploadType,
    item_count: String(itemCount),
  });
};

/**
 * Trace data sync
 */
export const traceDataSync = async (
  syncType: string,
  fn: () => Promise<void>,
): Promise<void> => {
  const traceName = 'data_sync';
  await measureAsync(traceName, fn, {
    sync_type: syncType,
  });
};

/**
 * Trace database query
 */
export const traceDatabaseQuery = async (
  tableName: string,
  operation: string,
  fn: () => Promise<any>,
): Promise<any> => {
  const traceName = `db_${operation}`;
  return await measureAsync(traceName, fn, {
    table_name: tableName,
    operation,
  });
};

/**
 * Trace image processing
 */
export const traceImageProcessing = async (
  operation: 'capture' | 'compress' | 'upload',
  fn: () => Promise<void>,
): Promise<void> => {
  const traceName = `image_${operation}`;
  await measureAsync(traceName, fn, {
    operation,
  });
};

/**
 * Trace audio recording
 */
export const traceAudioRecording = async (
  duration: number,
  fn: () => Promise<void>,
): Promise<void> => {
  const traceName = 'audio_recording';
  await measureAsync(traceName, fn, {
    duration_seconds: String(duration),
  });
};

/**
 * Trace location tracking
 */
export const traceLocationTracking = async (
  projectId: string,
  fn: () => Promise<void>,
): Promise<void> => {
  const traceName = 'location_tracking';
  await measureAsync(traceName, fn, {
    project_id: projectId,
  });
};

/**
 * Trace app startup
 */
export const traceAppStartup = async (): Promise<void> => {
  await startTrace('app_startup');
};

/**
 * Stop app startup trace
 */
export const stopAppStartupTrace = async (): Promise<void> => {
  await stopTrace('app_startup');
};

/**
 * Screen load trace helper
 */
export const traceScreenLoad = async (screenName: string): Promise<void> => {
  await startTrace(`screen_${screenName}`);
};

/**
 * Stop screen load trace
 */
export const stopScreenLoadTrace = async (screenName: string): Promise<void> => {
  await stopTrace(`screen_${screenName}`);
};
