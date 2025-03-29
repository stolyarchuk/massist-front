declare module "hono" {
  interface Hono {
    // Health check endpoint generator
    addHealthCheck(): void;
  }
}

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };

  API_BASE_URL: string;
}

export default Env;
