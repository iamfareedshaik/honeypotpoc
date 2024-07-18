const AWS = require("aws-sdk");
const express = require("express");
const bodyParser = require("body-parser");
const xlsx = require("xlsx");
const fs = require("fs");
require('dotenv').config();
AWS.config.update({ region: 'eu-north-1' });
const app = express();
const port = 3000;

//AWS.config.update({ region: 'eu-north-1', profile: 'pochoneypot' });

// Create DynamoDB service object
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

app.use(bodyParser.json());

// Function to upload data to S3
const uploadToS3 = (data, callback) => {
  const { session_id } = data;
  const fileName = `logs/${session_id}`;

  // Check if file already exists in S3
  s3.headObject({ Bucket: process.env.S3_BUCKET_NAME, Key: fileName }, (headErr, headData) => {
    if (headErr && headErr.code !== 'NotFound') {
      console.error("Error checking if file exists:", headErr);
      callback(headErr);
      return;
    }

    let workbook = null;

    if (headData) {
      // File exists, load existing workbook
      s3.getObject({ Bucket: process.env.S3_BUCKET_NAME, Key: fileName }, (getErr, getData) => {
        if (getErr) {
                    console.error("Error fetching existing file from S3:", getErr);
          callback(getErr);
          return;
        }

        // Parse buffer to workbook
        workbook = xlsx.read(getData.Body, { type: 'buffer' });
        appendDataToWorkbook(workbook, data, callback,fileName);
      });
    } else {
      // File does not exist, create new workbook
      workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet([data]);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Save workbook to buffer
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Upload buffer to S3
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      s3.upload(params, (uploadErr, uploadData) => {
        if (uploadErr) {
          console.error("Error uploading new file to S3:", uploadErr);
          callback(uploadErr);
        } else {
          console.log("Successfully uploaded new file to S3:", uploadData);
          callback(null, uploadData);
        }
      });
    }
  });
};

// Function to append data to existing workbook
const appendDataToWorkbook = (workbook, data, callback, fileName) => {
  const worksheet = workbook.Sheets["Sheet1"];

  // Convert the data to sheet format and append to existing worksheet
  const newData = xlsx.utils.sheet_to_json(worksheet);
  newData.push(data);
  const newWorksheet = xlsx.utils.json_to_sheet(newData);

  workbook.Sheets["Sheet1"] = newWorksheet;

  // Save workbook to buffer
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Upload buffer to S3
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  s3.upload(params, (uploadErr, uploadData) => {
    if (uploadErr) {
            console.error("Error uploading updated file to S3:", uploadErr);
      callback(uploadErr);
    } else {
      console.log("Successfully appended data to existing file in S3:", uploadData);
      callback(null, uploadData);
    }
  });
};


// Route to add item to DynamoDB
app.post("/logs", (req, res) => {
  const item = req.body;
  const {session_id, honeypotname, time_stamp, src_ip} = item
  const dynamoParam = {session_id, honeypotname, time_stamp, src_ip,isAnalysed:false}
  const params = {
    TableName: "HoneyPotLogs",
    Item: dynamoParam,
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
      uploadToS3(item, (err, s3Data) => {
        if (err) {
          res.status(500).json({ error: "Could not upload log to S3" });
        } else {
                    res.status(200).json({ success: "Item added and logged successfully", data, s3Data });
        }
      });
    }
  });
});

app.put("/logs/analyse/:session_id", (req, res) => {
  const session_id = req.params.session_id;

  const params = {
    TableName: "HoneyPotLogs",
    Key: {
      session_id: session_id,
    },
    UpdateExpression: "set isAnalysed = :true",
    ExpressionAttributeValues: {
      ":true": true
    },
    ReturnValues: "UPDATED_NEW"
  };

  dynamoDb.update(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.status(500).json({ error: "Could not update item" });
    } else {
      console.log("Updated item:", JSON.stringify(data, null, 2));
      res.status(200).json({ success: "Item updated successfully", data });
    }
  });
});

app.get('/logs/:filename', async (req, res) => {
  const filename = req.params.filename;
  const params = {
    Bucket: 'cowrie-commands',
    Key: `logs/${filename}`
  };

  try {
    console.log(params);
    const data = await s3.getObject(params).promise();

    // Parse Excel file
    const workbook = xlsx.read(data.Body, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Send JSON response
    res.json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving or processing the file');
  }
});


app.get('/logs/allitems/:size', async (req, res) => {
  const { size } = req.params;
  const { lastEvaluatedKey } = req.query;
  let items = [];
  const limit = parseInt(size);
    const params = {
    TableName: 'HoneyPotLogs',
    Limit: limit,
  };

  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
  }

  const scanWithExponentialBackoff = async (params, retryCount = 0) => {
    try {
      const data = await dynamoDb.scan(params).promise();
      return data;
    } catch (error) {
      if (error.code === 'ProvisionedThroughputExceededException' && retryCount < 5) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
        return scanWithExponentialBackoff(params, retryCount + 1);
      } else {
        throw error;
      }
    }
  };

  try {
    const data = await scanWithExponentialBackoff(params);
    items = data.Items;
    const response = {
      items,
      lastEvaluatedKey: data.LastEvaluatedKey ? JSON.stringify(data.LastEvaluatedKey) : null,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving or processing the logs');
  }
    });

// Route to scan and get all items from a DynamoDB table
app.get("/logs", (req, res) => {
  const { tableName } = req.params;

  const params = {
    TableName: "HoneyPotLogs",
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

app.get("/analyse/logs", (req, res) => {
  const params = {
    TableName: "HoneyPotLogs",
    FilterExpression: "isAnalysed = :false",
    ExpressionAttributeValues: {
      ":false": false
    }
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

  


        
