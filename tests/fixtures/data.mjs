export const data = {
  logger: {
    type: "systemd-logger",
    name: "logger",
    state: "running",
    logLevel: "error",
    description: "Log consuming service",
    timeout: { start: 20, stop: 20, restart: 20 },
    endpoints: {
      log: {
        in: true,
        out: true,
        open: true,
        connected: [
          "service(admin).log",
          "service(auth).log",
          "service(config).log",
          "service(health).log",
          "service(http).log",
          "service(ldap).log",
          "service(logger).log",
          "service(logger).log",
          "service(smtp).log",
          "service(systemd).log"
        ]
      },
      config: { in: true, open: true },
      command: { in: true, open: true }
    }
  },
  config: {
    type: "systemd-config",
    name: "config",
    state: "running",
    logLevel: "error",
    description: "Config providing service",
    timeout: { start: 20, stop: 20, restart: 20 },
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      command: { in: true, open: true }
    }
  },
  systemd: {
    type: "systemd",
    name: "systemd",
    state: "running",
    logLevel: "error",
    description: "This service is the base class for service implementations",
    timeout: { start: 20, stop: 20, restart: 20 },
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      command: { in: true, open: true }
    }
  },
  http: {
    type: "http",
    name: "http",
    state: "running",
    logLevel: "error",
    description: "This service is the base class for service implementations",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    listen: {
      url: "https://mfelten.dynv6.net/services/entitlements/api",
      socket: { fd: 3, name: "http.listen.socket" }
    },
    url: "https://mfelten.dynv6.net/services/entitlements/api",
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      command: { in: true, open: true },
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
        interceptors: [{ type: "decode-json" }]
      },
      "/state/memory": {
        path: "/state/memory",
        ws: true,
        in: true,
        out: true,
        connected: "service(health).memory",
        interceptors: [{ type: "decode-json" }]
      },
      "/services": {
        path: "/services",
        ws: true,
        in: true,
        out: true,
        open: true,
        connected: "service(admin).services",
        interceptors: [{ type: "decode-json" }]
      },
      "/authenticate": {
        method: "POST",
        path: "/authenticate",
        out: true,
        open: true,
        connected: "service(auth).access_token",
        interceptors: [{ type: "ctx-body-param", headers: {} }]
      },
      "/entitlement": {
        method: "GET",
        path: "/entitlement",
        out: true,
        open: true,
        connected: "service(ldap).search",
        interceptors: [
          { type: "ctx-jwt-verify" },
          { type: "ctx", headers: {} },
          {
            type: "template",
            request: {
              base: "ou=groups,dc=mf,dc=de",
              scope: "children",
              attributes: ["cn"],
              filter: "(objectclass=groupOfUniqueNames)"
            }
          }
        ]
      },
      "/user": {
        method: "PUT",
        path: "/user",
        out: true,
        open: true,
        connected: "service(ldap).add",
        interceptors: [
          { type: "ctx-body-param", headers: {} },
          {
            type: "template",
            request: {
              dn: "uid={{user}},ou=accounts,dc=mf,dc=de",
              entry: {
                objectClass: [
                  "inetOrgPerson",
                  "organizationalPerson",
                  "person",
                  "top"
                ],
                cn: "{{user}}",
                sn: "{{user}}",
                userPassword: "{{password}}"
              }
            }
          }
        ]
      },
      "/user/password": {
        method: "PATCH",
        path: "/user/password",
        out: true,
        open: true,
        connected: "service(ldap).modify",
        interceptors: [
          { type: "ctx-body-param", headers: {} },
          {
            type: "template",
            request: {
              bind: {
                dn: "uid={{user}},ou=accounts,dc=mf,dc=de",
                password: "{{password}}"
              },
              dn: "uid={{user}},ou=accounts,dc=mf,dc=de",
              replace: { userPassword: "{{new_password}}" }
            }
          }
        ]
      },
      "/user/:user": {
        method: "DEL",
        path: "/user/:user",
        out: true,
        open: true,
        connected: "service(ldap).del",
        interceptors: [
          { type: "ctx-jwt-verify" },
          { type: "ctx", headers: {} },
          {
            type: "template",
            request: { dn: "uid={{user}},ou=accounts,dc=mf,dc=de" }
          }
        ]
      },
      "/user/:user/entitlements": {
        method: "GET",
        path: "/user/:user/entitlements",
        out: true,
        open: true,
        connected: "service(ldap).search",
        interceptors: [
          { type: "ctx-jwt-verify" },
          { type: "ctx", headers: {} },
          {
            type: "template",
            request: {
              base: "ou=groups,dc=mf,dc=de",
              scope: "sub",
              attributes: ["cn"],
              filter:
                "(&(objectclass=groupOfUniqueNames)(uniqueMember=uid={{user}},ou=accounts,dc=mf,dc=de))"
            }
          }
        ]
      }
    }
  },
  auth: {
    type: "authenticator",
    name: "auth",
    state: "running",
    logLevel: "error",
    description: "provide authentication services",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    listen: {},
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      command: { in: true, open: true },
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
  ldap: {
    type: "ldap",
    name: "ldap",
    state: "stopped",
    logLevel: "error",
    description: "This service is the base class for service implementations",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {
      access_token: { algorithm: "RS256", expiresIn: "1h" },
      refresh_token: { algorithm: "RS256", expiresIn: "30d" }
    },
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
      command: { in: true, open: true },
      authenticate: {
        in: true,
        out: true,
        open: true,
        connected: "service(auth).ldap.authenticate"
      },
      add: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./user"
      },
      del: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./user/:user"
      },
      modify: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./user/password"
      },
      search: {
        in: true,
        out: true,
        open: true,
        connected: "service(http)./entitlement"
      }
    }
  },
  health: {
    type: "health-check",
    name: "health",
    state: "running",
    logLevel: "error",
    cpuInterval: 30,
    memoryInterval: 30,
    uptimeInterval: 30,
    resourceUsageInterval: 30,
    description: "This service is the base class for service implementations",
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
      state: { in: true, out: true, open: true },
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
  admin: {
    type: "admin",
    name: "admin",
    state: "running",
    logLevel: "error",
    description: "This service is the base class for service implementations",
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
        connected: "service(http)./services"
      }
    }
  },
  smtp: {
    type: "smtp",
    name: "smtp",
    state: "stopped",
    logLevel: "error",
    description: "This service is the base class for service implementations",
    timeout: { server: 120, start: 20, stop: 20, restart: 20 },
    jwt: {
      access_token: { algorithm: "RS256", expiresIn: "1h" },
      refresh_token: { algorithm: "RS256", expiresIn: "30d" }
    },
    listen: {},
    entitlements: { attribute: "cn", scope: "sub" },
    port: 25,
    secure: false,
    auth: {},
    endpoints: {
      log: { out: true, open: true, connected: "service(logger).log" },
      config: { in: true, open: true },
      command: { in: true, open: true },
      send: { in: true, out: true }
    }
  }
};
