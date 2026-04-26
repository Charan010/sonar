const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

let usersCollection;

let isConnected = false;


async function connectDB(){

    if(isConnected)
        return

    await client.connect();
    const db = client.db("sonarDB");
    usersCollection = db.collection("login_info");

    isConnected = true;
    
}

async function findUserByUsername(username){
    return await usersCollection.findOne({username});
}

async function saveImage({ username, name , buffer, mimeType}){

    return await usersCollection.updateOne({ username },
         { $setOnInsert: { username }, 
         $push: { images: { name, data: buffer, mimeType, uploadedAt: new Date() } } },
         { upsert: true });
}


/* 
    TO-DO: fetching all images of the user and sorting in memory(RAM) is not scalable because clients having massive amount of
    images in the database can crash the server instance.

    can simply prefer doing the computation on mongoDB side by using aggregration.

*/
async function getUserImages(username) {
  const user = await usersCollection.findOne(
    { username },
    { projection: { images: 1, _id: 0 } }
  );

  if (!user || !user.images) return [];

  return user.images
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 15);
}

async function getImageByName(username, name) {
  const user = await usersCollection.findOne(
    { username },
    { projection: { images: 1 } }
  );

  if (!user?.images)
    return null;

  return user.images.find(img => img.name === name);
}


async function deleteImage(username, name) {
  return await usersCollection.updateOne(
    { username },
    { $pull: { images: { name } } }
  );
}

async function deleteAllImages(username) {
  return await usersCollection.updateOne(
    { username },
    { $set: { images: [] } }
  );
}

module.exports = {
  connectDB,
  findUserByUsername,
  saveImage,
  getUserImages,
  getImageByName,
  deleteImage,
  deleteAllImages
};