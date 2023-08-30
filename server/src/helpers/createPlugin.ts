import { FastifyPluginAsync, RouteOptions } from "fastify"

export type PluginModule = {
  plugin: FastifyPluginAsync
  prefix: string
}

type OptionsModule = Promise<{
  default: RouteOptions
}>

export type RouteModule =
  | {
      default: RouteOptions
    }
  | {
      options: RouteOptions
    }

export type CreatePluginConfiguration = {
  plugins?: (Promise<PluginModule> | PluginModule)[]
  routes?: (Promise<RouteModule> | RouteModule)[] | OptionsModule[]

  extend?: FastifyPluginAsync
}

export const createPlugin = (
  config: CreatePluginConfiguration
): FastifyPluginAsync => {
  return async (fastify, opts) => {
    await Promise.all([
      Promise.all(config.plugins ?? []).then((plugins) =>
        plugins.map((plugin) =>
          fastify.register(plugin.plugin, { prefix: plugin.prefix })
        )
      ),
      Promise.all(config.routes ?? []).then((routes) =>
        routes.map((options: RouteModule) =>
          "default" in options
            ? fastify.route(options.default)
            : fastify.route(options.options)
        )
      ),
      config.extend ? config.extend(fastify, opts) : Promise.resolve(),
    ])
  }
}
