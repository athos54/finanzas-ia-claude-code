// MongoDB initialization script
db.createUser({
  user: 'testai_user',
  pwd: 'testai_password123',
  roles: [
    {
      role: 'readWrite',
      db: 'testai'
    }
  ]
});

db = db.getSiblingDB('testai');

// Create collections if needed
db.createCollection('users');

print('Database and user created successfully');