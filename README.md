POST: to post the record into database
URL: http://IP Address:port/logs
JSON : {
  "src_ip": "127.0.02.1",
  "time_stamp": "2024-06-11T15:55:00Z",
  "input_cmd": "ls",
  "honeypot_name": "testfareess",
  "response_cmd": "sample_ab",
  "session_id":""
}

GET: To Get all the logs
URL: http://IP Address:port/logs
response: [
            {
                "log_id": "example_uuid",
                "time_stamp": "example_timestamp",
                "honeypot_name": "honeypotname",
                "session_id": "example_session_id",
                "input_cmd": "command",
                "response_cmd": "response",
                "src_ip": "ipaddress"
            }
        ]


GET: to Get unique recotd
URL: http://IP Address:port/logs/UUID

response: {
                "log_id": "example_uuid",
                "time_stamp": "example_timestamp",
                "honeypot_name": "honeypotname",
                "session_id": "example_session_id",
                "input_cmd": "command",
                "response_cmd": "response",
                "src_ip": "ipaddress"
            }
        

Records are sorted based on time_Stamp




