/*
  - eBook Example Project:
  - "Go Serverless Fast & Furious- A Cost Effective TechStack: Node.js + AWS Cloud"

  - - Node.js + Typescript
  - - AWS Serverless: Lambda + APIGateway
  - - AWS SAM Template Project
  - - Backend Integration: MongoDB
  - - Dynamic e-Route for CRUD Operations
  - - JWT (JSON Web Token) Authorization

  -- - - -- CREATED BY- -- -- 
  Muhammad Furqan
  Email: furqan.cloud.dev@gmail.com
  Linkedin: https://www.linkedin.com/in/muhammad-furqan-121b691a

  -- - - -- SPONSERED BY- -- -- 
  Fast & Furious Functional Programming Style
  All Developer Community World Wide
 
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Db, MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
import { find, findOne, insert, updateOne, deleteOne } from "./crud.js";
import { sendErrorResponse, appendTimeStampForNewDoc, updateTimeStampForExistingDoc } from "./utility.js";


let mongoClient: MongoClient = null;
let db: Db = null;

//Mapped Entities
const entities = ["users", "notifications"];

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.path === undefined) {
        return sendErrorResponse(404, "node.js rest api - expecting an APIGatewayEvent Request");
    }

    const [emp, api, eRoute, entity, entityId] = event.path.split("/");
    if ([emp, api, eRoute].join("/") !== "/api/e") {
        // Some other route - Not an e-Route
        return sendErrorResponse(404, "not found");
    }

    if (entity === undefined || entity.trim().length === 0) {
        return sendErrorResponse(404, "not found - invalid e-route, entity missing");
    }

    if (!entities.includes(entity)) {
        // only allow mapped entities to process the request - avoid any random entity
        return sendErrorResponse(404, "not found - entity is not mapped");
    }

    const httpMethod = event.httpMethod.toLowerCase();
    const queryParameters = event.queryStringParameters ?? {};
    const page: number = parseInt(queryParameters.page ?? "1") || 1;
    const limit: number = parseInt(queryParameters.limit ?? "10") || 10;

    try {
        if (mongoClient === null) {
            const uri = process.env.MONGODB_CONNECTION_STRING;
            mongoClient = new MongoClient(uri);
            await mongoClient.connect();
            db = mongoClient.db("social");
        }

        const bodyJson = JSON.parse(event.body || "{}");
        const { filter = {}, sort = { _id: -1 }, fields = [] } = bodyJson;
        let result = null;
        if (entityId !== undefined && entityId != null) {
            if (entityId.trim().length === 0) {
                return sendErrorResponse(404, "not found - invalid e-route, entityId missing");
            }
            else {
                const query = { _id: new ObjectId(entityId) };
                if (httpMethod === "get") {
                    result = await findOne(db, entity || "", query, fields);
                }
                else if (httpMethod === "put") {
                    const jsonParameters = JSON.parse(event.body || "{}");
                    const doc = updateTimeStampForExistingDoc(jsonParameters);
                    const updateDoc = {
                        $set: doc
                    };
                    const options = { upsert: false };
                    result = await updateOne(db, entity, query, updateDoc, options);
                }
                else if (httpMethod === "delete") {
                    result = await deleteOne(db, entity, query);
                }
            }
        }
        else {
            if (httpMethod === "get") {
                result = await find(db, entity || "", filter, sort, page, limit, fields);
            }
            else if (httpMethod === "post") {
                const jsonParameters = JSON.parse(event.body || "{}");
                const doc = appendTimeStampForNewDoc(jsonParameters);
                result = await insert(db, entity, doc);
            }
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(result),
        };

    } catch (err: any) {
        console.log("Error:", err);
        return sendErrorResponse(500, err.message);
    }
};

