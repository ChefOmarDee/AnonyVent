const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const OpenAI = require('openai');

const OpenAIKey=process.env.OPENAI_KEY;
const openai = new OpenAI({apiKey: OpenAIKey});
const FormData = require("form-data");
const path = require("path");
const filePath = path.join(__dirname, "t.mp3");
const { MongoClient } = require('mongodb');

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = process.env.CONNECTION_STR; 
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

//main().catch(console.error);

const {AssemblyAI} = require('assemblyai');

ASSKEY=process.env.ASSEMBLY_KEY
const client = new AssemblyAI({
  apiKey: ASSKEY,
});

const audioUrl = 'https://anonyvent.s3.us-east-2.amazonaws.com/mp3file-1719100814230.mp3'

const config = {
  audio_url: audioUrl
}

 const getTranscription = async () => {
   const transcript = await client.transcripts.transcribe(config)
   return transcript.text;
 }



async function gptChecker() {
    const transcription = await getTranscription();
    const rules = "If the following transcription mentions sex, not including fuck in an upset manner, murdering someone, or mentions gravely hurting someone return true, if not then return false: ";
    const prompt = rules.concat(transcription);
  const completion = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct",
    prompt: prompt,
    max_tokens: 8,
    temperature: 0,
  });

  const redFlag = completion.choices[0].text;
  return redFlag;
  //let cleanedText = text.replace(/\n/g, '');
  //console.log(cleanedText);

}
gptChecker();
// //if true, delete from S3 and let user know and go back to home
// //if false, upload to mongodb