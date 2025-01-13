export class CeleniumClient {
  private baseURL: string;
  private headers: HeadersInit;

  constructor(url: string, apiKey?: string) {
    this.baseURL = url;
    this.headers = {
      "Content-Type": "application/json",
      ...(apiKey && { apiKey: apiKey }),
    };
  }

  private async makeRequest(
    url: string,
    method: "GET" | "POST",
    payload?: any
  ): Promise<any> {
    let attempts = 0;
    const maxAttempts = 20;
    const retryDelay = 1100; // 1.1 seconds in milliseconds

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers: this.headers,
        ...(payload && { body: JSON.stringify(payload) }),
      });

      // If response is 429, retry after delay
      if (response.status === 429) {
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
      }

      // Check if the response status is not OK (non-200 range)
      if (!response.ok) {
        // Parse error details if possible
        const errorDetails = await response.json().catch(() => null); // Handle cases where response isn't JSON
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}` +
            (errorDetails ? ` - ${JSON.stringify(errorDetails)}` : "")
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`${data.error.message}`);
      }

      // Handle the JSON-RPC response
      return data; //.result; this returns undefined
    }

    throw new Error("Maximum retry attempts reached");
  }

  async get(url: string, params?: Record<string, string>): Promise<any> {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url = `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
    }
    
    return this.makeRequest(url, "GET");
  }

  async post(url: string, payload: any): Promise<any> {
    return this.makeRequest(url, "POST", payload);
  }
}
