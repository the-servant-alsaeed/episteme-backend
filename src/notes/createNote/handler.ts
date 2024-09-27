import { APIGatewayEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export default async (event: APIGatewayEvent) => {
    // CAPTURE THIS INFO
    const { noteId, noteTitle, noteMarkdown, noteTags } = JSON.parse(event.body!);
    const userSub = event.requestContext.authorizer!.claims.sub;

    if (!noteId || !noteTitle) {
        return {
            statusCode: 422,
            body: null
        };
    }

    const command = new BatchWriteCommand({
        RequestItems: {
            [process.env.TABLE_NAME!]: [
                {
                    PutRequest: {
                        Item: { pk: noteId, sk: userSub, noteTitle, noteMarkdown, noteTags }
                    }
                }
            ]
        }
    });

    await docClient.send(command);

    return {
        statusCode: 200,
        body: JSON.stringify({ noteId, noteTitle, noteMarkdown, noteTags })
    };
};
