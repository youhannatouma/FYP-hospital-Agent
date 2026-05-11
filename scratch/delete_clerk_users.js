const { createClerkClient } = require('@clerk/clerk-sdk-node');

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('Error: CLERK_SECRET_KEY is not set');
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

async function deleteAllUsers() {
  console.log('Fetching users from Clerk...');
  let users;
  try {
    users = await clerk.users.getUserList({ limit: 100 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users. Deleting...`);

  for (const user of users) {
    try {
      await clerk.users.deleteUser(user.id);
      console.log(`Deleted user: ${user.id} (${user.emailAddresses[0]?.emailAddress})`);
    } catch (error) {
      console.error(`Failed to delete user ${user.id}:`, error.message);
    }
  }

  if (users.length === 100) {
    console.log('More users might exist. Run the script again to clear remaining users.');
  } else {
    console.log('All users deleted successfully.');
  }
}

deleteAllUsers();
