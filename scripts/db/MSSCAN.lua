[[

  `MSSCAN` - multi set-scan
     this function takes N keys (each should be a `Set`)
     and one argument, which should be an integer, and is
     used as a limit for each set scan. results are returned
     as a table of tables, where each table is the scan
     results (with order preserved) for each given key.

]]

local results = {}
for k, v in ipairs(KEYS) do
  results[k] = redis.call('SSCAN', v, 0, 'COUNT', ARGV[1] or 5)[2]
end
return results
