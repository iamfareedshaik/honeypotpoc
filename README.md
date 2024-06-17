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
#### Response
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

#### Example Response
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

### Get logs
Get all logs from the database. Sort entries in ascending order (earliest log entries first). Filter logs with parameters.
#### HTTP method: Get
#### URL: /logs
#### Parameters
- **session_id**: String (Optional) - unique identifier for the session
  - Example: "a-unique-identifier"

#### Example request
```JSON
{
  "session_id":"a-unique-identifier"
}
```
#### Response
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

#### Example Response
```JSON
[
  {
    "src_ip": "127.0.02.1",
    "time_stamp": "2024-06-11T15:55:00Z",
    "input_cmd": "ls",
    "honeypot_name": "Cowrie",
    "response_cmd": "/dev  /var  /home",
    "session_id":"a-unique-identifier"
  },
]
```

### Activity
Get a list of all sessions that have had new activity since the last call to this endpoint. 
#### HTTP method: Get
#### URL: /activity
#### Parameters
None

#### Example request
Empty

#### Response
- **session_id**: String (Required) - unique identifier for the session
  - Example: "a-unique-identifier"

#### Example Response
```JSON
[
  "a-unique-identifier",
]
```
