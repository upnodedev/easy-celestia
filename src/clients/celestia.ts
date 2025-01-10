export class CelestiaNodeClient {
  private baseURL: string;
  private headers: HeadersInit;

  constructor(url: string, apiKey?: string) {
    this.baseURL = url;
    this.headers = {
      "Content-Type": "application/json",
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    };
  }

  async request(payload: any): Promise<any> {
    let attempts = 0;
    const maxAttempts = 20;
    const retryDelay = 1100; // 1.1 seconds in milliseconds

    while (attempts < maxAttempts) {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(payload),
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
      //console.log("Response: ")
      //console.log(response);
      //console.log("Body: ")
      //console.log(response.body)

      //console.log("Json: ")
      const data = await response.json();
      //console.log(data.result);

      if (data.error) {
        throw new Error(`${data.error.message}`);
      }

      // Handle the JSON-RPC response
      return data.result;
    }

    throw new Error("Maximum retry attempts reached");
  }
}
