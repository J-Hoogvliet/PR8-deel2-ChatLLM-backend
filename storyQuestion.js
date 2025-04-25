import {AzureChatOpenAI, AzureOpenAIEmbeddings} from "@langchain/openai";
import { FaissStore} from "@langchain/community/vectorstores/faiss";

const model = new AzureChatOpenAI({temperature: 1});

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

let vectorStore = await FaissStore.load("Circuitsdb", embeddings)
async function askQuestion(prompt) {
    const relevantDocs = await vectorStore.similaritySearch(prompt, 3)
    console.log(relevantDocs[0].pageContent)
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n")
    console.log(context)
    //chat
    const response = await model.invoke([
        ["system", "You are a engineer who helps a racingdriver during races. Give a response like you are talking to your driver, while giving him advice. Be short and direct in your sentences, you do not want do distract him while driving. Start your sentences by saying the name of the driver back to them. Then you start answering the question. You are dutch"],
        ["user", `The context is ${context}, the question is ${prompt}`]
    ])
    console.log("-------------------------------")
    console.log(response)
}

await askQuestion("Hoi ik ben Alexander. Ik rijd vandaag op zandvoort, hier ga ik 33 ronden rijden. Reken uit hoeveel liter benzine ik mee moet nemen om minimaal 34 te kunnen rijden.")