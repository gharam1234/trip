declare module "apollo-upload-client/createUploadLink.mjs" {
  import { ApolloLink } from "@apollo/client";
  
  interface CreateUploadLinkOptions {
    uri?: string;
    fetch?: typeof fetch;
    fetchOptions?: RequestInit;
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
    includeExtensions?: boolean;
  }
  
  export function createUploadLink(options?: CreateUploadLinkOptions): ApolloLink;
}
