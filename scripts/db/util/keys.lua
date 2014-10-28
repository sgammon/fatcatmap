[[

  utils - keys

  provides tools for handling canteen
  model layer keys.

]]


-- `trim`: remove equals signs from keys
local trim = function (key)
  for item in key:gmatch("[^=]+") do
    return item
  end
end

-- `graphkey`: add key postfix for graph
local graphkey = function (key, type)
  return "__graph__::" .. key .. "::" .. type
end

-- `relationship` sort two neighbor keys to produce a relationship key
local relationship = function (source, target)
  local left, right;

  -- sort lexicographically (in reverse)
  if source < target then
    left, right = source, target
  else
    left, right = target, source
  end

  return {left=left, right=right, key=redis.sha1hex(trim(left) .. trim(right))}
end
