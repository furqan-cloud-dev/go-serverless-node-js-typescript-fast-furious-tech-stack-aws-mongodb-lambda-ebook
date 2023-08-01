import { Db } from "mongodb";

type projectionFields = {
    [key: string]: number
}

export async function find(db: Db, collectionName: string, query: any, sort: any, page = 1, limit = 10, fields: string[]) {
    const collection = db.collection(collectionName);
    const startFrom = (page - 1) * limit;
    const projection: projectionFields = {};
    fields.forEach((element) => {
        projection[element] = 1;
    });

    const results = await collection.find(query)
        .sort(sort)
        .skip(startFrom)
        .limit(limit)
        .project(projection)
        .toArray();

    return {
        "limit": limit,
        "currentPage": page,
        "results": results
    };
}


export async function findOne(db: Db, collectionName: string, query: any, fields: string[]) {
    const collection = db.collection(collectionName);
    const projection: projectionFields = {};
    fields.forEach((element) => {
        projection[element] = 1;
    });

    const options = {
        projection: projection
    };

    const result = await collection.findOne(query, options);
    return result;
}


export async function insert(db: Db, collectionName: string, doc: any) {
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(doc);
    return result;
}


export async function updateOne(db: Db, collectionName: string, filter: any, updateDoc: any, options: any) {
    const collection = db.collection(collectionName);
    const result = await collection.updateOne(filter, updateDoc, options);
    return result;
}

export async function deleteOne(db: Db, collectionName: string, query: any) {
    const collection = db.collection(collectionName);
    const result = await collection.deleteOne(query);
    return result;
}