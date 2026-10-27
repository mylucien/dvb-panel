#
# astra —— Astra 5.63 流媒体/DVB 面板（预编译 32 位 ARM 运行时）
#
# 作为 feed 引入固件源码树：
#   echo "src-git dvbpanel https://github.com/mylucien/dvb-panel.git" >> feeds.conf.default
#   ./scripts/feeds update dvbpanel && ./scripts/feeds install astra
#   make menuconfig  →  Network → astra
#   或直接： echo "CONFIG_PACKAGE_astra=y" >> .config
#
# 打进固件后位于 squashfs（/rom），恢复出厂设置不会丢，无需重装。
#
# ── 依赖处理（为什么不会和别的插件冲突）─────────────────────────────
# 1. DEPENDS 为空、PROVIDES 为空。
#    astra 是厂商的封闭二进制，32 位 ARM + bionic C 库，跑在自己的运行时上，
#    与固件的 musl/aarch64 用户态毫无关系。因此既不需要、也绝不能声明对
#    libc / libopenssl / libstdcpp / libiconv / zlib 的依赖：一旦声明，
#    这些系统包升级（openssl 1.1→3.x、musl 版本变化）就会连带判定 astra
#    需要重建，而 astra 根本不链接它们。
# 2. 整套 32 位库私有化在 /usr/lib/astra/lib，不落 /lib、/usr/lib 顶层。
#    musl 的 ld.so 不搜索该目录，所以其中的 libc.so / libm.so / libcrypto.so
#    / libstdc++.so 不会与系统同名库发生覆盖或解析冲突；
#    也不会出现 "装个插件把系统 libc 换掉" 的灾难。
# 3. astra 的 ELF 解释器（PT_INTERP）已从 /system/bin/linker 改成
#    /usr/lib/astra/ld（自带私有 bionic 链接器），lib 搜索路径由启动器用
#    LD_LIBRARY_PATH 指定。因此固件里不需要 /system、/vendor 那套目录，
#    也不会与任何依赖 /system 的厂商程序互相覆盖。
# 4. 对外只写这几个路径，全部为本包独占：
#      /usr/lib/astra/**       私有运行时（链接器 + 库 + astra 本体）
#      /usr/share/astra/**     本包的文档/示例（无）
#      /etc/astra/**           astra 自己的配置（conffile）
#      /etc/config/astra       服务开关与端口（conffile）
#      /usr/bin/astra-run      启动器（包一层 LD_LIBRARY_PATH）
#      /etc/init.d/astra       procd 服务
#      /vendor/static/*        面板静态资源：二进制把 http_static 的根目录
#                              硬编码成 "/vendor"，改不了，只能放这里。
#                              基础固件没有 /vendor 目录，本包独占。
# 5. 不含 LuCI：没有 menu.d / acl.d / view，不会出现在 LuCI 菜单里，
#    也不与任何 luci-app-* 争抢 uci 配置或 rpcd 权限。
#
# ── 运行时前提（写不进 DEPENDS 的内核条件）──────────────────────────
#   * 内核需要 32 位 ELF 支持（CONFIG_COMPAT），否则 exec 失败。
#   * 内核需要 time64 系统调用（CONFIG_COMPAT_32BIT_TIME=y，5.1+ 默认），
#     补丁版 libc 走 clock_gettime64 等新号；缺了会 ENOSYS。
#   * DVB 设备节点 /dev/dvb 由固件内核模块提供，本包不含任何 .ko。
#

include $(TOPDIR)/rules.mk

PKG_NAME:=astra
PKG_VERSION:=5.63
PKG_RELEASE:=1

PKG_LICENSE:=Proprietary
PKG_MAINTAINER:=mylucien

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/astra
  SECTION:=net
  CATEGORY:=Network
  TITLE:=Astra DVB/IPTV streaming panel (prebuilt 32-bit ARM runtime)
  URL:=https://github.com/mylucien/dvb-panel
  DEPENDS:=
endef

define Package/astra/description
 Astra 5.63 streaming/control panel with its own private 32-bit ARM
 (bionic) runtime under /usr/lib/astra. Ships no kernel modules and no
 LuCI integration; service is controlled by /etc/config/astra.
endef

define Package/astra/conffiles
/etc/astra/astra.json
/etc/config/astra
endef

define Package/astra/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	/etc/init.d/astra enable
	/etc/init.d/astra restart >/dev/null 2>&1
}
exit 0
endef

define Package/astra/prerm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || /etc/init.d/astra stop >/dev/null 2>&1
exit 0
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/. $(PKG_BUILD_DIR)/
endef

define Build/Compile
endef

define Package/astra/install
	# 私有运行时
	$(INSTALL_DIR) $(1)/usr/lib/astra/bin
	$(INSTALL_DIR) $(1)/usr/lib/astra/lib
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/ld $(1)/usr/lib/astra/ld
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/bin/astra $(1)/usr/lib/astra/bin/astra
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/lib/libc.so $(1)/usr/lib/astra/lib/libc.so
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/lib/libm.so $(1)/usr/lib/astra/lib/libm.so
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/lib/liblog.so $(1)/usr/lib/astra/lib/liblog.so
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/lib/libstdc++.so $(1)/usr/lib/astra/lib/libstdc++.so
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/lib/libiconv.so $(1)/usr/lib/astra/lib/libiconv.so
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/lib/libcrypto.so.1.0.0 $(1)/usr/lib/astra/lib/libcrypto.so.1.0.0
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/lib/libdvbcsa.so.1.0.1 $(1)/usr/lib/astra/lib/libdvbcsa.so.1.0.1
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/lib/libdvbhook.so $(1)/usr/lib/astra/lib/libdvbhook.so
	$(LN) libiconv.so $(1)/usr/lib/astra/lib/libiconv.so.2
	$(LN) libcrypto.so.1.0.0 $(1)/usr/lib/astra/lib/libcrypto.so
	$(LN) libdvbcsa.so.1.0.1 $(1)/usr/lib/astra/lib/libdvbcsa.so.1
	$(LN) libdvbcsa.so.1.0.1 $(1)/usr/lib/astra/lib/libdvbcsa.so

	# 面板静态资源（二进制里 http_static 根目录硬编码为 /vendor）
	$(INSTALL_DIR) $(1)/vendor/static
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/static/app.js $(1)/vendor/static/app.js
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/static/app.css $(1)/vendor/static/app.css
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/static/mod.js $(1)/vendor/static/mod.js

	# 配置与服务
	$(INSTALL_DIR) $(1)/etc/astra
	$(INSTALL_CONF) ./files/astra.json $(1)/etc/astra/astra.json
	$(INSTALL_DATA) ./files/panel.lua $(1)/etc/astra/panel.lua
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/astra.config $(1)/etc/config/astra
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/astra.init $(1)/etc/init.d/astra
	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(INSTALL_BIN) ./files/90-astra $(1)/etc/uci-defaults/90-astra
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/astra-run $(1)/usr/bin/astra-run
endef

$(eval $(call BuildPackage,astra))
