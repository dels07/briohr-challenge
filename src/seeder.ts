const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017/notification_service';
const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('notification_service');
    const channelCollection = database.collection('channels');
    const notificationCollection = database.collection('notifications');
    const historyCollection = database.collection('histories');

    // clear existing data
    await notificationCollection.deleteMany({});
    await channelCollection.deleteMany({});
    await historyCollection.deleteMany({});

    // seed channels
    const channels = [
      {
        _id: new ObjectId('66937c6a575c29023a09a8e1'),
        type: 'email',
      },
      {
        _id: new ObjectId('66937c6a575c29023a09a8e2'),
        type: 'ui-only',
      },
    ];

    await channelCollection.insertMany(channels);

    // seed notifications
    const notifications = [
      {
        _id: new ObjectId('66937c6a575c29023a09b7f1'),
        type: 'happy-birthday',
        channels: [
          { _id: '66937c6a575c29023a09a8e1' },
          { _id: '66937c6a575c29023a09a8e2' },
        ],
      },
      {
        _id: new ObjectId('66937c6a575c29023a09b7f2'),
        type: 'monthly-payslip',
        channels: [{ _id: '66937c6a575c29023a09a8e1' }],
      },
      {
        _id: new ObjectId('66937c6a575c29023a09b7f3'),
        type: 'leave-balance-reminder',
        channels: [{ _id: '66937c6a575c29023a09a8e2' }],
      },
    ];

    await notificationCollection.insertMany(notifications);

    // seed histories
    const histories = [
      {
        user_id: '66937a17575c29023a09a8e1',
        company_id: '66937d42575c29023a09a8e6',
        notification: '66937c6a575c29023a09b7f1',
        created_by: 'system',
        created_at: new Date(),
      },
    ];

    await historyCollection.insertMany(histories);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedDatabase();
