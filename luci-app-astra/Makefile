# SPDX-License-Identifier: Apache-2.0

include $(TOPDIR)/rules.mk

PKG_VERSION:=2.0.0
PKG_RELEASE:=1

LUCI_TITLE:=LuCI interface for Astra DVB/IPTV (replaces the built-in web panel)
LUCI_DEPENDS:=+astra +rpcd-mod-ucode +ucode-mod-fs +ucode-mod-socket +ucode-mod-uci
LUCI_PKGARCH:=all

PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=mylucien

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature

