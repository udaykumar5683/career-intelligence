import { Client, Account, Databases } from "appwrite"; 

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a0028cf00138195d07b");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
