[[

  utils - batch

  provides functions for dealing with batch
  record fetches.

]]


-- `fetch`: retrieve bulk response from redis and unwrap it
local fetch = function (command, ...)
  local cursor, payload, response, ok;
  response, ok = redis.call(command, unpack(arg))

  if (string.find(command, "SCAN")) then
    cursor, payload = unpack(response)
    return payload
  end
  return response
end
