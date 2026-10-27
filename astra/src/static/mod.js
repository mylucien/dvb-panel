/* Astra Control Panel - Chinese language pack
 *
 * 由 astra 内置 HTTP 服务的 /mod.js 下发（内置 HTML 里最后加载的脚本）。
 * 纯浏览器端工作：直接改 DOM，不改动 app.js / 二进制 / 不额外起进程。
 */
(function () {
  if (window.__astraZh) return;
  window.__astraZh = 1;

  var ZH = {"Dashboard": "仪表盘","Settings": "设置","Sessions": "会话","Log": "日志","Streams": "流","Stream": "流","Adapters": "适配器","Adapter": "适配器","Apply": "应用","Apply & Restart": "应用并重启","Cancel": "取消","Save": "保存","Remove": "删除","Restart": "重启","Clone": "克隆","Search": "搜索","Scan": "扫描","Clear": "清除","Import": "导入","Export": "导出","Test": "测试","Testing...": "测试中…","Renew": "续订","Enable": "启用","Disable": "禁用","Disabled": "已禁用","Edit Config": "编辑配置","View": "视图","Sign In": "登录","Remember me": "记住我","Add Group": "添加分组","New Header": "新建表头","New Adapter": "新建适配器","New Stream": "新建流","New User": "新建用户","New Server": "新建服务器","New Softcam": "新建软解密","New CAS": "新建 CAS","New Category": "新建分类","New Service": "新建服务","Remove Category": "删除分类","Remove Server": "删除服务器","Remove Softcam": "删除软解密","Remove user": "删除用户","Remove CAS": "删除 CAS","Name": "名称","Type": "类型","Format": "格式","Input Type": "输入类型","Output Type": "输出类型","Path": "路径","File": "文件","Protocol": "协议","Version": "版本","Comment": "备注","Category": "分类","Groups": "分组","Group Name": "分组名称","Category Name": "分类名称","Adapter Name": "适配器名称","Server Name": "服务器名称","SoftCAM Name": "软解密名称","CAS Name": "CAS 名称","Service": "服务","Service #": "服务号","Service Name": "服务名称","Service Provider": "服务提供商","Service Type": "服务类型","Provider": "提供商","Provider Name": "提供商名称","Country": "国家","Position": "位置","Quantity": "数量","Duration": "时长","Sequence": "顺序","Idents": "标识","Remap": "重映射","Toggle Input": "切换输入","Arrange By": "排序方式","Order By": "排序依据","Advanced": "高级","Advanced Options": "高级选项","Default Stream Options": "默认流参数","Address": "地址","Port": "端口","Local Interface": "本地接口","Destination": "目标","HTTP Address": "HTTP 地址","RTSP Address": "RTSP 地址","HbbTV URL": "HbbTV 地址","User-Agent": "用户代理","Timeout": "超时","Buffer Time": "缓冲时间","Socket Size": "Socket 大小","Keep Active": "保持连接","HTTP Keep Active": "HTTP 保持连接","HTTP Output Buffer": "HTTP 输出缓冲","HTTP Sessions": "HTTP 会话","TCP Congestion Control": "TCP 拥塞控制","Network ID": "网络 ID","Network Name": "网络名称","Network Search": "网络搜索","Login": "登录名","Password": "密码","User": "用户","Users": "用户","Administrator": "管理员","Root": "超级管理员","Available": "可用","Taken": "已占用","Created": "创建时间","Uptime (min)": "运行时长（分钟）","Frequency": "频率","Bandwidth": "带宽","Modulation": "调制方式","Symbolrate": "符号率","Symbol Rate": "符号率","Polarization": "极化方式","Device": "设备","Delivery": "传输方式","Guard": "保护间隔","Guard Interval": "保护间隔","Hierarchy": "分层","Roll-off": "滚降系数","FEC": "前向纠错","Transponder": "转发器","Orbital Position": "轨道位置","Satellite": "卫星","Terrestrial": "地面","Cable": "有线","Vertical": "垂直","Horizontal": "水平","Right": "右旋","Left": "左旋","Attenuator": "衰减器","Tone Burst": "音调脉冲","Force Tone": "强制音调","DiSEqC Command": "DiSEqC 指令","DiSEqC Mode": "DiSEqC 模式","Unicable": "单缆","Unicable Slot": "单缆时隙","Slot Frequency": "时隙频率","Slot Position": "时隙位置","LOF1": "本振 LOF1","LOF2": "本振 LOF2","SLOF": "切换频率 SLOF","LNB Sharing. Disable LNB voltage supply and tone signal": "共享 LNB，关闭 LNB 供电与音调","PLS Code": "PLS 码","PLS Mode": "PLS 模式","LCN": "逻辑频道号","Change PNR": "修改节目号","Change TSID": "修改传输流 ID","Scrambled channel": "加扰频道","Skip ECM": "跳过 ECM","Budget Mode. Disable hardware PID filtering": "精简模式，关闭硬件 PID 过滤","DVR Buffer Size": "DVR 缓冲大小","Filter PID's": "过滤 PID","Map PID's": "映射 PID","Start Delay": "启动延迟","Return Delay": "返回延迟","Backup": "备援","Backup Type": "备援类型","Backup Start Delay": "备援启动延迟","Backup Return Delay": "备援返回延迟","Passive Backup": "被动备援","Force return if all inputs are inactive": "所有输入失效时强制返回","Active Backup and Stop streaming if all inputs are inactive": "主动备援，输入全失效时停流","Repeat File": "循环播放文件","Segments naming": "分片命名","SI Packets Interval": "SI 包间隔","Round duration value": "时长取整","Start stream on demand": "按需启动流","Make new connection for each input": "每个输入新建连接","Use Expires header": "使用 Expires 头","Use SCTP instead of TCP": "用 SCTP 替代 TCP","Interleaved mode. Send data over TCP": "交织模式，数据走 TCP","Allow HLS access to all streams": "允许 HLS 访问所有流","Allow HTTP access to all streams": "允许 HTTP 访问所有流","Transmit": "发送","Transmit Mode": "发送模式","Monitoring": "监控","Conditional Access": "条件接收","CAS #": "CAS 编号","CaID": "CAID","Crypto Period": "密钥周期","Access Criteria (hex)": "访问条件 (hex)","DES Key": "DES 密钥","BISS Key": "BISS 密钥","SoftCAM": "软解密","Softcam": "软解密","ECM Private Data (hex)": "ECM 私有数据 (hex)","EMM Private Data (hex)": "EMM 私有数据 (hex)","ECMG Address": "ECMG 地址","ECMG Channel ID": "ECMG 频道 ID","ECMG Port": "ECMG 端口","EMMG Port": "EMMG 端口","EMMG Protocol": "EMMG 协议","Super CAS ID (hex)": "超级 CAS ID (hex)","Allow EMM if allowed by the server": "允许服务器许可的 EMM","Use ECM response with valid checksum only": "仅使用校验通过的 ECM 响应","Set SoftCAM for selected channels": "为选中频道设置软解密","Set DVB-CI CAM for selected channels": "为选中频道设置 DVB-CI 模块","DD-CI CAM": "DD-CI 模块","AU": "自动更新（AU）","General": "常规","Theme": "主题","Dark": "深色","Gold": "金色","Codepage": "字符集","EPG": "节目单","EPG Export": "节目单导出","HTTP Play": "HTTP 播放","Video": "视频","Radio": "广播","Teletext": "图文电视","Multi Program Stream": "多节目流","Single Program Stream": "单节目流","RESI Modulator": "RESI 调制器","Streamer": "推流器","Transcoder": "转码器","Relay": "中继","NetworkPush": "网络推送","Headers": "请求头","Paste here Astra Script (any version) or JSON configuration": "在此粘贴 Astra 脚本（任意版本）或 JSON 配置","Signal in dBm": "信号强度 (dBm)","UTC Offset": "UTC 偏移","Combo": "组合","Server": "服务器","Servers": "服务器","CC Limit": "CC 上限","CA Delay": "CA 延迟","Stream ID": "流 ID","Disabled ": "已禁用","None": "无","No Group": "无分组","Default: Light": "默认：浅色","Default: 35": "默认：35","Default: 64-QAM": "默认：64-QAM","Default: Active Backup": "默认：主动备援","Default: Any Interface": "默认：任意接口","Default: Auto": "默认：自动","Default: DiSEqC 1.0": "默认：DiSEqC 1.0","Default: Enabled > Status > Name": "默认：启用 > 状态 > 名称","Default: Latin (ISO 6937)": "默认：拉丁文 (ISO 6937)","Default: None": "默认：无","Default: not defined": "默认：未定义","Default: not set": "默认：未设置","Default: original service type": "默认：原始服务类型","Default: PCR hash": "默认：PCR 哈希","Default: TCP": "默认：TCP","Default: unicable disabled": "默认：单缆未启用","Default: Use system routes": "默认：使用系统路由","Default: XMLTV": "默认：XMLTV","Enabled > Name": "启用 > 名称","Enabled > Status > Name": "启用 > 状态 > 名称","West European (ISO 8859-1)": "西欧 (ISO 8859-1)","East European  (ISO 8859-2)": "东欧 (ISO 8859-2)","South European (ISO 8859-3)": "南欧 (ISO 8859-3)","North European (ISO 8859-4)": "北欧 (ISO 8859-4)","Cyrillic (ISO 8859-5)": "西里尔文 (ISO 8859-5)","Arabic (ISO 8859-6)": "阿拉伯文 (ISO 8859-6)","Greek (ISO 8859-7)": "希腊文 (ISO 8859-7)","Hebrew (ISO 8859-8)": "希伯来文 (ISO 8859-8)","Turkish (ISO 8859-9)": "土耳其文 (ISO 8859-9)","Nordic (ISO 8859-10)": "北欧文 (ISO 8859-10)","Thai (ISO 8859-11)": "泰文 (ISO 8859-11)","Baltic (ISO 8859-13)": "波罗的海文 (ISO 8859-13)","West European (ISO 8859-15)": "西欧 (ISO 8859-15)","Error": "错误","Form has errors": "表单有错误","Settings saved": "设置已保存","Configuration file not found": "配置文件不存在","Configuration file has wrong format": "配置文件格式错误","Failed to save settings": "设置保存失败","Failed to save stream": "流保存失败","Failed to save adapter": "适配器保存失败","Failed to save user": "用户保存失败","Failed to save server": "服务器保存失败","Failed to save CAS": "CAS 保存失败","Failed to save softcam": "软解密保存失败","Failed to save category": "分类保存失败","Failed to import settings": "设置导入失败","Failed to restart adapter": "适配器重启失败","Failed to scan stream": "流扫描失败","Failed to test server": "服务器测试失败","Softcam test failed": "软解密测试失败","Import failed": "导入失败","Upload failed": "上传失败","Connection closed. Retrying in {0}...": "连接已断开，{0} 后重试…","Connection failed. Retrying in {0}...": "连接失败，{0} 后重试…","Press \"Apply & Restart\" button to complete import or Reload page to discard changes": "点击「应用并重启」完成导入，或刷新页面放弃更改","Press \"Apply & Restart\" button to complete export or Reload page to discard changes": "点击「应用并重启」完成导出，或刷新页面放弃更改","Adapter \"{0}\" removed": "适配器 \"{0}\" 已删除","Adapter \"{0}\" saved": "适配器 \"{0}\" 已保存","Stream \"{0}\" removed": "流 \"{0}\" 已删除","Stream \"{0}\" saved": "流 \"{0}\" 已保存","User \"{0}\" removed": "用户 \"{0}\" 已删除","User \"{0}\" saved": "用户 \"{0}\" 已保存","Softcam \"{0}\" removed": "软解密 \"{0}\" 已删除","Softcam \"{0}\" saved": "软解密 \"{0}\" 已保存","CAS \"{0}\" removed": "CAS \"{0}\" 已删除","CAS \"{0}\" saved": "CAS \"{0}\" 已保存","Category \"{0}\" removed": "分类 \"{0}\" 已删除","Category \"{0}\" saved": "分类 \"{0}\" 已保存","Server \"{0}\" removed": "服务器 \"{0}\" 已删除","Server \"{0}\" saved": "服务器 \"{0}\" 已保存","input list": "输入列表","Menu": "菜单","new input": "新建输入","output list": "输出列表","new output": "新建输出","Bind adapter to the DigitalDevices CI": "将适配器绑定到 DigitalDevices CI","Change server CaID. Example: 06B0": "修改服务器 CaID。示例：06B0","Connection timeout in seconds. Default: 10": "连接超时（秒）。默认：10","Country Code ISO 3166-1 alpha-3": "国家代码 ISO 3166-1 alpha-3","Custom HTTP User-Agent. Default: Astra": "自定义 HTTP User-Agent。默认：Astra","Default: 0102030405060708091011121314": "默认：0102030405060708091011121314","Default: 0 (not limited)": "默认：0（不限制）","DVR Buffer Size 1..200. Default: not set": "DVR 缓冲大小 1..200。默认：未设置","Delay before initialize CA module. Default: 3": "初始化 CA 模块前的延迟。默认：3","Default: 1": "默认：1","Default: 8 sec.": "默认：8 秒","Delay before return to previous input. Default: 0": "切回上一路输入前的延迟。默认：0","Delay before start next input. Default: 0": "启动下一路输入前的延迟。默认：0","Delay before stop stream if no active connections. Default: 0 (turn off immediately)": "无客户端连接后停止流的延迟。默认：0（立即关闭）","Delay in seconds before check DVR errors. Default: 2sec": "检查 DVR 错误前的延迟（秒）。默认：2 秒","Destination Address": "目标地址","Destination Port. Default: 1234": "目标端口。默认：1234","Destination address: file:// or http://": "目标地址：file:// 或 http://","Domain or IP Address": "域名或 IP 地址","Example: pmt=100, video=101, audio=102, 1003=103": "示例：pmt=100, video=101, audio=102, 1003=103","Export telemetry and events to the external server": "将遥测和事件上报到外部服务器","Full path to the MPEG-TS file": "MPEG-TS 文件的完整路径","HTTP Server port": "HTTP 服务器端口","High sub-band": "高子频段","Ignore first ECM packets": "忽略开头若干个 ECM 包","Interval in milliseconds to send stream information. Default: 500": "发送流信息的间隔（毫秒）。默认：500","Keep only defined pids. Example: 101, 102, 103": "仅保留指定的 PID。示例：101, 102, 103","Low sub-band": "低子频段","Multistream filtering": "多流过滤","Number of segments. Default: 3": "分片数量。默认：3","Original Network ID. Default: 1": "原始网络 ID（ONID）。默认：1","Program Number": "节目号","Receiving buffer in seconds. Default: 2": "接收缓冲（秒）。默认：2","Redefine system socket size": "重定义系统 socket 大小","Refresh multicast group membership": "刷新组播组成员关系","Segments duration in seconds. Default: 10": "分片时长（秒）。默认：10","Size in Kb of the buffer for each client. Default: 1024": "每个客户端的缓冲大小（KB）。默认：1024","Source Address": "源地址","Source Port. Default: 1234": "源端口。默认：1234","Sub-band range": "子频段范围","Transport Stream ID. Default: 1": "传输流 ID（TSID）。默认：1","Unique path for stream": "流的唯一路径","Unique softcam identifier": "软解密唯一标识"};

  var LOWER = {};
  for (var k in ZH) LOWER[k.toLowerCase()] = ZH[k];

  var done = (typeof WeakSet !== "undefined") ? new WeakSet() : null;

  function dict(s) {
    if (!s) return null;
    var t = s.replace(/^[\s\u00a0]+|[\s\u00a0]+$/g, "");
    if (!t || t.length > 120) return null;
    if (Object.prototype.hasOwnProperty.call(ZH, t)) return ZH[t];
    var lk = t.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(LOWER, lk)) return LOWER[lk];
    // "Label:" / "Label ..." 之类的尾巴
    var m = t.match(/^(.+?)(\s*[:：]|\s*\.\.\.|\s*…)$/);
    if (m) {
      var base = m[1];
      var hit = ZH[base] || LOWER[base.toLowerCase()];
      if (hit) return hit + m[2];
    }
    return null;
  }

  function fixText(node) {
    var v = node.nodeValue;
    if (!v || !/[A-Za-z]/.test(v)) return;
    if (done && done.has(node)) return;
    var hit = dict(v);
    if (hit === null) {
      if (done) done.add(node);
      return;
    }
    var lead = (v.match(/^[\s\u00a0]*/) || [""])[0];
    var tail = (v.match(/[\s\u00a0]*$/) || [""])[0];
    node.nodeValue = lead + hit + tail;
    if (done) done.add(node);
  }

  function fixAttrs(el) {
    if (!el || el.nodeType !== 1) return;
    // data-label：表单字段名的真实来源（CSS 用 content: attr(data-label) 渲染，
    // 所以页面上看到的 "HTTP KEEP ACTIVE" 在 DOM 里根本没有对应文本节点）
    var attrs = ["data-label", "placeholder", "title", "aria-label", "alt"];
    for (var i = 0; i < attrs.length; i++) {
      var a = el.getAttribute && el.getAttribute(attrs[i]);
      if (a) {
        var hit = dict(a);
        if (hit !== null && hit !== a) el.setAttribute(attrs[i], hit);
      }
    }
    if (el.tagName === "INPUT") {
      var t = (el.getAttribute("type") || "").toLowerCase();
      if (t === "button" || t === "submit" || t === "reset") {
        var hit2 = dict(el.value);
        if (hit2 !== null) el.value = hit2;
      }
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 1) fixAttrs(root);
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);
    var n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) fixText(n);
      else fixAttrs(n);
    }
  }

  function boot() {
    document.documentElement.setAttribute("lang", "zh-CN");
    if (document.title) document.title = "Astra 控制面板";
    walk(document.body);

    var mo = new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r.type === "characterData") {
          fixText(r.target);
        } else if (r.type === "attributes") {
          fixAttrs(r.target);
        } else {
          for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
        }
      }
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-label"]
    });
    window.__astraZhWalk = function () { walk(document.body); };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

