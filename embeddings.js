import {AzureChatOpenAI, AzureOpenAIEmbeddings} from "@langchain/openai";
import {TextLoader} from "langchain/document_loaders/fs/text";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import { FaissStore} from "@langchain/community/vectorstores/faiss";

const model = new AzureChatOpenAI({temperature: 1});

let vectorStore

const embeddings = new AzureOpenAIEmbeddings({
    temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

async function loadCircuits() {
    const loader = new TextLoader("./public/circuit_brandstof_info.txt")
    const docs = await loader.load()
    const textSplitter = new RecursiveCharacterTextSplitter({chunkSize: 400, chunkOverlap: 20})
    const splitDocs = await textSplitter.splitDocuments(docs)
    console.log(`Chunks is ${splitDocs.length} kilo aangekomen`)
    vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings)
    await vectorStore.save("Circuitsdb")
    console.log("vector store saved")
}

async function askQuestion(prompt) {
    const relevantDocs = await vectorStore.similaritySearch(prompt, 3)
    console.log(relevantDocs[0].pageContent);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n")
    console.log(context)
    //chat
    const response = await model.invoke([
        ["system", "You will get a context and a question, use only the context to answer the question"],
        ["user", `The context is ${context}, the question is ${prompt}`]
    ])
    console.log("-------------------------------")
    console.log(response.content)
}

await loadCircuits()
await askQuestion("What is the fun fact")