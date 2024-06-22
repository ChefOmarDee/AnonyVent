const { MongoClient } = require('mongodb');

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://anonyvent:anonyvent123@anonyvent.cept3vq.mongodb.net/"; 
    const client = new MongoClient(uri);
   try {
    //connect to mongodb cluster
    await client.connect();
    const database = client.db('AnonyVent');
    // Access the collection
    const collection = database.collection('Vents');
    const randomDocuments = await collection.aggregate([ { $sample: { size: 3 } } ]).toArray();
    const titles = randomDocuments.map(randomDocuments => randomDocuments.title);
    console.log(titles);
    // const findResult = await collection.find().toArray();
    // console.log(findResult);
    // findResult.forEach(doc => {
    //     console.log('Document:');
    //     for (const [key, value] of Object.entries(doc)) {
    //         console.log(`  ${key}: ${value}`);
    //     }
    // });
    //console.log(findResult);

   }
   catch(e) {
    console.log(e);
   }
   finally {
    await client.close();
   }
   
}

main().catch(console.error);
async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};