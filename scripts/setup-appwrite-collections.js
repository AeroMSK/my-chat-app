import { Client, Databases, ID, Permission, Role } from "appwrite"

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "68938bea001ed4b0a8b0")
  .setKey(process.env.APPWRITE_API_KEY) // You'll need to set this in your environment

const databases = new Databases(client)

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "68a4caf7003509b5f8d0"

async function setupCollections() {
  try {
    console.log("Setting up Appwrite collections...")

    // Create Users collection
    const usersCollection = await databases.createCollection(DATABASE_ID, ID.unique(), "Users", [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ])

    // Create attributes for Users collection
    await databases.createStringAttribute(DATABASE_ID, usersCollection.$id, "userId", 255, true)
    await databases.createStringAttribute(DATABASE_ID, usersCollection.$id, "username", 255, true)
    await databases.createStringAttribute(DATABASE_ID, usersCollection.$id, "email", 255, true)
    await databases.createBooleanAttribute(DATABASE_ID, usersCollection.$id, "isOnline", false)
    await databases.createDatetimeAttribute(DATABASE_ID, usersCollection.$id, "lastSeen", false)

    console.log("Users collection created:", usersCollection.$id)

    // Create Messages collection
    const messagesCollection = await databases.createCollection(DATABASE_ID, ID.unique(), "Messages", [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ])

    // Create attributes for Messages collection
    await databases.createStringAttribute(DATABASE_ID, messagesCollection.$id, "senderId", 255, true)
    await databases.createStringAttribute(DATABASE_ID, messagesCollection.$id, "receiverId", 255, true)
    await databases.createStringAttribute(DATABASE_ID, messagesCollection.$id, "content", 1000, true)
    await databases.createDatetimeAttribute(DATABASE_ID, messagesCollection.$id, "timestamp", true)
    await databases.createStringAttribute(DATABASE_ID, messagesCollection.$id, "conversationId", 255, true)

    console.log("Messages collection created:", messagesCollection.$id)

    // Create Conversations collection
    const conversationsCollection = await databases.createCollection(DATABASE_ID, ID.unique(), "Conversations", [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ])

    // Create attributes for Conversations collection
    await databases.createStringAttribute(DATABASE_ID, conversationsCollection.$id, "participants", 1000, true)
    await databases.createDatetimeAttribute(DATABASE_ID, conversationsCollection.$id, "lastMessageTime", false)
    await databases.createStringAttribute(DATABASE_ID, conversationsCollection.$id, "lastMessage", 1000, false)

    console.log("Conversations collection created:", conversationsCollection.$id)

    console.log("\n=== SETUP COMPLETE ===")
    console.log("Please update your environment variables with these collection IDs:")
    console.log(`NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=${usersCollection.$id}`)
    console.log(`NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=${messagesCollection.$id}`)
    console.log(`NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID=${conversationsCollection.$id}`)
  } catch (error) {
    console.error("Error setting up collections:", error)
    console.log("\nTROUBLESHOOTING:")
    console.log("1. Make sure you have set APPWRITE_API_KEY in your environment")
    console.log("2. Verify your project ID and database ID are correct")
    console.log("3. Check that your API key has the necessary permissions")
  }
}

setupCollections()
