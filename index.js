const AWS = require("aws-sdk");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Configure AWS SDK with environment variables
AWS.config.update({
  region: "",
  accessKeyId: "",
  secretAccessKey: "",
  sessionToken: "",
});

// Create DynamoDB service object
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json());

// Route to add item to DynamoDB
app.post("/item", (req, res) => {
  const item = req.body;
  console.log(item);
  const params = {
    TableName: "HoneyPotLogs",
    Item: item,
  };

  dynamoDb.put(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to add item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json({ error: "Could not add item" });
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      res.status(200).json({ success: "Item added successfully", data });
    }
  });
});

// Route to get item from DynamoDB
app.get("/item/:tableName/:id", (req, res) => {
  const { tableName, id } = req.params;

  const params = {
    TableName: "HoneyPotLogs",
    Key: {
      id: id, // adjust according to your primary key
    },
  };

  dynamoDb.get(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to read item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json({ error: "Could not get item" });
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      res.status(200).json({ success: "Item retrieved successfully", data });
    }
  });
});

// Route to scan and get all items from a DynamoDB table
app.get("/items/:tableName", (req, res) => {
  const { tableName } = req.params;

  const params = {
    TableName: tableName,
  };

  dynamoDb.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to scan table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json({ error: "Could not scan table" });
    } else {
      console.log("Scan succeeded:", JSON.stringify(data, null, 2));
      res.status(200).json({ success: "Table scanned successfully", data });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
