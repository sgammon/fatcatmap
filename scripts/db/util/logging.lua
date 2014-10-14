[[

  utils - logging

  provides functions for dealing with batch
  record fetches.

]]


-- logging config
local infolevel = redis.LOG_NOTICE
local debuglevel = redis.LOG_DEBUG
local verboselevel = redis.LOG_VERBOSE
local warninglevel = redis.LOG_WARNING


-- `info`: notify logs of something
local info = function (...)
  redis.log(infolevel, unpack(arg))
end

-- `debug`: good for verbose messages
local debug = function (...)
  redis.log(debuglevel, unpack(arg))
end

-- `verbose`: for things that can be squelched
local verbose = function (...)
  redis.log(verboselevel, unpack(arg))
end

-- `warning`: notify logs of something
local warning = function (...)
  redis.log(warninglevel, unpack(arg))
end

-- `indent`: add space-based indent to output
local indent = function (steps)
  return string.rep(" ", steps * 2)
end
