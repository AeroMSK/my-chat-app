import { Client, Account, Databases, Query, ID } from "appwrite"

const client = new Client()

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68938bea001ed4b0a8b0")

export const account = new Account(client)
export const databases = new Databases(client)

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "68a4caf7003509b5f8d0"
export const MESSAGES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID || "68a60bcf0009b6090085"
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "68a60865000fd2f20282"
export const CONVERSATIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID || "68a60a71003b251da096"

export async function validateCollections() {
  try {
    // Test if collections exist by trying to list documents with limit 1
    await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.limit(1)])
    await databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [Query.limit(1)])
    await databases.listDocuments(DATABASE_ID, CONVERSATIONS_COLLECTION_ID, [Query.limit(1)])
    return true
  } catch (error) {
    console.error("[v0] Collection validation failed:", error)
    return false
  }
}

export { client, Query, ID }
