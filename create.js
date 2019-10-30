import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function main(event, context) {
  // Request body is passed in as JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.tableName,
    /**
     * 'Item' contains the attributes of the item to be created
     * - 'userId': user identities are federated througk the Cognito Identity Pool
     *             We will use the identity id as the user id of the authenticated user
     * - 'noteId': a unique uuid
     * - 'content' parsed from request body
     * - 'attachment': parsed from request body
     * - 'createdAt': current UNIX timestamp
     */
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuid.v1(),
      content: data.content,
      attachment: data.attachment,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (error) {
    return failure({ status: false });
  }
}
