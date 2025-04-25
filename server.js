import {AzureChatOpenAI, AzureOpenAIEmbeddings} from "@langchain/openai";
import {HumanMessage, AIMessage, SystemMessage, ToolMessage} from "@langchain/core/messages";
import express from "express"
import cors from "cors"
import { FaissStore} from "@langchain/community/vectorstores/faiss";

const app = express()
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));


const model = new AzureChatOpenAI({temperature: 1});

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});
let vectorStore = await FaissStore.load("Circuitsdb", embeddings)
let driversName =''
let track=''

const messages = [
    new SystemMessage(" You are a engineer who helps a racingdriver during races. Give a response like you are talking to your driver, while giving him advice. Be short and direct in your sentences, you do not want do distract him while driving. Start your sentences by saying the name of the driver back to them. Then you start answering the question. You are dutch")
]

async function askQuestion(prompt) {
    const relevantDocs = await vectorStore.similaritySearch(prompt, 3)
    console.log(relevantDocs[0].pageContent)
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n")
    console.log(context)
    messages.push(new HumanMessage(`De context: ${context}, De vraag: ${prompt}, ik heet ${driversName} en ik rijd nogsteeds op ${track}`))
    console.log(messages)
    const response = await model.invoke(messages)
    console.log("-------------------------------")
    console.log(response.content)
    messages.push(new AIMessage(response.content))
    return response.content
}

app.post("/ask", async (req, res) => {
    let prompt = req.body.prompt
    track = req.body.track
    driversName = req.body.driver
    let result = await askQuestion(prompt)
    console.log(result)
    res.json({message: result})
})
app.post("/clear", async (req, res) => {
    messages.length = 0;
    console.log(messages)
    messages.push(new SystemMessage("You are a engineer who helps a racingdriver during races. Give a response like you are talking to your driver, while giving him advice. Be short and direct in your sentences, you do not want do distract him while driving. Start your sentences by saying the name of the driver back to them. Then you start answering the question. You are dutch"));
    res.json({message: "Je kan nu opnieuw beginnen"});
});

app.listen(3000, () => console.log("Server op port 3000"));