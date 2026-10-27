-- Astra 5.63 启动脚本（原生运行，无 qemu）
--
-- 这个构建的内嵌引导脚本会以 log(...) / log.info(...) 的形式调用日志；
-- 直接替换整张 log 表会让 C 侧读 log.archive 时 PANIC（进程 SIGABRT），
-- 所以只挂元表：保留原表，缺失的方法返回空函数。
setmetatable(log, { __index = function() return function() end end, __call = function() end })