/* ------------------------------------------------------------------
 * DVB 设备列表兜底
 *
 * astra 自带的 DVB 枚举（--dvbls / sysinfo.dvb_list）在本机返回空：
 * 它是 32 位 ARM 程序跑在 64 位内核上，内部探测路径拿不到 frontend 信息。
 * 结果就是“新建适配器 / 适配器设置”里的 Adapter 下拉是空的，看不出有设备。
 *
 * 这里在页面里补一份真实硬件信息（/dev/dvb/adapter0/frontend0，
 * iCast DTMB/DVBC USB demodulator），让下拉能选到 0.0。设备名用中性标签，避免在别的硬件上显示错误型号。
 * 只影响浏览器端显示，不改变 astra 自身的探测结果。
 * ------------------------------------------------------------------ */
(function () {
  if (window.__astraDvbFix || typeof window.MainModule === "undefined") return;
  window.__astraDvbFix = 1;

  var FALLBACK = [{ adapter: 0, device: 0, frontend: "adapter0" }];

  function cloneFallback() {
    return FALLBACK.map(function (x) {
      return { adapter: x.adapter, device: x.device, frontend: x.frontend };
    });
  }

  function patch(hostId) {
    var h = window.app && window.app.hosts && window.app.hosts[hostId];
    if (!h || !h.sysinfo) return false;
    if (!h.sysinfo.dvb_list || !h.sysinfo.dvb_list.length) {
      h.sysinfo.dvb_list = cloneFallback();
      return true;
    }
    return false;
  }

  var origSetDvbList = MainModule.setDvbList;
  MainModule.setDvbList = function (hostId) {
    patch(hostId);
    return origSetDvbList.apply(this, arguments);
  };

  function tick() {
    if (!window.app || !window.app.hosts) return;
    Object.keys(window.app.hosts).forEach(function (id) {
      if (patch(id)) {
        try { MainModule.setDvbList(id); } catch (e) {}
      }
    });
  }

  window.__astraDvbRefresh = tick;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick);
  }
  setTimeout(tick, 200);
  setTimeout(tick, 1500);
})();
