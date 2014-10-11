[[

  `TRAVERSE`

]]


-- command config
local infolevel = redis.LOG_VERBOSE
local debuglevel = redis.LOG_DEBUG

-- extract arguments
local origin = KEYS[1]
local depth = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])

-- prepare state
local calls_made, perspective, stack = {}, {{origin, 0}}, 1;
local vertices, edges, relationships, unions = {}, {}, {}, 0;


-- `trim`: remove equals signs from keys
local trim = function (key)
  for item in key:gmatch("[^=]+") do
    return item
  end
end

-- operate on perspective stack until complete
while (stack > 0) do
  local source, steps_out = unpack(table.remove(perspective, stack))

  -- provision one task
  stack = stack - 1
  redis.log(infolevel, string.rep(" ", steps_out * 2) .. "Traversing " .. source .. "...")

  -- track vertex
  table.insert(vertices, source)

  -- if we're supposed to keep traversing, perform a neighbors scan and add each to stack
  if (steps_out < depth) then
    local ok, response, cursor, neighbors
    response, ok = redis.call("SSCAN", "__graph__::" .. source .. "::neighbors", 0, "COUNT", limit)
    cursor, neighbors = unpack(response)

    for i, target in ipairs(neighbors) do
      redis.log(infolevel, "  " .. string.rep(" ", steps_out * 2) .. " -> " .. target)

      -- build relationship keys as we go
      local left, right
      if (source > target) then
        right = source
        left = target
      else
        left = source
        right = target
      end

      unions = unions + 1
      table.insert(relationships, "__graph__::" .. trim(left) .. trim(right) .. "::relationship")

      -- add to perspective stack
      stack = stack + 1
      table.insert(perspective, {target, steps_out + 1})
    end
  end
end

-- resolve any relationships
if (unions > 0) then
  local cursor, response, ok, payload;

  -- graph edge keys in one-go
  if (unions == 1) then
    response, ok = redis.call("SMEMBERS", relationships[1])
  elseif (unions > 1) then
    response, ok = redis.call("SUNION", unpack(relationships))
  end

  for i, edge in ipairs(response) do
    table.insert(edges, edge)
  end
end

return {vertices, edges};
