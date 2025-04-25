Installation Process:

Clone project

Terminal:
cd Server
npm init -y
npm install express cors
npm install openai
npm install @azure/openai

After Installation you can use these by importing the following where needed:
import {AzureChatOpenAI, AzureOpenAIEmbeddings} from "@langchain/openai";
import {HumanMessage, AIMessage, SystemMessage, ToolMessage} from "@langchain/core/messages";
import express from "express"
import cors from "cors"
import { FaissStore} from "@langchain/community/vectorstores/faiss";
import {TextLoader} from "langchain/document_loaders/fs/text";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";

To run these js-files, watch the package.json to find the commands.
Put npm run in front of your desired fileCall and run it.

To test use apps like Postman
