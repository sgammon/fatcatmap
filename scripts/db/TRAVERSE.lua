[[

  `TRAVERSE`

]]

require 'util/keys.lua'
require 'util/batch.lua'
require 'util/logging.lua'

-- configure, extract arguments
local origin, depth, limit = KEYS[1], tonumber(ARGV[1]), tonumber(ARGV[2])

-- prepare state
local stack, perspectives, traversed, rel = 1, {{origin, 0}}, {}, 0;
local neighbors, edges, relationships, rel_i, packed, seen = {}, {}, {}, {}, {}, {};


-- `encounter`: add a vertex to the stack waiting to be processed
local encounter = function (source, target, steps_out)
  local edge = relationship(source, target);

  -- enqueue relationship key if it's new
  if (rel_i[edge.key] == nil) then
    rel = rel + 1
    rel_i[edge.key] = 1
    table.insert(relationships, graphkey(edge.key, "relationship"))

    -- allocate storage and file relationship
    if (neighbors[source] == nil) then neighbors[source] = {} end
    if (neighbors[target] == nil) then neighbors[target] = {} end
    neighbors[edge.left][edge.right], neighbors[edge.right][edge.left] = true, true
  end

  -- if we need to traverse, add vertex target to queue
  if (steps_out < depth and traversed[target] == nil) then
    stack = stack + 1
    traversed[target] = 1
    table.insert(perspectives, {target, steps_out})
  end
end

-- main graph loop
while (stack > 0) do
  local source, steps_out = unpack(table.remove(perspectives, stack));

  stack = stack - 1
  info(indent(steps_out) .. "Traversing " .. source .. "...")

  -- ... issue query for neighbors
  for i, target in ipairs(fetch("SSCAN", graphkey(source, "neighbors"), 0, "COUNT", limit)) do
    encounter(source, target, steps_out + 1)
    info(indent(steps_out) .. "-> " .. target)
  end
end

-- resolve relationships
if (rel > 0) then
  if (rel == 1) then
    edges = fetch("SMEMBERS", relationships[1])
  else
    edges = fetch("SUNION", unpack(relationships))
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
