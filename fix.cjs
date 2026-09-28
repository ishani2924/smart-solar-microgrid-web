const { MongoClient } = require('mongodb');
async function fix() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('SmartSolarMicrogrid');
  const collection = db.collection('EnergyBookingSlots');
  const slots = await collection.find({Capacity: 0}).toArray();
  for (const slot of slots) {
    await collection.updateOne({_id: slot._id}, {$set: {Capacity: slot.AvailableCapacity}});
    console.log('Fixed slot', slot.SlotId);
  }
  await client.close();
}
fix().catch(console.error);
