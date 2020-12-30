export const data = {
  logger: {
    type: "systemd-logger",
    name: "logger",
    state: "running",
    logLevel: "info",
    description: "Forward log entries into systemd journal",
    timeout: { start: 20, stop: 20, restart: 20 },
    endpoints: {
      log: {
        in: true,
        out: true,
        open: true,
        connected: [
          "service(admin).log",
          "service(authenticator).log",
          "service(config).log",
          "service(health).log",
          "service(http).log",
          "service(ldap).log",
          "service(logger).log",
          "service(logger).log",
          "service(named).log",
          "service(networkctl).log",
          "service(swarm).log",
          "service(systemctl).log",
          "service(systemd).log"
        ]
      },
      config: { in: true, open: true }
    }
  },
  config: {
    type: "systemd-config",
    name: "config",
    state: "running",
    logLevel: "info",
    description: "Synchronize configuration with systemd",
    timeout: { start: 20, stop: 20, restart: 20 },
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true }
    }
  },
  systemd: {
    type: "systemd",
    serviceProvider: true,
    name: "systemd",
    state: "running",
    logLevel: "info",
    description: "Bridge to systemd",
    timeout: { start: 20, stop: 20, restart: 20 },
    endpoints: {
      log: {
        out: true,
        open: true,
        connected: "service(logger).log",
        interceptors: [{ type: "live-probe" }]
      },
      config: { in: true, open: true }
    }
  },
  http: {
    type: "http",
    name: "http",
    state: "running",
    logLevel: "info",
    description: "http server",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {},
    listen: {
      url: "https://mfelten.dynv6.net/services/system-dashboard/api",
      socket: { fd: 3, name: "http.listen.socket" }
    },
    url: "https://mfelten.dynv6.net/services/system-dashboard/api",
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      "/services/peers": {
        path: "/services/peers",
        ws: true,
        in: true,
        out: true,
        connected: "service(swarm).peers.services",
        interceptors: [{ type: "decode-json" }]
      },
      "/admin/services": {
        path: "/admin/services",
        ws: true,
        in: true,
        out: true,
        open: true,
        connected: "service(admin).services",
        interceptors: [{ type: "decode-json" }]
      },
      "/admin/requests": {
        path: "/admin/requests",
        ws: true,
        in: true,
        out: true,
        connected: "service(admin).requests",
        interceptors: [{ type: "decode-json" }]
      },
      "/state/uptime": {
        path: "/state/uptime",
        ws: true,
        in: true,
        out: true,
        connected: "service(health).uptime",
        interceptors: [{ type: "decode-json" }]
      },
      "/state/cpu": {
        path: "/state/cpu",
        ws: true,
        in: true,
        out: true,
        connected: "service(health).cpu",
        interceptors: [{ type: "decode-json" }, { type: "live-probe" }]
      },
      "/state/memory": {
        path: "/state/memory",
        ws: true,
        in: true,
        out: true,
        connected: "service(health).memory",
        interceptors: [{ type: "decode-json" }]
      },
      "/state": {
        path: "/state",
        ws: true,
        in: true,
        out: true,
        connected: "service(health).state",
        interceptors: [{ type: "decode-json" }]
      },
      "/authenticate": {
        method: "POST",
        path: "/authenticate",
        out: true,
        open: true,
        connected: "service(authenticator).access_token",
        interceptors: [{ type: "ctx-body-param", headers: {} }]
      },
      "/systemctl/machine": {
        method: "GET",
        path: "/systemctl/machine",
        out: true,
        open: true,
        connected: "service(systemctl).machines",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          },
          { type: "live-probe" }
        ]
      },
      "/systemctl/timer": {
        method: "GET",
        path: "/systemctl/timer",
        out: true,
        open: true,
        connected: "service(systemctl).timers",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/socket": {
        method: "GET",
        path: "/systemctl/socket",
        out: true,
        open: true,
        connected: "service(systemctl).sockets",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/unit": {
        method: "GET",
        path: "/systemctl/unit",
        out: true,
        open: true,
        connected: "service(systemctl).units",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/unit/:unit": {
        method: "GET",
        path: "/systemctl/unit/:unit",
        out: true,
        open: true,
        connected: "service(systemctl).unit",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/unit/:unit/files": {
        method: "GET",
        path: "/systemctl/unit/:unit/files",
        out: true,
        open: true,
        connected: "service(systemctl).files",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/unit/:unit/start": {
        method: "POST",
        path: "/systemctl/unit/:unit/start",
        out: true,
        open: true,
        connected: "service(systemctl).start",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/unit/:unit/stop": {
        method: "POST",
        path: "/systemctl/unit/:unit/stop",
        out: true,
        open: true,
        connected: "service(systemctl).stop",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/unit/:unit/restart": {
        method: "POST",
        path: "/systemctl/unit/:unit/restart",
        out: true,
        open: true,
        connected: "service(systemctl).restart",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/unit/:unit/reload": {
        method: "POST",
        path: "/systemctl/unit/:unit/reload",
        out: true,
        open: true,
        connected: "service(systemctl).reload",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/unit/:unit/freeze": {
        method: "POST",
        path: "/systemctl/unit/:unit/freeze",
        out: true,
        open: true,
        connected: "service(systemctl).freeze",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/systemctl/unit/:unit/thaw": {
        method: "POST",
        path: "/systemctl/unit/:unit/thaw",
        out: true,
        open: true,
        connected: "service(systemctl).thaw",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/networkctl/interfaces": {
        method: "GET",
        path: "/networkctl/interfaces",
        out: true,
        open: true,
        connected: "service(networkctl).interfaces",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/fail2ban": {
        method: "GET",
        path: "/fail2ban",
        out: true,
        open: true,
        connected: "service(systemctl).fail2ban",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          }
        ]
      },
      "/named": {
        method: "GET",
        path: "/named",
        out: true,
        open: true,
        connected: "service(named).status",
        interceptors: [
          { type: "ctx-jwt-verify" },
          {
            type: "ctx",
            headers: {
              "cache-control": "no-store, no-cache, must-revalidate",
              pragma: "no-cache",
              expires: 0
            }
          },
          { type: "live-probe" }
        ]
      }
    }
  },
  ldap: {
    type: "ldap",
    name: "ldap",
    state: "stopped",
    logLevel: "info",
    description: "LDAP server access for bind/add/modify/del/query",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {},
    listen: {},
    url: "ldaps://mfelten.dynv6.net",
    entitlements: {
      bindDN: "uid={{username}},ou=accounts,dc=mf,dc=de",
      base: "ou=groups,dc=mf,dc=de",
      attribute: "cn",
      scope: "sub",
      filter:
        "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{username}},ou=accounts,dc=mf,dc=de))"
    },
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      authenticate: {
        in: true,
        out: true,
        open: true,
        connected: "service(authenticator).ldap.authenticate"
      },
      add: { in: true, out: true },
      del: { in: true, out: true },
      modify: { in: true, out: true },
      search: { in: true, out: true }
    }
  },
  health: {
    type: "health",
    name: "health",
    state: "running",
    logLevel: "info",
    cpuInterval: 30,
    memoryInterval: 30,
    uptimeInterval: 30,
    resourceUsageInterval: 30,
    description: "This service is the base class for service implementations",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {},
    listen: {},
    entitlements: { attribute: "cn", scope: "sub" },
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      state: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./state"
      },
      cpu: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./state/cpu"
      },
      memory: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./state/memory"
      },
      uptime: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./state/uptime"
      },
      resourceUsage: { in: true, out: true, open: true }
    }
  },
  authenticator: {
    type: "authenticator",
    name: "authenticator",
    state: "stopped",
    logLevel: "info",
    description: "provide authentication services",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    listen: {},
    entitlements: { attribute: "cn", scope: "sub" },
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      change_password: { in: true, open: true },
      access_token: {
        in: true,
        open: true,
        connected: "service(http)./authenticate"
      },
      "ldap.authenticate": {
        out: true,
        open: true,
        connected: "service(ldap).authenticate"
      }
    }
  },
  admin: {
    type: "admin",
    name: "admin",
    state: "stopped",
    logLevel: "info",
    description: "Live administration of kronos services",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {
      access_token: { algorithm: "RS256", expiresIn: "1h" },
      refresh_token: { algorithm: "RS256", expiresIn: "30d" }
    },
    listen: {},
    entitlements: { attribute: "cn", scope: "sub" },
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      command: { in: true, open: true },
      services: {
        in: true,
        out: true,
        open: true,
        connected: [
          "service(http)./admin/services",
          "service(swarm).topic.services[T]"
        ]
      },
      requests: { out: true, connected: "service(http)./admin/requests" }
    }
  },
  swarm: {
    type: "swarm",
    name: "swarm",
    state: "running",
    logLevel: "info",
    description: "This service is the base class for service implementations",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {
      access_token: { algorithm: "RS256", expiresIn: "1h" },
      refresh_token: { algorithm: "RS256", expiresIn: "30d" }
    },
    listen: {},
    entitlements: { attribute: "cn", scope: "sub" },
    maxPeers: 7,
    ephemeral: false,
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      "topic.services": {
        in: true,
        out: true,
        open: true,
        connected: "service(admin).services[C]",
        sockets: 9,
        topic: {
          name: "services",
          peers: [
            { host: "93.197.152.114", port: 34685, local: false },
            { host: "93.197.152.114", port: 43183, local: false },
            { host: "10.0.6.2", port: 36573, local: true },
            { host: "93.197.152.114", port: 40963, local: false },
            { host: "93.197.152.114", port: 41457, local: false },
            { host: "93.197.152.114", port: 36573, local: false },
            { host: "93.197.149.194", port: 43862, local: false },
            { host: "93.197.149.194", port: 42017, local: false },
            { host: "93.197.156.26", port: 36573, local: false },
            { host: "93.197.149.194", port: 41457, local: false }
          ],
          sockets: 1,
          announce: true,
          lookup: true
        }
      },
      "peers.services": {
        out: true,
        connected: "service(http)./services/peers",
        topic: {
          name: "services",
          peers: [
            { host: "93.197.152.114", port: 34685, local: false },
            { host: "93.197.152.114", port: 43183, local: false },
            { host: "10.0.6.2", port: 36573, local: true },
            { host: "93.197.152.114", port: 40963, local: false },
            { host: "93.197.152.114", port: 41457, local: false },
            { host: "93.197.152.114", port: 36573, local: false },
            { host: "93.197.149.194", port: 43862, local: false },
            { host: "93.197.149.194", port: 42017, local: false },
            { host: "93.197.156.26", port: 36573, local: false },
            { host: "93.197.149.194", port: 41457, local: false }
          ],
          sockets: 1,
          announce: true,
          lookup: true
        }
      }
    }
  },
  systemctl: {
    type: "systemctl",
    name: "systemctl",
    state: "stopped",
    logLevel: "info",
    description: "This service is the base class for service implementations",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {
      access_token: { algorithm: "RS256", expiresIn: "1h" },
      refresh_token: { algorithm: "RS256", expiresIn: "30d" }
    },
    listen: {},
    entitlements: { attribute: "cn", scope: "sub" },
    maxPeers: 10,
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      files: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/unit/:unit/files"
      },
      unit: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/unit/:unit"
      },
      units: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/unit"
      },
      timers: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/timer"
      },
      sockets: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/socket"
      },
      machines: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/machine"
      },
      start: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/unit/:unit/start"
      },
      stop: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/unit/:unit/stop"
      },
      restart: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/unit/:unit/restart"
      },
      reload: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/unit/:unit/reload"
      },
      freeze: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/unit/:unit/freeze"
      },
      thaw: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./systemctl/unit/:unit/thaw"
      },
      fail2ban: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./fail2ban"
      }
    }
  },
  networkctl: {
    type: "networkctl",
    name: "networkctl",
    state: "stopped",
    logLevel: "info",
    description: "This service is the base class for service implementations",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {
      access_token: { algorithm: "RS256", expiresIn: "1h" },
      refresh_token: { algorithm: "RS256", expiresIn: "30d" }
    },
    listen: {},
    entitlements: { attribute: "cn", scope: "sub" },
    maxPeers: 10,
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      interfaces: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./networkctl/interfaces"
      },
      neighbours: { in: true, out: true }
    }
  },
  named: {
    type: "named",
    name: "named",
    state: "stopped",
    logLevel: "info",
    description: "This service is the base class for service implementations",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {
      access_token: { algorithm: "RS256", expiresIn: "1h" },
      refresh_token: { algorithm: "RS256", expiresIn: "30d" }
    },
    listen: {},
    entitlements: { attribute: "cn", scope: "sub" },
    maxPeers: 10,
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      status: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./named"
      }
    }
  }
};
