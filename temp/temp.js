const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const OpenAI = require('openai');
const fetch = require('node-fetch'); // Add this line to import node-fetch
global.fetch = fetch;

const OpenAIKey=process.env.OPENAI_KEY;
const openai = new OpenAI({apiKey: OpenAIKey});
// const FormData = require("form-data");
// const path = require("path");
// const filePath = path.join(__dirname, "t.mp3");




const {AssemblyAI} = require('assemblyai');

ASSKEY=process.env.ASSEMBLY_KEY
const client = new AssemblyAI({
  apiKey: ASSKEY,
});

const audioUrl = 'https://anonyvent.s3.us-east-2.amazonaws.com/mp3file-1719148676037.mp3'

const config = {
  audio_url: audioUrl
}

 const getTranscription = async () => {
   const transcript = await client.transcripts.transcribe(config)
   console.log(transcript.text);
 }

 getTranscription();


async function gptChecker() {
    const transcription = await getTranscription();
    console.log(transcription);
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
  //console.log(redFlag);
  //let cleanedText = text.replace(/\n/g, '');
  //console.log(cleanedText);

}
gptChecker();
// //if true, delete from S3 and let user know and go back to home
// //if false, upload to mongodb