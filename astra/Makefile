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
