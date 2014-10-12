[[

  `TRAVERSE`

]]


-- configure, extract arguments
local infolevel, debuglevel = redis.LOG_NOTICE, redis.LOG_NOTICE
local origin, depth, limit = KEYS[1], tonumber(ARGV[1]), tonumber(ARGV[2])

-- prepare state
local stack, perspectives, traversed, rel = 1, {{origin, 0}}, {}, 0;
local neighbors, edges, relationships, packed, seen, relationships = {}, {}, {}, {}, {}, {};

-- `trim`: remove equals signs from keys
local trim = function (key)
  for item in key:gmatch("[^=]+") do
    return item
  end
end

-- `grab`: grab next vertex to process from the stack
local grab = function ()
  stack = stack - 1
  return table.remove(perspectives, stack + 1)
end

-- `encounter`: add a vertex to the stack waiting to be processed
local encounter = function (source, target, steps_out)

  -- allocate storage for this source & target
  if (neighbors[source] == nil) then neighbors[source] = {} end
  if (neighbors[target] == nil) then neighbors[target] = {} end

  -- store relationship key for later
  if source < target then
    rel = rel + 1
    relationships[trim(source) .. trim(target)] = 1
    neighbors[source][target], neighbors[target][source] = 1, 1
  else
    rel = rel + 1
    relationships[trim(target) .. trim(source)] = 1
    neighbors[source][target], neighbors[target][source] = 1, 1
  end

  -- push onto stack
  if (steps_out < depth and traversed[target] == nil) then
    stack = stack + 1
    traversed[target] = 1
    table.insert(perspectives, {target, steps_out})
  end
end

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

-- main graph loop
while (stack > 0) do
  local source, steps_out = unpack(grab());
  redis.log(infolevel, string.rep(" ", (steps_out * 2)) .. "Traversing " .. source .. "...")

  -- ... issue query for neighbors
  for i, target in ipairs(fetch("SSCAN", "__graph__::" .. source .. "::neighbors", 0, "COUNT", limit)) do
    redis.log(infolevel, "  " .. string.rep(" ", steps_out * 2) .. "-> " .. target)
    encounter(source, target, steps_out + 1)
  end
end

-- resolve relationships
if (rel > 0) then
  local request, _ = {}, nil;

  -- unique-ify relationship merges
  for relkey, _ in pairs(relationships) do
    table.insert(request, "__graph__::" .. relkey .. "::relationship")
  end

  if (rel == 1) then
    edges = fetch("SMEMBERS", request[1])
  else
    edges = fetch("SUNION", unpack(request))
  end
end

-- pack response
for vertex, e in pairs(neighbors) do
  local bundle = {};

  for neighbor, relationship in pairs(e) do
    if (seen[relationship] == nil) then
      seen[relationship] = 1
      table.insert(bundle, neighbor)
    end
  end
  table.insert(packed, {vertex, bundle})
end

return {packed, edges};
