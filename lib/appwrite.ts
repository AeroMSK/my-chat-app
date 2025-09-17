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

console.log("[v0] Appwrite Configuration Debug:")
console.log("[v0] DATABASE_ID:", DATABASE_ID)
console.log("[v0] USERS_COLLECTION_ID:", USERS_COLLECTION_ID)
console.log("[v0] MESSAGES_COLLECTION_ID:", MESSAGES_COLLECTION_ID)
console.log("[v0] CONVERSATIONS_COLLECTION_ID:", CONVERSATIONS_COLLECTION_ID)
console.log("[v0] Environment variables:")
console.log("[v0] NEXT_PUBLIC_APPWRITE_DATABASE_ID:", process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
console.log("[v0] NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID:", process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID)

export async function validateCollections() {
  try {
    console.log("[v0] Validating collections with IDs:")
    console.log("[v0] - Database ID:", DATABASE_ID)
    console.log("[v0] - Users Collection ID:", USERS_COLLECTION_ID)
    console.log("[v0] - Messages Collection ID:", MESSAGES_COLLECTION_ID)
    console.log("[v0] - Conversations Collection ID:", CONVERSATIONS_COLLECTION_ID)

    // Test if collections exist by trying to list documents with limit 1
    console.log("[v0] Testing Users collection...")
    await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.limit(1)])
    console.log("[v0] Users collection validated successfully")

    console.log("[v0] Testing Messages collection...")
    await databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [Query.limit(1)])
    console.log("[v0] Messages collection validated successfully")

    console.log("[v0] Testing Conversations collection...")
    await databases.listDocuments(DATABASE_ID, CONVERSATIONS_COLLECTION_ID, [Query.limit(1)])
    console.log("[v0] Conversations collection validated successfully")

    console.log("[v0] All collections validated successfully!")
    return true
  } catch (error) {
    console.error("[v0] Collection validation failed:", error)
    console.error("[v0] Error message:", error.message)
    console.error("[v0] Error type:", error.type)
    console.error("[v0] Error code:", error.code)
    return false
  }
}

export { client, Query, ID }
