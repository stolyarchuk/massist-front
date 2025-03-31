// export interface Env {
//   ASSETS: {
//     fetch(request: Request): Promise<Response>;
//   };

//   API_URL: string;
// }

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  chat_id?: string;
  initial_message?: string;
}

// export default Env;
