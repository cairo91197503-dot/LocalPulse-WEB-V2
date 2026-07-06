export const fetchGoogleApiWithDiagnostics = async (
  url: string,
  options: RequestInit,
  apiName: string
): Promise<Response> => {
  console.log(`[Diagnostic] [${apiName}] Initiating request to: ${url}`);
  console.log(`[Diagnostic] [${apiName}] Request options:`, {
    method: options.method || 'GET',
    headers: options.headers,
    hasBody: !!options.body,
  });

  const authHeader = (options.headers as Record<string, string>)?.['Authorization'] || (options.headers as any)?.get?.('Authorization');
  if (!authHeader) {
    console.warn(`[Diagnostic] [${apiName}] WARNING: No Authorization header provided!`);
  } else if (!authHeader.startsWith('Bearer ')) {
    console.warn(`[Diagnostic] [${apiName}] WARNING: Authorization header does not start with 'Bearer '!`);
  }

  try {
    const response = await fetch(url, options);
    
    console.log(`[Diagnostic] [${apiName}] Received response. Status: ${response.status} ${response.statusText}`);
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log(`[Diagnostic] [${apiName}] Response headers:`, responseHeaders);

    if (!response.ok) {
      console.error(`[Diagnostic] [${apiName}] Request failed with status ${response.status}.`);
      
      const clonedResponse = response.clone();
      try {
        const errorText = await clonedResponse.text();
        console.error(`[Diagnostic] [${apiName}] Error body:`, errorText);
        
        // Also attach the error text to the response object itself for the caller to use if needed
        (response as any).diagnosticErrorText = errorText;
      } catch (e) {
        console.error(`[Diagnostic] [${apiName}] Failed to read error body:`, e);
      }
    }

    return response;
  } catch (error) {
    console.error(`[Diagnostic] [${apiName}] Network or fetch error:`, error);
    throw error;
  }
};
