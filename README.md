# POC server
A Point Of Contact server between our containers generating logs and the database.

## REST API
Documentation about how to interact with the server to access and edit the database

### Post new log entry
Post a new log entry to the database
#### HTTP method: POST
#### URL: /logs
#### Parameters
- **src_ip**: String (Required) - source ip of attacker
  - Example: "127.0.02.1"
- **timestamp**: String (Required) - timestamp of the interaction in ISO 8601 format
  - Example: "2024-06-11T15:55:00Z"
- **input_cmd**: String (Required) - input command of the attacker
  - Example: "ls"
- **honeypot_name**: String (Required) - Name of the honeypot that sent the log entry
  - Example: "Cowrie"
- **response_cmd**: String (Optional) - Response from the honeypot when the command was entered
  - Example: "/dev  /var  /home"
- **session_id**: String (Required) - unique identifier for the session
  - Example: "a-unique-identifier"

#### Example request
```JSON
{
  "src_ip": "127.0.02.1",
  "time_stamp": "2024-06-11T15:55:00Z",
  "input_cmd": "ls",
  "honeypot_name": "Cowrie",
  "response_cmd": "/dev  /var  /home",
  "session_id":"a-unique-identifier"
}
```

#### Example Response
```JSON
{
    "success": "Item added and logged successfully",
    "data": {},
    "s3Data": {
        "ETag": "\"345234890wrldgjkl902345\"",
        "ServerSideEncryption": "AES256",
        "Location": "url",
        "key": "logs/simon-test-session",
        "Key": "logs/simon-test-session",
        "Bucket": "cowrie-commands"
    }
}
```

### Get all sessions
Get all sessions from the database.
#### HTTP method: Get
#### URL: /logs

#### Example Response
```JSON
{
    "success": "Table scanned successfully",
    "data": {
        "Items": [
            {
                "honeypot_name": "cowrie-honeypot",
                "isAnalysed": true,
                "time_stamp": "2024-07-11T15:55:00Z",
                "src_ip": "127.0.02.1",
                "session_id": "12345699876556789098"
            },
        ],
        "Count": 1,
        "ScannedCount": 1
    }
}
```

### Get all logs in a session
Get all logs from a session with a specific id
#### HTTP method: Get
#### URL: /logs/:session_id

#### Example Response
```JSON
[
    {
        "src_ip": "127.0.02.1",
        "time_stamp": "2024-07-11T15:55:00Z",
        "input_cmd": "mkdir",
        "honeypotname": "simon-test-pot",
        "session_id": "simon-test-session"
    },
    {
        "src_ip": "127.0.02.1",
        "time_stamp": "2024-07-11T15:55:00Z",
        "input_cmd": "ls",
        "honeypotname": "simon-test-pot",
        "session_id": "simon-test-session"
    }
]
```

### Get all updated logs
Get all sessions that have been updated
#### HTTP method: Get
#### URL: /analyse/logs

#### Example Response
```JSON
{
    "success": "Table scanned successfully",
    "data": {
        "Items": [
            {
                "honeypotname": "simon-test-pot",
                "isAnalysed": false,
                "time_stamp": "2024-07-11T15:55:00Z",
                "src_ip": "127.0.02.1",
                "session_id": "simon-test-session"
            }
        ],
        "Count": 1,
        "ScannedCount": 25
    }
}
```

### Set a session as analyzed
Set the status of a session to analyzed.
#### HTTP method: Put
#### URL: /logs/analyse/:session_id

#### Example Response
```JSON
{
    "success": "Item updated successfully",
    "data": {
        "Attributes": {
            "isAnalysed": true
        }
    }
}
```
