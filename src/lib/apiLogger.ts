import { queryClient } from "./queryClient";

export type LogListener = (msg: string) => void;
let listeners: LogListener[] = [];
export const addLogListener = (listener: LogListener) => {
  listeners.push(listener);
};
export const removeLogListener = (listener: LogListener) => {
  listeners = listeners.filter((l) => l !== listener);
};
export const logToUI = (msg: string) => {
  console.log(msg);
  listeners.forEach((l) => l(msg));
};

export const fetchWithLogging = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const method = options.method || "GET";

  // Use React Query for GET requests to cache results
  if (method === "GET") {
    const queryKey = ["fetch", url, options.headers];

    try {
      const cachedData = queryClient.getQueryData(queryKey);
      if (cachedData) {
        logToUI(`[API] Cache hit for: ${url}`);
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const data = await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          logToUI(`[API] Initiating request to: ${url}`);
          logToUI(`[API] Method: ${method}`);

          const response = await fetch(url, options);
          logToUI(`[API] Response: ${response.status} ${response.statusText}`);

          const clonedResponse = response.clone();
          try {
            const responseBodyText = await clonedResponse.text();
            logToUI(`[API] Response Body: ${responseBodyText.slice(0, 200)}...`);
            if (!response.ok) {
              (response as any).diagnosticErrorText = responseBodyText;
              throw response;
            }
            // we try to parse JSON, if it fails just return the text
            try {
              return JSON.parse(responseBodyText);
            } catch {
              return responseBodyText;
            }
          } catch (e: any) {
            logToUI(`[API] Failed to read body: ${e.message}`);
            throw response;
          }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
      });

      return new Response(
        typeof data === "string" ? data : JSON.stringify(data),
        {
          status: 200,
          headers: {
            "Content-Type":
              typeof data === "string"
                ? "text/plain"
                : "application/json",
          },
        }
      );
    } catch (error: any) {
      if (error instanceof Response) {
        return error; // return the error response so caller can handle it (like 429)
      }
      logToUI(`[API] Error: ${error.message}`);
      throw error;
    }
  }

  // Non-GET requests (POST, PUT, etc.) bypass cache
  logToUI(`[API] Initiating request to: ${url}`);
  logToUI(`[API] Method: ${method}`);
  if (options.body) {
    try {
      logToUI(
        `[API] Body: ${JSON.stringify(JSON.parse(options.body as string))}`
      );
    } catch {
      logToUI(`[API] Body: ${String(options.body).slice(0, 100)}...`);
    }
  }
  try {
    const response = await fetch(url, options);
    logToUI(`[API] Response: ${response.status} ${response.statusText}`);
    const clonedResponse = response.clone();
    try {
      const responseBodyText = await clonedResponse.text();
      logToUI(`[API] Response Body: ${responseBodyText.slice(0, 200)}...`);
      if (!response.ok) {
        (response as any).diagnosticErrorText = responseBodyText;
      }
    } catch (e: any) {
      logToUI(`[API] Failed to read body: ${e.message}`);
    }
    return response;
  } catch (error: any) {
    logToUI(`[API] Error: ${error.message}`);
    throw error;
  }
};
